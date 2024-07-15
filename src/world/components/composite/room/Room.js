import { Group, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { createCollisionPlane } from '../../physics/collisionHelper';
import { green } from '../../basic/colorBase';

class Room {
    name = '';
    frontWall;
    backWall;
    leftWall;
    rightWall;
    walls = [];
    floors = [];
    obstacles = [];
    insideWalls = [];
    insideGroups = [];
    showArrow = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, height, showArrow } = specs;
        const hSpecs = { width, height };
        const vSpecs = { width: depth, height };

        this.name = name;
        this.showArrow = showArrow;
        this.group = new Group();

        this.frontWall = createCollisionPlane(hSpecs, `${name}_front`, [0, 0, depth / 2], Math.PI, true, true, this.showArrow, true);
        this.backWall = createCollisionPlane(hSpecs, `${name}_back`, [0, 0, - depth / 2], 0, true, true, this.showArrow, false);
        this.leftWall = createCollisionPlane(vSpecs, `${name}_left`, [- width / 2, 0, 0], Math.PI / 2, true, true, this.showArrow, false);
        this.rightWall = createCollisionPlane(vSpecs, `${name}_right`, [width / 2, 0, 0], - Math.PI / 2, true, true, this.showArrow, false);
        
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
        const { frontMap, backMap, leftMap, rightMap, mapRatio } = this.specs;
        const [frontT, backT, leftT, rightT] = await Promise.all([
            frontMap ? new TextureLoader().loadAsync(frontMap) : new Promise(resolve => resolve(null)),
            backMap ? new TextureLoader().loadAsync(backMap) : new Promise(resolve => resolve(null)),
            leftMap ? new TextureLoader().loadAsync(leftMap) : new Promise(resolve => resolve(null)),
            rightMap ? new TextureLoader().loadAsync(rightMap) : new Promise(resolve => resolve(null))
        ]
            .concat(insideWallsInit)
            .concat(floorsInit)
            .concat(insideGroupsInit)
    );

        if (frontT) {
            frontT.colorSpace = SRGBColorSpace;
            this.frontWall.mesh.material = new MeshPhongMaterial({ map: frontT });
            this.setTextureWrapS(mapRatio, frontT, true);
        }

        if (backT) {
            backT.colorSpace = SRGBColorSpace;
            this.backWall.mesh.material = new MeshPhongMaterial({ map: backT });
            this.setTextureWrapS(mapRatio, backT, true);
        }

        if (leftT) {
            leftT.colorSpace = SRGBColorSpace;
            this.leftWall.mesh.material = new MeshPhongMaterial({ map: leftT });
            this.setTextureWrapS(mapRatio, leftT, false);
        }

        if (rightT) {
            rightT.colorSpace = SRGBColorSpace;
            this.rightWall.mesh.material = new MeshPhongMaterial({ map: rightT });
            this.setTextureWrapS(mapRatio, rightT, false);
        }
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
        });
    }

    setTextureWrapS(mapRatio, texture, h) {
        if (mapRatio) {
            const { width, height, depth } = this.specs;
            const xRepeat =  h ? width / (mapRatio * height) : depth / (mapRatio * height);
            texture.wrapS = RepeatWrapping;
            texture.repeat.set(xRepeat, 1);
        }
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
        this.floors.forEach(f => f.updateBoundingBoxHelper(false));
    }
}

export { Room };