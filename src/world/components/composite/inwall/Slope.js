import { Group } from 'three';
import { createCollisionPlane, createOBBPlane, createCollisionTrianglePlane, createCollisionPlaneFree } from '../../physics/collisionHelper';
import { yankeesBlue, basic } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

class Slope {

    name = '';
    isSlope = true;
    isStairs = true;

    slope;
    leftFace;
    rightFace;
    backFace;
    bottomFace;

    walls = []; // collision plane
    bottoms = []; // non OBB plane
    bottomOBBs = [];    // OBB plane

    specs;

    constructor(specs) {

        this.specs = specs;

        const { name, width = 1, depth = 1, height = 1 } = specs;
        const { showArrow = false, enableOBBs = false } = specs;
        const { backMap, leftMap, rightMap, slopeMap, bottomMap } = specs;

        const slopeSpecs = this.makePlaneConfig({ width, height: Math.sqrt(depth * depth + height * height), color: yankeesBlue, map: slopeMap });
        const leftSpecs = this.makePlaneConfig({ width: depth, height, leftHanded: true, color: basic, map: leftMap });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, leftHanded: false, color: basic, map: rightMap });
        const backSpecs = this.makePlaneConfig({ width, height, color: basic, map: backMap });
        const bottomSpecs = this.makePlaneConfig({ width, height: depth, color: yankeesBlue, map: bottomMap });

        this.name = name;

        this.group = new Group();
        this.group.name = name;

        this.slope = createOBBPlane(slopeSpecs, `${name}_slope`, [0, 0, 0], [- Math.atan(depth / height), 0, 0], true, true);
        this.leftFace = createCollisionTrianglePlane(leftSpecs, `${name}_left`, [width * .5, 0, 0], Math.PI * .5, true, true, showArrow);
        this.rightFace = createCollisionTrianglePlane(rightSpecs, `${name}_right`, [- width * .5, 0, 0], - Math.PI * .5, true, true, showArrow);
        this.backFace = createCollisionPlane(backSpecs, `${name}_back`, [0, 0, - depth * .5], Math.PI, true, true, showArrow);

        this.slope.mesh.layers.enable(2);

        if (!enableOBBs) {

            this.bottomFace = createCollisionPlaneFree(bottomSpecs, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false, showArrow);

            this.bottoms = [this.bottomFace];

        } else {

            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false);

            this.bottomOBBs = [this.bottomFace];

        }

        this.walls = [this.leftFace, this.rightFace, this.backFace];

        this.group.add(
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

    makePlaneConfig(specs) {
        
        const { width, height } = specs;
        const { baseSize = height, mapRatio, noRepeat = false } = this.specs;

        if (noRepeat) return specs;

        if (mapRatio) {
            specs.repeatU = width / (mapRatio * baseSize);
            specs.repeatV = height / baseSize;
        }

        specs.repeatModeU = REPEAT;
        specs.repeatModeV = REPEAT;

        return specs;
    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;
    }

    setRotationY(y) {

        this.group.rotation.y = y;

        this.walls.forEach(w => w.mesh.rotationY += y);
        
        return this;

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
    }
}

export { Slope };