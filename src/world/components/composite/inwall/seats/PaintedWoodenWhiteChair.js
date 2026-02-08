import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox, GeometryDesc, MeshDesc } from '../../../Models';
import { BOX_GEOMETRY } from '../../../utils/constants';

const GLTF_SRC = 'in_room/seats/painted_wooden_chair_01_1k/painted_wooden_chair_01_1k.gltf';

class PaintedWoodenWhiteChair extends ObstacleBase {

    _width = .433;
    _height = .964;
    _depth = .506;
    _bottomHeight = .452;
    _bottomDepth = .471;
    _bottomPosZ = .035;
    _backWidth = .377;
    _backHeight = .518;
    _backDepth = .115;
    _backPosZ = - .255 + this._bottomPosZ;

    gltf;

    _cBoxBottom;
    _cBoxBack;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);        

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };
        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };
        const cBoxBottomSpecs = { name: `${name}_bottom`, width: this._width, depth: this._bottomDepth, height: this._bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxBackSpecs = { name: `${name}_back`, width: this._backWidth, depth: this._backDepth, height: this._backHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        if (this.isSimplePhysics) {

            // obb box
            this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
            this.box.visible = false;
            this.group.add(this.box.mesh)

            // collision box
            const cBoxBottom = this._cBoxBottom = new CollisionBox(cBoxBottomSpecs);
            const cBoxBack = this._cBoxBack = new CollisionBox(cBoxBackSpecs);

            this.cObjects = [cBoxBottom, cBoxBack];
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

            // update cBox position and scale
            const height = this._height * this.scale[1];
            const bottomHeight = this._bottomHeight * this.scale[1];
            const backHeight = this._backHeight * this.scale[1];

            const bottomY = (bottomHeight - height) * .5;
            const bottomZ = this._bottomPosZ * this.scale[2];
            const backY = (backHeight - height) * .5 + bottomHeight;
            const backZ = this._backPosZ * this.scale[2];

            this._cBoxBottom.setPosition([0, bottomY, bottomZ]).setScale(this.scale);
            this._cBoxBack.setPosition([0, backY, backZ]).setScale(this.scale);

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
        const bottomHeight = this._bottomHeight * this.scale[1];
        const bottomDepth = this._bottomDepth * this.scale[2];
        const bottomPosY = (bottomHeight - height) * .5;
        const bottomPosZ = this._bottomPosZ * this.scale[2];
        const backWidth = this._backWidth * this.scale[0];
        const backHeight = this._backHeight * this.scale[1];
        const backDepth = this._backDepth * this.scale[2];
        const backPosY = (height - backHeight) * .5;
        const backPosZ = this._backPosZ * this.scale[2];
        const { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        const bottomBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height: bottomHeight, depth: bottomDepth });
        const bottomBoxMesh = new MeshDesc(bottomBoxGeo);
        bottomBoxMesh.name = `${this.name}_bottomBox_mesh_desc`;
        bottomBoxMesh.position.set(0, bottomPosY, bottomPosZ);
        bottomBoxMesh.userData.physics = { mass: mass * 4 / 5, restitution, friction };

        const backBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: backWidth, height: backHeight, depth: backDepth });
        const backBoxMesh = new MeshDesc(backBoxGeo);
        backBoxMesh.name = `${this.name}_backBox_mesh_desc`;
        backBoxMesh.position.set(0, backPosY, backPosZ);
        backBoxMesh.userData.physics = { mass: mass / 5, restitution, friction };

        this.rapierInstances.push(bottomBoxMesh, backBoxMesh);

    }

}

export { PaintedWoodenWhiteChair };