import { createAxesHelper, createGridHelper } from '../components/utils/helpers.js';
import { createBasicLights, createPointLights, createSpotLights } from '../components/lights.js';
import { Train, Tofu, Plane, OBBPlane, Room, SquarePillar, LWall, CylinderPillar, HexCylinderPillar, BoxCube, Slope, Stairs, WoodenPicnicTable, WoodenSmallTable } from '../components/Models.js';
import { setupShadowLight } from '../components/shadowMaker.js';
import { SimplePhysics } from '../components/physics/SimplePhysics.js';
import { loadTextures } from '../components/utils/textureHelper.js';
import { loadGLTFModels } from '../components/utils/gltfHelper.js';
import { MIRRORED_REPEAT, DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from '../components/utils/constants.js';
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
    enableShadow: true,
    // target, camera setup
    allTargets: [
        { x: 0, y: 0, z: 10 },
        { x: 0, y: 0, z: - 14 },
        { x: 18, y: 0, z: 4 },
    ],
    allCameraPos: [
        { x: 10, y: 10, z: 25 },
        { x: 7, y: 17, z: - 5 },
        { x: 20, y: 10, z: 20 }
    ],
    allPlayerPos: [
        [1, 5, 15],
        [0, 6, - 13],
        [18, 3, 4],
    ]
};

const ROOM1 = 'room1';
const ROOM2 = 'room2';
const ROOM3 = 'room3';

const TEXTURE_NAMES = {
    CRATE: 'CRATE',
    CRATE_NORMAL: 'CRATE_NORMAL',
    CONCRETE_128: 'CONCRETE_128',
    CONCRETE_128_NORMAL: 'CONCRETE_128_NORMAL',
    CONCRETE_132: 'CONCRETE_132',
    CONCRETE_132_NORMAL: 'CONCRETE_132_NORMAL',
    BRICK_159: 'BRICK_159',
    BRICK_159_NORMAL: 'BRICK_159_NORMAL',
    FABRIC_190: 'FABRIC_190',
    FABRIC_190_NORMAL: 'FABRIC_190_NORMAL',
    STONE_165: 'STONE_165',
    STONE_165_NORMAL: 'STONE_165_NORMAL',
    WOOD_186: 'WOOD_186',
    WOOD_186_NORMAL: 'WOOD_186_NORMAL',
    WOOD_227: 'WOOD_227',
    WOOD_227_NORMAL: 'WOOD_227_NORMAL'
}

const TEXTURES = [{
    name: TEXTURE_NAMES.CRATE, map: 'assets/textures/crate.png', normalMap: 'assets/textures/normals/crate.jpg'
}, {
    name: TEXTURE_NAMES.CONCRETE_128, map: 'assets/textures/walls/Texturelabs_Concrete_128M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Concrete_128L.jpg'
}, {
    name: TEXTURE_NAMES.CONCRETE_132, map: 'assets/textures/walls/Texturelabs_Concrete_132M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Concrete_132L.jpg'
}, {
    name: TEXTURE_NAMES.BRICK_159, map: 'assets/textures/walls/Texturelabs_Brick_159M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Brick_159L.jpg'
}, {
    name: TEXTURE_NAMES.FABRIC_190, map: 'assets/textures/walls/Texturelabs_Fabric_190M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Fabric_190L.jpg'
}, {
    name: TEXTURE_NAMES.STONE_165, map: 'assets/textures/walls/Texturelabs_Stone_165M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Stone_165L.jpg'
}, {
    name: TEXTURE_NAMES.WOOD_186, map: 'assets/textures/walls/Texturelabs_Wood_186M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Wood_186L.jpg'
}, {
    name: TEXTURE_NAMES.WOOD_227, map: 'assets/textures/walls/Texturelabs_Wood_227M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Wood_227L.jpg'
}];

const GLTF_NAMES = {
    WOODEN_PICNIC_TABLE: 'WOODEN_PICNIC_TABLE',
    WOODEN_TABLE: 'WOODEN_TABLE'
}

