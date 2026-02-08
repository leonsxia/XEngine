import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox, GeometryDesc, MeshDesc } from '../../../Models';
import { BOX_GEOMETRY } from '../../../utils/constants';

const GLTF_SRC = 'in_room/tables/wooden_table_1k/wooden_table_02_1k.gltf';

class WoodenSmallTable extends ObstacleBase {

    _width = 1.13768;
    _height = .8;
    _depth = .706739;

    _topHeight = .07;
    _footWidth = .0953;
    _footDepth = .1;
    _footHeight = this._height - this._topHeight;
    _footPosX = .468;
    _footPosZ = .25;

    gltf;

    _cBox;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };
        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };
        const cBoxSpecs = { name, width: this._width, depth: this._depth, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

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

        this.update(false);

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

    }

    update(needToUpdateOBBnRay = true) {
        
        // update gltf scale
        this.gltf.setScale(this.scale);

        if (this.isSimplePhysics) {

            // update box scale
            this.box.setScale(this.scale);

            // update cBox scale
            this._cBox.setScale(this.scale);

        }

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];
        const topHeight = this._topHeight * this.scale[1];
        const footWidth = this._footWidth * this.scale[0];
        const footHeight = this._footHeight * this.scale[1];
        const footDepth = this._footDepth * this.scale[2];
        const topPosY = (height - topHeight) * .5;
        const footPosX = this._footPosX * this.scale[0];
        const footPosY = - topHeight * .5;
        const footPosZ = this._footPosZ * this.scale[2];
        const { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        const topBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height: topHeight, depth });
        const topBoxMesh = new MeshDesc(topBoxGeo);
        topBoxMesh.name = `${this.name}_topBox_mesh_desc`;
        topBoxMesh.position.set(0, topPosY, 0);
        topBoxMesh.userData.physics = { mass: mass / 2, restitution, friction };

        const footFLGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: footWidth, height: footHeight, depth: footDepth });
        const footFLMesh = new MeshDesc(footFLGeo);
        footFLMesh.name = `${this.name}_footFL_mesh_desc`;
        footFLMesh.position.set(footPosX, footPosY, footPosZ);
        footFLMesh.userData.physics = { mass: mass / 8, restitution, friction };

        const footFRGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: footWidth, height: footHeight, depth: footDepth });
        const footFRMesh = new MeshDesc(footFRGeo);
        footFRMesh.name = `${this.name}_footFR_mesh_desc`;
        footFRMesh.position.set(- footPosX, footPosY, footPosZ);
        footFRMesh.userData.physics = { mass: mass / 8, restitution, friction };

        const footBLGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: footWidth, height: footHeight, depth: footDepth });
        const footBLMesh = new MeshDesc(footBLGeo);
        footBLMesh.name = `${this.name}_footBL_mesh_desc`;
        footBLMesh.position.set(footPosX, footPosY, - footPosZ);
        footBLMesh.userData.physics = { mass: mass / 8, restitution, friction };

        const footBRGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: footWidth, height: footHeight, depth: footDepth });
        const footBRMesh = new MeshDesc(footBRGeo);
        footBRMesh.name = `${this.name}_footBR_mesh_desc`;
        footBRMesh.position.set(- footPosX, footPosY, - footPosZ);
        footBRMesh.userData.physics = { mass: mass / 8, restitution, friction };

        this.rapierInstances.push(topBoxMesh, footFLMesh, footFRMesh, footBLMesh, footBRMesh);

    }

}

export { WoodenSmallTable };