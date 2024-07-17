import { Group, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { createCollisionPlane, createCollisionPlaneFree, createOBBPlane } from '../../physics/collisionHelper';
import { green, yankeesBlue } from '../../basic/colorBase';

class LWall {
    name = '';
    // S: horizontal, T: vertical
    outWallT;
    outWallS;
    sideWallT;
    sideWallS;
    inWallT;
    inWallS;
    topWallT;
    topWallS;
    bottomWallT;
    bottomWallS;
    walls = [];
    tops = [];
    bottoms = [];
    topOBBs = [];
    bottomOBBs = [];
    showArrow = false;
    specs;

    constructor(specs) {
        this.specs = specs;
        const { name, width, depth, thickness, height, showArrow, enableOBBs } = specs;
        const outWallTSpecs = { width: depth, height };
        const inWallTSpecs = { width: depth - thickness, height };
        const outWallSSpecs = { width, height };
        const inWallSSpecs = { width: width - thickness, height };
        const sideWallSpecs = { width: thickness, height };
        const tbTSpecs = { width: thickness, height: depth, color: yankeesBlue };
        const tbSSpecs = { width: width - thickness, height: thickness, color: yankeesBlue };

        this.name = name;
        this.showArrow = showArrow;
        this.group = new Group();

        this.outWallT = createCollisionPlane(outWallTSpecs, `${name}_outT`, [- width / 2, 0, 0], - Math.PI / 2, true, true, this.showArrow, false);
        this.inWallT = createCollisionPlane(inWallTSpecs, `${name}_inT`, [- width / 2 + thickness, 0, thickness / 2], Math.PI / 2, true, true, this.showArrow, false);
        this.inWallS = createCollisionPlane(inWallSSpecs, `${name}_inS`, [thickness / 2, 0, - depth / 2 + thickness], 0, true, true, this.showArrow, false);
        this.sideWallT = createCollisionPlane(sideWallSpecs, `${name}_sideT`, [width / 2, 0, - depth / 2 + thickness / 2], Math.PI / 2, true, true, this.showArrow, false);
        this.sideWallS = createCollisionPlane(sideWallSpecs, `${name}_sideS`, [- width / 2 + thickness / 2, 0, depth / 2], 0, true, true, this.showArrow, false);

        if (!enableOBBs) {
            this.topWallT = createCollisionPlaneFree(tbTSpecs, `${name}_topT`, [- (width - thickness) * .5 , height * .5, 0], [- Math.PI * .5, 0, 0], true, false, false, this.showArrow, false);
            this.topWallS = createCollisionPlaneFree(tbSSpecs, `${name}_topS`, [thickness * .5 , height * .5, - (depth - thickness) * .5], [- Math.PI * .5, 0, 0], true, false, false, this.showArrow, false);
            this.bottomWallT = createCollisionPlaneFree(tbTSpecs, `${name}_bottomT`, [- (width - thickness) * .5 , - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false, this.showArrow, false);
            this.bottomWallS = createCollisionPlaneFree(tbSSpecs, `${name}_bottomS`, [thickness * .5 , - height * .5, - (depth - thickness) * .5], [Math.PI * .5, 0, 0], true, false, false, this.showArrow, false);
            this.tops.push(this.topWallT, this.topWallS);
            this.bottoms.push(this.bottomWallT, this.bottomWallS);
        } else {
            this.topWallT = createOBBPlane(tbTSpecs, `${name}_topT_OBB`, [- (width - thickness) * .5 , height * .5, 0], [- Math.PI * .5, 0, 0], true, false, false);
            this.topWallS = createOBBPlane(tbSSpecs, `${name}_topS_OBB`, [thickness * .5 , height * .5, - (depth - thickness) * .5], [- Math.PI * .5, 0, 0], true, false, false);
            this.bottomWallT = createOBBPlane(tbTSpecs, `${name}_bottomT_OBB`, [- (width - thickness) * .5 , - height * .5, 0], [Math.PI * .5, 0, 0], true, false, false);
            this.bottomWallS = createOBBPlane(tbSSpecs, `${name}_bottomS_OBB`, [thickness * .5 , - height * .5, - (depth - thickness) * .5], [Math.PI * .5, 0, 0], true, false, false);
            this.topOBBs.push(this.topWallT, this.topWallS);
            this.bottomOBBs.push(this.bottomWallT, this.bottomWallS);
        }

        // create last for changing line color
        this.outWallS = createCollisionPlane(outWallSSpecs, `${name}_outS`, [0, 0, - depth / 2], Math.PI, true, true, this.showArrow, false);
        this.outWallS.line.material.color.setHex(green);

        this.walls = [this.outWallT, this.outWallS, this.inWallT, this.inWallS, this.sideWallT, this.sideWallS];

        this.group.add(
            this.outWallT.mesh,
            this.outWallS.mesh,
            this.sideWallT.mesh,
            this.sideWallS.mesh,
            this.inWallT.mesh,
            this.inWallS.mesh,
            this.topWallT.mesh,
            this.topWallS.mesh,
            this.bottomWallT.mesh,
            this.bottomWallS.mesh
        );
    }

    async init() {
        const { outTMap, outSMap, inTMap, inSMap, sideTMap, sideSMap, topMap, bottomMap, mapRatio } = this.specs;
        const [outTT, outST, inTT, inST, sideTT, sideST, top, bottom] = await Promise.all([
            outTMap ? new TextureLoader().loadAsync(outTMap) : new Promise(resolve => resolve(null)),
            outSMap ? new TextureLoader().loadAsync(outSMap) : new Promise(resolve => resolve(null)),
            inTMap ? new TextureLoader().loadAsync(inTMap) : new Promise(resolve => resolve(null)),
            inSMap ? new TextureLoader().loadAsync(inSMap) : new Promise(resolve => resolve(null)),
            sideTMap ? new TextureLoader().loadAsync(sideTMap) : new Promise(resolve => resolve(null)),
            sideSMap ? new TextureLoader().loadAsync(sideSMap) : new Promise(resolve => resolve(null)),
            topMap ? new TextureLoader().loadAsync(topMap) : new Promise(resolve => resolve(null)),
            bottomMap ? new TextureLoader().loadAsync(bottomMap) : new Promise(resolve => resolve(null))
        ]);

        if (outTT) {
            outTT.colorSpace = SRGBColorSpace;
            this.outWallT.mesh.material = new MeshPhongMaterial({ map: outTT });
            this.setTextureWrap(mapRatio, outTT, false, true, false);
        }

        if (outST) {
            outST.colorSpace = SRGBColorSpace;
            this.outWallS.mesh.material = new MeshPhongMaterial({ map: outST });
            this.setTextureWrap(mapRatio, outST, true, true, false);
        }

        if (inTT) {
            inTT.colorSpace = SRGBColorSpace;
            this.inWallT.mesh.material = new MeshPhongMaterial({ map: inTT });
            this.setTextureWrap(mapRatio, inTT, false, false, false);
        }

        if (inST) {
            inST.colorSpace = SRGBColorSpace;
            this.inWallS.mesh.material = new MeshPhongMaterial({ map: inST });
            this.setTextureWrap(mapRatio, inST, true, false, false);
        }

        if (sideTT) {
            sideTT.colorSpace = SRGBColorSpace;
            this.sideWallT.mesh.material = new MeshPhongMaterial({ map: sideTT });
            this.setTextureWrap(mapRatio, sideTT, false, false, true);
        }

        if (sideST) {
            sideST.colorSpace = SRGBColorSpace;
            this.sideWallS.mesh.material = new MeshPhongMaterial({ map: sideST });
            this.setTextureWrap(mapRatio, sideST, true, false, true);
        }

        if (top) {
            top.colorSpace = SRGBColorSpace;
            const topMaterialS = new MeshPhongMaterial({ map: top });
            const topMaterialT = new MeshPhongMaterial({ map: top.clone() });
            this.topWallS.mesh.material = topMaterialS;
            this.topWallT.mesh.material = topMaterialT;
            this.setTextureTBWrap(mapRatio, topMaterialS.map, true);
            this.setTextureTBWrap(mapRatio, topMaterialT.map, false);
        }

        if (bottom) {
            bottom.colorSpace = SRGBColorSpace;
            const bottomMaterialT = new MeshPhongMaterial({ map: bottom });
            const bottomMaterialS = new MeshPhongMaterial({ map: bottom.clone() });
            this.bottomWallS.mesh.material = bottomMaterialS;
            this.bottomWallT.mesh.material = bottomMaterialT;
            this.setTextureTBWrap(mapRatio, bottomMaterialS.map, true);
            this.setTextureTBWrap(mapRatio, bottomMaterialT.map, false);
        }
    }

    setTextureWrap(mapRatio, texture, s, out, side) {
        if (mapRatio) {
            const { width, height, depth, thickness, roomHeight } = this.specs;
            let w = s ? out ? width : width - thickness : out ? depth : depth - thickness;
            let h = height;
            if (side) w = thickness;
            const xRepeat = w / (mapRatio * roomHeight);
            const yRepeat = h / roomHeight;

            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.repeat.set(xRepeat, yRepeat);
        }
    }

    setTextureTBWrap(mapRatio, texture, s) {
        if (mapRatio) {
            const { width, depth, thickness, roomHeight } = this.specs;
            let w = s ? width - thickness : thickness;
            let h = s ? thickness : depth;

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

export { LWall };