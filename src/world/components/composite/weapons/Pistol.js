import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';

const GLTF_SRC = 'weapons/Pistol.glb';

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
            fireRate: 1, 
            ammo: 12,
            isSemiAutomatic: true
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { Pistol };