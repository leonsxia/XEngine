import { CubeMaker, SphereMaker, Sphere, Box, MeshGroup } from '../components/Models.js';
import { createBasicLights, createPointLights } from '../components/lights.js';
import { setupShadowLight } from '../components/shadowMaker.js';
import { WorldScene } from './WorldScene.js';
import { DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from '../components/utils/constants.js';

const sceneName = 'BasicObjects';
const worldSceneSpecs = {
    name: sceneName,
    camera: {
        position: [0, 0, 20]
    },
    scene: {
        backgroundColor: '#000000'
    },
    enableGui: true,
    enableShadow: false
};
// basic lights
const mainLightCtlSpecs = {
    name: 'mainLight',
    display: 'Directional Light',
    detail: {
        color: [255, 255, 255],
        intensity: 8,
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
    debug: false,
    visible: false
};
const hemisphereLightCtlSpecs = {
    name: 'hemisphereLight',
    display: 'Hemisphere Light',
    detail: {
        groundColor: [47, 79, 79],
        skyColor: [160, 160, 160],
        intensity: 15,
        position: [0, 1, 0] // light emit from top to bottom
    },
    type: HEMISPHERE_LIGHT,
    debug: true,
    visible: true
};
const basicLightSpecsArr = [mainLightCtlSpecs, ambientLightCtlSpecs, hemisphereLightCtlSpecs];
const pointLightSpecsArr = [];
const spotLightSpecsArr = [];

class WorldScene1 extends WorldScene  {
    #loaded = false;
    #basicLights = { mainLight: null, ambientLight: null, hemisphereLight: null };
    #pointLights = {};

    // 1. Create an instance of the World app   
    constructor(container, renderer, globalConfig, eventDispatcher) {
        Object.assign(worldSceneSpecs, globalConfig)
        super(container, renderer, worldSceneSpecs, eventDispatcher);

        this.#basicLights = createBasicLights(basicLightSpecsArr);
        this.#pointLights = createPointLights(pointLightSpecsArr);
        Object.assign(this.lights, this.#basicLights);
        Object.assign(this.lights, this.#pointLights);

        // this.camera.add(this.#pointLights['cameraSpotLight']);
        
        // this.scene.add(this.camera);

        // shadow light setup, including light helper
        // this.renderer.shadowMap.enabled = worldSceneSpecs.enableShadow;
        this.shadowLightObjects = setupShadowLight.call(this,
            this.scene, null, ...basicLightSpecsArr, ...pointLightSpecsArr
        );

        // Gui setup
        if (worldSceneSpecs.enableGui) {
            this.guiLights = { basicLightSpecsArr, pointLightSpecsArr, spotLightSpecsArr};
            this.setupGuiConfig();
        }
        return {
            name: this.name,
            renderer: this.renderer,
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
        // sphere
        const sphereSpecs = {
            map: 'assets/textures/crate.gif',
            name: 'sphere',
            size: {
                radius: 2,
                widthSegments: 32,
                heightSegments: 32
            }
        }
        const sphere = SphereMaker.createSphere(sphereSpecs);
        sphere.position.set(-10, 0, 0);
        sphere.rotation.set(0.25, 0, 0);

        // cube
        const cubeSpecs = {
            map: 'assets/textures/uv-test-col.png',
            name: 'box',
            size: {
                width: 2,
                height: 2,
                depth: 2
            }
        }
        const cube = CubeMaker.createCube(cubeSpecs);
        cube.position.set(-5, 0, 0);

        // box cube
        const boxSpecs = {
            map: 'assets/textures/crate.gif',
            name: 'crate',
            size: {
                width: 2,
                height: 3,
                depth: 3
            }
        }
        const box = new Box(boxSpecs);
        box.setRotation([0.25, -0.25, 0])
            .setPosition([0, 0, 0])
            .tick = (delta) => {
                box.mesh.rotation.y += delta * 8.59 * Math.PI / 180;
            }

        // earth
        const earthSpecs = {
            surfaceMap: 'assets/textures/earth_surface_2048.jpg',
            normalMap: 'assets/textures/earth_normal_2048.jpg',
            specularMap: 'assets/textures/earth_specular_2048.jpg',
            name: 'earth',
            size: {
                radius: 2,
                widthSegments: 32,
                heightSegments: 32
            }
        }
        const earth = new Sphere(earthSpecs);
        earth.setPosition([5, 0, 0])
            .setRotation([0.25, 0, 0])
            .tick = (delta) => {
                earth.mesh.rotation.y += delta * 8.59 * Math.PI / 180;
            }

        // mesh group
        const meshGroupSpecs = {
            position: [10, 0, 0]
        };
        const meshGroup = MeshGroup.createMeshGroup(meshGroupSpecs);
        
        await Promise.all([
            SphereMaker.loadMaterial(sphereSpecs),
            CubeMaker.loadMaterial(cubeSpecs),
            box.init(boxSpecs),
            earth.init(earthSpecs)
        ]);
        this.loop.updatables.push(sphere, cube, box, earth, meshGroup);
        this.scene.add(sphere, cube, box.mesh, earth.mesh, meshGroup);
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

export { WorldScene1 };