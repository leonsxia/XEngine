import { IMAGE_NAMES } from "../../../../../systems/ui/uiConstants";
import { AMMOS, WEAPONS } from "../../../../utils/constants";
import { Ammo } from "../../../weapons/Ammo";
import { WeaponItem } from "./WeaponItem";

const GLTF_SRC = 'weapons/revolver.glb';

class SMGShortItem extends WeaponItem {

    static gltfModel;

    constructor(specs) {

        specs.width = .42;
        specs.height = .2;
        specs.depth = .26;
        specs.gltfScale = [.15, .15, .15];
        specs.gltfRotation = [- Math.PI / 2, 0, 0];
        specs.weaponType = WEAPONS.SMG_SHORT;
        specs.src = specs.src ?? GLTF_SRC;
        specs.imgName = IMAGE_NAMES.SMG_SHORT;

        const { count = 35, damage = 7, offset0 = - - 2, offset1 = 2 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.SMG, count, damage, offset0, offset1 });
        super(specs);

    }

    // async init() {

    //     await super.init();
    //     this.itemSize = 2;

    // }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[2] * this._gltfScale[1], this.scale[1] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { SMGShortItem };