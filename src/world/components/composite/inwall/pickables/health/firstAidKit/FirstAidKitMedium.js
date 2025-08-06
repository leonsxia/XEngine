import { IMAGE_NAMES } from "../../../../../../systems/ui/uiConstants";
import { FIRST_AID_KIT } from "../../../../../utils/constants";
import { PICKABLE_ITEM_NAMES } from "../../../../../utils/documentary";
import { FirstAidKitBase } from "./FirstAidKitBase";

const GLTF_SRC = 'pickable_items/health/first_aid_kit_medium.glb';

class FirstAidKitMedium extends FirstAidKitBase {

    static gltfModel;

    healCapacity = 55;

    constructor(specs) {

        const superSpecs = {
            width: .233,
            height: .2083,
            depth: .1083,
            gltfScale: [.15, .15, .15],
            healthType: FIRST_AID_KIT.FIRST_AID_KIT_MEDIUM,
            imgName: IMAGE_NAMES.FIRST_AID_KIT_MEDIUM,
            srcMedium: GLTF_SRC,
            descriptionJsonItem: PICKABLE_ITEM_NAMES.FIRST_AID_KIT_MEDIUM
        }
        Object.assign(superSpecs, specs);

        super(superSpecs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[1] * this._gltfScale[1], this.scale[2] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { FirstAidKitMedium };