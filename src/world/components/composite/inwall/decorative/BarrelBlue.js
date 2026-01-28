import { BarrelBase } from './BarrelBase';

const GLTF_SRC = 'in_room/decorative/barrel_03_2k/barrel_03_2k.gltf';

class BarrelBlue extends BarrelBase {

    _radius = .3156;
    _height = .93;

    constructor(specs) {

        specs.src = specs.src ?? GLTF_SRC;
        super(specs);

    }

}

export { BarrelBlue };