import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/classic_wooden_double_door_1.glb';

class ClassicWoodenDoubleDoor1 extends Door {

    _width = 2.002; // 3.492 * 0.5733
    _height = 2.4114; // 4.2063 * 0.5733
    _depth = .145; // 0.2529 * 0.5733

    _gltfScale = [0.5733, 0.5733, 0.5733];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }

}

export { ClassicWoodenDoubleDoor1 };