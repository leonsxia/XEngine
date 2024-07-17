import { Group, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { createCollisionPlane, createCollisionPlaneFree, createOBBPlane } from '../../physics/collisionHelper';
import { yankeesBlue, green } from '../../basic/colorBase';

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
    showArrow = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, height, showArrow, enableOBBs } = specs;
        const hSpecs = { width, height };
        const vSpecs = { width: depth, height };
        const tbSpecs = { width, height: depth, color: yankeesBlue };

        this.name = name;
        this.showArrow = showArrow;
        this.group = new Group();

        this.backFace = createCollisionPlane(hSpecs, `${name}_back`, [0, 0, - depth / 2], Math.PI, true, true, this.showArrow, false);
        this.leftFace = createCollisionPlane(vSpecs, `${name}_left`, [- width / 2, 0, 0], - Math.PI / 2, true, true, this.showArrow, false);
        this.rightFace = createCollisionPlane(vSpecs, `${name}_right`, [width / 2, 0, 0], Math.PI / 2, true, true, this.showArrow, false);
        if (!enableOBBs) {
            this.topFace = createCollisionPlaneFree(tbSpecs, `${name}_top`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], true, false, false, this.showArrow, false);
            this.bottomFace = createCollisionPlaneFree(tbSpecs, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false, this.showArrow, false);
            this.tops = [this.topFace];
            this.bottoms = [this.bottomFace];
        } else {
            this.topFace = createOBBPlane(tbSpecs, `${name}_topOBB`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], true, false, false);
            this.bottomFace = createOBBPlane(tbSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false);
            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];
        }
        // create last for changing line color
        this.frontFace = createCollisionPlane(hSpecs, `${name}_front`, [0, 0, depth / 2], 0, true, true, this.showArrow, false);
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
        const { frontMap, backMap, leftMap, rightMap, topMap, bottomMap, mapRatio } = this.specs;
        const [frontT, backT, leftT, rightT, topT, bottomT] = await Promise.all([
            frontMap ? new TextureLoader().loadAsync(frontMap) : new Promise(resolve => resolve(null)),
            backMap ? new TextureLoader().loadAsync(backMap) : new Promise(resolve => resolve(null)),
            leftMap ? new TextureLoader().loadAsync(leftMap) : new Promise(resolve => resolve(null)),
            rightMap ? new TextureLoader().loadAsync(rightMap) : new Promise(resolve => resolve(null)),
            topMap ? new TextureLoader().loadAsync(topMap) : new Promise(resolve => resolve(null)),
            bottomMap ? new TextureLoader().loadAsync(bottomMap) : new Promise(resolve => resolve(null))
        ]);

        if (frontT) {
            frontT.colorSpace = SRGBColorSpace;
            this.frontFace.mesh.material = new MeshPhongMaterial({ map: frontT });
            this.setTextureWrap(mapRatio, frontT, true);
        }

        if (backT) {
            backT.colorSpace = SRGBColorSpace;
            this.backFace.mesh.material = new MeshPhongMaterial({ map: backT });
            this.setTextureWrap(mapRatio, backT, true);
        }

        if (leftT) {
            leftT.colorSpace = SRGBColorSpace;
            this.leftFace.mesh.material = new MeshPhongMaterial({ map: leftT });
            this.setTextureWrap(mapRatio, leftT, false);
        }

        if (rightT) {
            rightT.colorSpace = SRGBColorSpace;
            this.rightFace.mesh.material = new MeshPhongMaterial({ map: rightT });
            this.setTextureWrap(mapRatio, rightT, false);
        }

        if (topT) {
            topT.colorSpace = SRGBColorSpace;
            this.topFace.mesh.material = new MeshPhongMaterial({ map: topT });
            this.setTextureWrap(mapRatio, topT, true, true);
        }

        if (bottomT) {
            bottomT.colorSpace = SRGBColorSpace;
            this.bottomFace.mesh.material = new MeshPhongMaterial({ map: bottomT });
            this.setTextureWrap(mapRatio, bottomT, true, true);
        }
    }

    setTextureWrap(mapRatio, texture, s, tb) {
        if (mapRatio) {
            const { width, height, depth, roomHeight } = this.specs;
            const w = s ? width : depth;
            const h = tb ? s ? depth : width : height;
            const xRepeat = w / (mapRatio * roomHeight);
            const yRepeat = h / roomHeight;

            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.repeat.set(xRepeat, yRepeat);
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
}

export { SquarePillar };