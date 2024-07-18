import { Group } from 'three';
import { createCollisionPlane, createCollisionPlaneFree, createOBBPlane } from '../../physics/collisionHelper';
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
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, height, showArrow = false, enableOBBs = false } = specs;
        const { frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;

        const frontSpecs = this.makePlaneConfig({ width, height, map: frontMap })
        const backSpecs = this.makePlaneConfig({ width, height, map: backMap });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, map: leftMap });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, map: rightMap });

        const topSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: topMap});
        const bottomSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: bottomMap });

        this.name = name;
        this.group = new Group();

        this.backFace = createCollisionPlane(backSpecs, `${name}_back`, [0, 0, - depth / 2], Math.PI, true, true, showArrow, false);
        this.leftFace = createCollisionPlane(leftSpecs, `${name}_left`, [- width / 2, 0, 0], - Math.PI / 2, true, true, showArrow, false);
        this.rightFace = createCollisionPlane(rightSpecs, `${name}_right`, [width / 2, 0, 0], Math.PI / 2, true, true, showArrow, false);
        if (!enableOBBs) {
            this.topFace = createCollisionPlaneFree(topSpecs, `${name}_top`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], true, false, false, showArrow, false);
            this.bottomFace = createCollisionPlaneFree(bottomSpecs, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false, showArrow, false);
            this.tops = [this.topFace];
            this.bottoms = [this.bottomFace];
        } else {
            this.topFace = createOBBPlane(topSpecs, `${name}_topOBB`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], true, false, false);
            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false);
            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];
        }
        // create last for changing line color
        this.frontFace = createCollisionPlane(frontSpecs, `${name}_front`, [0, 0, depth / 2], 0, true, true, showArrow, false);
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
        const { roomHeight = 1, mapRatio } = this.specs;

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