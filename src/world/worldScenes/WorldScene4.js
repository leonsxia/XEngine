import { createAxesHelper, createGridHelper } from '../components/utils/helpers.js';
import { createBasicLights, createPointLights, createSpotLights } from '../components/lights.js';
import { Train, Tofu, Sphere, BoxCube, Plane, CollisionPlane } from '../components/Models.js';
import { setupShadowLight } from '../components/shadowMaker.js';
import { SimplePhysics } from '../components/physics/SimplePhysics.js';
import { createCollisionPlane } from '../components/physics/collisionHelper.js';
import { WorldScene } from './WorldScene.js';

const sceneName = 'Simple Physics';
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
        intensity: 0.7,
        position: [-10, 20, 8.5],
        target: [0, 0, 0]
    },
    type: 'directional',
    debug: true,
    shadow: true,
    shadow_debug: true,
    helper_show: false,
    shadow_cam_show: false,
    visible: true
};
const ambientLightCtlSpecs = {
    name: 'ambientLight',
    display: 'Ambient Light',
    detail: {
        color: [128, 128, 128],
        intensity: 1
    },
    type: 'ambient',
    debug: true,
    visible: true
}
const hemisphereLightCtlSpecs = {
    name: 'hemisphereLight',
    display: 'Hemisphere Light',
    detail: {
        groundColor: [47, 79, 79],
        skyColor: [160, 160, 160],
        intensity: 0.5,
        position: [0, 1, 0] // light emit from top to bottom
    },
    type: 'hemisphere',
    debug: true,
    helper_show: false,
    visible: true
};
const basicLightSpecsArr = [mainLightCtlSpecs, ambientLightCtlSpecs, hemisphereLightCtlSpecs];
const pointLightSpecsArr = [
    {
        name: 'pointLight1',
        display: 'Point Light 1',
        detail: {
            color: [254, 190, 16],
            position: [7.8, 10, 0],
            intensity: 50,
            distance: 0,    // infinite far
            decay: 1    // default 2
        },
        debug: true,
        shadow: true,
        shadow_debug: true,
        helper_show: false,
        shadow_cam_show: false,
        visible: true
    }
];
const spotLightSpecsArr = [
    {
        name: 'spotLight1',
        display: 'Spot Light 1',
        detail: {
            color: [255, 235, 0],
            position: [5, 12, - 21],
            target: [0.4, - .2, 11.8],
            intensity: 26,
            distance: 45,    // 0 infinite far
            decay: 0.33,
            penumbra: 0.35,
            angle: 72 / 360 * Math.PI
        },
        debug: true,
        shadow: true,
        shadow_debug: true,
        helper_show: false,
        shadow_cam_show: false,
        visible: true
    }
];
// axes, grid helper
const axesSpecs = {
    size: 3,
    position: [-50.5, 0, -50.5]
};
const gridSpecs = {
    size: 100,
    divisions: 100
}

class WorldScene4 extends WorldScene {
    #loaded = false;
    #basicLights = {};
    #pointLights = {};
    #spotLights = {};

