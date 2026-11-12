import { container, infosDomElements } from "./systems/htmlElements";
import { scenes, buildLevels } from "./worldScenes/levels/levelBuilder";

import { createRenderer } from "./systems/renderer";
import { Picker } from "./systems/Picker";
import { ControlEventDispatcher } from "./systems/ControlEventDispatcher";

/**
 * resources
 */
// textures
import { RESOURCE_TYPE } from "./systems/resources/configs/resources";
import { TEXTURES, HDR_TEXTURES, TEXTURE_NAMES } from "./systems/resources/configs/textures";
import TextureHelper, { loadedTextures } from "./systems/resources/helpers/TextureHelper";

// images
import { IMAGES, XBOX_CONTROLLER_ICONS } from "./systems/ui/uiConstants";
import ImageHelper from "./systems/resources/helpers/ImageHelper";

// jsons
import { JSONS } from "./systems/resources/configs/documentary";
import JsonHelper from "./systems/resources/helpers/JsonHelper";

// shaders
import { SHADERS } from "./systems/resources/configs/shaders";
import ShaderHelper from "./systems/resources/helpers/ShaderHelper";

// sounds
import { SOUNDS } from "./systems/resources/configs/sounds";
import AudioHelper from "./systems/resources/helpers/AudioHelper";

// gltf models
import { GLTFS } from "./systems/resources/configs/gltfs";
import GltfHelper, { initPickableModels } from "./systems/resources/helpers/GltfHelper";

import { SceneBuilder } from "./worldScenes/builder/SceneBuilder";
import { CONTROL_TYPES, PHYSICS_TYPES } from "./components/utils/constants";
import { Logger } from "./systems/Logger";
import { InputBase } from "./systems/physicalInputs/InputBase";
import { XBoxController } from "./systems/physicalInputs/gamepad/XBoxController";
import { Keyboard } from "./systems/physicalInputs/Keyboard";
import { Mouse } from "./systems/physicalInputs/Mouse";
import { pdaItemViewer } from "./systems/ItemViewer";
import { AnimationLoop } from "./systems/AnimationLoop";
import { Loop } from "./systems/Loop";

import { isObjectVisible } from "./components/utils/objectHelper";


const config = {
    scenes,
    physics: PHYSICS_TYPES.SIMPLE
};
const controlTypes = Object.values(InputBase.CONTROL_TYPES);
const controlActions = InputBase.CONTROL_ACTIONS.map(actions => {

    const category = actions.CATEGORY;
    const types = Object.values(actions.TYPES);

    return { category, types };

});
const DEBUG = true;

