import { Group, MeshPhongMaterial, TextureLoader, SRGBColorSpace } from 'three';
import { createCollisionPlane } from '../../physics/collisionHelper';

class Room {
    name = '';
    frontWall;
    backWall;
    leftWall;
    rightWall;
    walls = [];
    insideWalls = [];
    insideGroups = [];
    showArrow = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, height } = specs;
        const hSpecs = { width, height };
        const vSpecs = { width: depth, height };

        this.name = name;
        this.group = new Group();

        this.frontWall = createCollisionPlane(hSpecs, `${name}_front`, [0, 0, depth / 2], Math.PI, true, true, false, false);
        this.backWall = createCollisionPlane(hSpecs, `${name}_back`, [0, 0, - depth / 2], 0, true, true, false, false);
        this.leftWall = createCollisionPlane(vSpecs, `${name}_left`, [- width / 2, 0, 0], Math.PI / 2, true, true, false, false);
        this.rightWall = createCollisionPlane(vSpecs, `${name}_right`, [width / 2, 0, 0], - Math.PI / 2, true, true, false, false);
        
        this.frontWall.line.material.color.setHex(0x00ff00);

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
        const insideGroupsInit = this.initInsideGroups();
        const { frontMap, backMap, leftMap, rightMap } = this.specs;
        const [frontT, backT, leftT, rightT] = await Promise.all([
            frontMap ? new TextureLoader().loadAsync(frontMap) : new Promise(resolve => resolve(null)),
            backMap ? new TextureLoader().loadAsync(backMap) : new Promise(resolve => resolve(null)),
            leftMap ? new TextureLoader().loadAsync(leftMap) : new Promise(resolve => resolve(null)),
            rightMap ? new TextureLoader().loadAsync(rightMap) : new Promise(resolve => resolve(null)),
        ]
            .concat(insideWallsInit)
            .concat(insideGroupsInit)
    );

        if (frontT) {
            frontT.colorSpace = SRGBColorSpace;
            this.frontWall.mesh.material = new MeshPhongMaterial({ map: frontT });
        }

        if (backT) {
            backT.colorSpace = SRGBColorSpace;
            this.backWall.mesh.material = new MeshPhongMaterial({ map: backT });
        }

        if (leftT) {
            leftT.colorSpace = SRGBColorSpace;
            this.leftWall.mesh.material = new MeshPhongMaterial({ map: leftT });
        }

        if (rightT) {
            rightT.colorSpace = SRGBColorSpace;
            this.rightWall.mesh.material = new MeshPhongMaterial({ map: rightT });
        }
    }

    initInsideWalls() {
        const promises = [];
        this.insideWalls.forEach(w => promises.push(w.init()));
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

    addGroup(group) {
        this.group.add(group.group);
        this.insideGroups.push(group);
        this.walls = this.walls.concat(group.walls);
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

    updateWallsBBandRay() {
        this.group.updateMatrixWorld();
        this.walls.forEach(w => w.updateBoundingBoxHelper(false));
    }
}

export { Room };