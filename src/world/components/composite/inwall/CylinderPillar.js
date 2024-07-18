import { Group } from 'three';
import { createCollisionPlane, createCollisionOctagonFree, createOBBPlane } from '../../physics/collisionHelper';
import { green, yankeesBlue } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

class CylinderPillar {
    name = '';
    // named faces clockwise
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

    walls = [];
    tops = [];
    bottoms = [];
    topOBBs = [];
    bottomOBBs = [];

    radius;
    showArrow = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, height, showArrow, enableOBBs } = specs;
        const { map, topMap, bottomMap } = this.specs;
        const offset = Math.sqrt(width * width / 2);

        this.name = name;
        this.radius = width * .5 / Math.cos(.375 * Math.PI);
        this.showArrow = showArrow;
        this.group = new Group();

        const pSpecs = this.makePlaneConfig({ width, height, map });
        const topSpecs = this.makeTBPlaneConfig({ radius: this.radius, color: yankeesBlue, map: topMap });
        const bottomSpecs = this.makeTBPlaneConfig({ radius: this.radius, color: yankeesBlue, map: bottomMap }, false);

        this.face2 = createCollisionPlane(pSpecs, `${name}_face2`, [- width / 2 - offset / 2, 0, width / 2 + offset / 2], - Math.PI / 4, true, true, this.showArrow, false);
        this.face3 = createCollisionPlane(pSpecs, `${name}_face3`, [- width / 2 - offset, 0, 0], - Math.PI / 2, true, true, this.showArrow, false);
        this.face4 = createCollisionPlane(pSpecs, `${name}_face4`, [- width / 2 - offset / 2, 0, - width / 2 - offset / 2], - 3 * Math.PI / 4, true, true, this.showArrow, false);
        this.face5 = createCollisionPlane(pSpecs, `${name}_face5`, [0, 0, - width / 2 - offset], Math.PI, true, true, this.showArrow, false);
        this.face6 = createCollisionPlane(pSpecs, `${name}_face6`, [width / 2 + offset / 2, 0, - width / 2 - offset / 2], 3 * Math.PI / 4, true, true, this.showArrow, false);
        this.face7 = createCollisionPlane(pSpecs, `${name}_face7`, [width / 2 + offset, 0, 0], Math.PI / 2, true, true, this.showArrow, false);
        this.face8 = createCollisionPlane(pSpecs, `${name}_face8`, [width / 2 + offset / 2, 0, width / 2 + offset / 2],  Math.PI / 4, true, true, this.showArrow, false);

        this.top = createCollisionOctagonFree(topSpecs, `${name}_top`, [0, height * .5, 0], [- Math.PI * .5, 0, - Math.PI * .125], true, false, false);
        this.bottom = createCollisionOctagonFree(bottomSpecs, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, Math.PI * .125], true, false, false);
        this.tops = [this.top];
        this.bottoms = [this.bottom];

        if (enableOBBs) {
            const halfWidth = this.radius * Math.sin(.375 * Math.PI);
            const tbOBBSpecs = { width: halfWidth * 2, height: width, color: yankeesBlue };

            this.topCenterS = createOBBPlane(tbOBBSpecs, `${name}_topS_OBB`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], false, false, false);
            this.topCenterT = createOBBPlane(tbOBBSpecs, `${name}_topT_OBB`, [0, height * .5, 0], [- Math.PI * .5, 0, Math.PI * .5], false, false, false);
            this.topLF2RB = createOBBPlane(tbOBBSpecs, `${name}_topLF2RB_OBB`, [0, height * .5, 0], [- Math.PI * .5, 0, Math.PI * .25], false, false, false);
            this.topRF2LB = createOBBPlane(tbOBBSpecs, `${name}_topRF2LB_OBB`, [0, height * .5, 0], [- Math.PI * .5, 0, - Math.PI * .25], false, false, false);

            this.topOBBs = [this.topCenterS, this.topCenterT, this.topLF2RB, this.topRF2LB];

            this.bottomCenterS = createOBBPlane(tbOBBSpecs, `${name}_bottomS_OBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], false, false, false);
            this.bottomCenterT = createOBBPlane(tbOBBSpecs, `${name}_bottomT_OBB`, [0, - height * .5, 0], [Math.PI * .5, 0, Math.PI * .5], false, false, false);
            this.bottomLF2RB = createOBBPlane(tbOBBSpecs, `${name}_bottomLF2RB_OBB`, [0, - height * .5, 0], [Math.PI * .5, 0, Math.PI * .25], false, false, false);
            this.bottomRF2LB = createOBBPlane(tbOBBSpecs, `${name}_bottomRF2LB_OBB`, [0, - height * .5, 0], [Math.PI * .5, 0, - Math.PI * .25], false, false, false);

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
            )
        }

        this.face1 = createCollisionPlane(pSpecs, `${name}_face1`, [0, 0, width / 2 + offset], 0, true, true, this.showArrow, false);
        this.face1.line.material.color.setHex(green);

        this.walls = [this.face1, this.face2, this.face3, this.face4, this.face5, this.face6, this.face7, this.face8];

        this.walls.forEach(w => this.group.add(w.mesh));
        this.group.add(
            this.top.mesh,
            this.bottom.mesh
        );
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
        this.topOBBs.forEach(t => t.mesh.visible = visible);
        this.bottomOBBs.forEach(b => b.mesh.visible = visible);
    }

    makeTBPlaneConfig(specs, top = true) {
        const { roomHeight = 1, mapRatio } = this.specs;

        if (top)
            specs.rotationT = .125 * Math.PI;
        else
            specs.rotationT = - .125 * Math.PI;

        if (mapRatio) {
            specs.repeatU = this.radius * 2 / (mapRatio * roomHeight);
            specs.repeatV = this.radius * 2 / roomHeight;
        }

        specs.repeatModeU = REPEAT;
        specs.repeatModeV = REPEAT;

        return specs;
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

export { CylinderPillar };