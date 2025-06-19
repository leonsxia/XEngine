import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';
import { Ammo } from './Ammo';

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
            attackInterval: 1.03,
            damageRange: 1,
            prepareInterval: 0.5,
            fireRate: 1.25,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 30, offset0: - 10, offset1: 10 })
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { Bayonet };