import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox, GeometryDesc, MeshDesc } from '../../../Models';
import { BOX_GEOMETRY } from '../../../utils/constants';

const GLTF_SRC = 'in_room/tables/wooden_picnic_table_1k/wooden_picnic_table_1k.gltf';

class WoodenPicnicTable extends ObstacleBase {

    _width = 2.24;
    _height = .742;
    _depth = 3.03;
    _bottomHeight = .35;
    _sideHeight = .15;
    _topWidth = 1.246;
    _topHeight = .047;
    _topDepth = 2.93;
    _bodyHeight = .508;
    _bodyDepth = 2.784;
    _bodyPosY = (this._height - this._bodyHeight) * .5 - this._topHeight;
    _footHeight = this._height - this._topHeight - this._bodyHeight;
    _footWidth = .1342;
    _footDepth = .107;
    _footPosX = .6392;
    _footPosZ = 1.342;

    gltf;

    _cBoxTop;
    _cBoxSideLeft;
    _cBoxSideRight;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        const topHeight = this._height - this._bottomHeight;
        const sideWidth = (this._width - this._topWidth) * .5;
        const cBoxTopSpecs = { name: `${name}_top`, width: this._topWidth, depth: this._depth, height: topHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxLeftSideSpecs = { name: `${name}_left_side`, width: sideWidth, depth: this._depth, height: this._bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxRightSideSpecs = { name: `${name}_right_side`, width: sideWidth, depth: this._depth, height: this._bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);        

        if (this.isSimplePhysics) {

            // obb box
            this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
            this.box.visible = false;
            this.group.add(this.box.mesh);

            // collision box
            const cBoxTop = this._cBoxTop = new CollisionBox(cBoxTopSpecs);
            const cBoxSideLeft = this._cBoxSideLeft = new CollisionBox(cBoxLeftSideSpecs);
            const cBoxSideRight = this._cBoxSideRight = new CollisionBox(cBoxRightSideSpecs);
            
            this.cObjects = [cBoxTop, cBoxSideLeft, cBoxSideRight];
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
        this.setCanBeIgnored();

    }

    update(needToUpdateOBBnRay = true) {

        // update gltf scale
        this.gltf.setScale(this.scale);

        if (this.isSimplePhysics) {

            // update cBox position and scale
            const width = this._width * this.scale[0];
            const height = this._height * this.scale[1];
            const bottomHeight = this._bottomHeight * this.scale[1];
            const topWidth = this._topWidth * this.scale[0];

            const topHeight = height - bottomHeight;
            const sideWidth = (width - topWidth) * .5;
            const sideX = (topWidth + sideWidth) * .5;
            const topY = (height - topHeight) * .5;
            const bottomY = (bottomHeight - height) * .5;

            this._cBoxTop.setPosition([0, topY, 0]).setScale(this.scale);
            this._cBoxSideLeft.setPosition([sideX, bottomY, 0]).setScale(this.scale);
            this._cBoxSideRight.setPosition([- sideX, bottomY, 0]).setScale(this.scale);

            // update box scale
            this.box.setScale(this.scale);

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
        const topWidth = this._topWidth * this.scale[0];
        const topHeight = this._topHeight * this.scale[1];
        const topDepth = this._topDepth * this.scale[2];
        const bodyHeight = this._bodyHeight * this.scale[1];
        const bodyDepth = this._bodyDepth * this.scale[2];
        const bodyPosY = this._bodyPosY * this.scale[1];
        const bottomHeight = this._bottomHeight * this.scale[1];
        const footWidth = this._footWidth * this.scale[0];
        const footHeight = this._footHeight * this.scale[1];
        const footDepth = this._footDepth * this.scale[2];
        const footPosX = this._footPosX * this.scale[0];
        const footPosZ = this._footPosZ * this.scale[2];
        const footPosY = (footHeight - height) * .5;
        const sideHeight = this._sideHeight * this.scale[1];
        const sideWidth = (width - topWidth) * .5;
        const sidePosX = (topWidth + sideWidth) * .5;
        const sidePosY = bottomHeight - (height + sideHeight) * .5;

        let { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;
        mass /= 5;

        const topBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: topWidth, height: topHeight, depth: topDepth });
        const topBoxMesh = new MeshDesc(topBoxGeo);
        topBoxMesh.name = `${this.name}_topBox_mesh_desc`;
        topBoxMesh.position.set(0, (height - topHeight) * .5, 0);
        topBoxMesh.userData.physics = { mass, restitution, friction };

        const bodyBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: topWidth, height: bodyHeight, depth: bodyDepth });
        const bodyBoxMesh = new MeshDesc(bodyBoxGeo);
        bodyBoxMesh.name = `${this.name}_bodyBox_mesh_desc`;
        bodyBoxMesh.position.set(0, bodyPosY, 0);
        bodyBoxMesh.userData.physics = { mass, restitution, friction };

        const footBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: footWidth, height: footHeight, depth: footDepth });
        const footFLBoxMesh = new MeshDesc(footBoxGeo);
        footFLBoxMesh.name = `${this.name}_footFLBox_mesh_desc`;
        footFLBoxMesh.position.set(footPosX, footPosY, footPosZ);
        footFLBoxMesh.userData.physics = { mass: mass / 4, restitution, friction };

        const footFRBoxMesh = new MeshDesc(footBoxGeo);
        footFRBoxMesh.name = `${this.name}_footFRBox_mesh_desc`;
        footFRBoxMesh.position.set(- footPosX, footPosY, footPosZ);
        footFRBoxMesh.userData.physics = { mass: mass / 4, restitution, friction };

        const footBLBoxMesh = new MeshDesc(footBoxGeo);
        footBLBoxMesh.name = `${this.name}_footBLBox_mesh_desc`;
        footBLBoxMesh.position.set(footPosX, footPosY, - footPosZ);
        footBLBoxMesh.userData.physics = { mass: mass / 4, restitution, friction };

        const footBRBoxMesh = new MeshDesc(footBoxGeo);
        footBRBoxMesh.name = `${this.name}_footBRBox_mesh_desc`;
        footBRBoxMesh.position.set(- footPosX, footPosY, - footPosZ);
        footBRBoxMesh.userData.physics = { mass: mass / 4, restitution, friction };

        const sideBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: sideWidth, height: sideHeight, depth });
        const sideLeftBoxMesh = new MeshDesc(sideBoxGeo);
        sideLeftBoxMesh.position.set(sidePosX, sidePosY, 0);
        sideLeftBoxMesh.name = `${this.name}_sideLeftBox_mesh_desc`;
        sideLeftBoxMesh.userData.physics = { mass, restitution, friction };

        const sideRightBoxMesh = new MeshDesc(sideBoxGeo);
        sideRightBoxMesh.position.set(- sidePosX, sidePosY, 0);
        sideRightBoxMesh.name = `${this.name}_sideRightBox_mesh_desc`;
        sideRightBoxMesh.userData.physics = { mass, restitution, friction };

        this.rapierInstances.push(topBoxMesh, bodyBoxMesh, footFLBoxMesh, footFRBoxMesh, footBLBoxMesh, footBRBoxMesh, sideLeftBoxMesh, sideRightBoxMesh);

    }

}

export { WoodenPicnicTable };