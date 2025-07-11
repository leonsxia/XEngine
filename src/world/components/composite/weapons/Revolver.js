import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';
import { Ammo } from './Ammo';

const GLTF_SRC = 'weapons/revolver.glb';

class Revolver extends WeaponBase {

    constructor(specs) {

        const superSpecs = {
            weaponType: WEAPONS.REVOLVER,
            name: null,
            scale: [.19, .19, .19],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            offsetX: 0,
            offsetY: 0,
            offsetZ: 0,
            receiveShadow: true,
            castShadow: true,
            src: GLTF_SRC,
            damageRange: 16,
            attackInterval: 1.05,
            fireRate: 0.8,
            ammo:new Ammo({ count: 6, damage: 60, offset: - 10, offset1: 45 }),
            magzineCapacity: 6,
            isSemiAutomatic: true
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { Revolver };