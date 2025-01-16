import { WorldScene1 } from "./worldScenes/WorldScene1";
import { WorldScene2 } from "./worldScenes/WorldScene2";
import { WorldScene3 } from "./worldScenes/WorldScene3";
import { WorldScene4 } from "./worldScenes/WorldScene4";
import { WaterRoom } from "./worldScenes/WaterRoom";
import { Mansion } from "./worldScenes/Mansion";
import { WorldScene5 } from "./worldScenes/WorldScene5";

import { createRenderer } from "./systems/renderer";
import { Picker } from "./systems/Picker";
import { EventDispatcher } from "./systems/EventDispatcher";

import { loadTextures, loadedTextures } from "./components/utils/textureHelper";
import { loadGLTFModels } from "./components/utils/gltfHelper";
import { loadShaders } from "./components/utils/shaderHelper";
import { SceneBuilder } from "./worldScenes/builder/SceneBuilder";
import { TEXTURES, GLTFS, SHADERS } from "./components/utils/constants";

const config = { 
    scenes: ['BasicObjects', 'RunningTrain', 'Birds', 'Simple Physics', 'Water Room', 'Mansion', 'Animated Characters'],  // scene list for scene selector
};
const movementTypes = ['tankmove'];
const moveActions = ['movingLeft', 'movingRight', 'movingForward', 'movingBackward', 'accelerate', 'jump'];

class World {

    #renderer;
    #currentScene;
    #infosDomElements;
    #container;
    #movementEventDispatcher;
    #keyADown = false;
    #keyDDown = false;
    #keyWDown = false;
    #keySDown = false;
    #keyShiftDown = false;
    #keySpaceDown = false;
    #movingLeft = false;
    #movingRight = false;
    #movingForward = false;
    #movingBackward = false;
    #accelerate = false;
    #jump = false;

    #textures;
    #gltfs;

    #sceneBuilder;

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

