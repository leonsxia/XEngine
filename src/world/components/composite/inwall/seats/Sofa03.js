import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'in_room/seats/sofa_03_1k/sofa_03_1k.gltf';

class Sofa03 extends ObstacleBase {

    _width = 2.735;
    _height = 1.115;
    _depth = .916;
    _bottomWidth = 1.865;
    _bottomHeight = .573;
    _sideHeight = .857;
    _backDepth = .484;

    _bottomDepth = this._depth - this._backDepth;
    _sideWidth = (this._width - this._bottomWidth) * .5;
    _backHeight = this._height - this._bottomHeight;

    gltf;

    _cBoxBottom;
    _cBoxLeftSide;
    _cBoxRightSide;
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

        const cBoxBottomSpecs = { name: `${name}_bottom`, width: this._bottomWidth, depth: this._bottomDepth, height: this._bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxLeftSideSpecs = { name: `${name}_left_side`, width: this._sideWidth, depth: this._depth, height: this._sideHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxRightSideSpecs = { name: `${name}_right_side`, width: this._sideWidth, depth: this._depth, height: this._sideHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxBackSpecs = { name: `${name}_back`, width: this._bottomWidth, depth: this._backDepth, height: this._backHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBoxBottom = this._cBoxBottom = new CollisionBox(cBoxBottomSpecs);
        const cBoxSideLeft = this._cBoxLeftSide = new CollisionBox(cBoxLeftSideSpecs);
        const cBoxSideRight = this._cBoxRightSide = new CollisionBox(cBoxRightSideSpecs);
        const cBoxBack = this._cBoxBack = new CollisionBox(cBoxBackSpecs);

        this.update(false);

        this.cObjects = [cBoxBottom, cBoxSideLeft, cBoxSideRight, cBoxBack];
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

        // update cBox position and scale
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];
        const bottomWidth = this._bottomWidth * this.scale[0];
        const bottomHeight = this._bottomHeight * this.scale[1];
        const sideHeight = this._sideHeight * this.scale[1];
        const backDepth = this._backDepth * this.scale[2];

        const bottomDepth = this._bottomDepth * this.scale[2];
        const sideWidth = this._sideWidth * this.scale[0];
        const backHeight = this._backHeight * this.scale[1];

        const sideX = (bottomWidth + sideWidth) * .5;
        const sideY = (sideHeight - height) * .5;
        const bottomY = (bottomHeight - height) * .5;
        const bottomZ = (depth - bottomDepth) * .5;
        const backY = (height - backHeight) * .5;
        const backZ = (backDepth - depth) * .5;

        this._cBoxBottom.setPosition([0, bottomY, bottomZ]).setScale(this.scale);
        this._cBoxLeftSide.setPosition([sideX, sideY, 0]).setScale(this.scale);
        this._cBoxRightSide.setPosition([- sideX, sideY, 0]).setScale(this.scale);
        this._cBoxBack.setPosition([0, backY, backZ]).setScale(this.scale);

        // update gltf scale
        this.gltf.setScale(this.scale);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { Sofa03 };