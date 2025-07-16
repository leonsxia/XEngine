import { WeaponBase } from '../../Models';
import { AMMOS, GLTF_NAMES, WEAPONS } from '../../utils/constants';
import { Ammo } from './Ammo';

const GLTF_SRC = 'weapons/pistol.glb';

class Pistol extends WeaponBase {

    constructor(specs) {

        const superSpecs = {
            weaponType: WEAPONS.PISTOL1,
            gltfName: GLTF_NAMES.PISTOL1_ITEM,
            name: null,
            scale: [.15, .15, .15],
            position: [0, 0, 0], 
            rotation: [0, 0, 0],
            receiveShadow: true, 
            castShadow: true,
            src: GLTF_SRC,
            damageRange: 10,
            attackInterval: 0.7,
            fireRate: 1.2,
            ammo: new Ammo({ type: AMMOS.PISTOL_9MM, count: 15, damage: 20, offset0: - 5, offset1: 5 }),
            magzineCapacity: 15,
            isSemiAutomatic: true
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { Pistol };