        this.worldScenes = [];
        this.worldScenes.push(new WorldScene1(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldScene2(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldScene3(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldScene4(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WorldScene5(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new WaterRoom(container, this.#renderer, config, this.#movementEventDispatcher));
        this.worldScenes.push(new Mansion(container, this.#renderer, config, this.#movementEventDispatcher));
        // this.bindAllMoves();

    }

    async initScene(name) {

        const start = Date.now();
            
        const [textures, gltfs, shaders] = await Promise.all([
            loadTextures(TEXTURES),
            loadGLTFModels(GLTFS),
            loadShaders(SHADERS)
        ]);

        const end = Date.now();
        console.log(`loading assests in ${(end - start) * .001} s`);

        Object.assign(loadedTextures, textures);
        this.#textures = textures;
        this.#gltfs = gltfs;

        this.#sceneBuilder.loadAssets(this.#textures, this.#gltfs);

        await this.changeScene(name);

        this.bindResizer();
        this.bindAllMoves();

    }

    async changeScene(name) {

        this.#currentScene?.reset(); // reset camera, gui, controls, stop animation
        
        this.#container.innerHTML = '';

        if (this.#infosDomElements) {

            this.#infosDomElements.header.textContent = `XEngine - World ${name}`;
            this.#infosDomElements.msg.textContent = 'loading assets...';
        
        }

        const loadScene = this.worldScenes.find(s => s.name === name);
        
        await loadScene.init();

        this.#currentScene = loadScene;

        console.log(`Scene: ${this.#currentScene.name} Renderer: ${this.#currentScene.renderer.name}`);

        if (this.#infosDomElements) this.#infosDomElements.msg.textContent = 'assets all loaded. => renderding scene...';

        const start = Date.now();

        setTimeout(() => {

            loadScene.render();

            this.#container.append(this.#renderer.domElement);

            const end = Date.now();
            console.log(`render in ${(end - start) * .001} s`);

            const { objects, vertices, triangles } = this.countObjects(loadScene.scene);

            console.log(`objects: ${objects}, vertices: ${vertices}, triangles: ${triangles}`);

            if (this.#infosDomElements) this.#infosDomElements.msg.textContent = 'render complete!';

        }, 0);

    }

    get current() {

        return this.#currentScene.name;

    }

    countObjects(scene) {

        let objects = 0, vertices = 0, triangles = 0;

        scene.children.forEach(object => {

            object.traverseVisible( function ( object ) {
                objects ++;
    
                if ( object.isMesh ) {
    
                    const geometry = object.geometry;
    
                    vertices += geometry.attributes.position.count;
    
                    if ( geometry.index !== null ) {
    
                        triangles += geometry.index.count / 3;
    
                    } else {
    
                        triangles += geometry.attributes.position.count / 3;
    
                    }
    
                }
    
            } );

        });
        
        return { objects, vertices, triangles };
    } 

    bindResizer() {

        window.addEventListener('resize', () => {

            this.worldScenes.forEach(scene => {

                const { resizer } = scene;

                resizer.setSize();
                
                if (this.#currentScene === scene) {
                    
                    resizer.onResize();

                }

            });

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

        window.addEventListener('keydown', e => {

            switch (e.key) {
                case 'a':
                case 'A':
                case 'ArrowLeft':

                    if (!this.#keyADown) {

                        this.#keyADown = true;

                        if (!this.#keyDDown) {

                            // console.log('<');
                            this.#movingLeft = true;

                            eventDispatcher.publish(messageType, moveActions[0], this.current, this.#movingLeft);

                        } else {

                            // console.log('stop >'); // stop on local x
                            this.#movingRight = false;

                            eventDispatcher.publish(messageType, moveActions[1], this.current, this.#movingRight);

                        }

                        // this.logMovement();

                    }

                    break;

                case 'd':
                case 'D':
                case 'ArrowRight':

                    if (!this.#keyDDown) {

                        this.#keyDDown = true;

                        if (!this.#keyADown) {

                            // console.log('>');
                            this.#movingRight = true;

                            eventDispatcher.publish(messageType, moveActions[1], this.current, this.#movingRight);
                            
                        } else {

                            // console.log('stop <'); // stop on local x
                            this.#movingLeft = false;

                            eventDispatcher.publish(messageType, moveActions[0], this.current, this.#movingLeft);

                        }

                        // this.logMovement();

                    }

                    break;

                case 'w':
                case 'W':
                case 'ArrowUp':

                    if (!this.#keyWDown) {

                        this.#keyWDown = true;

                        if (!this.#keySDown) {

                            // console.log('^');
                            this.#movingForward = true;

                            eventDispatcher.publish(messageType, moveActions[2], this.current, this.#movingForward);

                        } else {

                            // console.log('stop v');
                            this.#movingBackward = false;

                            eventDispatcher.publish(messageType, moveActions[3], this.current, this.#movingBackward);

                        }

                        // this.logMovement();

                    }

                    break;

                case 's':
                case 'S':
                case 'ArrowDown':

                    if (!this.#keySDown) {

                        this.#keySDown = true;

                        if (!this.#keyWDown) {

                            // console.log('v');
                            this.#movingBackward = true;

                            eventDispatcher.publish(messageType, moveActions[3], this.current, this.#movingBackward);

                        } else {

                            // console.log('stop ^');
                            this.#movingForward = false;

                            eventDispatcher.publish(messageType, moveActions[2], this.current, this.#movingForward);

                        }

                        // this.logMovement();

                    }

                    break;

                case 'Shift':

                    if (!this.#keyShiftDown) {

                        this.#keyShiftDown = true;
                        this.#accelerate = true;

                        // console.log('faster!');
                        eventDispatcher.publish(messageType, moveActions[4], this.current, this.#accelerate);

                    }

                    break;

                case ' ':

                    if (!this.#keySpaceDown) {

                        this.#keySpaceDown = true;
                        this.#jump = true;

                        eventDispatcher.publish(messageType, moveActions[5], this.current, this.#jump);

                    }

                    break;

            }
        });

        window.addEventListener('keyup', e => {

            switch (e.key) {
                case 'a':
                case 'A':
                case 'ArrowLeft':
                    if (this.#keyDDown) {

                        // console.log('>');
                        this.#movingRight = true;

                        eventDispatcher.publish(messageType, moveActions[1], this.current, this.#movingRight);

                    } else {

                        // console.log('stop <'); // stop on local x
                        this.#movingLeft = false;

                        eventDispatcher.publish(messageType, moveActions[0], this.current, this.#movingLeft);

                    }

                    this.#keyADown = false;

                    // this.logMovement();

                    break;

                case 'd':
                case 'D':
                case 'ArrowRight':

                    if (this.#keyADown) {

                        // console.log('<');
                        this.#movingLeft = true;

                        eventDispatcher.publish(messageType, moveActions[0], this.current, this.#movingLeft);

                    } else {

                        // console.log('stop >'); // stop on local x
                        this.#movingRight = false;

                        eventDispatcher.publish(messageType, moveActions[1], this.current, this.#movingRight);

                    }

                    this.#keyDDown = false;

                    // this.logMovement();

                    break;

                case 'w':
                case 'W':
                case 'ArrowUp':

                    if (this.#keySDown) {

                        // console.log('v');
                        this.#movingBackward = true;

                        eventDispatcher.publish(messageType, moveActions[3], this.current, this.#movingBackward);

                    } else {

                        // console.log('stop ^'); // stop on local z
                        this.#movingForward = false;

                        eventDispatcher.publish(messageType, moveActions[2], this.current, this.#movingForward);

                    }

                    this.#keyWDown = false;

                    // this.logMovement();

                    break;

                case 's':
                case 'S':
                case 'ArrowDown':
                    
                    if (this.#keyWDown) {

                        // console.log('^');
                        this.#movingForward = true;

                        eventDispatcher.publish(messageType, moveActions[2], this.current, this.#movingForward);

                    } else {

                        // console.log('stop v'); // stop on local z
                        this.#movingBackward = false;

                        eventDispatcher.publish(messageType, moveActions[3], this.current, this.#movingBackward);

                    }

                    this.#keySDown = false;

                    // this.logMovement();

                    break;

                case 'Shift':

                    this.#keyShiftDown = false;
                    this.#accelerate = false;

                    // console.log('slow down');
                    eventDispatcher.publish(messageType, moveActions[4], this.current, this.#accelerate);

                    break;

                case ' ':

                    this.#keySpaceDown = false;
                    this.#jump = false;

                    eventDispatcher.publish(messageType, moveActions[5], this.current, this.#jump);

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
                    console.log('other left');
                    break;
                case 'd':
                case 'D':
                case 'ArrowRight':
                    console.log('other right');
                    break;
                case 'w':
                case 'W':
                case 'ArrowUp':
                    console.log('other up');
                    break;
                case 's':
                case 'S':
                case 'ArrowDown':
                    console.log('other down');
                    break;
                case 'Shift':
                    break;
                case ' ':
                    break;
            }
        });
    }

    logMovement() {

        console.log(`
            left:${this.#movingLeft} 
            right:${this.#movingRight} 
            forward:${this.#movingForward} 
            backward:${this.#movingBackward}`);
            
    }
}

export { World };