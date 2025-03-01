
import { WorldScene } from './WorldScene.js';
import { SimplePhysics } from '../components/physics/SimplePhysics.js';
import { independence } from '../components/basic/colorBase.js';

const sceneName = 'Animated Characters';
const worldSceneSpecs = {
    name: sceneName,
    camera: {
        position: [-1.5, 4.5, 6.5]
    },
    enableTPC: true,
    enableIC: true,
    scene: {
        backgroundColor: independence
    },
    enableGui: true,
    moveType: 'tankmove',
    enableShadow: true,
    enablePicker: true,
    // target, camera setup
    allTargets: [
        { x: 0, y: 0, z: 0 }
    ],
    allCameraPos: [
        { x: 3, y: 7, z: 8 }
    ],
    allPlayerPos: [
        [0, 3, 0]
    ],
    showManual: true
};

class WorldScene5 extends WorldScene {

    #loaded = false;

    constructor(container, renderer, globalConfig, eventDispatcher) {
        Object.assign(worldSceneSpecs, globalConfig)
        super(container, renderer, worldSceneSpecs, eventDispatcher);

        return {
            name: this.name,
            renderer: this.renderer,
            scene: this.scene,
            resizer: this.resizer,
            init: this.init.bind(this),
            render: this.render.bind(this),
            start: this.start.bind(this),
            stop: this.stop.bind(this),
            moveCamera: this.moveCamera.bind(this),
            resetCamera: this.resetCamera.bind(this),
            focusNext: this.focusNext.bind(this),
            reset: this.reset.bind(this),
            dispose: this.dispose.bind(this),
            setup: this.setup,
            paused: this.isScenePaused.bind(this)
        };
    }

    async init() {

        this.initBasic();

        if (this.#loaded) {
            this.initContainer();
            return
        }

        await this.postProcessor.init();
        await this.sceneBuilder.buildScene({ src: 'assets/sceneObjects/worldScene5.json' });

        this.physics = new SimplePhysics(this.players);

        this.loop.updatables.push(this.physics);

        // initialize player

        // no need to render at this time, so the change event of control won't do the rendering.
        this.changeCharacter('jill', false);

        // setup cameras
        this.thirdPersonCamera?.setup({ player: this.player, control: this.controls.defControl, scene: this.scene });
        this.inspectorCamera?.setup({ player: this.player, control: this.controls.defControl, scene: this.scene, rooms: this.rooms });

        this.showRoleSelector = true;

        // post processor
        this.enablePostProcessing(false);

        // Gui setup
        if (worldSceneSpecs.enableGui) {

            this.guiMaker.leftActions = {
                'actions': {
                    start: this.start.bind(this),
                    stop: this.stop.bind(this),
                    resetCamera: this.resetCamera.bind(this, false),
                    focusNext: this.focusNext.bind(this, false),
                    resetPlayer: this.resetCharacterPosition.bind(this),
                    resetScene: this.resetScene.bind(this),
                    saveScene: this.saveScene.bind(this),
                    loadScene: this.loadScene.bind(this)
                }
            };

            this.guiMaker.setupGuiConfig();

        }

        this.showCPlaneLines(false);
        this.showCPlaneArrows(false);

        this.initContainer();
        this.#loaded = true;

    }

}

export { WorldScene5 };