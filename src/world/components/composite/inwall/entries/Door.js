import { createOBBBox } from '../../../physics/collisionHelper';
import { GLTFModel, CollisionBox } from '../../../Models';
import { EntryBase } from './EntryBase';

class Door extends EntryBase {

    _width = 1;
    _height = 1;
    _depth = 1;

    _gltfScale = [1, 1, 1];

    _cBox;
    _gltfSrc;

    constructor(specs) {

        super(specs);

    }

    initComponents() {

        const { name, scale = [1, 1, 1], lines = false } = this.specs;
        const { showArrow = false } = this.specs;
        const { src = this._gltfSrc, receiveShadow = true, castShadow = true } = this.specs;

        this._scale = new Array(...scale);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        const cBoxSpecs = { name, width: this._width, depth: this._depth, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBox = this._cBox = new CollisionBox(cBoxSpecs);

        this.update(false);

        this.cObjects = [cBox];
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

        // update cBox scale
        this._cBox.setScale(this.scale);

        // update gltf scale
        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[1] * this._gltfScale[1], this.scale[2] * this._gltfScale[2]];
        this.gltf.setScale(modelScale);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { Door };