const GLTFS = [{
    name: GLTF_NAMES.WOODEN_PICNIC_TABLE, src: 'wooden_picnic_table_1k/wooden_picnic_table_1k.gltf'
}, {
    name: GLTF_NAMES.WOODEN_TABLE, src: 'wooden_table_1k/wooden_table_02_1k.gltf'
}];

// basic lights
// room1
const mainLightCtlSpecs1 = {
    room: ROOM1,
    name: 'mainLight1',
    display: 'Directional Light',
    detail: {
        color: [255, 255, 255],
        intensity: 0.7,
        position: [0, 4.3, 0],
        target: [0, 0, 0]
    },
    type: DIRECTIONAL_LIGHT,
    debug: true,
    shadow: true,
    shadow_debug: true,
    helper_show: false,
    shadow_cam_show: false,
    visible: true
};
const ambientLightCtlSpecs1 = {
    room: ROOM1,
    name: 'ambientLight1',
    display: 'Ambient Light',
    detail: {
        color: [128, 128, 128],
        intensity: 1
    },
    type: AMBIENT_LIGHT,
    debug: true,
    visible: true
}
const hemisphereLightCtlSpecs1 = {
    room: ROOM1,
    name: 'hemisphereLight1',
    display: 'Hemisphere Light',
    detail: {
        groundColor: [47, 79, 79],
        skyColor: [160, 160, 160],
        intensity: 0.5,
        position: [0, 1, 0] // light emit from top to bottom
    },
    type: HEMISPHERE_LIGHT,
    debug: true,
    helper_show: false,
    visible: true
};

// room2
const mainLightCtlSpecs2 = {
    room: ROOM2,
    name: 'mainLight2',
    display: 'Directional Light',
    detail: {
        color: [255, 255, 255],
        intensity: 0.05,
        position: [0, 6, 0],
        target: [0, 0, 0]
    },
    type: DIRECTIONAL_LIGHT,
    debug: true,
    shadow: true,
    shadow_debug: true,
    helper_show: false,
    shadow_cam_show: false,
    visible: true
};
const ambientLightCtlSpecs2 = {
    room: ROOM2,
    name: 'ambientLight2',
    display: 'Ambient Light',
    detail: {
        color: [128, 128, 128],
        intensity: 1
    },
    type: AMBIENT_LIGHT,
    debug: true,
    visible: true
}
const hemisphereLightCtlSpecs2 = {
    room: ROOM2,
    name: 'hemisphereLight2',
    display: 'Hemisphere Light',
    detail: {
        groundColor: [54, 212, 22],
        skyColor: [40, 157, 215],
        intensity: 0.3,
        position: [0, 1, 0] // light emit from top to bottom
    },
    type: HEMISPHERE_LIGHT,
    debug: true,
    helper_show: false,
    visible: true
};

// room3
const mainLightCtlSpecs3 = {
    room: ROOM3,
    name: 'mainLight3',
    display: 'Directional Light',
    detail: {
        color: [255, 255, 255],
        intensity: 0.7,
        position: [-10, 20, 8.5],
        target: [0, 0, 0]
    },
    type: DIRECTIONAL_LIGHT,
    debug: true,
    shadow: true,
    shadow_debug: true,
    helper_show: false,
    shadow_cam_show: false,
    visible: true
};
const ambientLightCtlSpecs3 = {
    room: ROOM3,
    name: 'ambientLight3',
    display: 'Ambient Light',
    detail: {
        color: [128, 128, 128],
        intensity: 1
    },
    type: AMBIENT_LIGHT,
    debug: true,
    visible: true
}
const hemisphereLightCtlSpecs3 = {
    room: ROOM3,
    name: 'hemisphereLight3',
    display: 'Hemisphere Light',
    detail: {
        groundColor: [47, 79, 79],
        skyColor: [160, 160, 160],
        intensity: 0.5,
        position: [0, 4.6, 0] // light emit from top to bottom
    },
    type: HEMISPHERE_LIGHT,
    debug: true,
    helper_show: false,
    visible: true
};

