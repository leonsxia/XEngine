import { WorldScene } from './WorldScene.js';
import { SimplePhysics } from '../components/physics/SimplePhysics.js';
import { independence } from '../components/basic/colorBase.js';

const sceneName = 'Water Room';
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
    // target, camera setup
    allTargets: [
        { x: 0, y: 0, z: 0 }
    ],
    allCameraPos: [
        { x: 5, y: 15, z: 15 }
    ],
    allPlayerPos: [
        [0, 4.5, 6.25]
    ]
};

class WaterRoom extends WorldScene {

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
            dispose: this.dispose.bind(this)
        };
    }

    async init() {

        this.renderer.shadowMap.enabled = worldSceneSpecs.enableShadow;
        this.picker.setup(this);
        this.sceneBuilder.worldScene = this;

        if (this.#loaded) {
            this.initContainer();
            return;
        }

        await this.postProcessor.init();
        await this.sceneBuilder.buildScene({ src: 'assets/sceneObjects/water_room.json' });

        this.physics = new SimplePhysics(this.players);

        this.loop.updatables.push(this.physics);

        // initialize player

        // no need to render at this time, so the change event of control won't do the rendering.
        this.changeCharacter('tofu1', false);

        // setup cameras
        this.thirdPersonCamera?.setup({ player: this.player, control: this.controls.defControl, scene: this.scene });
        this.inspectorCamera?.setup({ player: this.player, control: this.controls.defControl, scene: this.scene, rooms: this.rooms });

        this.showRoleSelector = true;

        // post processor
        this.enablePostProcessing(false);

        // Gui setup
        if (worldSceneSpecs.enableGui) {
            this.setupGuiConfig();
        }

        this.showCPlaneLines(false);
        this.showCPlaneArrows(false);

        this.initContainer();
        this.#loaded = true;
    }

    setupLeftFunctionPanle() {
        // assgin left panel parents
        Object.assign(this.guiLeftSpecs.parents, {
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
        });
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

export { WaterRoom };