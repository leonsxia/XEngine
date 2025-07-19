import { IMAGE_URLS } from "../../../../../systems/ui/uiConstants";
import { AMMOS, AMMUNITION } from "../../../../utils/constants";
import { Ammo } from "../../../weapons/Ammo";
import { AmmoBoxItem } from "./AmmoBoxItem";

const GLTF_SRC = 'pickable_items/ammunition/magnum_ammo_box.glb';

class MagnumAmmoBox extends AmmoBoxItem {

    static gltfModel;
    static imgUrl = IMAGE_URLS.MAGNUM_AMMO_BOX;

    constructor(specs) {

        specs.width = .2;
        specs.height = .2;
        specs.depth = .2;
        specs.gltfScale = [1.13, 1.13, 1.13];
        specs.ammoBoxType = AMMUNITION.MAGNUM_AMMO_BOX;
        specs.src = specs.src ?? GLTF_SRC;
        specs.capacity = 12;
        specs.imgUrl = MagnumAmmoBox.imgUrl;
        
        const { count = specs.capacity, damage = 60, offset0 = - 10, offset1 = 45 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.MAGNUM, count, damage, offset0, offset1 });
        super(specs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[1] * this._gltfScale[1], this.scale[2] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { MagnumAmmoBox };