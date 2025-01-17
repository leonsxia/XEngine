import { GLTFModel, Tofu } from '../../Models';
import { SOLDIER_FEMALE_CLIPS as CLIPS } from '../../utils/constants';
import { AnimateWorkstation } from '../../Animation/AnimateWorkstation';

const GLTF_SRC = 'characters/soldier_female.glb';
const ANIMATION_SETTINGS = {
    IDLE_TO_WALK: 0.1,
    IDLE_TO_RUN: 0.2,
    WALK_TO_RUN: 0.2,
    WALK_TO_IDLE: 0.3,    
    RUN_TO_IDLE: 0.3,
    RUN_TO_WALK: 0.2,
    IDLE_TO_TURN: 0.1,
    TURN_TO_IDLE: 0.1,
    WALK_TURN_TO_ZERO_TURN: 0.3,
    RUN_TURN_TO_ZERO_TURN: 0.3,
    BACK_WALK_WEIGHT: 0.7,
    TURN_WEIGHT: 0.5,
    QUICK_TURN_WEIGHT: 0.7
}

class SoldierFemale extends Tofu {

    gltf;
    mixer;
    clips = {};    
    actions = {};

    AWS;

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetY = - .89 } = specs;

        super({ name, size: { width: .7, depth: .9, height: 1.78 } });

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);    
        
        this.group.add(this.gltf.group);

        this.showTofu(false);

    }

    async init() {

        await this.gltf.init();

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: CLIPS });
        this.AWS.init();

    }    

    // animation controls
    movingForward(val) {        

        if (val) {

            if (this.accelerating) {

                if (this.rotating) {

                    console.log(`walk turn to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.RUN.nick], ANIMATION_SETTINGS.WALK_TO_RUN);

                } else {

                    console.log(`idle to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.RUN.nick], ANIMATION_SETTINGS.IDLE_TO_RUN);

                }

            } else if (!this.rotating) {

                console.log('idle to walk');
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_WALK);

            } else {

                console.log(`zero turn to walk turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.WALK_TURN_TO_ZERO_TURN, 1);

            }

        } else {
            
            if (this.accelerating) {

                if (this.rotating) {

                    console.log(`run to zero turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.RUN_TO_WALK, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    console.log(`run to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.RUN_TO_IDLE);

                }

            } else if (!this.rotating) {

                console.log(`walk to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.WALK_TO_IDLE);

            } else {

                console.log(`walk turn to zero turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.WALK_TURN_TO_ZERO_TURN, ANIMATION_SETTINGS.TURN_WEIGHT);

            }
            
        }      
        
        super.movingForward(val);

    }

    movingBackward(val) {

        if (val) {

            if (this.accelerating && !this.rotating) {

                console.log(`quick turn 1`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_WALK, ANIMATION_SETTINGS.QUICK_TURN_WEIGHT);

            } else {

                console.log(`idle to walk backward`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_WALK, ANIMATION_SETTINGS.BACK_WALK_WEIGHT);
                this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);
                
            }

        } else {

            if (!this.rotating) {

                console.log(`walk back to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.WALK_TO_IDLE);                

            } else {

                console.log(`walk back to turning`);
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, 1).setActionEffectiveTimeScale(CLIPS.WALK.nick, 1);

            }

        }

        super.movingBackward(val);

    }

    movingLeft(val) {

        if (val) {

            if (!this.forward && !this.backward) {

                console.log(`idle to left turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_TURN, ANIMATION_SETTINGS.TURN_WEIGHT);

            }

        } else {

            if (!this.forward && !this.backward) {

                console.log(`left turn to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.TURN_TO_IDLE);

            }
        }

        super.movingLeft(val);

    }

    movingRight(val) {

        if (val) {

            if (!this.forward && !this.backward) {

                console.log(`idle to right turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_TURN, ANIMATION_SETTINGS.TURN_WEIGHT);

            }

        } else {

            if (!this.forward && !this.backward) {

                console.log(`right turn to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.TURN_TO_IDLE);

            }
        }

        super.movingRight(val);

    }

    accelerate(val) {        

        if (val) {
            
            if (this.forward) {

                console.log(`walk to run`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.RUN.nick], ANIMATION_SETTINGS.WALK_TO_RUN);

            } else if (this.isBackward && !this.rotating) {

                console.log(`quick turn 2`);

            }
            
        } else {

            if (this.forward) {

                console.log(`run to walk`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.RUN_TO_WALK);

            } else if (this.backward) {

                console.log(`quick turn to walk back`);
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.BACK_WALK_WEIGHT).setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

            } else if (!this.rotating) {

                console.log(`run to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.RUN_TO_IDLE);

            }

        }

        super.accelerate(val);

    }

    finalTick(delta) {

        this.AWS.mixer.update(delta);

    }

}

export { SoldierFemale };