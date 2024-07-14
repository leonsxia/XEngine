import { Group, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { createCollisionPlane } from '../../physics/collisionHelper';
import { green } from '../../basic/colorBase';

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
    walls = [];
    showArrow = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, height, showArrow } = specs;
        const pSpecs = { width, height };
        const offset = Math.sqrt(width * width / 2);

        this.name = name;
        this.showArrow = showArrow;
        this.group = new Group();

        this.face1 = createCollisionPlane(pSpecs, `${name}_face1`, [0, 0, width / 2 + offset], 0, true, true, this.showArrow, false);
        this.face2 = createCollisionPlane(pSpecs, `${name}_face2`, [- width / 2 - offset / 2, 0, width / 2 + offset / 2], - Math.PI / 4, true, true, this.showArrow, false);
        this.face3 = createCollisionPlane(pSpecs, `${name}_face3`, [- width / 2 - offset, 0, 0], - Math.PI / 2, true, true, this.showArrow, false);
        this.face4 = createCollisionPlane(pSpecs, `${name}_face4`, [- width / 2 - offset / 2, 0, - width / 2 - offset / 2], - 3 * Math.PI / 4, true, true, this.showArrow, false);
        this.face5 = createCollisionPlane(pSpecs, `${name}_face5`, [0, 0, - width / 2 - offset], Math.PI, true, true, this.showArrow, false);
        this.face6 = createCollisionPlane(pSpecs, `${name}_face6`, [width / 2 + offset / 2, 0, - width / 2 - offset / 2], 3 * Math.PI / 4, true, true, this.showArrow, false);
        this.face7 = createCollisionPlane(pSpecs, `${name}_face7`, [width / 2 + offset, 0, 0], Math.PI / 2, true, true, this.showArrow, false);
        this.face8 = createCollisionPlane(pSpecs, `${name}_face8`, [width / 2 + offset / 2, 0, width / 2 + offset / 2],  Math.PI / 4, true, true, this.showArrow, false);

        this.face1.line.material.color.setHex(green);

        this.walls = [this.face1, this.face2, this.face3, this.face4, this.face5, this.face6, this.face7, this.face8];

        this.walls.forEach(w => this.group.add(w.mesh));
    }

    async init() {
        const { map, mapRatio } = this.specs;
        const [texture] = await Promise.all([
            map ? new TextureLoader().loadAsync(map) : new Promise(resolve => resolve(null))
        ]);

        if (texture) {
            texture.colorSpace = SRGBColorSpace;
            const material = new MeshPhongMaterial({ map: texture });
            this.walls.forEach(w => w.mesh.material = material);
            this.setTextureWrapS(mapRatio, texture);
        }
    }

    setTextureWrapS(mapRatio, texture) {
        if (mapRatio) {
            const { width, height } = this.specs;
            const xRepeat =  width / (mapRatio * height);
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

export { CylinderPillar };