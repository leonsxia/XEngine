import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/classic_wooden_door_3.glb';

class ClassicWoodenDoor3 extends Door {

    _width = .9521; // 1.73876 * 0.5476
    _height = 2.3; // 4.2 * 0.5476
    _depth = .1146; // 0.2092 * 0.5476

    _gltfScale = [0.5476, 0.5476, 0.5476];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }

}

export { ClassicWoodenDoor3 };