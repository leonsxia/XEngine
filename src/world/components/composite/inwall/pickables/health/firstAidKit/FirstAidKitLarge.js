import { IMAGE_NAMES } from "../../../../../../systems/ui/uiConstants";
import { FIRST_AID_KIT } from "../../../../../utils/constants";
import { FirstAidKitBase } from "./FirstAidKitBase";

const GLTF_SRC = 'pickable_items/health/first_aid_kit_large.glb';

class FirstAidKitLarge extends FirstAidKitBase {

    static gltfModel;

    healCapacity = 100;

    constructor(specs) {

        const superSpecs = {
            width: .283,
            height: .2,
            depth: .192,
            gltfScale: [.15, .15, .15],
            gltfRotation: [- Math.PI / 2, 0, 0],
            healthType: FIRST_AID_KIT.FIRST_AID_KIT_LARGE,
            imgName: IMAGE_NAMES.FIRST_AID_KIT_LARGE,
            srcLarge: GLTF_SRC
        }
        Object.assign(superSpecs, specs);
        
        super(superSpecs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[2] * this._gltfScale[1], this.scale[1] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { FirstAidKitLarge };