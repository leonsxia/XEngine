import { Group } from 'three';
import { createCollisionPlane, createCollisionOBBPlane, createCollisionPlaneFree, createOBBPlane } from '../../physics/collisionHelper';
import { yankeesBlue, green } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

class SquarePillar {
    name = '';
    frontFace;
    backFace;
    leftFace;
    rightFace;
    topFace;
    bottomFace;
    walls = [];
    tops = [];
    bottoms = [];
    topOBBs = [];
    bottomOBBs = [];

    enableWallOBBs = false;
    climbable = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, height} = specs;
        const {showArrow = false, enableOBBs = false, enableWallOBBs = false, climbable = false } = specs;
        const { frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;

        const frontSpecs = this.makePlaneConfig({ width, height, map: frontMap })
        const backSpecs = this.makePlaneConfig({ width, height, map: backMap });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, map: leftMap });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, map: rightMap });

        const topSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: topMap});
        const bottomSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: bottomMap });

        this.name = name;
        this.enableWallOBBs = enableWallOBBs;
        this.climbable = climbable;
        this.group = new Group();

        const createWallFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.backFace = createWallFunction(backSpecs, `${name}_back`, [0, 0, - depth / 2], Math.PI, true, true, showArrow);
        this.leftFace = createWallFunction(leftSpecs, `${name}_left`, [- width / 2, 0, 0], - Math.PI / 2, true, true, showArrow);
        this.rightFace = createWallFunction(rightSpecs, `${name}_right`, [width / 2, 0, 0], Math.PI / 2, true, true, showArrow);
        if (!enableOBBs) {
            this.topFace = createCollisionPlaneFree(topSpecs, `${name}_top`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], true, false, false, showArrow);
            this.bottomFace = createCollisionPlaneFree(bottomSpecs, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false, showArrow);
            this.tops = [this.topFace];
            this.bottoms = [this.bottomFace];
        } else {
            this.topFace = createOBBPlane(topSpecs, `${name}_topOBB`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], true, false);
            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false);
            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];
        }
        // create last for changing line color
        this.frontFace = createWallFunction(frontSpecs, `${name}_front`, [0, 0, depth / 2], 0, true, true, showArrow);
        this.frontFace.line.material.color.setHex(green);

        this.walls = [this.frontFace, this.backFace, this.leftFace, this.rightFace];
        
        this.group.add(
            this.frontFace.mesh,
            this.backFace.mesh,
            this.leftFace.mesh,
            this.rightFace.mesh,
            this.topFace.mesh,
            this.bottomFace.mesh
        );
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

    makePlaneConfig(specs) {
        const { width, height } = specs;
        const { roomHeight = 1, mapRatio, noRepeat = false } = this.specs;

        if (noRepeat) return specs;

        if (mapRatio) {
            specs.repeatU = width / (mapRatio * roomHeight);
            specs.repeatV = height / roomHeight;
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
}

export { SquarePillar };