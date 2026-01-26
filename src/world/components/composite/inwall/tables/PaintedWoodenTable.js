import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox, GeometryDesc, MeshDesc } from '../../../Models';
import { BOX_GEOMETRY } from '../../../utils/constants';

const GLTF_SRC = 'in_room/tables/painted_wooden_table_1k/painted_wooden_table_1k.gltf';

class PaintedWoodenTable extends ObstacleBase {

    _width = 2.4;
    _height = .963845;
    _depth = 1.14177;

    _topHeight = .142;
    _bodyHeight = .6;    
    _bodyWidth = 1.70658;
    _bodyDepth = .26;
    _bodyPosY = (this._height - this._bodyHeight) * .5 - this._topHeight;
    _footHeight = this._height - this._topHeight - this._bodyHeight;
    _footWidth = .084;
    _footDepth = .82;
    _footPosX = .826;

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

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBox = this._cBox = new CollisionBox(cBoxSpecs);

        this.update(false);

        this.cObjects = [cBox];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        // set triggers if needed
        this.setTriggers();

        this.group.add(
            this.gltf.group,
            this.box.mesh
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

    }

    update(needToUpdateOBBnRay = true) {

        // update cBox scale
        this._cBox.setScale(this.scale);

        // update gltf scale
        this.gltf.setScale(this.scale);

        // update box scale
        this.box.setScale(this.scale);

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
        const bodyHeight = this._bodyHeight * this.scale[1];
        const bodyWidth = this._bodyWidth * this.scale[0];
        const bodyDepth = this._bodyDepth * this.scale[2];
        const bodyPosY = this._bodyPosY * this.scale[1];
        const footHeight = this._footHeight * this.scale[1];
        const footWidth = this._footWidth * this.scale[0];
        const footDepth = this._footDepth * this.scale[2];
        const footPosX = this._footPosX * this.scale[0];
        const footPosY = (footHeight - height) * .5;

        let { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;
        mass /= 4;

        const topBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height: topHeight, depth });
        const topBoxMesh = new MeshDesc(topBoxGeo);
        topBoxMesh.name = `${this.name}_topBox_mesh_desc`;
        topBoxMesh.position.set(0, (height - topHeight) * .5, 0);
        topBoxMesh.userData.physics = { mass, restitution, friction };

        const bodyBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: bodyWidth, height: bodyHeight, depth: bodyDepth });
        const bodyBoxMesh = new MeshDesc(bodyBoxGeo);
        bodyBoxMesh.name = `${this.name}_bodyBox_mesh_desc`;
        bodyBoxMesh.position.set(0, bodyPosY, 0);
        bodyBoxMesh.userData.physics = { mass, restitution, friction };

        const footBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: footWidth, height: footHeight, depth: footDepth });
        const footLeftBoxMesh = new MeshDesc(footBoxGeo);
        footLeftBoxMesh.name = `${this.name}_footLeftBox_mesh_desc`;
        footLeftBoxMesh.position.set(footPosX, footPosY, 0);
        footLeftBoxMesh.userData.physics = { mass, restitution, friction };

        const footRightBoxMesh = new MeshDesc(footBoxGeo);
        footRightBoxMesh.name = `${this.name}_footRightBox_mesh_desc`;
        footRightBoxMesh.position.set(- footPosX, footPosY, 0);
        footRightBoxMesh.userData.physics = { mass, restitution, friction };

        this.rapierInstances.push(topBoxMesh, bodyBoxMesh, footLeftBoxMesh, footRightBoxMesh);

    }

}

export { PaintedWoodenTable };