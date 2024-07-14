import { createAxesHelper, createGridHelper } from '../components/utils/helpers.js';
import { createBasicLights, createPointLights, createSpotLights } from '../components/lights.js';
import { Train, Tofu, Sphere, BoxCube, Plane, CollisionPlane, Room, SquarePillar, LWall, CylinderPillar } from '../components/Models.js';
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
            color: [255, 199, 44],
            position: [7.8, 15.78, 0],
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
// target, camera setup
const allTargets = [
    { x: 0, y: 0, z: 10 },
    { x: 0, y: 0, z: - 9},
    { x: 18, y: 0, z: 4 },
];
const allCameraPos = [
    { x: 10, y: 10, z: 25 },
    { x: 10, y: 13, z: - 1},
    { x: 20, y: 10, z: 20 }
];
const allPlayerPos = [
    [0, 3, 10],
    [0, 3, - 9],
    [18, 3, 4],
]

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
        // const earthSpecs = {
        //     surfaceMap: 'assets/textures/earth_surface_2048.jpg',
        //     normalMap: 'assets/textures/earth_normal_2048.jpg',
        //     specularMap: 'assets/textures/earth_specular_2048.jpg',
        //     name: 'earth',
        //     size: {
        //         radius: 2,
        //         widthSegments: 32,
        //         heightSegments: 32
        //     }
        // }
        // const earth = new Sphere(earthSpecs);
        // earth.setPosition([0, 10, 0]);
        // earth.setRotation([0.25, 0, 0]);
        // earth.castShadow(true);
        // earth.receiveShadow(true);

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
            // .setRotation([0, Math.PI, 0])
            .setScale([.2, .3, .2])
            .updateBoundingBoxHelper();

        const [tmp1, room1, room2, room3] = await Promise.all([
            // earth.init(earthSpecs),
            box.init(boxSpecs),
            this.createRoom1(),
            this.createRoom2(),
            this.createRoom3(),
        ]);

        this.rooms.push(room1);
        this.rooms.push(room2);
        this.rooms.push(room3);
        
        this.players.push(tofu);
        this.players.push(train);
        // this.floors.push(ground);
        this.physics = new SimplePhysics(this.players, this.floors, this.walls, this.obstacles);

        this.loop.updatables.push(box, this.physics);
        this.scene.add(ground.mesh, ground.boundingBoxHelper, ceiling.mesh);

        // initialize player and rooms
        this.changeCharacter('tofu1');
        this.loadSequence = -1;
        this.focusNext();

        this.scene.add(room1.group);
        // room1.walls.forEach(w => this.scene.add(w.line, w.leftArrow, w.rightArrow));
        // room1.floors.forEach(f => this.scene.add(f.line, f.boundingBoxHelper));
        this.scene.add(room2.group);
        // room2.walls.forEach(w => this.scene.add(w.line, w.leftArrow, w.rightArrow));
        // room2.floors.forEach(f => this.scene.add(f.line, f.boundingBoxHelper));
        this.scene.add(room3.group);
        // room3.walls.forEach(w => this.scene.add(w.line, w.leftArrow, w.rightArrow));
        // room3.floors.forEach(f => this.scene.add(f.line, f.boundingBoxHelper));

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

    async createRoom1() {
        const specs = {
            width: 10,
            height: 4.6,
            depth: 15,
            frontMap: 'assets/textures/walls/Texturelabs_Concrete_132S.jpg',
            backMap: 'assets/textures/walls/Texturelabs_Concrete_132S.jpg',
            leftMap: 'assets/textures/walls/Texturelabs_Concrete_132S.jpg',
            rightMap: 'assets/textures/walls/Texturelabs_Concrete_132S.jpg',
            mapRatio: 1.5,
            name: 'room1'
        };

        const spSepcs1 = {
            width: 1,
            height: 4.6,
            depth: 1,
            frontMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            backMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            leftMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            rightMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            mapRatio: 1.5,
            name: 'square_pillar1',
            showArrow: false
        };

        const lwSpecs1 = {
            width: 3,
            height: 4.6,
            depth: 5,
            thickness: .5,
            outTMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            outSMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            inTMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            inSMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            sideTMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            sideSMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            mapRatio: 1.5,
            name: 'LWall1',
            showArrow: false
        };

        const floorSpecs = {
            width: 10,
            height: 15,
            map: 'assets/textures/walls/Texturelabs_Fabric_190S.jpg',
            name: 'floor1',
            mapRatio: 1.5
        };

        const posY = specs.height / 2;

        const floor = new CollisionPlane(floorSpecs);
        floor.setRotation([- .5 * Math.PI, 0, 0])
            .setPosition([0,  - posY + .1, 0]);
        floor.receiveShadow(true);

        const spillar1 = new SquarePillar(spSepcs1);
        spillar1.setPosition([0, 0, -5])
            .setRotationY(5 * Math.PI / 6);

        const lwall1 = new LWall(lwSpecs1);
        lwall1.setPosition([1.5, 0, 5]);

        const room = new Room(specs);
        room.addGroups([spillar1, lwall1]);
        room.addFloors([floor]);

        await room.init();

        room.setPosition([0, posY, 15])
            .setRotationY(- Math.PI / 6)
            .updateWallsBBandRay();

        return room;
    }

    async createRoom2() {
        const specs = {
            width: 10,
            height: 4.6,
            depth: 20,
            frontMap: 'assets/textures/walls/Texturelabs_Concrete_128S.jpg',
            backMap: 'assets/textures/walls/Texturelabs_Concrete_128S.jpg',
            leftMap: 'assets/textures/walls/Texturelabs_Concrete_128S.jpg',
            rightMap: 'assets/textures/walls/Texturelabs_Concrete_128S.jpg',
            mapRatio: 1.5,
            name: 'room2'
        };

        const spSepcs3 = {
            width: 1,
            height: 4.6,
            depth: 2,
            frontMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            backMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            leftMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            rightMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            mapRatio: 1.5,
            name: 'square_pillar3',
            showArrow: false
        };

        const spSepcs4 = {
            width: 1,
            height: 4.6,
            depth: 2,
            frontMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            backMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            leftMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            rightMap: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            mapRatio: 1.5,
            name: 'square_pillar4',
            showArrow: false
        };

        const cpSepcs1 = {
            width: 1,
            height: 4.6,
            map: 'assets/textures/walls/Texturelabs_Brick_159S.jpg',
            mapRatio: 1.5,
            name: 'cylinder_pillar1',
            showArrow: false
        };

        const floorSpecs = {
            width: 10,
            height: 20,
            map: 'assets/textures/walls/Texturelabs_Stone_165S.jpg',
            name: 'floor1',
            // mapRatio: 1.5,
            repeatU: 1.3,
            repeatV: 1,
            rotationT: Math.PI / 2
        };

        const posY = specs.height / 2;

        const floor = new CollisionPlane(floorSpecs);
        floor.setRotation([- .5 * Math.PI, 0, 0])
            .setPosition([0,  - posY + .1, 0]);
        floor.receiveShadow(true);

        const spillar3 = new SquarePillar(spSepcs3);
        const spillar4 = new SquarePillar(spSepcs4);
        const cpillar1 = new CylinderPillar(cpSepcs1);
        spillar3.setPosition([- 2.5, 0, 9]);
        spillar4.setPosition([2.5, 0, 9]);
        cpillar1.setPosition([0, 0, 0])

        const room = new Room(specs);
        room.addGroups([spillar3, spillar4, cpillar1]);
        room.addFloors([floor]);

        await room.init();

        room.setPosition([0, posY, -13])
            .setRotationY(5 * Math.PI / 6)
            .updateWallsBBandRay();

        return room;
    }

    async createRoom3() {
        const specs = {
            width: 10,
            height: 4.6,
            depth: 20,
            frontMap: 'assets/textures/walls/Texturelabs_Wood_186S.jpg',
            backMap: 'assets/textures/walls/Texturelabs_Wood_186S.jpg',
            leftMap: 'assets/textures/walls/Texturelabs_Wood_186S.jpg',
            rightMap: 'assets/textures/walls/Texturelabs_Wood_186S.jpg',
            mapRatio: 1.5,
            name: 'room3'
        };

        const floorSpecs = {
            width: 10,
            height: 20,
            map: 'assets/textures/walls/Texturelabs_Wood_227S.jpg',
            name: 'floor3',
            mapRatio: 1.5,
            repeatU: 1.5,
            repeatV: 2.8
        };

        const posY = specs.height / 2;

        const floor = new CollisionPlane(floorSpecs);
        floor.setRotation([- .5 * Math.PI, 0, 0])
            .setPosition([0,  - posY + .1, 0]);
        floor.receiveShadow(true);

        const room = new Room(specs);
        room.addFloors([floor]);

        await room.init();

        room.setPosition([20, posY, 4.3])
            .setRotationY(- Math.PI / 6)
            .updateWallsBBandRay();

        return room;
    }

    focusNext() {
        const setup = { allTargets, allCameraPos, allPlayerPos };

        this.focusNextProcess(setup);
        this.physics.walls = this.rooms[this.loadSequence].walls;
        this.physics.floors = this.rooms[this.loadSequence].floors;
    }
}

export { WorldScene4 };