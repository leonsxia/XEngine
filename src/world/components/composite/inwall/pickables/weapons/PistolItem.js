import { AMMOS, WEAPONS } from "../../../../utils/constants";
import { Ammo } from "../../../weapons/Ammo";
import { WeaponItem } from "./WeaponItem";

const GLTF_SRC = 'weapons/pistol.glb';

class PistolItem extends WeaponItem {

    static gltfModel;

    constructor(specs) {

        specs.width = .28;
        specs.height = .2;
        specs.depth = .165;
        specs.offsetX = -.57;
        specs.offsetY = -.15;
        specs.offsetZ = -.01;
        specs.gltfScale = [.15, .15, .15];
        specs.gltfRotation = [- Math.PI / 2, 0, 0];
        specs.weaponType = WEAPONS.PISTOL1;
        specs.src = specs.src ?? GLTF_SRC;

        const { count = 15, damage = 20, offset0 = - 5, offset1 = 5 } = specs.ammo ?? {};
        specs.ammoInstance = new Ammo({ type: AMMOS.PISTOL_9MM, count, damage, offset0, offset1 });
        super(specs);

    }

    setGLTFScale() {

        const modelScale = [this.scale[0] * this._gltfScale[0], this.scale[2] * this._gltfScale[1], this.scale[1] * this._gltfScale[2]];
        // update gltf scale
        this.gltf.setScale(modelScale);

    }

}

export { PistolItem };