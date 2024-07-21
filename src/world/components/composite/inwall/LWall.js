import { Group } from 'three';
import { createCollisionPlane, createCollisionOBBPlane, createCollisionPlaneFree, createOBBPlane } from '../../physics/collisionHelper';
import { green, yankeesBlue } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

class LWall {
    name = '';
    // S: horizontal, T: vertical
    outWallT;
    outWallS;
    sideWallT;
    sideWallS;
    inWallT;
    inWallS;
    topWallT;
    topWallS;
    bottomWallT;
    bottomWallS;
    walls = [];
    tops = [];
    bottoms = [];
    topOBBs = [];
    bottomOBBs = [];

    isObstacle = false;
    enableWallOBBs = false;
    climbable = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, thickness, height} = specs;
        const { isObstacle = false, showArrow = false, enableOBBs = false, enableWallOBBs = false, climbable = false } = specs;
        const { outTMap, outSMap, inTMap, inSMap, sideTMap, sideSMap, topMap, bottomMap } = specs;

        const outWallTSpecs = this.makePlaneConfig({ width: depth, height, map: outTMap });
        const inWallTSpecs = this.makePlaneConfig({ width: depth - thickness, height, map: inTMap });
        const outWallSSpecs = this.makePlaneConfig({ width, height, map: outSMap });
        const inWallSSpecs = this.makePlaneConfig({ width: width - thickness, height, map: inSMap });
        const sideWallTSpecs = this.makePlaneConfig({ width: thickness, height, map: sideTMap });
        const sideWallSSpecs = this.makePlaneConfig({ width: thickness, height, map: sideSMap });
        const topTSpecs = this.makePlaneConfig({ width: thickness, height: depth, color: yankeesBlue, map: topMap });
        const topSSpecs = this.makePlaneConfig({ width: width - thickness, height: thickness, color: yankeesBlue, map: topMap });
        const bottomTSpecs = this.makePlaneConfig({ width: thickness, height: depth, color: yankeesBlue, map: bottomMap });
        const bottomSSpecs = this.makePlaneConfig({ width: width - thickness, height: thickness, color: yankeesBlue, map: bottomMap });

        this.name = name;
        this.isObstacle = isObstacle;
        this.enableWallOBBs = enableWallOBBs;
        this.climbable = climbable;
        this.group = new Group();

        const createWallFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.outWallT = createWallFunction(outWallTSpecs, `${name}_outT`, [- width / 2, 0, 0], - Math.PI / 2, true, true, showArrow);
        this.inWallT = createWallFunction(inWallTSpecs, `${name}_inT`, [- width / 2 + thickness, 0, thickness / 2], Math.PI / 2, true, true, showArrow);
        this.inWallS = createWallFunction(inWallSSpecs, `${name}_inS`, [thickness / 2, 0, - depth / 2 + thickness], 0, true, true, showArrow);
        this.sideWallT = createWallFunction(sideWallTSpecs, `${name}_sideT`, [width / 2, 0, - depth / 2 + thickness / 2], Math.PI / 2, true, true, showArrow);
        this.sideWallS = createWallFunction(sideWallSSpecs, `${name}_sideS`, [- width / 2 + thickness / 2, 0, depth / 2], 0, true, true, showArrow);

        if (!enableOBBs) {
            this.topWallT = createCollisionPlaneFree(topTSpecs, `${name}_topT`, [- (width - thickness) * .5 , height * .5, 0], [- Math.PI * .5, 0, 0], true, false, false, showArrow);
            this.topWallS = createCollisionPlaneFree(topSSpecs, `${name}_topS`, [thickness * .5 , height * .5, - (depth - thickness) * .5], [- Math.PI * .5, 0, 0], true, false, false, showArrow);
            this.bottomWallT = createCollisionPlaneFree(bottomTSpecs, `${name}_bottomT`, [- (width - thickness) * .5 , - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false, showArrow);
            this.bottomWallS = createCollisionPlaneFree(bottomSSpecs, `${name}_bottomS`, [thickness * .5 , - height * .5, - (depth - thickness) * .5], [Math.PI * .5, 0, 0], true, false, false, showArrow);
            this.tops.push(this.topWallT, this.topWallS);
            this.bottoms.push(this.bottomWallT, this.bottomWallS);
        } else {
            this.topWallT = createOBBPlane(topTSpecs, `${name}_topT_OBB`, [- (width - thickness) * .5 , height * .5, 0], [- Math.PI * .5, 0, 0], true, false);
            this.topWallS = createOBBPlane(topSSpecs, `${name}_topS_OBB`, [thickness * .5 , height * .5, - (depth - thickness) * .5], [- Math.PI * .5, 0, 0], true, false);
            this.bottomWallT = createOBBPlane(bottomTSpecs, `${name}_bottomT_OBB`, [- (width - thickness) * .5 , - height * .5, 0], [Math.PI * .5, 0, 0], true, false);
            this.bottomWallS = createOBBPlane(bottomSSpecs, `${name}_bottomS_OBB`, [thickness * .5 , - height * .5, - (depth - thickness) * .5], [Math.PI * .5, 0, 0], true, false);
            this.topOBBs.push(this.topWallT, this.topWallS);
            this.bottomOBBs.push(this.bottomWallT, this.bottomWallS);
        }

        // create last for changing line color
        this.outWallS = createWallFunction(outWallSSpecs, `${name}_outS`, [0, 0, - depth / 2], Math.PI, true, true, showArrow);
        this.outWallS.line.material.color.setHex(green);

        this.walls = [this.outWallT, this.outWallS, this.inWallT, this.inWallS, this.sideWallT, this.sideWallS];

        this.group.add(
            this.outWallT.mesh,
            this.outWallS.mesh,
            this.sideWallT.mesh,
            this.sideWallS.mesh,
            this.inWallT.mesh,
            this.inWallS.mesh,
            this.topWallT.mesh,
            this.topWallS.mesh,
            this.bottomWallT.mesh,
            this.bottomWallS.mesh
        );
    }

    async init() {
        await Promise.all([
            this.outWallT.init(),
            this.outWallS.init(),
            this.inWallT.init(),
            this.inWallS.init(),
            this.sideWallT.init(),
            this.sideWallS.init(),
            this.topWallT.init(),
            this.topWallS.init(),
            this.bottomWallT.init(),
            this.bottomWallS.init()
        ]);
    }

    makePlaneConfig(specs) {
        const { width, height } = specs;
        const { baseSize = height, mapRatio, noRepeat } = this.specs;

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

    updateOBBs(needUpdateMatrixWorld = true, needUpdateWalls = true, needUpdateTopBottom = true) {
        if (needUpdateWalls) {
            this.walls.forEach(w => {
                w.updateRay();

                if (w.isOBB) {
                    w.updateOBB(needUpdateMatrixWorld);
                }
            });
        }

        if (needUpdateTopBottom) {
            this.topOBBs.concat(this.bottomOBBs).forEach(obb => obb.updateOBB(needUpdateMatrixWorld));
        }
    }
}

export { LWall };