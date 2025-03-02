import { WorldScene1 } from "./worldScenes/WorldScene1";
import { WorldScene2 } from "./worldScenes/WorldScene2";
import { WorldScene3 } from "./worldScenes/WorldScene3";
import { WorldScene4 } from "./worldScenes/WorldScene4";
import { WaterRoom } from "./worldScenes/WaterRoom";
import { Mansion } from "./worldScenes/Mansion";
import { WorldScene5 } from "./worldScenes/WorldScene5";
import { WorldMatrix } from "./worldScenes/Matrix";

import { createRenderer } from "./systems/renderer";
import { Picker } from "./systems/Picker";
import { EventDispatcher } from "./systems/EventDispatcher";

import { loadTextures, loadedTextures } from "./components/utils/textureHelper";
import { loadGLTFModels, loadedGLTFModels } from "./components/utils/gltfHelper";
import { loadShaders } from "./components/utils/shaderHelper";
import { SceneBuilder } from "./worldScenes/builder/SceneBuilder";
import { TEXTURES, GLTFS, SHADERS } from "./components/utils/constants";
import { Logger } from "./systems/Logger";
import { XBoxController } from "./systems/gamepad/XBoxController";

const config = { 
    scenes: ['BasicObjects', 'RunningTrain', 'Birds', 'Simple Physics', 'Water Room', 'Mansion', 'Animated Characters', 'Matrix'],  // scene list for scene selector
};
const movementTypes = ['tankmove'];
const moveActions = [
    { 
        category: 'tankmove', 
        types: ['movingLeft', 'movingRight', 'movingForward', 'movingBackward', 'accelerate', 'jump', 'melee', 'interact', 'gunPoint', 'shoot']
    }
];
const DEBUG = true;

class World {

    #renderer;
    #currentScene;
    #infosDomElements;
    #container;
    #movementEventDispatcher;

    keys = {
        A: { upper: 'A', lower: 'a', isDown: false },
        D: { upper: 'D', lower: 'd', isDown: false },
        W: { upper: 'W', lower: 'w', isDown: false },
        S: { upper: 'S', lower: 's', isDown: false },
        V: { upper: 'V', lower: 'v', isDown: false },
        J: { upper: 'J', lower: 'j', isDown: false },
        K: { upper: 'K', lower: 'k', isDown: false },
        L: { upper: 'L', lower: 'l', isDown: false },
        F: { upper: 'F', lower: 'f', isDown: false },
        Shift: { code: 'Shift', isDown: false },
        Space: { code: ' ', isDown: false }
    }

    #movingLeft = false;
    #movingRight = false;
    #movingForward = false;
    #movingBackward = false;
    #accelerate = false;
    #jump = false;
    #melee = false;
    #interact = false;
    #gunPointing = false;
    #shoot = false;

    #textures;
    #gltfs;

    #sceneBuilder;

    _systemLogger = new Logger(true, 'World');
    _eventLogger = new Logger(DEBUG, 'World');

