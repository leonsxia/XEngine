import { Box3, Box3Helper, Group, MathUtils, Vector3 } from 'three';
import { createCollisionOBBPlane, createCollisionTrianglePlane, createOBBBox, createOBBPlane } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { LadderItem } from './LadderItem';
import { green, intersect, khaki, orange, yankeesBlue } from '../../../basic/colorBase';
import { OBSTACLE_RAY_LAYER, TOFU_RAY_LAYER } from '../../../utils/constants';
import { ladderPolarity } from '../../../utils/enums';
import { Plane } from '../../../Models';

const _v1 = new Vector3();
const _v2 = new Vector3();
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
    topBuffer;
    bottomBuffer;
    slopes = [];
    sideFaces = [];

    _leftLHWall;
    _leftRHWall;
    _rightLHWall;
    _rightRHWall;

    _frontWall;
    _backWall;

    _endPlane0;
    _endPlane1;

    boundingBox = new Box3();
    boundingBoxHelper;

    subGroup = new Group();

    areaBox;

    #edge = .05;

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

        const areaboxSpecs = { size: { width: 1, depth: 1, height: 1 }, lines };
        this.areaBox = createOBBBox(areaboxSpecs, `${name}_area_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.areaBox.visible = false;

        const frontSpecs = { width: this._width, height: this._height, color: yankeesBlue };
        const backSpecs = { width: this._width, height: this._height };
        const leftSpecs = { width: this._depth, height: this._height, color: khaki };
        const rightSpecs = { width: this._depth, height: this._height };
        const topBottomSpecs = { width: this._width, height: 1 };
        this._front = createOBBPlane(frontSpecs, `${name}_front_obb`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this._back = createOBBPlane(backSpecs, `${name}_back_obb`, [0, 0, 0], [0, Math.PI, 0], receiveShadow, castShadow);
        this._left = createOBBPlane(leftSpecs, `${name}_left_obb`, [0, 0, 0], [0, Math.PI * .5, 0], receiveShadow, castShadow);
        this._right = createOBBPlane(rightSpecs, `${name}_right_obb`, [0, 0, 0], [0, - Math.PI * .5, 0], receiveShadow, castShadow);
        this.topBuffer = createOBBPlane(topBottomSpecs, `${name}_top_obb`, [0, 0, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow);
        this.bottomBuffer = createOBBPlane(topBottomSpecs, `${name}_bottom_obb`, [0, 0, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow);
        this._front.mesh.layers.enable(TOFU_RAY_LAYER);
        this._back.mesh.layers.enable(TOFU_RAY_LAYER);
        this._front.mesh.layers.enable(OBSTACLE_RAY_LAYER);
        this._back.mesh.layers.enable(OBSTACLE_RAY_LAYER);
        this.slopes.push(this._front, this._back);
        this.sideFaces.push(this._left, this._right);

        const sideLHTriangleSpecs = { width: 1, height: 1, color: orange, leftHanded: true };
        const sideRHTriangleSpecs = { width: 1, height: 1, leftHanded: false };
        this._leftLHWall = createCollisionTrianglePlane(sideLHTriangleSpecs, `${name}_left_wall_lefthanded`, [0, 0, 0], Math.PI * .5, receiveShadow, castShadow);
        this._leftRHWall = createCollisionTrianglePlane(sideRHTriangleSpecs, `${name}_left_wall_righthanded`, [0, 0, 0], Math.PI * .5, receiveShadow, castShadow);
        this._rightRHWall = createCollisionTrianglePlane(sideRHTriangleSpecs, `${name}_right_wall_righthanded`, [0, 0, 0], - Math.PI * .5, receiveShadow, castShadow);
        this._rightLHWall = createCollisionTrianglePlane(sideLHTriangleSpecs, `${name}_right_wall_lefthanded`, [0, 0, 0], - Math.PI * .5, receiveShadow, castShadow);
        this._leftLHWall.belongTo = this;
        this._leftRHWall.belongTo = this;
        this._rightLHWall.belongTo = this;
        this._rightRHWall.belongTo = this;
        this._leftLHWall.needTest = this;
        this._leftRHWall.needTest = this;
        this._rightLHWall.needTest = this;
        this._rightRHWall.needTest = this;
        this.walls.push(this._leftLHWall, this._leftRHWall, this._rightLHWall, this._rightRHWall);

        const fbWallSpecs = {width: 1, height: 1}
        this._frontWall = createCollisionOBBPlane(fbWallSpecs, `${name}_front_wall`, [0, 0, 0], 0, receiveShadow, castShadow);
        this._backWall = createCollisionOBBPlane(fbWallSpecs, `${name}_back_wall`, [0, 0, 0], Math.PI, receiveShadow, castShadow);
        this._frontWall.belongTo = this;
        this._frontWall.needTest = true;
        this._backWall.belongTo = this;
        this._backWall.needTest = true;
        this.walls.push(this._frontWall, this._backWall);

        const endPlaneSpecs = { width: 1, height: 1 };
        this._endPlane0 = new Plane(Object.assign({name: `${name}_end_plane_0`, color: intersect}, endPlaneSpecs));
        this._endPlane1 = new Plane(Object.assign({name: `${name}_end_plane_1`}, endPlaneSpecs));
        this._endPlane0.setRotation([- Math.PI * .5, 0, 0]);
        this._endPlane1.setRotation([- Math.PI * .5, 0, 0]);
        this._endPlane0.mesh.layers.enable(TOFU_RAY_LAYER);
        this._endPlane0.mesh.layers.enable(OBSTACLE_RAY_LAYER);

        if (!DEBUG) {

            this._front.visible = false;
            this._back.visible = false;
            this._left.visible = false;
            this._right.visible = false;
            this.topBuffer.visible = false;
            this.bottomBuffer.visible = false;
            this._leftLHWall.visible = false;
            this._leftRHWall.visible = false;
            this._rightLHWall.visible = false;
            this._rightRHWall.visible = false;
            this._frontWall.visible = false;
            this._backWall.visible = false;
            this._endPlane0.visible = false;
            this._endPlane1.visible = false;

        }

        this.update(false);

        this.boundingBoxHelper = new Box3Helper(this.boundingBox, green);
        this.boundingBoxHelper.name = `${name}-box-helper`;

        this.subGroup.add(
            this.box.mesh,
            this._front.mesh,
            this._back.mesh,
            this._left.mesh,
            this._right.mesh,
            this.topBuffer.mesh,
            this.bottomBuffer.mesh
        );
        this.group.add(
            this.areaBox.mesh,       
            this.ladderItem.group,
            this.subGroup,
            this._leftLHWall.mesh,
            this._leftRHWall.mesh,
            this._rightLHWall.mesh,
            this._rightRHWall.mesh,
            this._frontWall.mesh,
            this._backWall.mesh,
            this._endPlane0.mesh,
            this._endPlane1.mesh
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

    get endPlane0() {

        return this._endPlane0;

    }

    get endPlane1() {

        return this._endPlane1;

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

    get bottomY() {

        const posY = this.getWorldPosition(_v1).y;
        return posY - this.height * .5;

    }

    get slopeRatio() {

        const side = this._height * this.scale[1];
        const height = this.height;
        const bottom = Math.sqrt(Math.max(side * side - height * height, 0));

        return bottom / side;

    }

    get polarity() {

        const frontPosY = this._front.getWorldPosition(_v1).y;
        const backPosY = this._back.getWorldPosition(_v2).y;

        return frontPosY >= backPosY ? ladderPolarity.up : ladderPolarity.down;

    }

    get polarityCos() {

        return Math.cos(this.rotationX) >= 0 ? 1 : - 1;

    }

    testWallAvailable(wall) {

        let result = false;

        if (!wall.needTest) {

            result = true;

        } else if (this.polarity === ladderPolarity.up) {

            if (this.polarityCos > 0) {
                
                if (wall === this._backWall || wall === this._leftLHWall || wall === this._rightRHWall) {

                    result = true;

                }

            } else {

                if (wall === this._frontWall || wall === this._leftRHWall || wall === this._rightLHWall) {

                    result = true;

                }

            }

        } else {

            if (this.polarityCos > 0) {

                if (wall === this._frontWall || wall === this._leftRHWall || wall === this._rightLHWall) {

                    result = true;

                }

            } else {

                if (wall === this._backWall || wall === this._leftLHWall || wall === this._rightRHWall) {

                    result = true;

                }

            }

        }

        return result;

    }

    updateOBBs(needUpdateMatrixWorld = true) {

        super.updateOBBs(needUpdateMatrixWorld, true, false);
        this._front.updateOBB();
        this._back.updateOBB();
        this._left.updateOBB();
        this._right.updateOBB();
        this.topBuffer.updateOBB();
        this.bottomBuffer.updateOBB();
        this.areaBox.updateOBB();

        this.updateBoundingBox();

    }

    updateBoundingBox() {

        const { matrixWorld, geometry: { boundingBox } } = this.box.mesh;
        this.boundingBox.copy(boundingBox).applyMatrix4(matrixWorld);

    }

    update(needToUpdateOBBnRay = true) {

        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];
        const width = this._width * this.scale[0];

        this.ladderItem.scale = this.scale;

        // update box scale
        this.box.setScale(this.scale);

        this._front.setPosition([0, 0, depth * .5]).setScale(this.scale);
        this._back.setPosition([0, 0, - depth * .5]).setScale(this.scale);
        this._left.setPosition([width * .5, 0, 0]).setScale([this.scale[2], this.scale[1], 1]);
        this._right.setPosition([- width * .5, 0, 0]).setScale([this.scale[2], this.scale[1], 1]); 
        this.topBuffer.setPosition([0, height * .5, 0]).setScale([this.scale[0], .5, 1]);
        this.bottomBuffer.setPosition([0, - height * .5, 0]).setScale([this.scale[0], .5, 1]);

        this.box.updateOBB(needToUpdateOBBnRay);
        this.updateBoundingBox();

        // update area box
        this.areaBox.setScale([width, this.height, height * this.slopeRatio]);

        this._leftLHWall.setPosition([width * .5 - this.#edge, 0, 0]).setScale([height * this.slopeRatio, this.height, 1]);
        this._leftRHWall.setPosition([width * .5 - this.#edge, 0, 0]).setScale([height * this.slopeRatio, this.height, 1]);
        this._rightLHWall.setPosition([- width * .5 + this.#edge, 0, 0]).setScale([height * this.slopeRatio, this.height, 1]);
        this._rightRHWall.setPosition([- width * .5 + this.#edge, 0, 0]).setScale([height * this.slopeRatio, this.height, 1]);

        this.updateOBBs(needToUpdateOBBnRay);

        const _posY = this.polarity === ladderPolarity.up ? this.height * .5 : - this.height * .5;
        const _posZ = height * this.slopeRatio * .5 + .5;
        this._endPlane0.setPosition([0,  _posY, - _posZ * this.polarityCos]).setScale([width, 1]);
        this._endPlane1.setPosition([0, - _posY, _posZ * this.polarityCos]).setScale([width, 1]);
        
    }

    lazyUpdate(target) {

        if (!this.movable) {

            this.box.updateOBB();
            this.updateBoundingBox();

        }

        const targetPosY = target.getWorldPosition(_v1).y;
        const side = this._height * this.scale[1];
        const height = target ? Math.min(Math.max(targetPosY + target.height * .5 - this.bottomY, 0), this.height) : this.height;
        const width = this._width * this.scale[0] - this.#edge * 2;
        const depth = side * this.slopeRatio;
        const tan = this.height / depth;
        const backPosZ = Math.max(depth * .5 - height / tan, - depth * .5);
        const frontPosZ = Math.min(- depth * .5 + height / tan, depth * .5);
        const posY = - this.height * .5 + height * .5;

        this._frontWall.setPosition([0, posY, frontPosZ]).setScale([width, height, 1]);
        this._backWall.setPosition([0, posY, backPosZ]).setScale([width, height, 1]);

        const sideWidth = height / tan;
        if (this.polarity === ladderPolarity.up) {

            const posZ = this.polarityCos > 0 ? depth * .5 - sideWidth * .5 : - depth * .5 + sideWidth * .5;
            this._leftLHWall.setPosition([width * .5 - this.#edge, - this.height * .5 + height * .5, posZ]).setScale([sideWidth, height, 1]);
            this._leftRHWall.setPosition([width * .5 - this.#edge, - this.height * .5 + height * .5, posZ]).setScale([sideWidth, height, 1]);
            this._rightLHWall.setPosition([- width * .5 + this.#edge, - this.height * .5 + height * .5, posZ]).setScale([sideWidth, height, 1]);
            this._rightRHWall.setPosition([- width * .5 + this.#edge, - this.height * .5 + height * .5, posZ]).setScale([sideWidth, height, 1]);

        } else {

            const posZ = this.polarityCos > 0 ? - depth * .5 + sideWidth * .5 : depth * .5 - sideWidth * .5;
            this._leftLHWall.setPosition([width * .5 - this.#edge, - this.height * .5 + height * .5, posZ]).setScale([sideWidth, height, 1]);
            this._leftRHWall.setPosition([width * .5 - this.#edge, - this.height * .5 + height * .5, posZ]).setScale([sideWidth, height, 1]);
            this._rightLHWall.setPosition([- width * .5 + this.#edge, - this.height * .5 + height * .5, posZ]).setScale([sideWidth, height, 1]);
            this._rightRHWall.setPosition([- width * .5 + this.#edge, - this.height * .5 + height * .5, posZ]).setScale([sideWidth, height, 1]);

        }

        if (!this.movable) {

            this.updateOBBs();

        }

    }

}

export { RotatableLadder };