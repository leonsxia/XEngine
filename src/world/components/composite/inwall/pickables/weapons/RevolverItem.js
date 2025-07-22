import { IMAGE_NAMES } from "../../../../../systems/ui/uiConstants";
import { AMMOS, WEAPONS } from "../../../../utils/constants";
import { Ammo } from "../../../weapons/Ammo";
import { WeaponItem } from "./WeaponItem";

const GLTF_SRC = 'weapons/revolver.glb';

class RevolverItem extends WeaponItem {

    static gltfModel;

    constructor(specs) {

        specs.width = .37;
        specs.height = .2;
        specs.depth = .185;
        specs.gltfScale = [.19, .19, .19];
        specs.gltfRotation = [- Math.PI / 2, 0, 0];
        specs.weaponType = WEAPONS.REVOLVER;
        specs.src = specs.src ?? GLTF_SRC;
        specs.imgName = IMAGE_NAMES.REVOLVER;

        const { count = 6, damage = 60, offset0 = - 10, offset1 = 45 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.MAGNUM, count, damage, offset0, offset1 });
        super(specs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[2] * this._gltfScale[1], this.scale[1] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { RevolverItem };