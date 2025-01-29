import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';

const GLTF_SRC = 'weapons/Revolver.glb';

class Revolver extends WeaponBase {

    constructor(specs) {

        const { name, scale = [.19, .19, .19] } = specs;
        const { position = [0, 0, 0], rotation = [0, 0, 0] } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { src = GLTF_SRC } = specs;

        super({
            name, scale,
            position, rotation,
            offsetX, offsetY, offsetZ,
            receiveShadow, castShadow,
            weaponType: WEAPONS.REVOLVER,
            src
        });

    }

}

export { Revolver };