const basicLightSpecsArr = [
    mainLightCtlSpecs1, ambientLightCtlSpecs1, hemisphereLightCtlSpecs1,
    mainLightCtlSpecs2, ambientLightCtlSpecs2, hemisphereLightCtlSpecs2,
    mainLightCtlSpecs3, ambientLightCtlSpecs3, hemisphereLightCtlSpecs3
];

const pointLightSpecsArr = [
    {
        room: ROOM1,
        name: 'pointLight1',
        display: 'Point Light',
        detail: {
            color: [251, 230, 172],
            position: [0, 4, - 4.3],
            intensity: 25,
            distance: 0,    // infinite far
            decay: 1    // default 2
        },
        debug: true,
        shadow: true,
        shadow_debug: true,
        helper_show: false,
        shadow_cam_show: false,
        visible: true
    },

    {
        room: ROOM2,
        name: 'pointLight2',
        display: 'Point Light',
        detail: {
            color: [255, 199, 44],
            position: [- 8.4, 6.325, - 5.7],
            intensity: 20,
            distance: 0,    // infinite far
            decay: 1    // default 2
        },
        debug: true,
        shadow: true,
        shadow_debug: true,
        helper_show: false,
        shadow_cam_show: false,
        visible: true
    },

    {
        room: ROOM3,
        name: 'pointLight3',
        display: 'Point Light',
        detail: {
            color: [253, 182, 58],
            position: [- .2, 5.3, 0],
            intensity: 90,
            distance: 16.77,    // 0 infinite far
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
        room: ROOM1,
        name: 'spotLight1',
        display: 'Spot Light',
        detail: {
            color: [242, 176, 33],
            position: [- 4.3, 4.6, - 7],
            target: [0, 0, 0],
            intensity: 46,
            distance: 45,    // 0 infinite far
            decay: 0.33,
            penumbra: 0.35,
            angle: 82 / 360 * Math.PI
        },
        debug: true,
        shadow: true,
        shadow_debug: true,
        helper_show: false,
        shadow_cam_show: false,
        visible: true
    },

    {
        room: ROOM2,
        name: 'spotLight2',
        display: 'Spot Light',
        detail: {
            color: [250, 250, 250],
            position: [0, 6, 14.7],
            target: [0, 1.25, 0],
            intensity: 26,
            distance: 45,    // 0 infinite far
            decay: 0.33,
            penumbra: 0.35,
            angle: 23.6 / 360 * Math.PI
        },
        debug: true,
        shadow: true,
        shadow_debug: true,
        helper_show: false,
        shadow_cam_show: false,
        visible: true
    },

    {
        room: ROOM3,
        name: 'spotLight3',
        display: 'Spot Light',
        detail: {
            color: [244, 207, 144],
            position: [5, 4.625, - 21],
            target: [0.4, - .2, 11.8],
            intensity: 26,
            distance: 45,    // 0 infinite far
            decay: 0.33,
            penumbra: 0.35,
            angle: 43.2 / 360 * Math.PI
        },
        debug: true,
        shadow: true,
        shadow_debug: true,
        helper_show: false,
        shadow_cam_show: false,
        visible: false
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
        Object.assign(worldSceneSpecs, globalConfig);
        super(container, renderer, worldSceneSpecs, eventDispatcher);

        this.#basicLights = createBasicLights(basicLightSpecsArr);
        this.#pointLights = createPointLights(pointLightSpecsArr);
        this.#spotLights = createSpotLights(spotLightSpecsArr);
        Object.assign(this.lights, this.#basicLights);
        Object.assign(this.lights, this.#pointLights);
        Object.assign(this.lights, this.#spotLights);

        // this.camera.add(this.#pointLights['cameraSpotLight']);

        const gridY = createGridHelper(gridSpecs);
        gridY.rotation.x = Math.PI * .5;

        this.scene.add( //this.camera, 
            createAxesHelper(axesSpecs), createGridHelper(gridSpecs));

        // shadow light setup, including light helper
        // this.renderer.shadowMap.enabled = worldSceneSpecs.enableShadow;
        // this.shadowLightObjects = setupShadowLight.call(this,
        //     this.scene, ...basicLightSpecsArr, ...pointLightSpecsArr, ...spotLightSpecsArr
        // );
        
        return {
            name: this.name,
            renderer: this.renderer,
            scene: this.scene,
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
        const ground = new OBBPlane(groudSpecs);
        ground.setRotation([- .5 * Math.PI, 0, 0])
            .updateOBB()
        this.cPlanes.push(ground);

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

        const train = new Train('red train 2');
        // this.subscribeEvents(train, worldSceneSpecs.moveType);
        train.castShadow(true)
            .receiveShadow(true)
            // .setPosition([0, 3, 0])
            .setScale([.5, .5, .5])
            .updateOBB();

        const tofu = new Tofu('tofu1');
        // this.subscribeEvents(tofu, worldSceneSpecs.moveType);
        tofu.castShadow(true)
            .receiveShadow(true)
            // .setPosition([0, 5, 3])
            // .setRotation([0, Math.PI, 0])
            // .setScale([.2, .3, .2])
            .updateOBB();

        const [textures, gltfs] = await Promise.all([
            loadTextures(TEXTURES),
            loadGLTFModels(GLTFS)
        ]);

        this.textures = textures;
        this.gltfs = gltfs;

        const [room1, room2, room3] = await Promise.all([
            // earth.init(earthSpecs),
            this.createRoom1(),
            this.createRoom2(),
            this.createRoom3()
        ]);

        this.rooms.push(room1);
        this.rooms.push(room2);
        this.rooms.push(room3);
        
        this.players.push(tofu);
        this.players.push(train);
        this.physics = new SimplePhysics(this.players, [], [], []);

        this.loop.updatables.push(this.physics);
        this.scene.add(ground.mesh, ceiling.mesh);

        this.rooms.forEach(room => {
            
            const basicLightsSpecs = basicLightSpecsArr.filter(basic => basic.room === room.name);
            const pointLightsSpecs = pointLightSpecsArr.filter(point => point.room === room.name);
            const spotLightsSpecs = spotLightSpecsArr.filter(spot => spot.room === room.name);

            const roomLightObjects = setupShadowLight.call(this,
                this.scene, room.group, ...basicLightsSpecs, ...pointLightsSpecs, ...spotLightsSpecs
            );

            this.shadowLightObjects = this.shadowLightObjects.concat(roomLightObjects);

            const basicLights = basicLightsSpecs.filter(l => l.visible).map(l => l.light);
            const pointLights = pointLightsSpecs.filter(l => l.visible).map(l => l.light);
            const spotLights = spotLightsSpecs.filter(l => l.visible).map(l => l.light);

            room.lights = basicLights.concat(pointLights, spotLights);

            room.setLightsVisible(false);

        });

        // initialize player and rooms

        // no need to render at this time, so the change event of control won't do the rendering.
        this.changeCharacter('tofu1', false);

        this.scene.add(room1.group);
        room1.walls.forEach(w => this.scene.add(...w.arrows));
        this.scene.add(room2.group);
        room2.walls.forEach(w => this.scene.add(...w.arrows));
        this.scene.add(room3.group);
        room3.walls.forEach(w => this.scene.add(...w.arrows));

        this.showRoleSelector = true;

        // Gui setup
        if (worldSceneSpecs.enableGui) {
            this.guiLights = { basicLightSpecsArr, pointLightSpecsArr, spotLightSpecsArr };
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
                moveCamera: this.moveCamera.bind(this, false),
                resetCamera: this.resetCamera.bind(this, false),
                focusNext: this.focusNext.bind(this, false),
                resetPlayer: this.resetCharacterPosition.bind(this)
            }
        });
    }

    async createRoom1() {
        const T_MAPS = this.textures;

        const specs = {
            width: 10,
            height: 4.6,
            depth: 15,
            baseSize: 4.6,
            frontMap: T_MAPS[TEXTURE_NAMES.CONCRETE_132],
            frontNormal: T_MAPS[TEXTURE_NAMES.CONCRETE_132_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.CONCRETE_132],
            backNormal: T_MAPS[TEXTURE_NAMES.CONCRETE_132_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.CONCRETE_132],
            leftNormal: T_MAPS[TEXTURE_NAMES.CONCRETE_132_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.CONCRETE_132],
            rightNormal: T_MAPS[TEXTURE_NAMES.CONCRETE_132_NORMAL],
            mapRatio: 1.5,
            name: 'room1',
            showArrow: true,
            enableWallOBBs: true
        };

        const spSpecs1 = {
            width: 3,
            height: 0.6,
            depth: 3,
            baseSize: 4.6,
            enableOBBs: true,
            frontMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            frontNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            backNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            leftNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            rightNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            topNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            name: 'square_pillar1',
            showArrow: true,
            enableWallOBBs: true,
            isObstacle: true,
            climbable: true
        };

        const spSpecs2 = {
            width: 2.5,
            height: 2.3,
            depth: 2.75,
            baseSize: 4.6,
            enableOBBs: true,
            frontMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            frontNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            backNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            leftNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            rightNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            topNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            name: 'square_pillar2',
            showArrow: true,
            enableWallOBBs: false,
            isObstacle: false,
            climbable: false
        };

        const lwSpecs1 = {
            width: 3,
            height: 4.6,
            depth: 5,
            thickness: .5,
            baseSize: 4.6,
            outTMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            outTNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            outSMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            outSNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            inTMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            inTNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            inSMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            inSNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            sideTMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            sideTNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            sideSMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            sideSNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            topNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            name: 'LWall1',
            showArrow: true,
            enableWallOBBs: true
        };

        const cbSpecs1 = {
            width: 1.5,
            height: 1.5,
            depth: 1.5,
            baseSize: 1.5,
            map: T_MAPS[TEXTURE_NAMES.CRATE],
            normalMap: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            frontMap: T_MAPS[TEXTURE_NAMES.CRATE],
            frontNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.CRATE],
            backNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.CRATE],
            leftNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.CRATE],
            rightNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.CRATE],
            topNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            bottomMap: T_MAPS[TEXTURE_NAMES.CRATE],
            bottomNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            mapRatio: 1,
            freeTexture: true,
            noRepeat: true,
            isObstacle: true,
            enableWallOBBs: true,
            movable: true,
            climbable: true,
            name: 'CubeBox1'
        }

        const cbSpecs2 = {
            width: 1,
            height: 1,
            depth: 1,
            baseSize: 1,
            map: T_MAPS[TEXTURE_NAMES.CRATE],
            normalMap: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            frontMap: T_MAPS[TEXTURE_NAMES.CRATE],
            frontNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.CRATE],
            backNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.CRATE],
            leftNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.CRATE],
            rightNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.CRATE],
            topNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            bottomMap: T_MAPS[TEXTURE_NAMES.CRATE],
            bottomNormal: T_MAPS[TEXTURE_NAMES.CRATE_NORMAL],
            mapRatio: 1,
            freeTexture: false,
            noRepeat: true,
            isObstacle: true,
            enableWallOBBs: true,
            movable: true,
            climbable: true,
            name: 'CubeBox2'
        }

        const slope1Specs = {
            width: 2,
            height: 2.3,
            depth: 3.5,
            baseSize: 4.6,
            frontMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            frontNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            backNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            leftNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            rightNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            slopeMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            slopeNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            enableOBBs: false,
            name: 'Slope1'
        }

        const stairs1Specs = {
            width: 2,
            height: 2.6,
            depth: 3.5,
            baseSize: 4.6,
            frontMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            frontNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            topNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            sideMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            sideNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            backNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            enableOBBs: false,
            name: 'Stairs1'
        }

        const floorSpecs = {
            width: 10,
            height: 15,
            map: T_MAPS[TEXTURE_NAMES.FABRIC_190],
            normalMap: T_MAPS[TEXTURE_NAMES.FABRIC_190_NORMAL],
            name: 'floor1',
            mapRatio: 1.5
        };

        const posY = specs.height / 2;

        const floor = new OBBPlane(floorSpecs);
        floor.setRotation([- .5 * Math.PI, 0, 0])
            .setPosition([0,  - posY + .1, 0])
            .receiveShadow(true);

        const spillar1 = new SquarePillar(spSpecs1);
        spillar1.setPosition([- 1.8, - posY + spSpecs1.height * .5, - 5])
            .setRotationY(5 * Math.PI / 6);

        const spillar2 = new SquarePillar(spSpecs2);
        spillar2.setPosition([2.5, - posY + spSpecs2.height * .5 + .1, - 6.125]);

        const lwall1 = new LWall(lwSpecs1);
        lwall1.setPosition([1.5, 0, 5]);

        const cubeBox1 = new BoxCube(cbSpecs1);
        cubeBox1.setPosition([- 1.5, 2, - 5])
            .setRotationY(3 * Math.PI * .25);

        const cubeBox2 = new BoxCube(cbSpecs2);
        cubeBox2.setPosition([- 1.5, 4, - 5])
            .setRotationY(Math.PI * .33);

        const slope1 = new Slope(slope1Specs);
        slope1.setPosition([2.5, - posY + slope1Specs.height * .5 + .1, - 3]);
            // .setRotationY(- Math.PI * .133);

        const stairs1 = new Stairs(stairs1Specs);
        stairs1.setPosition([- 2, - posY + stairs1Specs.height * .5 + .1, - .5])
            .setRotationY(Math.PI * .5);

        const room = new Room(specs);
        room.addGroups([spillar1, spillar2, lwall1, cubeBox1, cubeBox2, slope1, stairs1]);
        room.addFloors([floor]);

        await room.init();

        room.setPosition([0, posY, 15])
            .setRotationY(- Math.PI / 6)
            .updateOBBnRay();

        this.cPlanes = this.cPlanes.concat(room.walls, room.floors, room.tops, room.bottoms, room.topOBBs, room.bottomOBBs, room.slopeFaces, room.stairsSides, room.stairsStepFronts, room.stairsStepTops);
        this.cBoxes.push(cubeBox1.box, cubeBox2.box);

        return room;
    }

    async createRoom2() {
        const T_MAPS = this.textures;

        const specs = {
            width: 10,
            height: 4.6,
            depth: 20,
            baseSize: 4.6,
            frontMap: T_MAPS[TEXTURE_NAMES.CONCRETE_128],
            frontNormal: T_MAPS[TEXTURE_NAMES.CONCRETE_128_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.CONCRETE_128],
            backNormal: T_MAPS[TEXTURE_NAMES.CONCRETE_128_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.CONCRETE_128],
            leftNormal: T_MAPS[TEXTURE_NAMES.CONCRETE_128_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.CONCRETE_128],
            rightNormal: T_MAPS[TEXTURE_NAMES.CONCRETE_128_NORMAL],
            mapRatio: 1.5,
            name: 'room2',
            showArrow: true
        };

        const spSepcs3 = {
            width: 1,
            height: 4.6,
            depth: 2,
            baseSize: 4.6,
            enableOBBs: false,
            frontMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            frontNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            backNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            leftNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            rightNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            topNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            name: 'square_pillar3',
            showArrow: true
        };

        const spSepcs4 = {
            width: 1,
            height: 4.6,
            depth: 2,
            baseSize: 4.6,
            enableOBBs: false,
            frontMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            frontNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            backNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            leftNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            rightNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            topNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            name: 'square_pillar4',
            showArrow: true
        };

        const cpSepcs1 = {
            width: 1,
            height: 4.6,
            baseSize: 4.6,
            enableOBBs: true,
            map: T_MAPS[TEXTURE_NAMES.BRICK_159],
            normalMap: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            topNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            name: 'cylinder_pillar1',
            showArrow: true,
            enableWallOBBs: true,
            isObstacle: true,
            climbable: true
            // separatedFace: true
        };

        const hexCylinderSpecs = {
            radius: 1,
            height: 3.6,
            baseSize: 4.6,
            map: this.textures[TEXTURE_NAMES.BRICK_159],
            normalMap: this.textures[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: this.textures[TEXTURE_NAMES.BRICK_159],
            topNormal: this.textures[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: this.textures[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: this.textures[TEXTURE_NAMES.BRICK_159_NORMAL],
            name: 'hexCylinder1',
            mapRatio: 1.5,
            showArrow: true,
            isObstacle: true,
            enableWallOBBs: true,
            movable: true,
            climbable: true
        }

        const lwSpecs2 = {
            width: 4,
            height: 2.6,
            depth: 5,
            thickness: 1,
            baseSize: 4.6,
            enableOBBs: true,
            outTMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            outTNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            outSMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            outSNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            inTMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            inTNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            inSMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            inSNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            sideTMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            sideTNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            sideSMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            sideSNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            topMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            topNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            // bottomMap: T_MAPS[TEXTURE_NAMES.BRICK_159],
            // bottomNormal: T_MAPS[TEXTURE_NAMES.BRICK_159_NORMAL],
            mapRatio: 1.5,
            name: 'LWall2',
            showArrow: true,
            enableWallOBBs: true,
            isObstacle: true,
            climbable: true
        };

        const floorSpecs = {
            width: 10,
            height: 20,
            map: T_MAPS[TEXTURE_NAMES.STONE_165],
            normalMap: T_MAPS[TEXTURE_NAMES.STONE_165_NORMAL],
            name: 'floor1',
            // mapRatio: 1.5,
            repeatU: 1.3,
            repeatV: 1,
            repeatModeU: MIRRORED_REPEAT,
            repeatModeV: MIRRORED_REPEAT,
            rotationT: Math.PI / 2,
            showArrow: true
        };

        const posY = specs.height / 2;

        const floor = new OBBPlane(floorSpecs);
        floor.setRotation([- .5 * Math.PI, 0, 0])
            .setPosition([0,  - posY + .1, 0])
            .receiveShadow(true);

        const spillar3 = new SquarePillar(spSepcs3);
        const spillar4 = new SquarePillar(spSepcs4);
        const cpillar1 = new CylinderPillar(cpSepcs1);
        const hexCylinder1 = new HexCylinderPillar(hexCylinderSpecs);
        spillar3.setPosition([- 2.5, 0, 9]);
        spillar4.setPosition([2.5, 0, 9]);
        cpillar1.setPosition([0, 0, 0]);
        hexCylinder1.setPosition([2.5, .5, - 5]);

        const lwall1 = new LWall(lwSpecs2);
        lwall1.setPosition([- 1.5, - posY + lwSpecs2.height * .5, - 5]);

        const room = new Room(specs);
        room.addGroups([spillar3, spillar4, lwall1, cpillar1, hexCylinder1]);
        room.addFloors([floor]);

        await room.init();

        room.setPosition([0, posY, -13])
            .setRotationY(5 * Math.PI / 6)
            .updateOBBnRay();

        this.cPlanes = this.cPlanes.concat(room.walls, room.floors, room.tops, room.bottoms, room.topOBBs, room.bottomOBBs);
        return room;
    }

    async createRoom3() {
        const T_MAPS = this.textures;
        const GLTF_MAPS = this.gltfs;

        const specs = {
            width: 10,
            height: 4.6,
            depth: 20,
            baseSize: 4.6,
            frontMap: T_MAPS[TEXTURE_NAMES.WOOD_186],
            frontNormal: T_MAPS[TEXTURE_NAMES.WOOD_186_NORMAL],
            backMap: T_MAPS[TEXTURE_NAMES.WOOD_186],
            backNormal: T_MAPS[TEXTURE_NAMES.WOOD_186_NORMAL],
            leftMap: T_MAPS[TEXTURE_NAMES.WOOD_186],
            leftNormal: T_MAPS[TEXTURE_NAMES.WOOD_186_NORMAL],
            rightMap: T_MAPS[TEXTURE_NAMES.WOOD_186],
            rightNormal: T_MAPS[TEXTURE_NAMES.WOOD_186_NORMAL],
            mapRatio: 1.5,
            name: 'room3',
            showArrow: true
        };

        const floorSpecs = {
            width: 10,
            height: 20,
            map: T_MAPS[TEXTURE_NAMES.WOOD_227],
            normalMap: T_MAPS[TEXTURE_NAMES.WOOD_227_NORMAL],
            name: 'floor3',
            mapRatio: 1.5,
            repeatU: 1.5,
            repeatV: 2.8,
            repeatModeU: MIRRORED_REPEAT,
            repeatModeV: MIRRORED_REPEAT,
            showArrow: true
        };

        const woodenPicnicTableSpecs = {
            src: GLTF_MAPS[GLTF_NAMES.WOODEN_PICNIC_TABLE],
            name: 'wooden_picnic_table_1',
            offsetY: - .371,
            scale: [1, 1, 1],
            isObstacle: true,
            enableWallOBBs: true,
            movable: true,
            climbable: true
        }

        const woodenTableSpecs = {
            src: GLTF_MAPS[GLTF_NAMES.WOODEN_TABLE],
            name: 'wooden_table_1',
            offsetY: - .4,
            scale: [1.5, 1, 3],
            isObstacle: true,
            enableWallOBBs: true,
            movable: true,
            climbable: true
        }

        const woodenTableSpecs2 = {
            src: GLTF_MAPS[GLTF_NAMES.WOODEN_TABLE],
            name: 'wooden_table_2',
            offsetY: - .4,
            scale: [1, 1, 1],
            isObstacle: true,
            enableWallOBBs: true,
            movable: true,
            climbable: true
        }

        const posY = specs.height / 2;

        const floor = new OBBPlane(floorSpecs);
        floor.setRotation([- .5 * Math.PI, 0, 0])
            .setPosition([0,  - posY + .1, 0])
            .receiveShadow(true);

        const woodenPicnicTable = new WoodenPicnicTable(woodenPicnicTableSpecs);
        woodenPicnicTable.setPosition([0, 3, 0]);

        const smallTable = new WoodenSmallTable(woodenTableSpecs);
        smallTable.setPosition([0, 3, 4])
            .setRotationY(5 * Math.PI / 6);

        const smallTable2 = new WoodenSmallTable(woodenTableSpecs2);
        smallTable2.setPosition([3, 5, 5]);

        const room = new Room(specs);
        room.addFloors([floor]);
        room.addGroups([woodenPicnicTable, smallTable, smallTable2]);

        await room.init();

        room.setPosition([20, posY, 4.3])
            .setRotationY(- Math.PI / 6)
            .updateOBBnRay();

        this.cPlanes = this.cPlanes.concat(room.walls, room.floors, room.tops, room.bottoms, room.topOBBs, room.bottomOBBs);
        return room;
    }

    focusNext(forceStaticRender = true) {
        
        this.focusNextProcess(forceStaticRender);
        const { walls, floors, topOBBs, obstacles, slopes } = this.rooms[this.loadSequence];

        this.physics.walls = walls;
        this.physics.floors = floors;
        this.physics.obstacleTops = topOBBs;
        this.physics.obstacles = obstacles;
        this.physics.slopes = slopes;
        this.physics.sortFloorTops();

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