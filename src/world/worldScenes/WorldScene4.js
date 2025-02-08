import { WorldScene } from './WorldScene.js';
import { SimplePhysics } from '../components/physics/SimplePhysics.js';
import { independence } from '../components/basic/colorBase.js';

const sceneName = 'Simple Physics';
const worldSceneSpecs = {
    name: sceneName,
    camera: {
        position: [10, 10, 10]
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
        { x: 0, y: 0, z: 10 },
        { x: 0, y: 0, z: - 14 },
        { x: 28, y: 0, z: 4 },
    ],
    allCameraPos: [
        { x: 10, y: 10, z: 25 },
        { x: 7, y: 17, z: - 5 },
        { x: 30, y: 10, z: 20 }
    ],
    allPlayerPos: [
        [1, 5, 15],
        [0, 6, - 13],
        [25, 3, 4],
    ],
    resolution: .8,
    showManual: true
};

class WorldScene4 extends WorldScene {

    #loaded = false;

    constructor(container, renderer, globalConfig, eventDispatcher) {
        Object.assign(worldSceneSpecs, globalConfig);
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
            return;
        }

        await this.postProcessor.init();
        await this.sceneBuilder.buildScene({ src: 'assets/sceneObjects/worldScene4.json' });

        this.physics = new SimplePhysics(this.players);

        this.loop.updatables.push(this.physics);

        // initialize player

        // no need to render at this time, so the change event of control won't do the rendering.
        this.changeCharacter('jill', false);

        // setup cameras
        this.thirdPersonCamera?.setup({ player: this.player, control: this.controls.defControl, scene: this.scene });
        this.inspectorCamera?.setup({ player: this.player, control: this.controls.defControl, scene: this.scene, rooms: this.rooms })

        this.showRoleSelector = true;

        // post processor
        this.enablePostProcessing(false);

        // Gui setup
        if (worldSceneSpecs.enableGui) {

            this.guiMaker.leftActions = {
                'actions': {
                    start: this.start.bind(this),
                    stop: this.stop.bind(this),
                    moveCamera: this.moveCamera.bind(this, false),
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

    focusNext(forceStaticRender = true) {
        
        this.focusNextProcess(forceStaticRender);
        
        this.physics.initPhysics(this.rooms[this.loadSequence]);

        this.rooms.forEach((room, idx) => {
            if (idx === this.loadSequence) {
                room.setLightsVisible(true);
            } else {
                room.setLightsVisible(false);
            }
        });
    }
}

export { WorldScene4 };