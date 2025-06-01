import { Logger } from "../../../systems/Logger";
import { Tofu } from "../../Models";

const DEBUG = true;

class EnemyBase extends Tofu {

    specs;

    isActive = true;
    isAttacking = false;
    target = null;

    gltf;

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(DEBUG, 'EnemyBase');

    constructor(specs) {

        const { name } = specs;
        // const { src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        // const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8, sovRadius = Math.max(width, width2, depth, depth2, height) } = specs;
        const { rotateR = .9, vel = 1.34, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5 } = specs;
        // const { clips, animationSetting } = specs;
        // const { scale = [1, 1, 1] } = specs;
        const { isActive = true } = specs;

        super({ name, size: { width, width2, depth, depth2, height, sovRadius }, rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge });

        this.specs = specs;
        this.isActive = isActive;

        // basic gltf model
        // const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow, hasBones };

        // gltf model
        // this.gltf = new GLTFModel(gltfSpecs);
        // super.setScale(scale);

        this.showBS(true);

    }

    async init() {
        // todo
    }

}

export { EnemyBase };