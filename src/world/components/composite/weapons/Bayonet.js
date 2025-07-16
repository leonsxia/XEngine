import { WeaponBase } from '../../Models';
import { createOBBBox } from '../../physics/collisionHelper';
import { AMMOS, GLTF_NAMES, WEAPONS } from '../../utils/constants';
import { Ammo } from './Ammo';

const GLTF_SRC = 'weapons/bayonet.glb';

class Bayonet extends WeaponBase {

    constructor(specs) {

        const superSpecs = {
            weaponType: WEAPONS.BAYONET,
            gltfName: GLTF_NAMES.BAYONET_ITEM,
            name: null,
            scale: [.25, .25, .25],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            receiveShadow: true,
            castShadow: true,
            src: GLTF_SRC,
            attackInterval: 1.03,
            damageRange: 1,
            prepareInterval: 0.5,
            fireRate: 1.25,
            ammo: new Ammo({ type: AMMOS.BAYONET, isMeleeWeapon: true, damage: 30, offset0: - 10, offset1: 10 })
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

        const { obbSize, obbPosition, obbRotation } = specs;
        this.hittingBox = createOBBBox(obbSize, `bayonet_hitting_obb_box`, obbPosition, obbRotation);
        this.group.add(this.hittingBox.mesh);
        this.hittingBox.mesh.isWeapon = true;
        // this.hittingBox.mesh.layers.enable(CAMERA_RAY_LAYER);
        this.hittingBox.mesh.visible = false;

    }

}

export { Bayonet };