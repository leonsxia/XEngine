import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';

const GLTF_SRC = 'weapons/Bayonet.glb';

class Bayonet extends WeaponBase {

    constructor(specs) {

        const superSpecs = {
            weaponType: WEAPONS.BAYONET,
            name: null,
            scale: [.25, .25, .25],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            offsetX: 0,
            offsetY: 0,
            offsetZ: 0,
            receiveShadow: true,
            castShadow: true,
            src: GLTF_SRC,
            fireRate: 1
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { Bayonet };