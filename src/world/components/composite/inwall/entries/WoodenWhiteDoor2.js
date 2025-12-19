import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/wooden_white_door_2.gbl';

class WoodenWhiteDoor2 extends Door {

    _width = 1.096; // 1.868 * 0.5867
    _height = 2.3; // 3.92 * 0.5867
    _depth = .135; // 0.23 * 0.5867

    _gltfScale = [0.5867, 0.5867, 0.5867];
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

export { WoodenWhiteDoor2 };