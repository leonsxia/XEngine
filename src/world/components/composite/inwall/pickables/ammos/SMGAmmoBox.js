import { IMAGE_NAMES } from "../../../../../systems/ui/uiConstants";
import { AMMOS, AMMUNITION } from "../../../../utils/constants";
import { Ammo } from "../../../weapons/Ammo";
import { AmmoBoxItem } from "./AmmoBoxItem";

const GLTF_SRC = 'pickable_items/ammunition/smg_ammo_box.glb';

class SMGAmmoBox extends AmmoBoxItem {

    static gltfModel;
    static imgName = IMAGE_NAMES.SMG_AMMO_BOX;

    constructor(specs) {

        specs.width = .27;
        specs.height = .28;
        specs.depth = .18;
        specs.gltfScale = [0.08, 0.08, 0.08];
        specs.ammoBoxType = AMMUNITION.SMG_AMMO_BOX;
        specs.src = specs.src ?? GLTF_SRC;
        specs.capacity = 100;
        specs.imgName = SMGAmmoBox.imgName;
        
        const { count = specs.capacity, damage = 7, offset0 = - 2, offset1 = 2 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.SMG, count, damage, offset0, offset1 });
        super(specs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[1] * this._gltfScale[1], this.scale[2] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { SMGAmmoBox };