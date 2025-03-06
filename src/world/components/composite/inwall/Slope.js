import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane, createCollisionTrianglePlane, createCollisionPlaneFree, createOBBBox } from '../../physics/collisionHelper';
import { InWallObjectBase } from './InWallObjectBase';
import { yankeesBlue, basic, green, red } from '../../basic/colorBase';
import { PLAYER_RAY_LAYER, OBSTACLE_RAY_LAYER } from '../../utils/constants';

const DEFAULT_STEP_HEIGHT = .25;

class Slope extends InWallObjectBase {

    isSlope = true;

    _width = 1;
    _height = 1;
    _depth = 1;
    _slopeHeight = Math.sqrt(this._depth * this._depth + this._height * this._height);

    box;
    bottomBoxBuffer;
    topBoxBuffer;

    slope;
    leftFace;
    rightFace;
    backFace;
    bottomFace;

    leftOBBFace;
    rightOBBFace;

    sideOBBWalls = [];

    constructor(specs) {

        super(specs);

        const { name } = specs;
        const { showArrow = false } = specs;
        const { backMap, leftMap, rightMap, slopeMap, bottomMap } = specs;
        const { backNormal, leftNormal, rightNormal, slopeNormal, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { scale = [1, 1, 1] } = specs;

        this._scale = new Array(...scale);

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height } };
        const bufferSpecs = { size: { width: this._width, depth: .2, height: .1 }, color: yankeesBlue };

        const slopeSpecs = this.makePlaneConfig({ width: this._width, height: this._slopeHeight, color: yankeesBlue, map: slopeMap, normalMap: slopeNormal });
        const leftSpecs = this.makePlaneConfig({ width: this._depth, height: this._height, leftHanded: true, color: basic, map: leftMap, normalMap: leftNormal });
        const rightSpecs = this.makePlaneConfig({ width: this._depth, height: this._height, leftHanded: false, color: basic, map: rightMap, normalMap: rightNormal });
        const backSpecs = this.makePlaneConfig({ width: this._width, height: this._height, color: basic, map: backMap, normalMap: backNormal });
        const bottomSpecs = this.makePlaneConfig({ width: this._width, height: this._depth, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });

