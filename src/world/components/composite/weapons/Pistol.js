import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';
import { Ammo } from './Ammo';

const GLTF_SRC = 'weapons/pistol.glb';

class Pistol extends WeaponBase {

    constructor(specs) {

        const superSpecs = {
            weaponType: WEAPONS.PISTOL1,
            name: null,
            scale: [.15, .15, .15],
            position: [0, 0, 0], 
            rotation: [0, 0, 0],
            offsetX: 0, 
            offsetY: 0, 
            offsetZ: 0,
            receiveShadow: true, 
            castShadow: true,
            src: GLTF_SRC,
            damageRange: 10,
            attackInterval: 0.7,
            fireRate: 1.2,
            ammo: new Ammo({ count: 12, damage: 20, offset0: - 5, offset1: 5 }),
            magzineCapacity: 12,
            isSemiAutomatic: true
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { Pistol };