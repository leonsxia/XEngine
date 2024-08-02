import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane, createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { yankeesBlue, green, basic } from '../../basic/colorBase';

class BoxCube extends ObstacleBase  {

    frontFace;
    backFace;
    leftFace;
    rightFace;
    topFace;
    bottomFace;

    constructor(specs) {

        super(specs);

        this.specs = specs;
        const { name, width, depth, height, lines = true } = specs;
        const { showArrow = false, freeTexture = false } = specs;
        const { map, frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;
        const { normalMap, frontNormal, backNormal, leftNormal, rightNormal, topNormal, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;

        const boxSpecs = { size: { width, depth, height }, color: yankeesBlue, map, normalMap, lines };

        const frontSpecs = this.makePlaneConfig({ width, height, color: basic, map: frontMap, normalMap: frontNormal })
        const backSpecs = this.makePlaneConfig({ width, height, color: basic, map: backMap, normalMap: backNormal });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, color: basic, map: leftMap, normalMap: leftNormal });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, color: basic, map: rightMap, normalMap: rightNormal });

        const topSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: topMap, normalMap: topNormal });
        const bottomSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);

        const createPlaneFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.backFace = createPlaneFunction(backSpecs, `${name}_back`, [0, 0, - depth * .5], Math.PI, receiveShadow, castShadow, showArrow);
        this.rightFace = createPlaneFunction(leftSpecs, `${name}_right`, [- width * .5, 0, 0], - Math.PI * .5, receiveShadow, castShadow, showArrow);
        this.leftFace = createPlaneFunction(rightSpecs, `${name}_left`, [width * .5, 0, 0], Math.PI * .5, receiveShadow, castShadow, showArrow);

        {
            this.topFace = createOBBPlane(topSpecs, `${name}_topOBB`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow);
            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow);
            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];
        }

        // create last for changing line color
        this.frontFace = createPlaneFunction(frontSpecs, `${name}_front`, [0, 0, depth * .5], 0, receiveShadow, castShadow, showArrow);
        this.frontFace.line?.material.color.setHex(green);

        this.walls = [this.frontFace, this.backFace, this.leftFace, this.rightFace];

        // freeTexture is true to enable 6 different texture maps for each face,
        // the initial box will be hidden
        if (!freeTexture) {

            this.setPlaneVisible(false);

        } else {

            this.box.mesh.visible = false;

        }

        this.setTriggers();

        this.group.add(
            this.box.mesh,
            this.frontFace.mesh,
            this.backFace.mesh,
            this.leftFace.mesh,
            this.rightFace.mesh,
            this.topFace.mesh,
            this.bottomFace.mesh
        );

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

}

export { BoxCube };