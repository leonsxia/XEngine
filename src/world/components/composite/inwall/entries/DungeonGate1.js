import { Door } from "./Door";

const GLTF_SRC = 'in_room/entries/dungeon_gate_1.glb';

class DungeonGate1 extends Door {

    _width = 2.3275; // 2.3275
    _height = 2.9471; // 2.9471
    _depth = .1654; // .1654

    _gltfScale = [1, 1, 1];

    _gltfSrc = GLTF_SRC;

    constructor(specs) {

        super(specs);

        this.initComponents();

    }

}

export { DungeonGate1 };