        const createWallFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], false, false);
        this.bottomBoxBuffer = createOBBBox(bufferSpecs, `${name}_obb_bottom_buffer`, [0, 0, 0], [0, 0, 0], false, false);
        this.topBoxBuffer = createOBBBox(bufferSpecs, `${name}_obb_top_buffer`, [0, 0, 0], [0, 0, 0], false, false);

        this.slope = createOBBPlane(slopeSpecs, `${name}_slope`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.leftFace = createCollisionTrianglePlane(leftSpecs, `${name}_left`, [0, 0, 0], Math.PI * .5, receiveShadow, castShadow, showArrow);
        this.rightFace = createCollisionTrianglePlane(rightSpecs, `${name}_right`, [0, 0, 0], - Math.PI * .5, receiveShadow, castShadow, showArrow);
        this.backFace = createWallFunction(backSpecs, `${name}_back`, [0, 0, 0], Math.PI, receiveShadow, castShadow, showArrow);

        this.createSideOBBs();

        this.slope.mesh.layers.enable(PLAYER_RAY_LAYER);
        this.slope.mesh.layers.enable(OBSTACLE_RAY_LAYER);
        this.box.visible = false;
        this.bottomBoxBuffer.visible = false;
        this.topBoxBuffer.visible = false;

        if (!this.enableOBBs) {

            this.bottomFace = createCollisionPlaneFree(bottomSpecs, `${name}_bottom`, [0, 0, 0], [Math.PI * .5, 0, 0], receiveShadow, true, false, showArrow);

            this.bottoms = [this.bottomFace];

        } else {

            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, 0, 0], [Math.PI * .5, 0, 0], receiveShadow, true);

            this.bottomOBBs = [this.bottomFace];

        }

        const { needUpdate = true } = specs;

        if (needUpdate) {

            this.update(false);

        }

        this.walls.push(this.leftFace, this.rightFace, this.backFace);

        this.group.add(
            this.box.mesh,
            this.bottomBoxBuffer.mesh,
            this.topBoxBuffer.mesh,
            this.slope.mesh,
            this.leftFace.mesh,
            this.rightFace.mesh,
            this.backFace.mesh,
            this.bottomFace.mesh
        );

        this.setPickLayers();

    }

    async init() {

        await Promise.all([
            this.slope.init(),
            this.leftFace.init(),
            this.rightFace.init(),
            this.backFace.init(),
            this.bottomFace.init()
        ]);        

    }

    // for calculating slopeCoefficient in Tofu !!!
    get depth() {

        return this._depth * this.scale[2];

    }

    // for calculating slopeCoefficient in Tofu !!!
    get height() {

        return this._height * this.scale[1];

    }

    createSideOBBs() {

        if (this.enableWallOBBs) {

            const { name, stepHeight = DEFAULT_STEP_HEIGHT } = this.specs;

            const leftOBBSpecs = { width: this._depth, height: stepHeight, color: green };
            const rightOBBSpecs = { width: this._depth, height: stepHeight, color: red };

            this.leftOBBFace = createOBBPlane(leftOBBSpecs, `${name}_left_obb`, [0, 0, 0], [0, Math.PI * .5, 0], false, false);
            this.rightOBBFace = createOBBPlane(rightOBBSpecs, `${name}_right_obb`, [0, 0, 0], [0, - Math.PI * .5, 0], false, false);

            this.leftOBBFace.visible = false;
            this.rightOBBFace.visible = false;

            this.group.add(this.leftOBBFace.mesh, this.rightOBBFace.mesh);

            this.sideOBBWalls.push(this.leftOBBFace, this.rightOBBFace);

        }

    }

    updateOBBs(needUpdateMatrixWorld = true, needUpdateWalls = true, needUpdateBottom = true) {

        if (needUpdateWalls) {

            for (let i = 0, il = this.walls.length; i < il; i++) {

                const w = this.walls[i];

                w.updateRay(needUpdateMatrixWorld);

                if (w.isOBB) {

                    w.updateOBB(false);

                }

            }

            for (let i = 0, il = this.sideOBBWalls.length; i < il; i++) {

                const w = this.sideOBBWalls[i];

                w.updateOBB(needUpdateMatrixWorld);

            }

        }

        if (needUpdateBottom) {

            this.bottomOBBs.forEach(obb => obb.updateOBB(needUpdateMatrixWorld));

        }

        this.slope.updateOBB(needUpdateMatrixWorld);

        this.box.updateOBB(needUpdateMatrixWorld);
        this.bottomBoxBuffer.updateOBB(needUpdateMatrixWorld);
        this.topBoxBuffer.updateOBB(needUpdateMatrixWorld);

    }

    update(needToUpdateOBBnRay = true) {

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];
        const bufferSize = { width, depth: .2, height: .1 };

        // update box
        this.box.setScale(this.scale);

        // update buffer
        this.bottomBoxBuffer.setScale([this.scale[0], 1, 1])
            .setPosition([0, - height * .5 + bufferSize.height * .5, depth * .5 + bufferSize.depth * .5]);
        this.topBoxBuffer.setScale([this.scale[0], 1, 1])
            .setPosition([0, height * .5 + bufferSize.height * .5, - depth * .5 - bufferSize.depth * .5]);

        // update slope
        const slopeHeight = Math.sqrt(depth * depth + height * height);

        this.slope.setScaleWithTexUpdate([this.scale[0], slopeHeight / this._slopeHeight, 1])
            .setRotation([- Math.atan(depth / height), 0, 0]);

        // update faces
        this.leftFace.setScaleWithTexUpdate([this.scale[2], this.scale[1], 1])
            .setPosition([width * .5, 0, 0]);
        this.rightFace.setScaleWithTexUpdate([this.scale[2], this.scale[1], 1])
            .setPosition([- width * .5, 0, 0]);
        this.backFace.setScaleWithTexUpdate([this.scale[0], this.scale[1], 1])
            .setPosition([0, 0, - depth * .5]);
        this.bottomFace.setScaleWithTexUpdate([this.scale[0], this.scale[2], 1])
            .setPosition([0, - height * .5, 0]);

        // update side obbs
        const { stepHeight = DEFAULT_STEP_HEIGHT } = this.specs;
        const bottomY = (stepHeight - height) * .5;
        this.leftOBBFace.setScale([this.scale[2], 1, 1])
            .setPosition([width * .5, bottomY, 0]);
        this.rightOBBFace.setScale([this.scale[2], 1, 1])
            .setPosition([- width * .5, bottomY, 0]);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { Slope };