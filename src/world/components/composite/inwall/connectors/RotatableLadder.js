import { Box3, Box3Helper, Group, MathUtils, Vector3 } from 'three';
import { createOBBBox, createOBBPlane } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { LadderItem } from './LadderItem';
import { green, khaki, yankeesBlue } from '../../../basic/colorBase';
import { OBSTACLE_RAY_LAYER, TOFU_RAY_LAYER } from '../../../utils/constants';

const _v1 = new Vector3();
const DEBUG = false;

class RotatableLadder extends ObstacleBase {

    isLadder = true;
    isRotatableLadder = true;

    _width;
    _height;
    _depth;

    ladderItem;

    _front;
    _back;
    _left;
    _right;
    slopes = [];
    sideFaces = [];

    boundingBox = new Box3();
    boundingBoxHelper;

    subGroup = new Group();

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        this.ladderItem = new LadderItem(specs);

        this._width = this.ladderItem._width;
        this._height = this.ladderItem._height;
        this._depth = this.ladderItem._depth;

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };
        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;
        this.box.mesh.geometry.computeBoundingBox();

        const frontSpecs = this.makePlaneConfig({ width: this._width, height: this._height, color: yankeesBlue });
        const backSpecs = this.makePlaneConfig({ width: this._width, height: this._height });
        const leftSpecs = this.makePlaneConfig({ width: this._depth, height: this._height, color: khaki });
        const rightSpecs = this.makePlaneConfig({ width: this._depth, height: this._height });
        this._front = createOBBPlane(frontSpecs, `${name}_front_obb`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this._back = createOBBPlane(backSpecs, `${name}_back_obb`, [0, 0, 0], [0, Math.PI, 0], receiveShadow, castShadow);
        this._left = createOBBPlane(leftSpecs, `${name}_left_obb`, [0, 0, 0], [0, Math.PI * .5, 0], receiveShadow, castShadow);
        this._right = createOBBPlane(rightSpecs, `${name}_right_obb`, [0, 0, 0], [0, - Math.PI * .5, 0], receiveShadow, castShadow);
        this._front.mesh.layers.enable(TOFU_RAY_LAYER);
        this._back.mesh.layers.enable(TOFU_RAY_LAYER);
        this._left.mesh.layers.enable(TOFU_RAY_LAYER);
        this._right.mesh.layers.enable(TOFU_RAY_LAYER);
        this._front.mesh.layers.enable(OBSTACLE_RAY_LAYER);
        this._back.mesh.layers.enable(OBSTACLE_RAY_LAYER);
        this._left.mesh.layers.enable(OBSTACLE_RAY_LAYER);
        this._right.mesh.layers.enable(OBSTACLE_RAY_LAYER);
        this.slopes.push(this._front, this._back);
        this.sideFaces.push(this._left, this._right);

        if (!DEBUG) {

            this._front.visible = false;
            this._back.visible = false;
            this._left.visible = false;
            this._right.visible = false;

        }

        this.update(false);

        this.boundingBoxHelper = new Box3Helper(this.boundingBox, green);
        this.boundingBoxHelper.name = `${name}-box-helper`;

        this.subGroup.add(
            this.box.mesh,
            this._front.mesh,
            this._back.mesh,
            this._left.mesh,
            this._right.mesh
        );
        this.group.add(            
            this.ladderItem.group,
            this.subGroup
        );

    }

    async init() {

        await this.ladderItem.init();

        this.setPickLayers();

    }

    rotateOnLocalAxisX(rad) {

        this.ladderItem.group.rotation.x = rad;
        // this.box.mesh.rotation.x = rad;
        // this._front.mesh.rotation.x = rad;
        // this._back.mesh.rotation.x = rad;
        // this._left.mesh.rotation.z = rad;
        // this._right.mesh.rotation.z = - rad;
        this.subGroup.rotation.x = rad;

        return this;

    }

    get rotationXDegree() {

        // return MathUtils.radToDeg(this.box.mesh.rotation.x);
        return MathUtils.radToDeg(this.subGroup.rotation.x);

    }

    set rotationXDegree(value) {

        this.rotateOnLocalAxisX(MathUtils.degToRad(value));

    }

    get rotationX() {

        return this.subGroup.rotation.x;

    }

    get height() {

        return this.boundingBox.getSize(_v1).y;

    }

    get slopeRatio() {

        const side = this._height * this.scale[1];
        const height = this.height;
        const bottom = Math.sqrt(side * side - height * height);

        return bottom / side;

    }

    updateOBBs(needUpdateMatrixWorld = true) {

        super.updateOBBs(needUpdateMatrixWorld, false, false);
        this._front.updateOBB(needUpdateMatrixWorld);
        this._back.updateOBB(needUpdateMatrixWorld);
        this._left.updateOBB(needUpdateMatrixWorld);
        this._right.updateOBB(needUpdateMatrixWorld);

        const { matrixWorld, geometry: { boundingBox } } = this.box.mesh;
        this.boundingBox.copy(boundingBox).applyMatrix4(matrixWorld);

    }

    update(needToUpdateOBBnRay = true) {

        const depth = this._depth * this.scale[2];
        const width = this._width * this.scale[0];

        this.ladderItem.scale = this.scale;

        // update box scale
        this.box.setScale(this.scale);

        this._front.setPosition([0, 0, depth * .5]).setScale(this.scale);
        this._back.setPosition([0, 0, - depth * .5]).setScale(this.scale);
        this._left.setPosition([width * .5, 0, 0]).setScale([this.scale[2], this.scale[1], 1]);
        this._right.setPosition([- width * .5, 0, 0]).setScale([this.scale[2], this.scale[1], 1]);

        this.updateOBBs(needToUpdateOBBnRay);
        
    }

}

export { RotatableLadder };