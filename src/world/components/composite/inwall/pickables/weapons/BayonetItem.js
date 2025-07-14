import { AMMOS, WEAPONS } from "../../../../utils/constants";
import { Ammo } from "../../../weapons/Ammo";
import { WeaponItem } from "./WeaponItem";

const GLTF_SRC = 'weapons/bayonet.glb';

class BayonetItem extends WeaponItem {

    static gltfModel;

    constructor(specs) {

        specs.width = .28;
        specs.height = .2;
        specs.depth = .06;
        specs.offsetX = -.36;
        specs.gltfScale = [.25, .25, .25];
        specs.gltfRotation = [- Math.PI / 2, 0, 0];
        specs.weaponType = WEAPONS.BAYONET;
        specs.src = specs.src ?? GLTF_SRC;

        const { damage = 30, offset0 = - 10, offset1 = 10 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.BAYONET, isMeleeWeapon: true, damage, offset0, offset1 });
        super(specs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[2] * this._gltfScale[1], this.scale[1] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { BayonetItem };