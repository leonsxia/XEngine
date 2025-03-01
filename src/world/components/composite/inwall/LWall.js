import { createCollisionPlane, createCollisionOBBPlane, createCollisionPlaneFree, createOBBPlane } from '../../physics/collisionHelper';
import { InWallObjectBase } from './InWallObjectBase';
import { green, yankeesBlue } from '../../basic/colorBase';

class LWall extends InWallObjectBase {

    defaultThickS = 0.5;
    defaultThickT = 0.5;
    _thicknessS = this.defaultThickS;
    _thicknessT = this.defaultThickT;
    _width = 1;
    _height = 1;
    _depth = 1;

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

        const { name, thicknessS = this.defaultThickS, thicknessT = this.defaultThickT } = specs;
        const { showArrow = false } = specs;
        const { outTMap, outSMap, inTMap, inSMap, sideTMap, sideSMap, topMap, bottomMap } = specs;
        const { outTNormal, outSNormal, inTNormal, inSNormal, sideTNormal, sideSNormal, topNormal, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { scale = [1, 1, 1] } = specs;

        this._scale = new Array(...scale);
        this._thicknessS = thicknessS;
        this._thicknessT = thicknessT;

        const outWallTSpecs = this.makePlaneConfig({ width: this._depth, height: this._height, map: outTMap, normalMap: outTNormal });
        const inWallTSpecs = this.makePlaneConfig({ width: this._depth - this.defaultThickT, height: this._height, map: inTMap, normalMap: inTNormal });
        const outWallSSpecs = this.makePlaneConfig({ width: this._width, height: this._height, map: outSMap, normalMap: outSNormal });
        const inWallSSpecs = this.makePlaneConfig({ width: this._width - this.defaultThickS, height: this._height, map: inSMap, normalMap: inSNormal });
        const sideWallTSpecs = this.makePlaneConfig({ width: this.defaultThickT, height: this._height, map: sideTMap, normalMap: sideTNormal });
        const sideWallSSpecs = this.makePlaneConfig({ width: this.defaultThickS, height: this._height, map: sideSMap, normalMap: sideSNormal });
        const topTSpecs = this.makePlaneConfig({ width: this.defaultThickS, height: this._depth, color: yankeesBlue, map: topMap, normalMap: topNormal });
        const topSSpecs = this.makePlaneConfig({ width: this._width - this.defaultThickS, height: this.defaultThickT, color: yankeesBlue, map: topMap, normalMap: topNormal });
        const bottomTSpecs = this.makePlaneConfig({ width: this.defaultThickS, height: this._depth, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });
        const bottomSSpecs = this.makePlaneConfig({ width: this._width - this.defaultThickS, height: this.defaultThickT, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });

        const createWallFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.outWallT = createWallFunction(outWallTSpecs, `${name}_outT`, [0, 0, 0], - Math.PI / 2, receiveShadow, castShadow, showArrow);
        this.inWallT = createWallFunction(inWallTSpecs, `${name}_inT`, [0, 0, 0], Math.PI / 2, receiveShadow, castShadow, showArrow);
        this.inWallS = createWallFunction(inWallSSpecs, `${name}_inS`, [0, 0, 0], 0, receiveShadow, castShadow, showArrow);
        this.sideWallT = createWallFunction(sideWallTSpecs, `${name}_sideT`, [0, 0, 0], Math.PI / 2, receiveShadow, castShadow, showArrow);
        this.sideWallS = createWallFunction(sideWallSSpecs, `${name}_sideS`, [0, 0, 0], 0, receiveShadow, castShadow, showArrow);

        if (!this.enableOBBs) {

            this.topWallT = createCollisionPlaneFree(topTSpecs, `${name}_topT`, [0, 0, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow, false, showArrow);
            this.topWallS = createCollisionPlaneFree(topSSpecs, `${name}_topS`, [0, 0, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow, false, showArrow);
            this.bottomWallT = createCollisionPlaneFree(bottomTSpecs, `${name}_bottomT`, [0, 0, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow, false, showArrow);
            this.bottomWallS = createCollisionPlaneFree(bottomSSpecs, `${name}_bottomS`, [0, 0, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow, false, showArrow);

            this.tops.push(this.topWallT, this.topWallS);
            this.bottoms.push(this.bottomWallT, this.bottomWallS);

        } else {

            this.topWallT = createOBBPlane(topTSpecs, `${name}_topT_OBB`, [0, 0, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow);
            this.topWallS = createOBBPlane(topSSpecs, `${name}_topS_OBB`, [0, 0, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow);
            this.bottomWallT = createOBBPlane(bottomTSpecs, `${name}_bottomT_OBB`, [0, 0, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow);
            this.bottomWallS = createOBBPlane(bottomSSpecs, `${name}_bottomS_OBB`, [0, 0, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow);

            this.topOBBs.push(this.topWallT, this.topWallS);
            this.bottomOBBs.push(this.bottomWallT, this.bottomWallS);

        }

        // create last for changing line color
        this.outWallS = createWallFunction(outWallSSpecs, `${name}_outS`, [0, 0, 0], Math.PI, receiveShadow, castShadow, showArrow);
        this.outWallS.line?.material.color.setHex(green);

        this.walls = [this.outWallT, this.outWallS, this.inWallT, this.inWallS, this.sideWallT, this.sideWallS];

        this.update(false, true);

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

        this.setPickLayers();
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

    get thicknessS() {

        return this._thicknessS;

    }

    set thicknessS(val) {

        this._thicknessS = val;

    }

    get thicknessT() {

        return this._thicknessT;

    }

    set thicknessT(val) {

        this._thicknessT = val;

    }

    get thickSPercentage() {

        return parseFloat((100 * this._thicknessS / (this._width * this.scale[0])).toFixed(1));

    }

    set thickSPercentage(val) {

        this._thicknessS = this._width * this.scale[0] * val / 100;

        this.update();

    }

    get thickTPercentage() {

        return parseFloat((100 * this._thicknessT / (this._depth * this.scale[2])).toFixed(1));

    }

    set thickTPercentage(val) {

        this._thicknessT = this._depth * this.scale[2] * val / 100;

        this.update();

    }

    update(needToUpdateOBBnRay = true, needToUpdateTexture = true) {

        const thicknessS = this._thicknessS;
        const thicknessT = this._thicknessT;
        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];

        this.outWallT.setScale([this.scale[2], this.scale[1], 1])
            .setPosition([- width / 2, 0, 0]);
        this.outWallS.setScale([this.scale[0], this.scale[1], 1])
            .setPosition([0, 0, - depth / 2]);
        this.inWallT.setScale([(depth - thicknessT) / this.defaultThickT, this.scale[1], 1])
            .setPosition([- width / 2 + thicknessS, 0, thicknessT / 2]);
        this.inWallS.setScale([(width - thicknessS) / this.defaultThickS, this.scale[1], 1])
            .setPosition([thicknessS / 2, 0, - depth / 2 + thicknessT]);
        this.sideWallT.setScale([thicknessT / this.defaultThickT, this.scale[1], 1])
            .setPosition([width / 2, 0, - depth / 2 + thicknessT / 2]);
        this.sideWallS.setScale([thicknessS / this.defaultThickS, this.scale[1], 1])
            .setPosition([- width / 2 + thicknessS / 2, 0, depth / 2]);
        this.topWallT.setScale([thicknessS / this.defaultThickS, this.scale[2], 1])
            .setPosition([- (width - thicknessS) * .5, height * .5, 0]);
        this.topWallS.setScale([(width - thicknessS) / this.defaultThickS, thicknessT / this.defaultThickT, 1])
            .setPosition([thicknessS * .5, height * .5, - (depth - thicknessT) * .5]);
        this.bottomWallT.setScale([thicknessS / this.defaultThickS, this.scale[2], 1])
            .setPosition([- (width - thicknessS) * .5, - height * .5, 0]);
        this.bottomWallS.setScale([(width - thicknessS) / this.defaultThickS, thicknessT / this.defaultThickT, 1])
            .setPosition([thicknessS * .5, - height * .5, - (depth - thicknessT) * .5]);

        if (needToUpdateTexture) {

            this.outWallT.setConfig({ texScale: [this.scale[2], this.scale[1]] })
                .updateTextures();
            this.outWallS.setConfig({ texScale: [this.scale[0], this.scale[1]] })
                .updateTextures();
            this.inWallT.setConfig({ texScale: [(this.scale[2] - thicknessT) / this.defaultThickT, this.scale[1]] })
                .updateTextures();
            this.inWallS.setConfig({ texScale: [(this.scale[0] - thicknessS) / this.defaultThickS, this.scale[1]] })
                .updateTextures();
            this.sideWallT.setConfig({ texScale: [thicknessT / this.defaultThickT, this.scale[1]] })
                .updateTextures();
            this.sideWallS.setConfig({ texScale: [thicknessS / this.defaultThickS, this.scale[1]] })
                .updateTextures();
            this.topWallT.setConfig({ texScale: [thicknessS / this.defaultThickS, this.scale[2]] })
                .updateTextures();
            this.topWallS.setConfig({ texScale: [(this.scale[0] - thicknessS) / this.defaultThickS, thicknessT / this.defaultThickT] })
                .updateTextures();
            this.bottomWallT.setConfig({ texScale: [thicknessS / this.defaultThickS, this.scale[2]] })
                .updateTextures();
            this.bottomWallS.setConfig({ texScale: [(this.scale[0] - thicknessS) / this.defaultThickS, thicknessT / this.defaultThickT] })
                .updateTextures();
        }

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { LWall };