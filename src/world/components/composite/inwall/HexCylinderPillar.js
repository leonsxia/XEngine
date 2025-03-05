import { createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { CollisionHexCylinder, CollisionCylinder } from '../../Models';

class HexCylinderPillar extends ObstacleBase {

    isHexCylinderPillar = true;

    _radius = 1;
    _height = 1;

    cylinder;
    _chCylinder;

    constructor(specs) {

        super(specs);

        const { name, lines = true, showArrow = false } = specs;
        const { segments = 16, baseSize, mapRatio, rotationC = Math.PI * .5 } = specs;
        const { map, normalMap, topMap, topNormal, bottomMap, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { scale = [1, 1] } = specs;
        const { transparent = true } = specs;

        this._scale = [scale[0], scale[1], scale[0]];

        const boxSpecs = { size: { width: this._radius * 2, depth: this._radius * 2, height: this._height }, lines };
        const cylinderSpecs = {
            name: `${name}_cylinder`, radius: this._radius, height: this._height, texScale: [this.scale[0], this.scale[1]], segments, baseSize,
            map, normalMap, topMap, topNormal, bottomMap, bottomNormal,
            mapRatio, rotationC, lines, transparent
        };
        const chCylinderSpecs = { name: `${name}_collision_hex_cylinder`, radius: this._radius, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // cylinder
        this.cylinder = new CollisionCylinder(cylinderSpecs);
        this.cylinder.receiveShadow(receiveShadow)
            .castShadow(castShadow);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision cylinder
        const chCylinder = this._chCylinder = new CollisionHexCylinder(chCylinderSpecs);
        chCylinder.setRotationY(Math.PI / 16);

        this.update(false, false);

        this.cObjects = [chCylinder];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        this.group.add(
            this.cylinder.mesh,
            this.box.mesh
        );

        this.setPickLayers();

    }

    async init() {

        await this.cylinder.init();

    }

    get scaleR() {

        return this._scale[0];

    }

    set scaleR(r) {

        this._scale[0] = this._scale[2] = r;

        this.update();

    }

    get scale() {

        return [this._scale[0], this._scale[1]];

    }

    set scale(val = [1, 1]) {

        this._scale = [val[0], val[1], val[0]];

        this.update();

    }

    update(needToUpdateOBBnRay = true, needToUpdateTexture = true) {

        this._chCylinder.setScale(this._scale);

        if (needToUpdateTexture) {

            const cylinderConfig = { texScale: [this.scale[0], this.scale[1]] };
            this.cylinder.setConfig(cylinderConfig);
            this.cylinder.updateTextures();

        }
        this.cylinder.setScale(this._scale);        

        this.box.setScale(this._scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { HexCylinderPillar };