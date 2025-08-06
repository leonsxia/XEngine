import { IMAGE_NAMES } from "../../../../../systems/ui/uiConstants";
import { AMMOS, AMMUNITION } from "../../../../utils/constants";
import { PICKABLE_ITEM_NAMES } from "../../../../utils/documentary";
import { Ammo } from "../../../weapons/Ammo";
import { AmmoBoxItem } from "./AmmoBoxItem";

const GLTF_SRC = 'pickable_items/ammunition/pistol_ammo_box.glb';

class PistolAmmoBox extends AmmoBoxItem {

    static gltfModel;

    constructor(specs) {

        specs.width = .2;
        specs.height = .2;
        specs.depth = .12;
        specs.gltfScale = [.1, .1, .1];
        specs.gltfRotation = [0, Math.PI / 2, 0];
        specs.ammoBoxType = AMMUNITION.PISTOL_AMMO_BOX;
        specs.src = specs.src ?? GLTF_SRC;
        specs.capacity = 60;
        specs.imgName = IMAGE_NAMES.PISTOL_AMMO_BOX;
        specs.descriptionJsonItem = PICKABLE_ITEM_NAMES.PISTOL_AMMO_BOX_ITEM;
        
        const { count = specs.capacity, damage = 20, offset0 = - 5, offset1 = 5 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.PISTOL_9MM, count, damage, offset0, offset1 });
        super(specs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[2] * this._gltfScale[0], this.scale[1] * this._gltfScale[1], this.scale[0] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { PistolAmmoBox };