    constructor(container, infos) {

        this.#renderer = createRenderer();
        this.#renderer.name = 'world_renderer';
        this.#container = container;
        this.#infosDomElements = infos;
        this.#movementEventDispatcher = new EventDispatcher(movementTypes, moveActions);

        config.changeCallback = this.changeScene.bind(this);

        const worldPicker = new Picker(container);
        config.worldPicker = worldPicker;
        this.#sceneBuilder = new SceneBuilder();
        config.sceneBuilder = this.#sceneBuilder;

        const xboxController = new XBoxController({
            dispatcher: this.#movementEventDispatcher,
            controlType: movementTypes[0],
            attachTo: this
        });
        xboxController.bindGamepadEvents();
        config.xboxController = xboxController;

        this.worldScenes = [];
        this.worldScenes.push(new WorldScene1(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldScene2(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldScene3(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldScene4(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldScene5(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WaterRoom(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new Mansion(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldMatrix(container, this.#renderer, config, this.#movementEventDispatcher));
        // this.bindAllMoves();

    }

    async initScene(name) {

        const start = Date.now();
            
        const [textures, gltfs] = await Promise.all([
            loadTextures(TEXTURES),
            loadGLTFModels(GLTFS),
            loadShaders(SHADERS)
        ]);

        const end = Date.now();
        this._systemLogger.log(`loading assests in ${(end - start) * .001} s`);

        Object.assign(loadedTextures, textures);
        Object.assign(loadedGLTFModels, gltfs);
        this.#textures = textures;
        this.#gltfs = gltfs;

        this.#sceneBuilder.loadAssets(this.#textures, this.#gltfs);

        await this.changeScene(name);

        this.bindResizer();
        this.bindAllMoves();

    }

    async changeScene(name) {

        // this.#currentScene?.reset(); // reset camera, gui, controls, stop animation
        this.#currentScene?.suspend(); // stop looping, hide gui but not reset, disable controls
        
        this.#container.innerHTML = '';

        if (this.#infosDomElements) {

            this.#infosDomElements.header.textContent = `XEngine - World ${name}`;
            this.#infosDomElements.msg.textContent = 'loading assets...';
        
        }

        const loadScene = this.worldScenes.find(s => s.name === name);
        
        await loadScene.init();

        // need to resize current loaded scene in case that size has changed on last scene
        loadScene.resizer.setSize();

        this.#currentScene = loadScene;

        this._systemLogger.log(`Scene: ${this.#currentScene.name} Renderer: ${this.#currentScene.renderer.name}`);

        if (this.#infosDomElements) this.#infosDomElements.msg.textContent = 'assets all loaded. => renderding scene...';

        const start = Date.now();

        setTimeout(() => {

            loadScene.render();

            this.#container.append(this.#renderer.domElement);

            const end = Date.now();
            this._systemLogger.log(`render in ${(end - start) * .001} s`);

            const { objects, vertices, triangles } = this.countObjects(loadScene.scene);

            this._systemLogger.log(`objects: ${objects}, vertices: ${vertices}, triangles: ${triangles}`);

            if (this.#infosDomElements) {
                
                this.#infosDomElements.msg.textContent = 'render complete!';

                this.#infosDomElements.manual.style.display = loadScene.setup?.showManual ? 'block' : 'none';
                
            }

        }, 0);

    }

    get current() {

        return this.#currentScene.name;

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

    bindAllMoves() {

        this.bindKeysToTankMove();
        // this.bindKeysToOtherMove();

    }

    // left 0, right 1, forward 2, backward 3
    bindKeysToTankMove() {

        const eventDispatcher = this.#movementEventDispatcher;
        const messageType = movementTypes[0];
        const actions = moveActions.find(f => f.category === 'tankmove').types;
        const { A, D, W, S, J, K, L, F, Shift, Space } = this.keys;

        window.addEventListener('keydown', e => {

            if (this.#currentScene.paused()) return;

            switch (e.key) {
                case A.lower:
                case A.upper:
                case 'ArrowLeft':

                    if (!A.isDown) {

                        A.isDown = true;

                        if (!D.isDown) {

                            // this._eventLogger.log('<');
                            this.#movingLeft = true;

                            eventDispatcher.publish(messageType, actions[0], this.current, this.#movingLeft);

                        } else {

                            // this._eventLogger.log('stop >'); // stop on local x
                            this.#movingRight = false;

                            eventDispatcher.publish(messageType, actions[1], this.current, this.#movingRight);

                        }

                        // this.logMovement();

                    }

                    break;

                case D.lower:
                case D.upper:
                case 'ArrowRight':

                    if (!D.isDown) {

                        D.isDown = true;

                        if (!A.isDown) {

                            // this._eventLogger.log('>');
                            this.#movingRight = true;

                            eventDispatcher.publish(messageType, actions[1], this.current, this.#movingRight);
                            
                        } else {

                            // this._eventLogger.log('stop <'); // stop on local x
                            this.#movingLeft = false;

                            eventDispatcher.publish(messageType, actions[0], this.current, this.#movingLeft);

                        }

                        // this.logMovement();

                    }

                    break;

                case W.lower:
                case W.upper:
                case 'ArrowUp':

                    if (!W.isDown) {

                        W.isDown = true;

                        if (!S.isDown) {

                            // this._eventLogger.log('^');
                            this.#movingForward = true;

                            eventDispatcher.publish(messageType, actions[2], this.current, this.#movingForward);

                        } else {

                            // this._eventLogger.log('stop v');
                            this.#movingBackward = false;

                            eventDispatcher.publish(messageType, actions[3], this.current, this.#movingBackward);

                        }

                        // this.logMovement();

                    }

                    break;

                case S.lower:
                case S.upper:
                case 'ArrowDown':

                    if (!S.isDown) {

                        S.isDown = true;

                        if (!W.isDown) {

                            // this._eventLogger.log('v');
                            this.#movingBackward = true;

                            eventDispatcher.publish(messageType, actions[3], this.current, this.#movingBackward);

                        } else {

                            // this._eventLogger.log('stop ^');
                            this.#movingForward = false;

                            eventDispatcher.publish(messageType, actions[2], this.current, this.#movingForward);

                        }

                        // this.logMovement();

                    }

                    break;

                case L.lower:
                case L.upper:

                    if (!L.isDown) {

                        L.isDown = true;
                        this.#melee = true;

                        // this._eventLogger.log('melee');
                        eventDispatcher.publish(messageType, actions[6], this.current, this.#melee);

                    }

                    break;

                case J.lower:
                case J.upper:

                    if (!J.isDown) {

                        J.isDown = true;
                        this.#gunPointing = true;

                        // this._eventLogger.log('gun pointing');
                        eventDispatcher.publish(messageType, actions[8], this.current, this.#gunPointing);

                    }

                    break;

                case K.lower:
                case K.upper:

                    if (!K.isDown) {

                        K.isDown = true;
                        this.#shoot = true;

                        // this._eventLogger.log('gun shooting');
                        eventDispatcher.publish(messageType, actions[9], this.current, this.#shoot);

                    }

                    break;

                case F.lower:
                case F.upper:

                    if (!F.isDown) {

                        F.isDown = true;
                        this.#interact = true;

                        // this._eventLogger.log('interact');
                        eventDispatcher.publish(messageType, actions[7], this.current, this.#interact);

                    }

                    break;

                case Shift.code:

                    if (!Shift.isDown) {

                        Shift.isDown = true;
                        this.#accelerate = true;

                        // this._eventLogger.log('faster!');
                        eventDispatcher.publish(messageType, actions[4], this.current, this.#accelerate);

                    }

                    break;

                case Space.code:

                    if (!Space.isDown) {

                        Space.isDown = true;
                        this.#jump = true;

                        eventDispatcher.publish(messageType, actions[5], this.current, this.#jump);

                    }

                    break;

            }
        });

        window.addEventListener('keyup', e => {

            if (this.#currentScene.paused()) return;

            switch (e.key) {
                case A.lower:
                case A.upper:
                case 'ArrowLeft':
                    if (D.isDown) {

                        // this._eventLogger.log('>');
                        this.#movingRight = true;

                        eventDispatcher.publish(messageType, actions[1], this.current, this.#movingRight);

                    } else {

                        // this._eventLogger.log('stop <'); // stop on local x
                        this.#movingLeft = false;

                        eventDispatcher.publish(messageType, actions[0], this.current, this.#movingLeft);

                    }

                    A.isDown = false;

                    // this.logMovement();

                    break;

                case D.lower:
                case D.upper:
                case 'ArrowRight':

                    if (A.isDown) {

                        // this._eventLogger.log('<');
                        this.#movingLeft = true;

                        eventDispatcher.publish(messageType, actions[0], this.current, this.#movingLeft);

                    } else {

                        // this._eventLogger.log('stop >'); // stop on local x
                        this.#movingRight = false;

                        eventDispatcher.publish(messageType, actions[1], this.current, this.#movingRight);

                    }

                    D.isDown = false;

                    // this.logMovement();

                    break;

                case W.lower:
                case W.upper:
                case 'ArrowUp':

                    if (S.isDown) {

                        // this._eventLogger.log('v');
                        this.#movingBackward = true;

                        eventDispatcher.publish(messageType, actions[3], this.current, this.#movingBackward);

                    } else {

                        // this._eventLogger.log('stop ^'); // stop on local z
                        this.#movingForward = false;

                        eventDispatcher.publish(messageType, actions[2], this.current, this.#movingForward);

                    }

                    W.isDown = false;

                    // this.logMovement();

                    break;

                case S.lower:
                case S.upper:
                case 'ArrowDown':
                    
                    if (W.isDown) {

                        // this._eventLogger.log('^');
                        this.#movingForward = true;

                        eventDispatcher.publish(messageType, actions[2], this.current, this.#movingForward);

                    } else {

                        // this._eventLogger.log('stop v'); // stop on local z
                        this.#movingBackward = false;

                        eventDispatcher.publish(messageType, actions[3], this.current, this.#movingBackward);

                    }

                    S.isDown = false;

                    // this.logMovement();

                    break;

                case L.lower:
                case L.upper:

                    L.isDown = false;
                    this.#melee = false;

                    // this._eventLogger.log('cancel melee');
                    eventDispatcher.publish(messageType, actions[6], this.current, this.#melee);

                    break;

                case J.lower:
                case J.upper:

                    J.isDown = false;
                    this.#gunPointing = false;

                    // this._eventLogger.log('cancel gun pointing');
                    eventDispatcher.publish(messageType, actions[8], this.current, this.#gunPointing);

                    break;

                case K.lower:
                case K.upper:

                    K.isDown = false;
                    this.#shoot = false;

                    // this._eventLogger.log('cancel gun shoot');
                    eventDispatcher.publish(messageType, actions[9], this.current, this.#shoot);

                    break;

                case F.lower:
                case F.upper:

                    F.isDown = false;
                    this.#interact = false;

                    // this._eventLogger.log('cancel interact');
                    eventDispatcher.publish(messageType, actions[7], this.current, this.#interact);

                    break;

                case Shift.code:

                    Shift.isDown = false;
                    this.#accelerate = false;

                    // this._eventLogger.log('slow down');
                    eventDispatcher.publish(messageType, actions[4], this.current, this.#accelerate);

                    break;

                case Space.code:

                    Space.isDown = false;
                    this.#jump = false;

                    eventDispatcher.publish(messageType, actions[5], this.current, this.#jump);

                    break;

            }
        });
    }

    bindKeysToOtherMove() {
        window.addEventListener('keydown', e => {
            switch (e.key) {
                case 'a':
                case 'A':
                case 'ArrowLeft':
                    this._eventLogger.log('other left');
                    break;
                case 'd':
                case 'D':
                case 'ArrowRight':
                    this._eventLogger.log('other right');
                    break;
                case 'w':
                case 'W':
                case 'ArrowUp':
                    this._eventLogger.log('other up');
                    break;
                case 's':
                case 'S':
                case 'ArrowDown':
                    this._eventLogger.log('other down');
                    break;
                case 'Shift':
                    break;
                case ' ':
                    break;
            }
        });
    }

    logMovement() {

        this._eventLogger.log(`
            left:${this.#movingLeft} 
            right:${this.#movingRight} 
            forward:${this.#movingForward} 
            backward:${this.#movingBackward}`);
            
    }
}

export { World };