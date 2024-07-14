import { Group, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { createCollisionPlane } from '../../physics/collisionHelper';
import { green } from '../../basic/colorBase';

class SquarePillar {
    name = '';
    frontFace;
    backFace;
    leftFace;
    rightFace;
    walls = [];
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

        this.frontFace = createCollisionPlane(hSpecs, `${name}_front`, [0, 0, depth / 2], 0, true, true, this.showArrow, false);
        this.backFace = createCollisionPlane(hSpecs, `${name}_back`, [0, 0, - depth / 2], Math.PI, true, true, this.showArrow, false);
        this.leftFace = createCollisionPlane(vSpecs, `${name}_left`, [- width / 2, 0, 0], - Math.PI / 2, true, true, this.showArrow, false);
        this.rightFace = createCollisionPlane(vSpecs, `${name}_right`, [width / 2, 0, 0], Math.PI / 2, true, true, this.showArrow, false);
        
        this.frontFace.line.material.color.setHex(green);

        this.walls = [this.frontFace, this.backFace, this.leftFace, this.rightFace];

        this.group.add(
            this.frontFace.mesh,
            this.backFace.mesh,
            this.leftFace.mesh,
            this.rightFace.mesh
        );
    }

    async init() {
        const { frontMap, backMap, leftMap, rightMap, mapRatio } = this.specs;
        const [frontT, backT, leftT, rightT] = await Promise.all([
            frontMap ? new TextureLoader().loadAsync(frontMap) : new Promise(resolve => resolve(null)),
            backMap ? new TextureLoader().loadAsync(backMap) : new Promise(resolve => resolve(null)),
            leftMap ? new TextureLoader().loadAsync(leftMap) : new Promise(resolve => resolve(null)),
            rightMap ? new TextureLoader().loadAsync(rightMap) : new Promise(resolve => resolve(null))
        ]);

        if (frontT) {
            frontT.colorSpace = SRGBColorSpace;
            this.frontFace.mesh.material = new MeshPhongMaterial({ map: frontT });
            this.setTextureWrapS(mapRatio, frontT, true);
        }

        if (backT) {
            backT.colorSpace = SRGBColorSpace;
            this.backFace.mesh.material = new MeshPhongMaterial({ map: backT });
            this.setTextureWrapS(mapRatio, backT, true);
        }

        if (leftT) {
            leftT.colorSpace = SRGBColorSpace;
            this.leftFace.mesh.material = new MeshPhongMaterial({ map: leftT });
            this.setTextureWrapS(mapRatio, leftT, false);
        }

        if (rightT) {
            rightT.colorSpace = SRGBColorSpace;
            this.rightFace.mesh.material = new MeshPhongMaterial({ map: rightT });
            this.setTextureWrapS(mapRatio, rightT, false);
        }
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
}

export { SquarePillar };