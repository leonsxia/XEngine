import { container, infosDomElements } from "./systems/htmlElements";
import { WorldScene1 } from "./worldScenes/WorldScene1";
import { WorldScene2 } from "./worldScenes/WorldScene2";
import { WorldScene3 } from "./worldScenes/WorldScene3";
import { WorldScene4 } from "./worldScenes/WorldScene4";
import { WaterRoom } from "./worldScenes/WaterRoom";
import { Mansion } from "./worldScenes/Mansion";
import { WorldScene5 } from "./worldScenes/WorldScene5";
import { WorldMatrix } from "./worldScenes/Matrix";
import { EnemyTestScene } from "./worldScenes/EnemyTestScene";

import { createRenderer } from "./systems/renderer";
import { Picker } from "./systems/Picker";
import { ControlEventDispatcher } from "./systems/ControlEventDispatcher";

import { loadTextures, loadedTextures } from "./components/utils/textureHelper";
import { initPickableModels, loadGLTFModels, loadedGLTFModels } from "./components/utils/gltfHelper";
import { loadShaders } from "./components/utils/shaderHelper";
import { SceneBuilder } from "./worldScenes/builder/SceneBuilder";
import { TEXTURES, GLTFS, SHADERS, CONTROL_TYPES } from "./components/utils/constants";
import { Logger } from "./systems/Logger";
import { InputBase } from "./systems/physicalInputs/InputBase";
import { XBoxController } from "./systems/physicalInputs/gamepad/XBoxController";
import { Keyboard } from "./systems/physicalInputs/Keyboard";
import { Mouse } from "./systems/physicalInputs/Mouse";

const config = { 
    scenes: ['BasicObjects', 'RunningTrain', 'Birds', 'Simple Physics', 'Water Room', 'Mansion', 'Animated Characters', 'Matrix', 'Enemy Test Scene'],  // scene list for scene selector
};
const controlTypes = Object.values(InputBase.CONTROL_TYPES);
const controlActions = InputBase.CONTROL_ACTIONS.map(actions => {

    const category = actions.CATEGORY;
    const types = Object.values(actions.TYPES);

    return { category, types };

});
const controlEventDispatcher = new ControlEventDispatcher(controlTypes, controlActions);
config.controlEventDispatcher = controlEventDispatcher;
const DEBUG = true;

class World {

    #renderer;
    #currentScene;

    #textures;
    #gltfs;

    #sceneBuilder;

    #systemLogger = new Logger(DEBUG, 'World');

    _xboxController;
    _keyboard;
    _mouse;

    _showGuiAndInfo = false;

