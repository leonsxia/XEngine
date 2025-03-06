import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane, createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { yankeesBlue, green, basic } from '../../basic/colorBase';

class BoxCube extends ObstacleBase {

    _width = 1;
    _height = 1;
    _depth = 1;

    frontFace;
    backFace;
    leftFace;
    rightFace;
    topFace;
    bottomFace;

    constructor(specs) {

        super(specs);

        this.specs = specs;
        const { name, lines = true } = specs;
        const { showArrow = false, freeTexture = false } = specs;
        const { map, frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;
        const { normalMap, frontNormal, backNormal, leftNormal, rightNormal, topNormal, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { scale = [1, 1, 1] } = specs;
        const { transparent = true } = specs;

        this._scale = new Array(...scale);

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, color: yankeesBlue, map, normalMap, lines, transparent };

        const frontSpecs = this.makePlaneConfig({ width: this._width, height: this._height, color: basic, map: frontMap, normalMap: frontNormal })
        const backSpecs = this.makePlaneConfig({ width: this._width, height: this._height, color: basic, map: backMap, normalMap: backNormal });

        const leftSpecs = this.makePlaneConfig({ width: this._depth, height: this._height, color: basic, map: leftMap, normalMap: leftNormal });
        const rightSpecs = this.makePlaneConfig({ width: this._depth, height: this._height, color: basic, map: rightMap, normalMap: rightNormal });

        const topSpecs = this.makePlaneConfig({ width: this._width, height: this._depth, color: yankeesBlue, map: topMap, normalMap: topNormal });
        const bottomSpecs = this.makePlaneConfig({ width: this._width, height: this._depth, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);

        const createPlaneFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.backFace = createPlaneFunction(backSpecs, `${name}_back`, [0, 0, 0], Math.PI, receiveShadow, castShadow, showArrow);
        this.rightFace = createPlaneFunction(rightSpecs, `${name}_right`, [0, 0, 0], - Math.PI * .5, receiveShadow, castShadow, showArrow);
        this.leftFace = createPlaneFunction(leftSpecs, `${name}_left`, [0, 0, 0], Math.PI * .5, receiveShadow, castShadow, showArrow);

        {
            this.topFace = createOBBPlane(topSpecs, `${name}_topOBB`, [0, 0, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow);
            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, 0, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow);
            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];
        }

        // create last for changing line color
        this.frontFace = createPlaneFunction(frontSpecs, `${name}_front`, [0, 0, 0], 0, receiveShadow, castShadow, showArrow);
        this.frontFace.line?.material.color.setHex(green);

        this.walls = [this.frontFace, this.backFace, this.leftFace, this.rightFace];

        // freeTexture is true to enable 6 different texture maps for each face,
        // the initial box will be hidden
        if (!freeTexture) {

            this.setPlaneVisible(false);

        } else {

            this.box.visible = false;

        }
        // this.setPlaneVisible(false); // for debug only
        // this.box.visible = false; // for debug only

        this.setTriggers();
        this.createBoundingFaces();
        this.createRay();
        this.showArrows(false);

        this.update(false, true);

        this.group.add(
            this.box.mesh,
            this.frontFace.mesh,
            this.backFace.mesh,
            this.leftFace.mesh,
            this.rightFace.mesh,
            this.topFace.mesh,
            this.bottomFace.mesh
        );

        this.setPickLayers();

    }

    async init() {

        const { freeTexture } = this.specs;
        let initPromises = [];

        if (freeTexture) initPromises = this.initFaces();
        else initPromises.push(this.box.init());

        await Promise.all(initPromises);

    }

    initFaces() {

        const promises = [];

        this.walls.forEach(w => promises.push(w.init()));

        promises.push(this.topFace.init());

        promises.push(this.bottomFace.init());

        return promises;

    }

    update(needToUpdateOBBnRay = true, needToUpdateFaceTrigger = true) {

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];

        this.frontFace.setScale([this.scale[0], this.scale[1], 1])
            .setPosition([0, 0, depth * .5]);

        this.backFace.setScale([this.scale[0], this.scale[1], 1])
            .setPosition([0, 0, - depth * .5]);

        this.leftFace.setScale([this.scale[2], this.scale[1], 1])
            .setPosition([width * .5, 0, 0]);

        this.rightFace.setScale([this.scale[2], this.scale[1], 1])
            .setPosition([- width * .5, 0, 0]);

        this.topFace.setScale([this.scale[0], this.scale[2], 1])
            .setPosition([0, height * .5, 0]);

        this.bottomFace.setScale([this.scale[0], this.scale[2], 1])
            .setPosition([0, - height * .5, 0]);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateFaceTrigger) {

            this.updateBoundFaces();
            this.updateTriggers();

        }

        if (needToUpdateOBBnRay) {
            
            this.updateOBBs();
            this.updateRay();

        }

    }

}

export { BoxCube };