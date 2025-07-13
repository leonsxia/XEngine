import { GLTFModel } from "../../../Models";
import { createOBBBox } from "../../../physics/collisionHelper";
import { ObstacleBase } from "../ObstacleBase";

class PickableItem extends ObstacleBase {

    _width;
    _height;
    _depth;
    _gltfScale = [1, 1, 1];

    isPickableItem = true;
    isPicked = false;
    belongTo = undefined;

    currentRoom;

    constructor(specs) {

        super(specs);

        const { name, lines = false } = specs;
        const { width = 1, height = 1, depth = 1 } = specs;
        const { scale = [1, 1, 1], gltfScale = [1, 1, 1] } = specs;
        const { gltfRotation = [0, 0, 0] } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { src, receiveShadow = true, castShadow = true } = specs;
        const { currentRoom } = specs;
        const { isPicked = false, belongTo } = specs;

        this._width = width;
        this._height = height;
        this._depth = depth;
        this._scale = new Array(...scale);
        this._gltfScale = gltfScale;

        this.currentRoom = currentRoom;
        this.isPicked = isPicked;
        this.belongTo = belongTo;

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(gltfScale);
        this.gltf.setRotation(gltfRotation);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        this.group.add(
            this.gltf.group,
            this.box.mesh
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

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

    tick(delta) {

        this.group.rotation.y = (this.group.rotation.y + 0.5 * delta) % (2 * Math.PI);
        this.updateOBBs();

    }

}

export { PickableItem };