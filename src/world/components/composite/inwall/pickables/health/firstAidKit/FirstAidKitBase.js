import { GLTFModel } from "../../../../../Models";
import { FIRST_AID_KIT } from "../../../../../utils/constants";
import { SubCombinableItem } from "../../SubCombinableItem";

class FirstAidKitBase extends SubCombinableItem {

    constructor(specs) {

        super(specs);

        const { name, gltfRotation = [0, 0, 0], receiveShadow = true, castShadow = true } = specs;
        let src;
        switch(this.type) {

            case FIRST_AID_KIT.FIRST_AID_KIT_LARGE:

                src = specs.largeSrc;
                break;

            case FIRST_AID_KIT.FIRST_AID_KIT_MEDIUM:

                src = specs.mediumSrc;
                break;

            case FIRST_AID_KIT.FIRST_AID_KIT_SMALL:

                src = specs.smallSrc;
                break;
                
        }                

        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };        
        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setRotation(gltfRotation);
        
        this.update(false);

    }    

}

export { FirstAidKitBase };