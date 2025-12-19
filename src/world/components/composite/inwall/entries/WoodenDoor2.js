import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/wooden_door_2.glb';

class WoodenDoor2 extends Door {

    _width = 1.1654; // 0.4887 * 2.3846
    _height = 2.4046; // 1.0084 * 2.3846
    _depth = .2182; // 0.0915 * 2.3846

    _gltfScale = [2.3846, 2.3846, 2.3846];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }
    
}

export { WoodenDoor2 };