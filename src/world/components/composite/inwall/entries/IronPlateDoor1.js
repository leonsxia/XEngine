import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/iron_plate_door.gbl';

class IronPlateDoor1 extends Door {

    _width = 1; // 1.75 * 0.571
    _height = 2.3; // 4.2117 * 0.5461
    _depth = .1273; // 0.223 * 0.571

    _gltfScale = [0.571, 0.5461, 0.571];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }

}

export { IronPlateDoor1 };