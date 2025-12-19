import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/wooden_glass_door_3.gbl';

class WoodenGlassDoor3 extends Door {

    _width = 1.3513; // 1.75488 * 0.77
    _height = 2.4114; // 3.13165 * 0.77
    _depth = .2448; // 0.31794 * 0.77

    _gltfScale = [.77, .77, .77];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }

}

export { WoodenGlassDoor3 };