function countObjects(scene, specs = { visibleOnly: false }) {

    let objects = 0, vertices = 0, triangles = 0;
    const { visibleOnly } = specs;

    for (let i = 0, il = scene.children.length; i < il; i++) {

        const object = scene.children[i];
        if (visibleOnly && !object.visible) continue;

        object.traverse(function (object) {

            if (visibleOnly) {

                if (!isObjectVisible(object)) return;

            }

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

const systemLogger = new Logger(DEBUG, 'World');

let instance = null;

class World {

    configuration;

    _amimationLoop;
    _worldLooper;
    _onAnimationFrameCallback;

    _xboxController;
    _keyboard;
    _mouse;

    _showGuiAndInfo = false;

    constructor() {

        // singleton
        if (instance) {

            return instance;

        }

        instance = this;

        this.renderer = createRenderer();
        this.renderer.name = 'world_renderer';
        this.renderer.domElement.classList.add('scene-canvas');

        this.configuration = config;

        this.worldPicker = new Picker();
        this.sceneBuilder = new SceneBuilder();
        this.controlEventDispatcher = new ControlEventDispatcher(controlTypes, controlActions);

        this._amimationLoop = new AnimationLoop();    
        this._amimationLoop.setAnimationLoop((time) => {

            if (this._onAnimationFrameCallback) this._onAnimationFrameCallback(time);

        });
        this._worldLooper = new Loop(this);

        const inputConifg = {
            dispatcher: this.controlEventDispatcher,
            controlTypes: controlTypes,
            attachTo: this
        }
        this._xboxController = new XBoxController(inputConifg);
        this._xboxController.bindGamepadEvents();

        this._keyboard = new Keyboard(inputConifg);
        this._keyboard.bindAllMoves();

        this._mouse = new Mouse(inputConifg);
        this._mouse.bindAllEvents();

        this.worldScenes = buildLevels();

        this.setupResources();

    }

    setupResources() {

        this.resources = {
            textures: new TextureHelper(TEXTURES),
            hdrTextures: new TextureHelper(HDR_TEXTURES, RESOURCE_TYPE.HDR_TEXTURE),
            gltfs: new GltfHelper(GLTFS, this.renderer),
            images: new ImageHelper(IMAGES),
            xboxControllerIcons: new ImageHelper(XBOX_CONTROLLER_ICONS, RESOURCE_TYPE.XBOX_CONTROLLER_ICON),
            jsons: new JsonHelper(JSONS),
            shaders: new ShaderHelper(SHADERS),
            sounds: new AudioHelper(SOUNDS)
        };

        const readyCall = (event) => {

            infosDomElements.msg.textContent += `\r\n[${event.type}] ${event.count} ${event.count > 1 ? 'assets are' : 'asset is'} ready in ${event.time} ms.`;

        };
        
        for (const key in this.resources) {

            const helper = this.resources[key];
            helper.on(helper.outEvent, readyCall);

        }

    }

    async initScene(name) {

        const start = Date.now();

        const [textures, , gltfs] = await Promise.all([
            this.resources.textures.startLoading(),
            this.resources.hdrTextures.startLoading(),
            this.resources.gltfs.startLoading(),
            this.resources.shaders.startLoading(),
            this.resources.images.startLoading(),
            this.resources.xboxControllerIcons.startLoading(),
            this.resources.jsons.startLoading(),
            this.resources.sounds.startLoading()
        ]);
        const itemViewerEnvironment = loadedTextures[TEXTURE_NAMES.METAL_241].clone();

        const end = Date.now();
        systemLogger.log(`loading assests in ${(end - start) * .001} s`);

        pdaItemViewer.scene.background = itemViewerEnvironment;

        await initPickableModels();

        this.sceneBuilder.loadAssets(textures, gltfs);

        await this.changeScene(name);

        this.bindResizer();
        this._worldLooper.start();

    }

    async changeScene(name) {

        // this.currentScene?.reset(); // reset camera, gui, controls, stop animation
        this.currentScene?.suspend(); // stop looping, hide gui but not reset, disable controls
        
        container.innerHTML = '';

        if (infosDomElements) {

            infosDomElements.header.textContent = `XEngine - World ${name}`;
            infosDomElements.msg.textContent = 'loading assets...';
        
        }

        const loadScene = this.worldScenes.find(s => s.name === name);
        
        await loadScene.init();

        // need to resize current loaded scene in case that size has changed on last scene
        loadScene.resizer.setSize();

        this.currentScene = loadScene;

        systemLogger.log(`Scene: ${this.currentScene.name} - Renderer: ${this.currentScene.renderer.name}`);

        if (infosDomElements) infosDomElements.msg.textContent = 'assets all loaded. => renderding scene...';

        const start = Date.now();

        setTimeout(() => {

            loadScene.render();

            container.prepend(this.renderer.domElement);

            const end = Date.now();
            systemLogger.log(`render in ${(end - start) * .001} s`);

            const { objects, vertices, triangles } = countObjects(loadScene.scene);

            systemLogger.log(`all objects: ${objects}, vertices: ${vertices}, triangles: ${triangles}`);

            if (infosDomElements) {
                
                infosDomElements.msg.textContent = 'render complete!';

            }

        }, 0);

    }

    get current() {

        return this.currentScene.name;

    }

    get sceneClientSize() {

        const canvas = this.renderer.domElement;
        return {
            width: canvas.clientWidth,
            height: canvas.clientHeight
        };

    }

    setAnimationLoop(callback) {

        this._onAnimationFrameCallback = callback;

        (callback === null) ? this._amimationLoop.stop() : this._amimationLoop.start();

    }

    bindResizer() {

        window.addEventListener('resize', () => {

            for (let i = 0, il = this.worldScenes.length; i < il; i++) {

                const scene = this.worldScenes[i];
                const { resizer } = scene;

                if (this.currentScene === scene) {

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
                // new editor
                this.currentScene?.editor.recover();
                this.setInfo(true);
                this._showGuiAndInfo = true;

            }

        } else {

            if (this._showGuiAndInfo) {

                container.classList.add('nocursor');
                // new editor
                this.currentScene?.editor.guiMaker.hide();
                this.setInfo(false);
                this._showGuiAndInfo = false;

            }

        }

    }

    switchInput(type) {

        if (!this.currentScene) return;

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

export { World, countObjects, systemLogger };