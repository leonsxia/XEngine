import { IMAGE_NAMES } from "../../../../../systems/ui/uiConstants";
import { AMMOS, WEAPONS } from "../../../../utils/constants";
import { PICKABLE_ITEM_NAMES } from "../../../../utils/documentary";
import { Ammo } from "../../../weapons/Ammo";
import { WeaponItem } from "./WeaponItem";

const GLTF_SRC = 'weapons/bayonet.glb';

class BayonetItem extends WeaponItem {

    static gltfModel;
    static imgName = IMAGE_NAMES.BAYONET;

    constructor(specs) {

        specs.width = .28;
        specs.height = .2;
        specs.depth = .06;
        specs.gltfScale = [.25, .25, .25];
        specs.gltfRotation = [- Math.PI / 2, 0, 0];
        specs.weaponType = WEAPONS.BAYONET;
        specs.src = specs.src ?? GLTF_SRC;
        specs.imgName = BayonetItem.imgName;
        specs.descriptionJsonItem = PICKABLE_ITEM_NAMES.BAYONET_ITEM;

        const { damage = 30, offset0 = - 10, offset1 = 10, count = 1 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.BAYONET, isMeleeWeapon: true, damage, offset0, offset1, count });
        super(specs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[2] * this._gltfScale[1], this.scale[1] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { BayonetItem };