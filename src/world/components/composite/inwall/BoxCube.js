import { Group } from 'three';
import { createCollisionPlane, createOBBPlane, createOBBBox } from '../../physics/collisionHelper';
import { yankeesBlue, green, basic } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

class BoxCube {
    name = '';
    box;
    frontFace;
    backFace;
    leftFace;
    rightFace;
    topFace;
    bottomFace;
    walls = [];
    topOBBs = [];
    bottomOBBs = [];
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, height, showArrow = false, freeTexture = false } = specs;
        const { map, frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;

        const boxSpecs = { size: { width, depth, height }, color: yankeesBlue, map };

        const frontSpecs = this.makePlaneConfig({ width, height, color: basic, map: frontMap })
        const backSpecs = this.makePlaneConfig({ width, height, color: basic, map: backMap });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, color: basic, map: leftMap });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, color: basic, map: rightMap });

        const topSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: topMap});
        const bottomSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: bottomMap });

        this.name = name;
        this.showArrow = showArrow;
        this.group = new Group();

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], !freeTexture ? true : false, !freeTexture ? true : false, false);

        this.backFace = createCollisionPlane(backSpecs, `${name}_back`, [0, 0, - depth * .5], Math.PI, true, true, showArrow, false);
        this.leftFace = createCollisionPlane(leftSpecs, `${name}_left`, [- width * .5, 0, 0], - Math.PI * .5, true, true, showArrow, false);
        this.rightFace = createCollisionPlane(rightSpecs, `${name}_right`, [width * .5, 0, 0], Math.PI * .5, true, true, showArrow, false);
        {
            this.topFace = createOBBPlane(topSpecs, `${name}_topOBB`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], true, true, false);
            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, true, false);
            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];
        }
        // create last for changing line color
        this.frontFace = createCollisionPlane(frontSpecs, `${name}_front`, [0, 0, depth * .5], 0, true, true, showArrow, false);
        this.frontFace.line.material.color.setHex(green);

        this.walls = [this.frontFace, this.backFace, this.leftFace, this.rightFace];

        if (!freeTexture) {
            this.setFaceVisible(false);
        } else {
            this.box.mesh.visible = false;
        }

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

    setFaceVisible(show) {
        this.walls.forEach(w => w.mesh.visible = show);
        this.topFace.mesh.visible = show;
        this.bottomFace.mesh.visible = show;
    }


    makePlaneConfig(specs) {
        const { width, height } = specs;
        const { baseSize = height, mapRatio } = this.specs;

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
}

export { BoxCube };