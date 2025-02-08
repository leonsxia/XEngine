import { createAxesHelper, createGridHelper } from '../components/utils/helpers.js';
import { createBasicLights, createPointLights } from '../components/lights.js';
import { BirdsGroup } from '../components/Models.js';
import { setupShadowLight } from '../components/shadowMaker.js';
import { WorldScene } from './WorldScene.js';
import { DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from '../components/utils/constants.js';

const sceneName = 'Birds';
const worldSceneSpecs = {
    name: sceneName,
    camera: {
        position: [-1.5, 4.5, 6.5]
    },
    scene: {
        backgroundColor: 'lightblue'
    },
    enableGui: true,
    enableShadow: false,
    enablePicker: false
};
// basic lights
const mainLightCtlSpecs = {
    name: 'mainLight',
    display: 'Directional Light',
    detail: {
        color: [255, 255, 255],
        intensity: 2,
        position: [-10, 10, 10],
        target: [0, 0, 0]
    },
    type: DIRECTIONAL_LIGHT,
    debug: true,
    shadow: false,
    shadow_debug: false,
    visible: true
};
const ambientLightCtlSpecs = {
    name: 'ambientLight',
    display: 'Ambient Light',
    detail: {
        color: [128, 128, 128],
        intensity: 2
    },
    type: AMBIENT_LIGHT,
    debug: true,
    visible: true
};
const hemisphereLightCtlSpecs = {
    name: 'hemisphereLight',
    display: 'Hemisphere Light',
    detail: {
        groundColor: [47, 79, 79],
        skyColor: [160, 160, 160],
        intensity: 3,
        position: [0, 1, 0] // light emit from top to bottom
    },
    type: HEMISPHERE_LIGHT,
    debug: true,
    visible: true
};
const basicLightSpecsArr = [mainLightCtlSpecs, ambientLightCtlSpecs, hemisphereLightCtlSpecs];
const pointLightSpecsArr = [];
const spotLightSpecsArr = [];
// axes, grid helper
const axesSpecs = {
    size: 3,
    position: [-10.5, 0, -10.5]
};
const gridSpecs = {
    size: 20,
    divisions: 20
}

class WorldScene3 extends WorldScene {
    #objects = [];
    #loaded = false;
    #basicLights = {};
    #pointLights = {};

    constructor(container, renderer, globalConfig, eventDispatcher) {
        Object.assign(worldSceneSpecs, globalConfig)
        super(container, renderer, worldSceneSpecs, eventDispatcher);

        this.#basicLights = createBasicLights(basicLightSpecsArr);
        this.#pointLights = createPointLights(pointLightSpecsArr);
        Object.assign(this.lights, this.#basicLights);
        Object.assign(this.lights, this.#pointLights);

        // this.camera.add(this.#pointLights['cameraSpotLight']);
        
        this.scene.add(  //this.camera, 
            createAxesHelper(axesSpecs), createGridHelper(gridSpecs));

        // shadow light setup, including light helper
        // this.renderer.shadowMap.enabled = worldSceneSpecs.enableShadow;
        this.shadowLightObjects = setupShadowLight.call(this,
            this.scene, null, ...basicLightSpecsArr, ...pointLightSpecsArr
        );

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
            paused: this.isScenePaused.bind(this)
        };
    }

    async init() {

        this.initBasic();

        if (this.#loaded) {
            this.initContainer();
            return
        }
        const birdsSpecs = {
            models: [{
                src: 'assets/models/Parrot.glb',
                name: 'parrot',
                position: [0, 3, 2.5]
            }, {
                src: 'assets/models/Flamingo.glb',
                name: 'flamingo',
                position: [7.5, 3, -10]
            }, {
                src: 'assets/models/Stork.glb',
                name: 'stork',
                position: [0, 1.5, -10]
            }]
        };

        const birdsGroup = new BirdsGroup(birdsSpecs);
        birdsGroup.name = 'birdsGroup';
        this.#objects.push(birdsGroup);
        await birdsGroup.loadBirds();
        // move the target to the center of the front bird
        this.controls.defControl.target.copy(birdsGroup.getBirds(0).position);

        this.forceStaticRender = false;
        this.controls.defControl.update();
        this.forceStaticRender = true;

        this.controls.defControl.saveState();

        this.loop.updatables.push(birdsGroup);

        this.scene.add(birdsGroup);

        if (worldSceneSpecs.enableGui) {

            this.guiMaker.guiLights = { basicLightSpecsArr, pointLightSpecsArr, spotLightSpecsArr };

            this.guiMaker.leftActions = {
                'actions': {
                    start: this.start.bind(this),
                    stop: this.stop.bind(this),
                    moveCamera: this.moveCamera.bind(this, false),
                    resetCamera: this.resetCamera.bind(this, false),
                    focusNext: this.focusNext.bind(this, false)
                }
            };

            this.guiMaker.setupGuiConfig();
            
        }

        this.initContainer();

        this.#loaded = true;

    }

    focusNext(forceStaticRender = true) {
        // console.log(this.#loadSequence);
        const birdsGroup = this.#objects.find((obj) => obj.name === 'birdsGroup');
        const allTargets = birdsGroup.positions.concat([{x: 0, y: 0, z: 0}]);
        const allCameraPos = birdsGroup.getBirdsCamsPositions(5);
        allCameraPos.push({x: 20, y: 15, z: 20}); // the last view camera position
        const pos = {
            allTargets,
            allCameraPos
        }

        Object.assign(worldSceneSpecs, pos);
        this.focusNextProcess(forceStaticRender);
    }
}

export { WorldScene3 };