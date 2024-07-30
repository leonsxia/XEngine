import { createCollisionPlane, createOBBPlane, createCollisionTrianglePlane, createCollisionPlaneFree, createOBBBox } from '../../physics/collisionHelper';
import { InWallObjectBase } from './InWallObjectBase';
import { yankeesBlue, basic } from '../../basic/colorBase';

class Slope extends InWallObjectBase {

    isSlope = true;

    box;
    bottomBoxBuffer;
    topBoxBuffer;

    slope;
    leftFace;
    rightFace;
    backFace;
    bottomFace;

    constructor(specs) {

        super(specs);

        const { name, width = 1, depth = 1, height = 1 } = specs;
        const { showArrow = false } = specs;
        const { backMap, leftMap, rightMap, slopeMap, bottomMap } = specs;
        const { backNormal, leftNormal, rightNormal, slopeNormal, bottomNormal } = specs;

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

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], false, false);
        this.bottomBoxBuffer = createOBBBox(bufferSpecs, `${name}_obb_bottom_buffer`, [0, - height * .5 + bufferSpecs.size.height * .5, depth * .5 + bufferSpecs.size.depth * .5], [0, 0, 0], false, false);
        this.topBoxBuffer = createOBBBox(bufferSpecs, `${name}_obb_top_buffer`, [0, height * .5 + bufferSpecs.size.height * .5, - depth * .5 - bufferSpecs.size.depth * .5], [0, 0, 0], false, false);

        this.slope = createOBBPlane(slopeSpecs, `${name}_slope`, [0, 0, 0], [- Math.atan(depth / height), 0, 0], true, true);
        this.leftFace = createCollisionTrianglePlane(leftSpecs, `${name}_left`, [width * .5, 0, 0], Math.PI * .5, true, true, showArrow);
        this.rightFace = createCollisionTrianglePlane(rightSpecs, `${name}_right`, [- width * .5, 0, 0], - Math.PI * .5, true, true, showArrow);
        this.backFace = createCollisionPlane(backSpecs, `${name}_back`, [0, 0, - depth * .5], Math.PI, true, true, showArrow);

        this.slope.mesh.layers.enable(2);
        this.box.mesh.visible = false;
        this.bottomBoxBuffer.mesh.visible = false;
        this.topBoxBuffer.mesh.visible = false;

        if (!this.enableOBBs) {

            this.bottomFace = createCollisionPlaneFree(bottomSpecs, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false, showArrow);

            this.bottoms = [this.bottomFace];

        } else {

            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false);

            this.bottomOBBs = [this.bottomFace];

        }

        this.walls = [this.leftFace, this.rightFace, this.backFace];

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

    updateOBBs(needUpdateMatrixWorld = true, needUpdateWalls = true, needUpdateBottom = true) {
        
        if (needUpdateWalls) {

            this.walls.forEach(w => {

                w.updateRay();

                if (w.isOBB) {

                    w.updateOBB(needUpdateMatrixWorld);

                }

            });

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