import { Group } from 'three';
import { createCollisionPlane } from '../../physics/collisionHelper';
import { green } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

class Room {
    name = '';
    frontWall;
    backWall;
    leftWall;
    rightWall;
    walls = [];
    floors = [];
    tops = [];
    bottoms = [];
    topOBBs = [];
    bottomOBBs = [];
    boxOBBs = [];
    obstacles = [];
    insideWalls = [];
    insideGroups = [];
    showArrow = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, height, showArrow } = specs;
        const { frontMap, backMap, leftMap, rightMap } = this.specs;

        const frontSpecs = this.makePlaneConfig({ width, height, map: frontMap });
        const backSpecs = this.makePlaneConfig({ width, height, map: backMap });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, map: leftMap });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, map: rightMap });

        this.name = name;
        this.showArrow = showArrow;
        this.group = new Group();

        this.backWall = createCollisionPlane(backSpecs, `${name}_back`, [0, 0, - depth / 2], 0, true, true, this.showArrow, false);
        this.leftWall = createCollisionPlane(leftSpecs, `${name}_left`, [- width / 2, 0, 0], Math.PI / 2, true, true, this.showArrow, false);
        this.rightWall = createCollisionPlane(rightSpecs, `${name}_right`, [width / 2, 0, 0], - Math.PI / 2, true, true, this.showArrow, false);
        
        this.frontWall = createCollisionPlane(frontSpecs, `${name}_front`, [0, 0, depth / 2], Math.PI, true, true, this.showArrow, false);
        this.frontWall.line.material.color.setHex(green);

        this.walls = [this.frontWall, this.backWall, this.leftWall, this.rightWall];

        this.group.add(
            this.frontWall.mesh,
            this.backWall.mesh,
            this.leftWall.mesh,
            this.rightWall.mesh
        );
    }

    async init() {
        const insideWallsInit = this.initInsideWalls();
        const floorsInit = this.initFloors();
        const insideGroupsInit = this.initInsideGroups();
        
        await Promise.all([
            this.frontWall.init(),
            this.backWall.init(),
            this.leftWall.init(),
            this.rightWall.init()
        ]
            .concat(insideWallsInit)
            .concat(floorsInit)
            .concat(insideGroupsInit)
        );
    }

    initInsideWalls() {
        const promises = [];
        this.insideWalls.forEach(w => promises.push(w.init()));
        return promises;
    }

    initFloors() {
        const promises = [];
        this.floors.forEach(f => promises.push(f.init()));
        return promises;
    }

    initInsideGroups() {
        const promises = [];
        this.insideGroups.forEach(g => promises.push(g.init()));
        return promises;
    }

    addWalls(walls) {
        walls.forEach(w => {
            this.group.add(w.mesh);
            this.walls.push(w);
            this.insideWalls.push(w);
        });
    }

    addFloors(floors) {
        floors.forEach(f => {
            this.group.add(f.mesh);
            this.floors.push(f);
        });
    }

    addGroups(groups) {
        groups.forEach(g => {
            this.group.add(g.group);
            this.insideGroups.push(g);
            this.walls = this.walls.concat(g.walls);
            if (g.tops) this.tops = this.tops.concat(g.tops);
            if (g.bottoms) this.bottoms = this.bottoms.concat(g.bottoms);
            if (g.topOBBs) this.topOBBs = this.topOBBs.concat(g.topOBBs);
            if (g.bottomOBBs) this.bottomOBBs = this.bottomOBBs.concat(g.bottomOBBs);
            if (g.box) this.boxOBBs.push(g.box);
        });
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

    updateCPlaneBBandRay() {
        this.group.updateMatrixWorld();
        this.walls.forEach(w => w.updateBoundingBoxHelper(false));
        this.floors.forEach(f => f.updateOBB(false));
        this.tops.forEach(t => t.updateBoundingBoxHelper(false));
        this.bottoms.forEach(b => b.updateBoundingBoxHelper(false));
        this.topOBBs.forEach(t => t.updateOBB(false));
        this.bottomOBBs.forEach(b => b.updateOBB(false));
        this.boxOBBs.forEach(box => box.updateOBB(false));
    }
}

export { Room };