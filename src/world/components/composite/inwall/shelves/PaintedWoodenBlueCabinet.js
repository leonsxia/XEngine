import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'in_room/shelves/painted_wooden_cabinet_02_1k/painted_wooden_cabinet_02_1k.gltf';

class PaintedWoodenBlueCabinet extends ObstacleBase {

    _width = 1;
    _height = 2.57;
    _depth = .72;
    _frontHeight = 1.169;
    _backDepth = .388;

    _frontDepth = this._depth - this._backDepth;

    gltf;

    _cBoxFront;
    _cBoxBack;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        const cBoxFrontSpecs = { name: `${name}_front`, width: this._width, depth: this._frontDepth, height: this._frontHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxBackSpecs = { name: `${name}_back`, width: this._width, depth: this._backDepth, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBoxFront = this._cBoxFront = new CollisionBox(cBoxFrontSpecs);
        const cBoxBack = this._cBoxBack = new CollisionBox(cBoxBackSpecs);

        this.update(false);

        this.cObjects = [cBoxFront, cBoxBack];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        // set triggers if needed
        this.setTriggers();

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
        const depth = this._depth * this.scale[2];
        const frontHeight = this._frontHeight * this.scale[1];
        const backDepth = this._backDepth * this.scale[2];
        const frontDepth = this._frontDepth * this.scale[2];

        const frontY = (frontHeight - height) * .5;
        const frontZ = (depth - frontDepth) * .5;
        const backZ = (backDepth - depth) * .5;

        this._cBoxFront.setPosition([0, frontY, frontZ]).setScale(this.scale);
        this._cBoxBack.setPosition([0, 0, backZ]).setScale(this.scale);

        // update gltf scale
        this.gltf.setScale(this.scale);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { PaintedWoodenBlueCabinet };