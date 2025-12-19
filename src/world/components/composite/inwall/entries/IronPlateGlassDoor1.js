import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/iron_plate_glass_door_1.gbl';

class IronPlateGlassDoor1 extends Door {

    _width = 1.3; // 1.60825 * 0.8083
    _height = 2.2657; // 2.803 * 0.8083
    _depth = .2562; // 0.317 * 0.8083

    _gltfScale = [0.8083, 0.8083, 0.8083];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }

}

export { IronPlateGlassDoor1 };