import { createCollisionPlane, createCollisionOBBPlane, createCollisionOctagonFree, createOBBPlane } from '../../physics/collisionHelper';
import { InWallObjectBase } from './InWallObjectBase';
import { green, yankeesBlue } from '../../basic/colorBase';

class CylinderPillar extends InWallObjectBase {

    _width = 1;
    _height = 1;

    // named faces counterclockwise
    face1; // bottom
    face2;
    face3; // left
    face4;
    face5; // top
    face6;
    face7; // right
    face8;

    top;
    bottom;

    // OBBs
    topCenterS;
    topCenterT;
    topLF2RB;
    topRF2LB;
    bottomCenterS;
    bottomCenterT;
    bottomLF2RB;
    bottomRF2LB;

    radius;

    constructor(specs) {

        super(specs);
        
        const { name } = specs;
        const { showArrow = false } = specs;
        const { map, topMap, bottomMap, normalMap, topNormal, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { scale = [1, 1] } = specs;

        this._scale = [scale[0], scale[1], scale[0]];

        this.radius = this._width * .5 / Math.cos(.375 * Math.PI);

        const pSpecs1 = this.makePlaneConfig({ width: this._width, height: this._height, map, normalMap }, 0);
        const pSpecs2 = this.makePlaneConfig({ width: this._width, height: this._height, map, normalMap }, 1);
        const pSpecs3 = this.makePlaneConfig({ width: this._width, height: this._height, map, normalMap }, 2);
        const pSpecs4 = this.makePlaneConfig({ width: this._width, height: this._height, map, normalMap }, 3);
        const pSpecs5 = this.makePlaneConfig({ width: this._width, height: this._height, map, normalMap }, 4);
        const pSpecs6 = this.makePlaneConfig({ width: this._width, height: this._height, map, normalMap }, 5);
        const pSpecs7 = this.makePlaneConfig({ width: this._width, height: this._height, map, normalMap }, 6);
        const pSpecs8 = this.makePlaneConfig({ width: this._width, height: this._height, map, normalMap }, 7);
        const topSpecs = this.makeTBPlaneConfig({ radius: this.radius, color: yankeesBlue, map: topMap, normalMap: topNormal });
        const bottomSpecs = this.makeTBPlaneConfig({ radius: this.radius, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal }, false);

        const createWallFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.face8 = createWallFunction(pSpecs8, `${name}_face8`, [0, 0, 0], - Math.PI / 4, receiveShadow, castShadow, showArrow);
        this.face7 = createWallFunction(pSpecs7, `${name}_face7`, [0, 0, 0], - Math.PI / 2, receiveShadow, castShadow, showArrow);
        this.face6 = createWallFunction(pSpecs6, `${name}_face6`, [0, 0, 0], - 3 * Math.PI / 4, receiveShadow, castShadow, showArrow);
        this.face5 = createWallFunction(pSpecs5, `${name}_face5`, [0, 0, 0], Math.PI, receiveShadow, castShadow, showArrow);
        this.face4 = createWallFunction(pSpecs4, `${name}_face4`, [0, 0, 0], 3 * Math.PI / 4, receiveShadow, castShadow, showArrow);
        this.face3 = createWallFunction(pSpecs3, `${name}_face3`, [0, 0, 0], Math.PI / 2, receiveShadow, castShadow, showArrow);
        this.face2 = createWallFunction(pSpecs2, `${name}_face2`, [0, 0, 0],  Math.PI / 4, receiveShadow, castShadow, showArrow);

        this.top = createCollisionOctagonFree(topSpecs, `${name}_top`, [0, 0, 0], [- Math.PI * .5, 0, - Math.PI * .125], receiveShadow, false);
        this.bottom = createCollisionOctagonFree(bottomSpecs, `${name}_bottom`, [0, - 0, 0], [Math.PI * .5, 0, Math.PI * .125], receiveShadow, false);
        this.tops = [this.top];
        this.bottoms = [this.bottom];

        if (this.enableOBBs) {

            const halfWidth = this.radius * Math.sin(.375 * Math.PI);
            const tbOBBSpecs = { width: halfWidth * 2, height: this._width, color: yankeesBlue };

            this.topCenterS = createOBBPlane(tbOBBSpecs, `${name}_topS_OBB`, [0, 0, 0], [- Math.PI * .5, 0, 0], false, false);
            this.topCenterT = createOBBPlane(tbOBBSpecs, `${name}_topT_OBB`, [0, 0, 0], [- Math.PI * .5, 0, Math.PI * .5], false, false);
            this.topLF2RB = createOBBPlane(tbOBBSpecs, `${name}_topLF2RB_OBB`, [0, 0, 0], [- Math.PI * .5, 0, Math.PI * .25], false, false);
            this.topRF2LB = createOBBPlane(tbOBBSpecs, `${name}_topRF2LB_OBB`, [0, 0, 0], [- Math.PI * .5, 0, - Math.PI * .25], false, false);

            this.topOBBs = [this.topCenterS, this.topCenterT, this.topLF2RB, this.topRF2LB];

            this.bottomCenterS = createOBBPlane(tbOBBSpecs, `${name}_bottomS_OBB`, [0, 0, 0], [Math.PI * .5, 0, 0], false, false);
            this.bottomCenterT = createOBBPlane(tbOBBSpecs, `${name}_bottomT_OBB`, [0, 0, 0], [Math.PI * .5, 0, Math.PI * .5], false, false);
            this.bottomLF2RB = createOBBPlane(tbOBBSpecs, `${name}_bottomLF2RB_OBB`, [0, 0, 0], [Math.PI * .5, 0, Math.PI * .25], false, false);
            this.bottomRF2LB = createOBBPlane(tbOBBSpecs, `${name}_bottomRF2LB_OBB`, [0, 0, 0], [Math.PI * .5, 0, - Math.PI * .25], false, false);

            this.bottomOBBs = [this.bottomCenterS, this.bottomCenterT, this.bottomLF2RB, this.bottomRF2LB];

            this.setOBBPlaneVisible(false);
            
            this.group.add(
                this.topCenterS.mesh,
                this.topCenterT.mesh,
                this.topLF2RB.mesh,
                this.topRF2LB.mesh,
                this.bottomCenterS.mesh,
                this.bottomCenterT.mesh,
                this.bottomLF2RB.mesh,
                this.bottomRF2LB.mesh
            );

        }

        this.face1 = createWallFunction(pSpecs1, `${name}_face1`, [0, 0, 0], 0, receiveShadow, castShadow, showArrow);
        this.face1.line?.material.color.setHex(green);

        this.walls = [this.face1, this.face2, this.face3, this.face4, this.face5, this.face6, this.face7, this.face8];

        this.walls.forEach(w => this.group.add(w.mesh));

        this.update();

        this.group.add(
            this.top.mesh,
            this.bottom.mesh
        );

        this.setPickLayers();

    }

    async init() {

        await Promise.all([
            this.top.init(),
            this.bottom.init()
        ].concat(this.initSideWalls()));

    }

    initSideWalls() {

        const promises = [];

        this.walls.forEach(w => promises.push(w.init()));

        return promises;

    }

    setOBBPlaneVisible(visible) {

        this.topOBBs.forEach(t => t.visible = visible);
        this.bottomOBBs.forEach(b => b.visible = visible);

    }

    makePlaneConfig(specs, idx) {

        const { height } = specs;
        const { baseSize = height, mapRatio, lines = true } = this.specs;
        const { separatedFace = false } = this.specs;
        const { scale = [1, 1] } = this.specs;

        if (!separatedFace) {

            specs.offsetX = idx / 8;

        }

        specs.lines = lines;
        specs.mapRatio = mapRatio;
        specs.baseSize = baseSize;
        specs.transparent = true;
        specs.texScale = scale;

        return specs;

    }

    makeTBPlaneConfig(specs, top = true) {
        
        const { baseSize = this.radius * 2, mapRatio, lines = true, scale = [1, 1] } = this.specs;

        specs.lines = lines;
        specs.mapRatio = mapRatio;
        specs.baseSize = baseSize;
        specs.transparent = true;
        specs.texScale = [scale[0]];

        if (top)
            specs.rotationT = .125 * Math.PI;
        else
            specs.rotationT = - .125 * Math.PI;

        return specs;

    }

    get scaleR() {

        return this._scale[0];

    }

    set scaleR(r) {

        this._scale[0] = this._scale[2] = r;

        this.update();

    }

    get scale() {

        return [this._scale[0], this._scale[1]];

    }

    set scale(val = [1, 1]) {

        this._scale = [val[0], val[1], val[0]];

        this.update();

    }

    update(needToUpdateOBBnRay = true, needToUpdateTexture = true) {

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const offset = Math.sqrt(width * width / 2);

        this.radius = width * .5 / Math.cos(.375 * Math.PI);

        const faceScale = [...this.scale, 1];
        this.face1.setScale(faceScale)
            .setPosition([0, 0, width / 2 + offset]);
        this.face2.setScale(faceScale)
            .setPosition([width / 2 + offset / 2, 0, width / 2 + offset / 2]);
        this.face3.setScale(faceScale)
            .setPosition([width / 2 + offset, 0, 0]);
        this.face4.setScale(faceScale)
            .setPosition([width / 2 + offset / 2, 0, - width / 2 - offset / 2]);
        this.face5.setScale(faceScale)
            .setPosition([0, 0, - width / 2 - offset]);
        this.face6.setScale(faceScale)
            .setPosition([- width / 2 - offset / 2, 0, - width / 2 - offset / 2]);
        this.face7.setScale(faceScale)
            .setPosition([- width / 2 - offset, 0, 0]);
        this.face8.setScale(faceScale)
            .setPosition([- width / 2 - offset / 2, 0, width / 2 + offset / 2]);

        const tbScale = [this.scale[0], this.scale[0], 1]
        this.top.setScale(tbScale)
            .setPosition([0, height * .5, 0]);
        this.bottom.setScale(tbScale)
            .setPosition([0, - height * .5, 0]);

        if (this.enableOBBs) {

            this.topCenterS.setScale(tbScale)
                .setPosition([0, height * .5, 0]);
            this.topCenterT.setScale(tbScale)
                .setPosition([0, height * .5, 0]);
            this.topLF2RB.setScale(tbScale)
                .setPosition([0, height * .5, 0]);
            this.topRF2LB.setScale(tbScale)
                .setPosition([0, height * .5, 0]);

            this.bottomCenterS.setScale(tbScale)
                .setPosition([0, - height * .5, 0]);
            this.bottomCenterT.setScale(tbScale)
                .setPosition([0, - height * .5, 0]);
            this.bottomLF2RB.setScale(tbScale)
                .setPosition([0, - height * .5, 0]);
            this.bottomRF2LB.setScale(tbScale)
                .setPosition([0, - height * .5, 0]);

        }

        if (needToUpdateTexture) {

            this.face1.setConfig({ texScale: this.scale }).updateTextures();
            this.face2.setConfig({ texScale: this.scale }).updateTextures();
            this.face3.setConfig({ texScale: this.scale }).updateTextures();
            this.face4.setConfig({ texScale: this.scale }).updateTextures();
            this.face5.setConfig({ texScale: this.scale }).updateTextures();
            this.face6.setConfig({ texScale: this.scale }).updateTextures();
            this.face7.setConfig({ texScale: this.scale }).updateTextures();
            this.face8.setConfig({ texScale: this.scale }).updateTextures();

            this.top.setConfig({ texScale: [this.scale[0]] }).updateTextures();
            this.bottom.setConfig({ texScale: [this.scale[0]] }).updateTextures();

        }

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { CylinderPillar };