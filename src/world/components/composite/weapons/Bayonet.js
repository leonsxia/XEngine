import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';

const GLTF_SRC = 'weapons/Bayonet.glb';

class Bayonet extends WeaponBase {

    constructor(specs) {

        const { name, scale = [.25, .25, .25] } = specs;
        const { position = [0, 0, 0], rotation = [0, 0, 0] } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { src = GLTF_SRC } = specs;
        const { fireRate = 1 } = specs;

        super({
            name, scale,
            position, rotation,
            offsetX, offsetY, offsetZ,
            receiveShadow, castShadow,
            weaponType: WEAPONS.BAYONET,
            src,
            fireRate
        });

    }

}

export { Bayonet };