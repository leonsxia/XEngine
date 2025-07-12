import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'in_room/seats/painted_wooden_chair_01_1k/painted_wooden_chair_01_1k.gltf';

class PaintedWoodenWhiteChair extends ObstacleBase {

    _width = .433;
    _height = .964;
    _depth = .506;
    _bottomHeight = .458;
    _bottomDepth = .476;
    _backWidth = .377;
    _backHeight = .518;
    _backDepth = .125;

    gltf;

    _cBoxBottom;
    _cBoxBack;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { offsetY = - .482 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);        

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        const cBoxBottomSpecs = { name: `${name}_bottom`, width: this._width, depth: this._bottomDepth, height: this._bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxBackSpecs = { name: `${name}_back`, width: this._backWidth, depth: this._backDepth, height: this._backHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBoxBottom = this._cBoxBottom = new CollisionBox(cBoxBottomSpecs);
        const cBoxBack = this._cBoxBack = new CollisionBox(cBoxBackSpecs);

        this.update(false);

        this.cObjects = [cBoxBottom, cBoxBack];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        this.group.add(
            this.gltf.group,
            this.box.mesh
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

    }

    update(needToUpdateOBBnRay = true) {

        // update cBox position and scale
        const height = this._height * this.scale[1];
        const bottomHeight = this._bottomHeight * this.scale[1];
        const backHeight = this._backHeight * this.scale[1];

        const bottomY = (bottomHeight - height) * .5;
        const backY = (backHeight - height) * .5 + bottomHeight;
        const backZ = - .24 * this.scale[2];

        this._cBoxBottom.setPosition([0, bottomY, 0]).setScale(this.scale);
        this._cBoxBack.setPosition([0, backY, backZ]).setScale(this.scale);

        // update gltf scale
        this.gltf.setScale(this.scale);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { PaintedWoodenWhiteChair };