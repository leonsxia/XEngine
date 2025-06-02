import { Logger } from "../../../systems/Logger";
import { Tofu } from "../../Models";
import { BS, AI as AICodes } from "../../basic/colorBase";
import { polarity } from "../../utils/enums";

const DEBUG = true;

class EnemyBase extends Tofu {

    specs;

    isActive = true;
    isNoticed = false;
    isAttacking = false;

    gltf;

    #logger = new Logger(DEBUG, 'EnemyBase');

    constructor(specs) {

        const { name } = specs;
        // const { src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        // const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8, sovRadius = Math.max(width, width2, depth, depth2, height) } = specs;
        const { rotateR = .9, vel = 0.7, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5 } = specs;
        // const { clips, animationSetting } = specs;
        // const { scale = [1, 1, 1] } = specs;
        const { isActive = true, showBS = false } = specs;

        super({ name, size: { width, width2, depth, depth2, height, sovRadius }, rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge });

        this.specs = specs;
        this.isActive = isActive;

        // basic gltf model
        // const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow, hasBones };

        // gltf model
        // this.gltf = new GLTFModel(gltfSpecs);
        // super.setScale(scale);

        this.showBS(showBS);

    }

    async init() {
        // todo
    }

    movingForward(val) {

        if (val) {

            if (!this.forward) {

                super.movingForward(true);

            }

        } else {

            if (this.forward) {

                super.movingForward(false);

            }

        }

    }

    movingLeft(val) {

        if (val) {

            if (this.turningRight) {

                this.movingRight(false);

            }
            
            if (!this.turningLeft) {

                super.movingLeft(true);

            }

        } else {

            if (this.turningLeft) {

                super.movingLeft(false);

            }

        }

    }

    movingRight(val) {

        if (val) {

            if (this.turningLeft) {

                this.movingLeft(false);

            }

            if (!this.turningRight) {

                super.movingRight(true);

            }
            
        } else {

            if (this.turningRight) {

                super.movingRight(false);

            }

        }

    }

    onSovSphereTriggerEnter(target) {

        this.#logger.func = this.onSovSphereTriggerEnter.name;
        this.#logger.log(`Enemy ${this.name} sov sphere trigger entered by ${target.name}`);

        if (this._inSightTargets.length === 1) {

            this.isNoticed = true;
            this.sovBoundingSphereMesh.material.color.setHex(AICodes.targetInRange);

        }
        
    }

    onSovSphereTriggerExit(target) {

        this.#logger.func = this.onSovSphereTriggerExit.name;
        this.#logger.log(`${target.name} exited Enemy ${this.name}'s sov sphere trigger`);

        if (this._inSightTargets.length === 0) {

            this.isNoticed = false;
            this.sovBoundingSphereMesh.material.color.setHex(BS);

        }

    }

    movingTick() {

        this.#logger.func = this.movingTick.name;

        if (this.isNoticed) {

            this._target = this.getNearestInSightTarget(null, this._inSightTargets, false);
            const dirAngle = this.getTargetDirectionAngle(this._target);

            if (dirAngle.angle < 0.01) {

                this.movingLeft(false);
                this.movingRight(false);

            } else if (dirAngle.direction === polarity.left) {

                this.movingLeft(true);

            } else {

                this.movingRight(true);

            }

            this.movingForward(true);

        } else {

            this.movingLeft(false);
            this.movingRight(false);
            this.movingForward(false);

        }

    }

}

export { EnemyBase };