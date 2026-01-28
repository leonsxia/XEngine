import { BarrelBase } from './BarrelBase';

const GLTF_SRC = 'in_room/decorative/barrel_01_2k/Barrel_01_2k.gltf';

class BarrelExplosive extends BarrelBase {

    _radius = .2834;
    _height = .878;

    constructor(specs) {

        specs.src = specs.src ?? GLTF_SRC;
        super(specs);

    }

}

export { BarrelExplosive };