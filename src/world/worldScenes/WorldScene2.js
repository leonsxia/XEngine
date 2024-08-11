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
    enableShadow: true
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

        this.scene.add( //this.camera, 
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
            dispose: this.dispose.bind(this)
        };
    }

    async init() {

        this.renderer.shadowMap.enabled = worldSceneSpecs.enableShadow;

        if (this.#loaded) {
            this.initContainer();
            return;
        }
        const train = new Train('red train');
        train.setPosition([0, 1.25, 0]);
        this.subscribeEvents(train, worldSceneSpecs.moveType);
        train.castShadow(true);
        train.receiveShadow(true);
        this.loop.updatables.push(train);
        this.scene.add(train.group);

        if (worldSceneSpecs.enableGui) {
            this.guiLights = { basicLightSpecsArr, pointLightSpecsArr, spotLightSpecsArr };
            this.setupGuiConfig();
        }
        
        this.initContainer();
        this.#loaded = true;
    }

    setupLeftFunctionPanle() {
        // assgin left panel parents
        Object.assign(this.guiLeftSpecs.parents, {
            'actions': {
                start: this.start.bind(this),
                stop: this.stop.bind(this),
                moveCamera: this.moveCamera.bind(this, false),
                resetCamera: this.resetCamera.bind(this, false),
                focusNext: this.focusNext.bind(this, false)
            }
        });
    }
}

export { WorldScene2 };