import { Object3D, Vector3 } from 'three';
import { createOBBBox } from '../../../physics/collisionHelper';
import { GLTFModel, CollisionBox, Box, GeometryDesc, MeshDesc } from '../../../Models';
import { TVNoise } from '../../../basic/colorBase';
import { LightingObjectBase } from '../lighting/LightingObjectBase';
import { BOX_GEOMETRY } from '../../../utils/constants';

const GLTF_SRC = 'in_room/electronics/Television_01_1k/Television_01_1k.gltf';

class Television01 extends LightingObjectBase {

    _width = .6;
    _height = .456;
    _depth = .464;

    _screenWidth = .36;
    _screenHeight = .28;
    _screenDepth = .04;

    _screenX = -.068;
    _screenY = .03;
    _screenZ = .196;
    _targetZ = 1;

    _bloomScreen;

    _cBox;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;
        const { bloomTransparency = .5, bloomIntensity = 10 } = specs;

        this._scale = new Array(...scale);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        const cBoxSpecs = { name: `${name}_cbox`, width: this._width, depth: this._depth, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        const bloomScreenSpecs = { name: `${name}_screen`, size: { width: this._screenWidth, height: this._screenHeight, depth: this._screenDepth }, color: TVNoise, transparent: true };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        if (this.isSimplePhysics) {

            // obb box
            this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
            this.box.visible = false;
            this.group.add(this.box.mesh);

            // collision box
            const cBox = this._cBox = new CollisionBox(cBoxSpecs);

            this.cObjects = [cBox];
            this.walls = this.getWalls();
            this.topOBBs = this.getTopOBBs();
            this.bottomOBBs = this.getBottomOBBs();
            this.addCObjects();
            this.setCObjectsVisible(false);

        }

        // bloom object
        const bloomScreen = this._bloomScreen = new Box(bloomScreenSpecs);
        this.bloomObjects = [bloomScreen];
        this.setBloomObjectsFather();
        this.setBloomObjectsTransparent(bloomTransparency);
        this.setBloomObjectsLayers();
        this.setBloomObjectsVisible(false);
        this.addBloomObjects();
        this.setLightingMap('screen', {
            bloomObject: bloomScreen,
            intensity: 0,
            bloomIntensity,
            lightObject: null,
            position: new Vector3(this._screenX, this._screenY, this._screenZ),
            currentPosition: new Vector3(),
            target: new Vector3(this._screenX, this._screenY, this._targetZ + this._screenZ),
            currentTarget: new Vector3(),
            targetObject: new Object3D()
        });

        this.update(false, false);

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();
        this.setCanBeIgnored();

    }

    update(needToUpdateOBBnRay = true, needToUpdateLight = true) {

        if (this.isSimplePhysics) {

            // update cBox scale and position
            this._cBox.setScale(this.scale);

            // update box scale
            this.box.setScale(this.scale);

        }

        // update bloom screen scale and position
        const screenX = this._screenX * this.scale[0];
        const screenY = this._screenY * this.scale[1];
        const screenZ = this._screenZ * this.scale[2];

        this._bloomScreen.setScale(this.scale).setPosition([screenX, screenY, screenZ]);

        this.updateLightingMap(needToUpdateLight);

        // update gltf scale
        this.gltf.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];
        const { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        const boxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height, depth });
        const boxMesh = new MeshDesc(boxGeo);
        boxMesh.name = `${this.name}_box_mesh_desc`;
        boxMesh.userData.physics = { mass, restitution, friction };

        this.rapierInstances.push(boxMesh);

        this.updateLightingMap();

    }

}

export { Television01 };