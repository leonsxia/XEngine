import { createCollisionPlane, createCollisionOBBPlane, createCollisionPlaneFree, createOBBPlane } from '../../physics/collisionHelper';
import { InWallObjectBase } from './InWallObjectBase';
import { green, yankeesBlue } from '../../basic/colorBase';

class LWall extends InWallObjectBase {

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

    constructor(specs) {

        super(specs);

        const { name, width, depth, thickness, height} = specs;
        const { showArrow = false } = specs;
        const { outTMap, outSMap, inTMap, inSMap, sideTMap, sideSMap, topMap, bottomMap } = specs;
        const { outTNormal, outSNormal, inTNormal, inSNormal, sideTNormal, sideSNormal, topNormal, bottomNormal } = specs;

        const outWallTSpecs = this.makePlaneConfig({ width: depth, height, map: outTMap, normalMap: outTNormal });
        const inWallTSpecs = this.makePlaneConfig({ width: depth - thickness, height, map: inTMap, normalMap: inTNormal });
        const outWallSSpecs = this.makePlaneConfig({ width, height, map: outSMap, normalMap: outSNormal });
        const inWallSSpecs = this.makePlaneConfig({ width: width - thickness, height, map: inSMap, normalMap: inSNormal });
        const sideWallTSpecs = this.makePlaneConfig({ width: thickness, height, map: sideTMap, normalMap: sideTNormal });
        const sideWallSSpecs = this.makePlaneConfig({ width: thickness, height, map: sideSMap, normalMap: sideSNormal });
        const topTSpecs = this.makePlaneConfig({ width: thickness, height: depth, color: yankeesBlue, map: topMap, normalMap: topNormal });
        const topSSpecs = this.makePlaneConfig({ width: width - thickness, height: thickness, color: yankeesBlue, map: topMap, normalMap: topNormal });
        const bottomTSpecs = this.makePlaneConfig({ width: thickness, height: depth, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });
        const bottomSSpecs = this.makePlaneConfig({ width: width - thickness, height: thickness, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });

        const createWallFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.outWallT = createWallFunction(outWallTSpecs, `${name}_outT`, [- width / 2, 0, 0], - Math.PI / 2, true, true, showArrow);
        this.inWallT = createWallFunction(inWallTSpecs, `${name}_inT`, [- width / 2 + thickness, 0, thickness / 2], Math.PI / 2, true, true, showArrow);
        this.inWallS = createWallFunction(inWallSSpecs, `${name}_inS`, [thickness / 2, 0, - depth / 2 + thickness], 0, true, true, showArrow);
        this.sideWallT = createWallFunction(sideWallTSpecs, `${name}_sideT`, [width / 2, 0, - depth / 2 + thickness / 2], Math.PI / 2, true, true, showArrow);
        this.sideWallS = createWallFunction(sideWallSSpecs, `${name}_sideS`, [- width / 2 + thickness / 2, 0, depth / 2], 0, true, true, showArrow);

        if (!this.enableOBBs) {

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
        this.outWallS.line?.material.color.setHex(green);

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
    
}

export { LWall };