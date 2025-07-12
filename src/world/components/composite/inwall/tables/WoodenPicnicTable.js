import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'in_room/tables/wooden_picnic_table_1k/wooden_picnic_table_1k.gltf';

class WoodenPicnicTable extends ObstacleBase {

    _width = 2.24;
    _height = .742;
    _depth = 3.03;
    _bottomHeight = .35;
    _topWidth = 1.246;

    gltf;

    _cBoxTop;
    _cBoxSideLeft;
    _cBoxSideRight;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { offsetY = - .371 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        const topHeight = this._height - this._bottomHeight;
        const sideWidth = (this._width - this._topWidth) * .5;
        const cBoxTopSpecs = { name: `${name}_top`, width: this._topWidth, depth: this._depth, height: topHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxLeftSideSpecs = { name: `${name}_left_side`, width: sideWidth, depth: this._depth, height: this._bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxRightSideSpecs = { name: `${name}_right_side`, width: sideWidth, depth: this._depth, height: this._bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);        

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBoxTop = this._cBoxTop = new CollisionBox(cBoxTopSpecs);
        const cBoxSideLeft = this._cBoxSideLeft = new CollisionBox(cBoxLeftSideSpecs);
        const cBoxSideRight = this._cBoxSideRight = new CollisionBox(cBoxRightSideSpecs);

        this.update(false);

        this.cObjects = [cBoxTop, cBoxSideLeft, cBoxSideRight];
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

        // update gltf scale
        this.gltf.setScale(this.scale);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { WoodenPicnicTable };