    constructor() {

        this.#renderer = createRenderer();
        this.#renderer.name = 'world_renderer';

        config.changeCallback = this.changeScene.bind(this);

        const worldPicker = new Picker();
        config.worldPicker = worldPicker;
        this.#sceneBuilder = new SceneBuilder();
        config.sceneBuilder = this.#sceneBuilder;

        const inputConifg = {
            dispatcher: controlEventDispatcher,
            controlTypes: controlTypes,
            attachTo: this
        }
        this._xboxController = new XBoxController(inputConifg);
        this._xboxController.bindGamepadEvents();
        config.xboxController = this._xboxController;

        this._keyboard = new Keyboard(inputConifg);
        this._keyboard.bindAllMoves();

        this._mouse = new Mouse(inputConifg);
        this._mouse.bindAllEvents();

        this.worldScenes = [];
        this.worldScenes.push(new WorldScene1(this.#renderer, config));
        this.worldScenes.push(new WorldScene2(this.#renderer, config));
        this.worldScenes.push(new WorldScene3(this.#renderer, config));
        this.worldScenes.push(new WorldScene4(this.#renderer, config));
        this.worldScenes.push(new WorldScene5(this.#renderer, config));
        this.worldScenes.push(new WaterRoom(this.#renderer, config));
        this.worldScenes.push(new Mansion(this.#renderer, config));
        this.worldScenes.push(new WorldMatrix(this.#renderer, config));
        this.worldScenes.push(new EnemyTestScene(this.#renderer, config));

    }

    async initScene(name) {

        const start = Date.now();
            
        const [textures, gltfs] = await Promise.all([
            loadTextures(TEXTURES),
            loadGLTFModels(GLTFS),
            loadShaders(SHADERS)
        ]);

        const end = Date.now();
        this.#systemLogger.log(`loading assests in ${(end - start) * .001} s`);

        Object.assign(loadedTextures, textures);
        Object.assign(loadedGLTFModels, gltfs);
        this.#textures = textures;
        this.#gltfs = gltfs;

        await initPickableModels();

        this.#sceneBuilder.loadAssets(this.#textures, this.#gltfs);

        await this.changeScene(name);

        this.bindResizer();

    }

    async changeScene(name) {

        // this.#currentScene?.reset(); // reset camera, gui, controls, stop animation
        this.#currentScene?.suspend(); // stop looping, hide gui but not reset, disable controls
        
        container.innerHTML = '';

        if (infosDomElements) {

            infosDomElements.header.textContent = `XEngine - World ${name}`;
            infosDomElements.msg.textContent = 'loading assets...';
        
        }

        const loadScene = this.worldScenes.find(s => s.name === name);
        
        await loadScene.init();

        // need to resize current loaded scene in case that size has changed on last scene
        loadScene.resizer.setSize();

        this.#currentScene = loadScene;

        this.#systemLogger.log(`Scene: ${this.#currentScene.name} Renderer: ${this.#currentScene.renderer.name}`);

        if (infosDomElements) infosDomElements.msg.textContent = 'assets all loaded. => renderding scene...';

        const start = Date.now();

        setTimeout(() => {

            loadScene.render();

            container.append(this.#renderer.domElement);

            const end = Date.now();
            this.#systemLogger.log(`render in ${(end - start) * .001} s`);

            const { objects, vertices, triangles } = this.countObjects(loadScene.scene);

            this.#systemLogger.log(`objects: ${objects}, vertices: ${vertices}, triangles: ${triangles}`);

            if (infosDomElements) {
                
                infosDomElements.msg.textContent = 'render complete!';

                if (loadScene.setup?.showManual) {

                    infosDomElements.manual.classList.remove('hide');

                } else {

                    infosDomElements.manual.classList.add('hide');

                }
                
            }

        }, 0);

    }

    get current() {

        return this.#currentScene.name;

    }

    get currentScene() {

        return this.#currentScene;

    }

    countObjects(scene) {

        let objects = 0, vertices = 0, triangles = 0;

        for (let i = 0, il = scene.children.length; i < il; i++) {

            const object = scene.children[i];

            object.traverseVisible(function (object) {
                objects++;

                if (object.isMesh) {

                    const geometry = object.geometry;

                    vertices += geometry.attributes.position.count;

                    if (geometry.index !== null) {

                        triangles += geometry.index.count / 3;

                    } else {

                        triangles += geometry.attributes.position.count / 3;

                    }

                }

            });

        }

        return { objects, vertices, triangles };

    } 

    bindResizer() {

        window.addEventListener('resize', () => {

            for (let i = 0, il = this.worldScenes.length; i < il; i++) {

                const scene = this.worldScenes[i];
                const { resizer } = scene;

                if (this.#currentScene === scene) {

                    resizer.setSize();
                    resizer.onResize();

                }

            }

        });

    }

    setInfo(show) {

        for (const i in infosDomElements) {

            const info = infosDomElements[i];

            if (show) {

                if (info === infosDomElements.manual && !this.#currentScene.setup?.showManual) {

                    continue;

                }

                if (info.classList.contains('hide')) {

                    info.classList.remove('hide');

                }

            } else {

                if (!info.classList.contains('hide')) {

                    info.classList.add('hide');

                }

            }

        }

    }

    setGuiAndInfo() {

        if (this._mouse.triggered) {

            if (!this._showGuiAndInfo) {

                container.classList.remove('nocursor');
                this.#currentScene?.guiMaker.gui.recover();
                this.setInfo(true);
                this._showGuiAndInfo = true;

            }

        } else {

            if (this._showGuiAndInfo) {

                container.classList.add('nocursor');
                this.#currentScene?.guiMaker.gui.hide();
                this.setInfo(false);
                this._showGuiAndInfo = false;

            }

        }

    }

    switchInput(type) {

        if (!this.#currentScene) return;

        switch(type) {

            case CONTROL_TYPES.KEYBOARD:
                this._keyboard.triggered = true;
                if (this.currentScene.isPdaOn) this._mouse.triggered = false;
                this._xboxController.triggered = false;
                this._xboxController.disconnectXboxController();
                break;

            case CONTROL_TYPES.MOUSE:
                this._mouse.triggered = true;
                this._xboxController.triggered = false;
                this._xboxController.disconnectXboxController();
                break;

            case CONTROL_TYPES.XBOX:
                this._keyboard.triggered = false;
                this._mouse.triggered = false;
                this._xboxController.triggered = true;
                this._xboxController.connectXboxController();
                break;

        }

        this.setGuiAndInfo();

    }

}

export { World };