import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane, createCollisionTrianglePlane, createCollisionPlaneFree, createOBBBox } from '../../physics/collisionHelper';
import { InWallObjectBase } from './InWallObjectBase';
import { yankeesBlue, basic } from '../../basic/colorBase';
import { PLAYER_RAY_LAYER, OBSTACLE_RAY_LAYER } from '../../utils/constants';

const DEFAULT_STEP_HEIGHT = .25;

class Slope extends InWallObjectBase {

    isSlope = true;

    _width = 1;
    _height = 1;
    _depth = 1;

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

        const { name, width = 1, depth = 1, height = 1 } = specs;
        const { showArrow = false } = specs;
        const { backMap, leftMap, rightMap, slopeMap, bottomMap } = specs;
        const { backNormal, leftNormal, rightNormal, slopeNormal, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { scale = [1, 1, 1] } = specs;

        this._scale = new Array(...scale);

        const boxSpecs = { size: { width, depth, height } };
        const bufferSpecs = { size: { width, depth: .2, height: .1 }, color: yankeesBlue };

        const slopeSpecs = this.makePlaneConfig({ width, height: Math.sqrt(depth * depth + height * height), color: yankeesBlue, map: slopeMap, normalMap: slopeNormal });
        const leftSpecs = this.makePlaneConfig({ width: depth, height, leftHanded: true, color: basic, map: leftMap, normalMap: leftNormal });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, leftHanded: false, color: basic, map: rightMap, normalMap: rightNormal });
        const backSpecs = this.makePlaneConfig({ width, height, color: basic, map: backMap, normalMap: backNormal });
        const bottomSpecs = this.makePlaneConfig({ width, height: depth, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });

        this.width = width;
        this.height = height;
        this.depth = depth;

        const createWallFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], false, false);
        this.bottomBoxBuffer = createOBBBox(bufferSpecs, `${name}_obb_bottom_buffer`, [0, - height * .5 + bufferSpecs.size.height * .5, depth * .5 + bufferSpecs.size.depth * .5], [0, 0, 0], false, false);
        this.topBoxBuffer = createOBBBox(bufferSpecs, `${name}_obb_top_buffer`, [0, height * .5 + bufferSpecs.size.height * .5, - depth * .5 - bufferSpecs.size.depth * .5], [0, 0, 0], false, false);

        this.slope = createOBBPlane(slopeSpecs, `${name}_slope`, [0, 0, 0], [- Math.atan(depth / height), 0, 0], receiveShadow, castShadow);
        this.leftFace = createCollisionTrianglePlane(leftSpecs, `${name}_left`, [width * .5, 0, 0], Math.PI * .5, receiveShadow, castShadow, showArrow);
        this.rightFace = createCollisionTrianglePlane(rightSpecs, `${name}_right`, [- width * .5, 0, 0], - Math.PI * .5, receiveShadow, castShadow, showArrow);
        this.backFace = createWallFunction(backSpecs, `${name}_back`, [0, 0, - depth * .5], Math.PI, receiveShadow, castShadow, showArrow);

        this.createSideOBBs();

        this.slope.mesh.layers.enable(PLAYER_RAY_LAYER);
        this.slope.mesh.layers.enable(OBSTACLE_RAY_LAYER);
        this.box.visible = false;
        this.bottomBoxBuffer.visible = false;
        this.topBoxBuffer.visible = false;

        if (!this.enableOBBs) {

            this.bottomFace = createCollisionPlaneFree(bottomSpecs, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], receiveShadow, false, false, showArrow);

            this.bottoms = [this.bottomFace];

        } else {

            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], receiveShadow, false);

            this.bottomOBBs = [this.bottomFace];

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

    createSideOBBs() {

        if (this.enableWallOBBs) {

            const { name, width = 1, depth = 1, height = 1, stepHeight = DEFAULT_STEP_HEIGHT } = this.specs;

            const leftOBBSpecs = { width: depth, height: stepHeight, color: basic };
            const rightOBBSpecs = { width: depth, height: stepHeight, color: basic };
            const bottomY = (stepHeight - height) * .5;

            this.leftOBBFace = createOBBPlane(leftOBBSpecs, `${name}_left_obb`, [width * .5, bottomY, 0], [0, Math.PI * .5, 0], false, false);
            this.rightOBBFace = createOBBPlane(rightOBBSpecs, `${name}_right_obb`, [- width * .5, bottomY, 0], [0, - Math.PI * .5, 0], false, false);

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

}

export { Slope };