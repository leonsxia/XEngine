import { CollisionBox } from '../../../Models';
import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { LadderItem } from './LadderItem';

class VerticalLadder extends ObstacleBase {

    isLadder = true;

    _width;
    _height;
    _depth;

    ladderItem;

    _cBox;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { showArrow = false } = specs;
        const { receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        this.ladderItem = new LadderItem(specs);

        this._width = this.ladderItem._width;
        this._height = this.ladderItem._height;
        this._depth = this.ladderItem._depth;

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };
        const cBoxSpecs = { name, width: this._width, depth: this._depth, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBox = this._cBox = new CollisionBox(cBoxSpecs);
        cBox.left.ignoreOBBTest = true;        
        cBox.right.ignoreOBBTest = true;
        cBox.front.climbAngle = 30;
        cBox.back.climbAngle = 30;

        this.update(false);

        this.cObjects = [cBox];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        this.group.add(
            this.box.mesh,
            this.ladderItem.group
        );

    }

    async init() {

        await this.ladderItem.init();

        this.setPickLayers();

    }

    update(needToUpdateOBBnRay = true) {

        this.ladderItem.scale = this.scale;

        // update cBox scale
        this._cBox.setScale(this.scale);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { VerticalLadder };