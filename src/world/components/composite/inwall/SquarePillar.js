import { createCollisionPlane, createCollisionOBBPlane, createCollisionPlaneFree, createOBBPlane } from '../../physics/collisionHelper';
import { InWallObjectBase } from './InWallObjectBase';
import { yankeesBlue, green } from '../../basic/colorBase';

class SquarePillar extends InWallObjectBase {
    
    frontFace;
    backFace;
    leftFace;
    rightFace;
    topFace;
    bottomFace;

    constructor(specs) {

        super(specs);

        const { name, width, depth, height} = specs;
        const { showArrow = false } = specs;
        const { frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;
        const { frontNormal, backNormal, leftNormal, rightNormal, topNormal, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;

        const frontSpecs = this.makePlaneConfig({ width, height, map: frontMap, normalMap: frontNormal })
        const backSpecs = this.makePlaneConfig({ width, height, map: backMap, normalMap: backNormal });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, map: leftMap, normalMap: leftNormal });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, map: rightMap, normalMap: rightNormal });

        const topSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: topMap, normalMap: topNormal });
        const bottomSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: bottomMap, normalMap: bottomNormal });

        const createWallFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.backFace = createWallFunction(backSpecs, `${name}_back`, [0, 0, - depth / 2], Math.PI, receiveShadow, castShadow, showArrow);
        this.rightFace = createWallFunction(rightSpecs, `${name}_right`, [- width / 2, 0, 0], - Math.PI / 2, receiveShadow, castShadow, showArrow);
        this.leftFace = createWallFunction(leftSpecs, `${name}_left`, [width / 2, 0, 0], Math.PI / 2, receiveShadow, castShadow, showArrow);

        if (!this.enableOBBs) {

            this.topFace = createCollisionPlaneFree(topSpecs, `${name}_top`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow, false, showArrow);
            this.bottomFace = createCollisionPlaneFree(bottomSpecs, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow, false, showArrow);

            this.tops = [this.topFace];
            this.bottoms = [this.bottomFace];

        } else {

            this.topFace = createOBBPlane(topSpecs, `${name}_topOBB`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], receiveShadow, castShadow);
            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], receiveShadow, castShadow);

            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];

        }

        // create last for changing line color
        this.frontFace = createWallFunction(frontSpecs, `${name}_front`, [0, 0, depth / 2], 0, receiveShadow, castShadow, showArrow);
        this.frontFace.line?.material.color.setHex(green);

        this.setInvisibleFaces();

        this.walls = [this.frontFace, this.backFace, this.leftFace, this.rightFace];
        
        this.group.add(
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

        await Promise.all([
            this.frontFace.init(),
            this.backFace.init(),
            this.leftFace.init(),
            this.rightFace.init(),
            this.topFace.init(),
            this.bottomFace.init()
        ]);

    }

    setInvisibleFaces() {

        const { invisibles = [] } = this.specs;

        invisibles.forEach(i => {

            switch(i) {
                case 0:
                    this.frontFace.visible = false;
                    this.frontFace.receiveShadow(false)
                        .castShadow(false);
                    break;
                case 1:
                    this.backFace.visible = false;
                    this.backFace.receiveShadow(false)
                        .castShadow(false);
                    break;
                case 2:
                    this.leftFace.visible = false;
                    this.leftFace.receiveShadow(false)
                        .castShadow(false);
                    break;
                case 3:
                    this.rightFace.visible = false;
                    this.rightFace.receiveShadow(false)
                        .castShadow(false);
                    break;
                case 4:
                    this.topFace.visible = false;
                    this.topFace.receiveShadow(false)
                        .castShadow(false);
                    break;
                case 5:
                    this.bottomFace.visible = false;
                    this.bottomFace.receiveShadow(false)
                        .castShadow(false);
                    break;
            }

        });

    }

}

export { SquarePillar };