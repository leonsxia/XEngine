import { WeaponBase } from '../../Models';
import { WEAPONS } from '../../utils/constants';

const GLTF_SRC = 'weapons/Revolver.glb';

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
            fireRate: 1,
            ammo: 6,
            isSemiAutomatic: true
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

}

export { Revolver };