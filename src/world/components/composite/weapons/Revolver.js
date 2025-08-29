import { WeaponBase } from '../../Models';
import { SOUND_NAMES } from '../../utils/audioConstants';
import { AMMOS, GLTF_NAMES, WEAPONS } from '../../utils/constants';
import { Ammo } from './Ammo';

const GLTF_SRC = 'weapons/revolver.glb';

class Revolver extends WeaponBase {

    constructor(specs) {

        const superSpecs = {
            weaponType: WEAPONS.REVOLVER,
            gltfName: GLTF_NAMES.REVOLVER_ITEM,
            name: null,
            scale: [.19, .19, .19],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            receiveShadow: true,
            castShadow: true,
            src: GLTF_SRC,
            damageRange: 16,
            attackInterval: 1.05,
            fireRate: 0.8,
            ammo:new Ammo({ type: AMMOS.MAGNUM, count: 6, damage: 60, offset: - 10, offset1: 45 }),
            magzineCapacity: 6,
            isSemiAutomatic: true,
            soundFire: SOUND_NAMES.BRETTA_FIRE
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { Revolver };