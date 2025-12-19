import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/wooden_glass_door_2.gbl';

class WoodenGlassDoor2 extends Door {

    _width = 1.2; // 163.106 * 0.007357
    _height = 2.4046; // 326.837 * 0.007357
    _depth = .1806; // 24.55 * 0.007357

    _gltfScale = [0.007357, 0.007357, 0.007357];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }

}

export { WoodenGlassDoor2 };