    constructor(container, renderer, globalConfig, eventDispatcher) {
        Object.assign(worldSceneSpecs, globalConfig)
        super(container, renderer, worldSceneSpecs, eventDispatcher);

        this.#basicLights = createBasicLights(basicLightSpecsArr);
        this.#pointLights = createPointLights(pointLightSpecsArr);
        this.#spotLights = createSpotLights(spotLightSpecsArr);
        Object.assign(this.lights, this.#basicLights);
        Object.assign(this.lights, this.#pointLights);
        Object.assign(this.lights, this.#spotLights);

        // this.camera.add(this.#pointLights['cameraSpotLight']);

        this.loop.updatables = [this.controls.defControl];
        this.scene.add( //this.camera, 
            createAxesHelper(axesSpecs), createGridHelper(gridSpecs));

        // shadow light setup, including light helper
        this.renderer.shadowMap.enabled = worldSceneSpecs.enableShadow;
        this.shadowLightObjects = setupShadowLight.call(this,
            this.scene, ...basicLightSpecsArr, ...pointLightSpecsArr, ...spotLightSpecsArr
        );
        
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
            // this.updateMainLightCamera();
            return;
        }
        
        // groud
        const groudSpecs = {
            width: 100,
            height: 100,
            color: 0xCC8866,
            name: 'ground'
        };
        const ground = new CollisionPlane(groudSpecs);
        ground.setRotation([-.5 * Math.PI, 0, 0]);
        ground.updateBoundingBoxHelper();
        ground.receiveShadow(true);

        // ceiling
        const ceilingSpecs = {
            width: 100,
            height: 100,
            color: 0xcccccc,
            name: 'ceiling'
        };
        const ceiling = new Plane(ceilingSpecs);
        ceiling.setRotation([.5 * Math.PI, 0, 0]);
        ceiling.setPosition([0, 20, 0]);
        ceiling.receiveShadow(true);


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
        earth.setPosition([0, 10, 0]);
        earth.setRotation([0.25, 0, 0]);
        earth.castShadow(true);
        earth.receiveShadow(true);

        // box cube
        const boxSpecs = {
            map: 'assets/textures/crate.gif',
            name: 'crate',
            size: {
                width: 2,
                height: 3,
                depth: 3
            },
            basicMaterial: worldSceneSpecs.basicMaterial
        }
        const box = new BoxCube(boxSpecs);
        box.setRotation([0.25, -0.25, 0]);
        box.setPosition([-10, 10, 0]);
        box.setScale([3, 3, 3]);
        box.castShadow(true);
        box.receiveShadow(true);

        const train = new Train('red train 2');
        // this.subscribeEvents(train, worldSceneSpecs.moveType);
        train.castShadow(true)
            .receiveShadow(true)
            .setPosition([0, 3, 0])
            .setScale([.5, .5, .5])
            .updateBoundingBoxHelper();

        const tofu = new Tofu('tofu1');
        // this.subscribeEvents(tofu, worldSceneSpecs.moveType);
        tofu.castShadow(true)
            .receiveShadow(true)
            .setPosition([0, 5, 3])
            .setRotation([0, Math.PI, 0])
            .setScale([.2, .3, .2])
            .updateBoundingBoxHelper();

        await Promise.all([
            earth.init(earthSpecs),
            box.init(boxSpecs)
        ]);

        const walls = this.createWalls()
            .concat(this.createWalls2())
            .concat(this.createInsideWalls())
            .concat(this.createInsideWalls2());
        this.players.push(tofu);
        this.players.push(train);
        this.walls = walls;
        this.floors.push(ground);
        this.physics = new SimplePhysics(this.players, this.floors, this.walls, this.obstacles);

        this.loop.updatables.push(earth, box, this.physics);
        this.scene.add(ground.mesh, ground.boundingBoxHelper, ceiling.mesh
        );

        this.changeCharacter('red train 2', false);

        walls.forEach(w => {
            this.scene.add(w.mesh, w.line, w.leftArrow, w.rightArrow);
        });

        this.showRoleSelector = true;
        // Gui setup
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
                moveCamera: this.moveCamera.bind(this),
                resetCamera: this.resetCamera.bind(this),
                focusNext: this.focusNext.bind(this)
            }
        });
    }

    createWalls() {
        // wall
        const specs = {
            width: 10,
            height: 2.5
        };
        const posY = specs.height / 2 - .1;

        const wall = createCollisionPlane(specs, 'wall', [20, posY, 0], - Math.PI / 6, true, true);

        const wall2 = createCollisionPlane(specs, 'wall2', [13.2, posY, 1.8], Math.PI / 3, true, true);

        const wall3 = createCollisionPlane(specs, 'wall3', [15, posY, 8.6], 5 * Math.PI / 6, true, true);

        const wall4 = createCollisionPlane(specs, 'wall4', [21.8, posY, 6.8], - 2 * Math.PI / 3, true, true);

        return [wall, wall2, wall3, wall4];
    }

    createWalls2() {
        const specs = {
            width: 10,
            height: 2.5
        };
        const posY = specs.height / 2 - .1;

        const wall = createCollisionPlane(specs, 'wall5', [0, posY, - 14], 0, true, true);

        const wall2 = createCollisionPlane(specs, 'wall6', [- 5, posY, - 9], Math.PI / 2, true, true);

        const wall3 = createCollisionPlane(specs, 'wall7', [0, posY, - 4], Math.PI, true, true);

        const wall4 = createCollisionPlane(specs, 'wall8', [5, posY, - 9], - Math.PI / 2, true, true);

        return [wall, wall2, wall3, wall4];
    }

    createInsideWalls() {
        const specs = {
            width: 1,
            height: 2.5
        }
        const offset = Math.sqrt(.5);
        const posY = specs.height / 2 - .1;
        
        const wall = createCollisionPlane(specs, 'wall9', [0, posY, -5], 0, true, true);

        const wall2 = createCollisionPlane(specs, 'wall10', [- .5 - offset / 2, posY, - 5 - offset / 2], - Math.PI / 4, true, true);

        const wall3 = createCollisionPlane(specs, 'wall11', [- .5 - offset, posY, - 5.5 - offset], - Math.PI / 2, true, true);

        const wall4 = createCollisionPlane(specs, 'wall12', [- .5 - offset / 2, posY, - 6 - 3 * offset / 2], - 3 * Math.PI / 4, true, true);

        const wall5 = createCollisionPlane(specs, 'wall13', [0, posY, - 6 - 2 * offset], Math.PI, true, true);

        const wall6 = createCollisionPlane(specs, 'wall14', [.5 + offset / 2, posY, - 6 - 3 * offset / 2], 3 * Math.PI / 4, true, true);

        const wall7 = createCollisionPlane(specs, 'wall15', [.5 + offset, posY, - 5.5 - offset], Math.PI / 2, true, true);

        const wall8 = createCollisionPlane(specs, 'wall16', [.5 + offset / 2, posY, - 5 - offset / 2], Math.PI / 4, true, true);

        return [
            wall, wall2, wall3, wall4, 
            wall5, wall6, wall7, wall8
        ];
    }

    createInsideWalls2() {
        const specs = {
            width: 1,
            height: 2.5
        }

        const specsL = {
            width: 2,
            height: 2.5
        }
        const posY = specs.height / 2 - .1;

        const wall = createCollisionPlane(specsL, 'wall17', [- 3, posY, - 5], - Math.PI / 2, true, true);

        const wall2 = createCollisionPlane(specs, 'wall18', [- 2.5, posY, - 6], Math.PI, true, true);

        const wall3 = createCollisionPlane(specsL, 'wall19', [- 2, posY, - 5], Math.PI / 2, true, true);

        const wall4 = createCollisionPlane(specsL, 'wall20', [2, posY, - 5], - Math.PI / 2, true, true);

        const wall5 = createCollisionPlane(specs, 'wall21', [2.5, posY, - 6], Math.PI, true, true);

        const wall6 = createCollisionPlane(specsL, 'wall22', [3, posY, - 5], Math.PI / 2, true, true);

        return [wall, wall2, wall3, wall4, wall5, wall6];
    }

    focusNext() {
        const allTargets = [
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: - 9},
            { x: 18, y: 0, z: 4 },
        ];
        const allCameraPos = [
            { x: 10, y: 10, z: 10 },
            { x: 10, y: 13, z: - 1},
            { x: 20, y: 10, z: 20 }
        ];
        const allPlayerPos = [
            [0, 3, 0],
            [0, 3, - 9],
            [18, 3, 4],
        ]

        const setup = { allTargets, allCameraPos, allPlayerPos };

        this.focusNextProcess(setup);
    }
}

export { WorldScene4 };