import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/wooden_pink_door_1.gbl';

class WoodenPinkDoor1 extends Door {

    _width = 1.1785; // 0.9378 * 1.2567
    _height = 2.4046; // 1.9134 * 1.2567
    _depth = .1316; // 0.1047 * 1.2567

    _gltfScale = [1.2567, 1.2567, 1.2567];
    _gltfRotation = [0, - Math.PI * .5, 0];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }

    update(needToUpdateOBBnRay = true) {

        // update cBox scale
        this._cBox.setScale(this.scale);

        // update gltf scale
        const modelScale = [this.scale[2] * this._gltfScale[0], this.scale[1] * this._gltfScale[1], this.scale[0] * this._gltfScale[2]];
        this.gltf.setScale(modelScale);
        this.gltf.setRotation(this._gltfRotation);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { WoodenPinkDoor1 };