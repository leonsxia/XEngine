import { IMAGE_URLS } from "../../../../../systems/ui/uiConstants";
import { AMMOS, WEAPONS } from "../../../../utils/constants";
import { Ammo } from "../../../weapons/Ammo";
import { WeaponItem } from "./WeaponItem";

const GLTF_SRC = 'weapons/glock19.glb';

class GlockItem extends WeaponItem {

    static gltfModel;
    static imgUrl = IMAGE_URLS.GLOCK19;

    constructor(specs) {

        specs.width = .26;
        specs.height = .2;
        specs.depth = .18;
        specs.gltfScale = [.025, .025, .025];
        specs.gltfRotation = [0, Math.PI / 2, - Math.PI / 2];
        specs.weaponType = WEAPONS.GLOCK;
        specs.src = specs.src ?? GLTF_SRC;
        specs.imgUrl = GlockItem.imgUrl;

        const { count = 20, damage = 18, offset0 = - 5, offset1 = 10 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.PISTOL_9MM, count, damage, offset0, offset1 });
        super(specs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[1] * this._gltfScale[0], this.scale[2] * this._gltfScale[1], this.scale[0] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { GlockItem };