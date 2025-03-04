import { createAxesHelper, createGridHelper } from '../components/utils/helpers.js';
import { createBasicLights, createPointLights } from '../components/lights.js';
import { Train } from '../components/Models.js';
import { setupShadowLight } from '../components/shadowMaker.js';
import { WorldScene } from './WorldScene.js';
import { DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from '../components/utils/constants.js';

const sceneName = 'RunningTrain';
const worldSceneSpecs = {
    name: sceneName,
    camera: {
        position: [10, 10, 10]
    },
    scene: {
        backgroundColor: 'lightblue'
    },
    enableGui: true,
    moveType: 'tankmove',
    enableShadow: true,
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
    shadow: true,
    shadow_debug: true,
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
    debug: false,
    visible: false
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
    position: [-25.5, 0, -25.5]
};
const gridSpecs = {
    size: 50,
    divisions: 50
}

class WorldScene2 extends WorldScene {

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

        this.scene.add( //this.camera, 
            createAxesHelper(axesSpecs), createGridHelper(gridSpecs));

        // shadow light setup, including light helper
        // this.renderer.shadowMap.enabled = worldSceneSpecs.enableShadow;
        this.shadowLightObjects = setupShadowLight.call(this,
            this.scene, null, ...basicLightSpecsArr, ...pointLightSpecsArr
        );

    }

    async init() {

        this.initBasic();

        if (this.loaded) return;

        const { 
            camera: { position = [0, 0, 0] },
            enableShadow = false
        } = this.setup;

        // renderer shadow enable
        this.renderer.shadowMap.enabled = enableShadow;

        // setup cameras
        this.defaultCamera.position = position;

        this.forceStaticRender = false;
        this.controls.defControl.update();
        this.forceStaticRender = true;

        this.controls.defControl.saveState();

        const train = new Train('red train');
        train.setPosition([0, 1.25, 0]);
        this.subscribeEvents(train, worldSceneSpecs.moveType);
        train.castShadow(true);
        train.receiveShadow(true);
        this.loop.updatables.push(train);
        this.scene.add(train.group);

        if (worldSceneSpecs.enableGui) {

            this.guiMaker.guiLights = { basicLightSpecsArr, pointLightSpecsArr, spotLightSpecsArr };

            this.guiMaker.leftActions = {
                'actions': {
                    start: this.start.bind(this),
                    stop: this.stop.bind(this),
                    moveCamera: this.moveCamera.bind(this, false),
                    resetCamera: this.resetCamera.bind(this, false)
                }
            };

            this.guiMaker.setupGuiConfig();
            
        }
        
        this.initContainer();

        this.loaded = true;

    }

}

export { WorldScene2 };