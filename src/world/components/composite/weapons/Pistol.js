import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';

const GLTF_SRC = 'weapons/Pistol.glb';

class Pistol extends WeaponBase {

    constructor(specs) {

        const { name, scale = [.15, .15, .15] } = specs;
        const { position = [0, 0, 0], rotation = [0, 0, 0] } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { src = GLTF_SRC } = specs;

        super({
            name, scale, 
            position, rotation,
            offsetX, offsetY, offsetZ,
            receiveShadow, castShadow,
            weaponType: WEAPONS.PISTOL1,
            src
        });

    }

}

export { Pistol };