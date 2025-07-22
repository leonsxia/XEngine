import { createOBBBox } from "../../../physics/collisionHelper";
import { getImageUrl } from "../../../utils/imageHelper";

class SubCombinableItem {

    gltf;
    box;
    type;
    imgUrl;
    itemSize = 1;

    _scale = [1, 1, 1];
    _gltfScale = [1, 1, 1];

    constructor(specs) {

        const { name, lines = false } = specs;
        const { healthType } = specs;
        const { itemSize = 1 } = specs;
        const { width = 1, height = 1, depth = 1 } = specs;
        const { scale = [1, 1, 1], gltfScale = [1, 1, 1] } = specs;
        const { receiveShadow = true, castShadow = true } = specs;

        this.specs = specs;
        this.type = healthType;
        this.itemSize = itemSize;

        this.width = width;
        this.height = height;
        this.depth = depth;
        this._scale = new Array(...scale);
        this._gltfScale = gltfScale;

        const boxSpecs = { size: { width, depth, height }, lines };
        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;
        // this.box.setTransparent(true, .5);

    }

    async init() {

        await this.gltf.init();
        this.imgUrl = await getImageUrl(this.specs.imgName);

    }

    get scale() {

        return this._scale;

    }

    set scale(val) {

        this._scale = new Array(...val);

        this.update();

    }

    setGLTFScale() {}

    update(needToUpdateOBBnRay = true) {

        this.setGLTFScale();

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

    updateOBBs(needToUpdateOBBnRay = true) {

        this.box.updateOBB(needToUpdateOBBnRay);

    }
    
}

export { SubCombinableItem };