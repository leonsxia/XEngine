import { Group, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { createCollisionPlane } from '../../physics/collisionHelper';
import { green } from '../../basic/colorBase';

class LWall {
    name = '';
    // S: horizontal, T: vertical
    outWallT;
    outWallS;
    sideWallT;
    sideWallS;
    inWallT;
    inWallS;
    walls = [];
    showArrow = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, thickness, height, showArrow } = specs;
        const outWallTSpecs = { width: depth, height };
        const inWallTSpecs = { width: depth - thickness, height };
        const outWallSSpecs = { width, height };
        const inWallSSpecs = { width: width - thickness, height };
        const sideWallSpecs = { width: thickness, height };

        this.name = name;
        this.showArrow = showArrow;
        this.group = new Group();

        this.outWallT = createCollisionPlane(outWallTSpecs, `${name}_outT`, [- width / 2, 0, 0], - Math.PI / 2, true, true, this.showArrow, false);
        this.outWallS = createCollisionPlane(outWallSSpecs, `${name}_outS`, [0, 0, - depth / 2], Math.PI, true, true, this.showArrow, false);
        this.inWallT = createCollisionPlane(inWallTSpecs, `${name}_inT`, [- width / 2 + thickness, 0, thickness / 2], Math.PI / 2, true, true, this.showArrow, false);
        this.inWallS = createCollisionPlane(inWallSSpecs, `${name}_inS`, [thickness / 2, 0, - depth / 2 + thickness], 0, true, true, this.showArrow, false);
        this.sideWallT = createCollisionPlane(sideWallSpecs, `${name}_sideT`, [width / 2, 0, - depth / 2 + thickness / 2], Math.PI / 2, true, true, this.showArrow, false);
        this.sideWallS = createCollisionPlane(sideWallSpecs, `${name}_sideS`, [- width / 2 + thickness / 2, 0, depth / 2], 0, true, true, this.showArrow, false);

        this.outWallS.line.material.color.setHex(green);

        this.walls = [this.outWallT, this.outWallS, this.inWallT, this.inWallS, this.sideWallT, this.sideWallS];

        this.group.add(
            this.outWallT.mesh,
            this.outWallS.mesh,
            this.sideWallT.mesh,
            this.sideWallS.mesh,
            this.inWallT.mesh,
            this.inWallS.mesh
        );
    }

    async init() {
        const { outTMap, outSMap, inTMap, inSMap, sideTMap, sideSMap, mapRatio } = this.specs;
        const [outTT, outST, inTT, inST, sideTT, sideST] = await Promise.all([
            outTMap ? new TextureLoader().loadAsync(outTMap) : new Promise(resolve => resolve(null)),
            outSMap ? new TextureLoader().loadAsync(outSMap) : new Promise(resolve => resolve(null)),
            inTMap ? new TextureLoader().loadAsync(inTMap) : new Promise(resolve => resolve(null)),
            inSMap ? new TextureLoader().loadAsync(inSMap) : new Promise(resolve => resolve(null)),
            sideTMap ? new TextureLoader().loadAsync(sideTMap) : new Promise(resolve => resolve(null)),
            sideSMap ? new TextureLoader().loadAsync(sideSMap) : new Promise(resolve => resolve(null)),
        ]);

        if (outTT) {
            outTT.colorSpace = SRGBColorSpace;
            this.outWallT.mesh.material = new MeshPhongMaterial({ map: outTT });
            this.setTextureWrapS(mapRatio, outTT, false, true, false);
        }

        if (outST) {
            outST.colorSpace = SRGBColorSpace;
            this.outWallS.mesh.material = new MeshPhongMaterial({ map: outST });
            this.setTextureWrapS(mapRatio, outST, true, true, false);
        }

        if (inTT) {
            inTT.colorSpace = SRGBColorSpace;
            this.inWallT.mesh.material = new MeshPhongMaterial({ map: inTT });
            this.setTextureWrapS(mapRatio, inTT, false, false, false);
        }

        if (inST) {
            inST.colorSpace = SRGBColorSpace;
            this.inWallS.mesh.material = new MeshPhongMaterial({ map: inST });
            this.setTextureWrapS(mapRatio, inST, true, false, false);
        }

        if (sideTT) {
            sideTT.colorSpace = SRGBColorSpace;
            this.sideWallT.mesh.material = new MeshPhongMaterial({ map: sideTT });
            this.setTextureWrapS(mapRatio, sideTT, false, false, true);
        }

        if (sideST) {
            sideST.colorSpace = SRGBColorSpace;
            this.sideWallS.mesh.material = new MeshPhongMaterial({ map: sideST });
            this.setTextureWrapS(mapRatio, sideST, true, false, true);
        }
    }

    setTextureWrapS(mapRatio, texture, s, out, side) {
        if (mapRatio) {
            const { width, height, depth, thickness } = this.specs;
            let w = s ? out ? width : width - thickness : out ? depth : depth - thickness;
            if (side) w = thickness;
            const xRepeat =  w / (mapRatio * height);
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

export { LWall };