import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';
import { Ammo } from './Ammo';

const GLTF_SRC = 'weapons/SMG1.glb';

class SMGShort extends WeaponBase {

    constructor(specs) {

        const superSpecs = {
            weaponType: WEAPONS.SMG_SHORT,
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
            damageRange: 9,
            attackInterval: 0.08,
            fireRate: 10.2,
            ammo: new Ammo({ count: 35, damage: 7, offset: - 2, offset1: 2 }),
            magzineCapacity: 12,
            isSemiAutomatic: false
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { SMGShort };