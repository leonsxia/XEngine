import { IMAGE_NAMES } from "../../../../../../systems/ui/uiConstants";
import { FIRST_AID_KIT } from "../../../../../utils/constants";
import { PICKABLE_ITEM_NAMES } from "../../../../../utils/documentary";
import { FirstAidKitBase } from "./FirstAidKitBase";

const GLTF_SRC = 'pickable_items/health/first_aid_kit_small.glb';

class FirstAidKitSmall extends FirstAidKitBase {

    static gltfModel;

    healCapacity = 30;

    constructor(specs) {

        const superSpecs = {
            width: .192,
            height: .2,
            depth: .088,
            gltfScale: [.2, .2, .2],
            healthType: FIRST_AID_KIT.FIRST_AID_KIT_SMALL,
            imgName: IMAGE_NAMES.FIRST_AID_KIT_SMALL,
            smallSrc: GLTF_SRC,
            descriptionJsonItem: PICKABLE_ITEM_NAMES.FIRST_AID_KIT_SMALL
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

export { FirstAidKitSmall };