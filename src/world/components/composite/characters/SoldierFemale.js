import { GLTFModel, Tofu } from '../../Models';
import { SOLDIER_FEMALE_CLIPS as CLIPS } from '../../utils/constants';
import { AnimateWorkstation } from '../../Animation/AnimateWorkstation';
import { Logger } from '../../../systems/Logger';

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
    TURN_WEIGHT: 0.7,
    QUICK_TURN_WEIGHT: 0.7,
    MELEE: .2,
    GUN_POINT: .2,
    INTERACT: .1
}

const DEBUG = true;

class SoldierFemale extends Tofu {

    gltf;
    mixer;
    clips = {};    
    actions = {};
    #logger = new Logger(DEBUG, SoldierFemale.name);

    AWS;

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetY = - .89, offsetZ = - .1 } = specs;

        super({ name, size: { width: .6, depth: .9, height: 1.78 } });

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, offsetZ, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);    
        
        this.group.add(this.gltf.group);

        this.showTofu(false);

    }

    async init() {

        await this.gltf.init();

        this.showSkeleton(false);

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: CLIPS });
        this.AWS.init();

    }

    showSkeleton(show) {

        if (this.gltf.skeleton) {

            this.gltf.skeleton.visible = show;

        }

    }

    // animation controls
    movingForward(val) {

        if (val) {

            if (this.accelerating) {

                if (this.attacking) {

                    if (this.meleeing) {

                        this.#logger.log(`melee attack up`);
    
                    } else if (this.gunPointing) {
    
                        this.#logger.log(`gun point up`);
    
                    }

                    this.#logger.log(`run in queue`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.RUN.nick];

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.RUN.nick], ANIMATION_SETTINGS.WALK_TO_RUN);

                } else {

                    this.#logger.log(`idle to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.RUN.nick], ANIMATION_SETTINGS.IDLE_TO_RUN);

                }

            } else if (this.attacking) {

                if (this.meleeing) {

                    this.#logger.log(`melee attack up`);

                } else if (this.gunPointing) {

                    this.#logger.log(`gun point up`);

                }

                this.#logger.log(`walk in queue`);
                this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, 1);

            } else if (!this.rotating) {

                this.#logger.log('idle to walk');
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_WALK);

            } else if (this.rotating) {

                this.#logger.log(`zero turn to walk turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.WALK_TURN_TO_ZERO_TURN, 1);

            }

        } else {
            
            if (this.accelerating) {

                if (this.attacking) {

                    if (this.rotating) {

                        this.#logger.log(`walk turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                        this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                    } else {

                        this.#logger.log(`idle in queue`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];
                        
                    }


                } else if (this.rotating) {

                    this.#logger.log(`run to zero turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.RUN_TO_WALK, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    this.#logger.log(`run to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.RUN_TO_IDLE);

                }

            } else if (this.attacking) {

                if (this.rotating) {

                    this.#logger.log(`walk turn in queue 2`);
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle in queue 2`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                }

            } else if (!this.rotating) {

                this.#logger.log(`walk to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.WALK_TO_IDLE);

            } else {

                this.#logger.log(`walk turn to zero turn`);
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

            }
            
        }      
        
        super.movingForward(val);

    }

    movingBackward(val) {

        if (val) {

            if (this.accelerating) {

                if (this.attacking) {

                    if (this.meleeing) {

                        this.#logger.log(`melee attack down`);
    
                    } else if (this.gunPointing) {
    
                        this.#logger.log(`gun point down`);
    
                    }

                    this.#logger.log(`quick turn in queue`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.QUICK_TURN_WEIGHT);

                } else if (!this.rotating) {

                    this.#logger.log(`quick turn 1`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_WALK, ANIMATION_SETTINGS.QUICK_TURN_WEIGHT);

                }

            } else {

                if (this.attacking) {

                    if (this.meleeing) {

                        this.#logger.log(`melee attack down`);
    
                    } else if (this.gunPointing) {
    
                        this.#logger.log(`gun point down`);
    
                    }

                    this.#logger.log(`walk backward in queue`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.BACK_WALK_WEIGHT);
                    this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to walk backward`);
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.BACK_WALK_WEIGHT);
                    this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

                } else {

                    this.#logger.log(`idle to walk backward`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_WALK, ANIMATION_SETTINGS.BACK_WALK_WEIGHT);
                    this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

                }
                
            }

        } else {

            if (this.attacking) {

                if (this.rotating) {

                    this.#logger.log(`walk turn in queue 3`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle in queue 3`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                }

            } else if (!this.rotating) {

                this.#logger.log(`walk back to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.WALK_TO_IDLE);

            } else {

                this.#logger.log(`walk back to turning`);
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT)

            }

            this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, 1);

        }

        super.movingBackward(val);

    }

    movingLeft(val) {

        if (val) {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    this.#logger.log(`left turn in queue`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle to left turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_TURN, ANIMATION_SETTINGS.TURN_WEIGHT);

                }

            }

        } else {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    this.#logger.log(`idle in queue 3`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                } else {

                    this.#logger.log(`left turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.TURN_TO_IDLE);

                }

            }
        }

        super.movingLeft(val);

    }

    movingRight(val) {

        if (val) {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    this.#logger.log(`right turn in queue`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle to right turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_TURN, ANIMATION_SETTINGS.TURN_WEIGHT);

                }

            }

        } else {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    this.#logger.log(`idle in queue 3`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                } else {

                    this.#logger.log(`right turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.TURN_TO_IDLE);

                }

            }
        }

        super.movingRight(val);

    }

    accelerate(val) {        

        if (val) {
            
            if (this.forward) {

                if (this.attacking) {

                    this.#logger.log(`run in queue 2`);
                    this.AWS.setActionEffectiveWeight(CLIPS.RUN.nick, 1);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.RUN.nick];

                } else {

                    this.#logger.log(`walk to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.RUN.nick], ANIMATION_SETTINGS.WALK_TO_RUN);

                }

            } else if (this.isBackward && !this.rotating) {

                this.#logger.log(`quick turn 2`);

            }
            
        } else {

            if (this.forward) {

                if (this.attacking) {

                    this.#logger.log(`walk in queue 2`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, 1);
                    
                } else {

                    this.#logger.log(`run to walk`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.RUN_TO_WALK);

                }

            } else if (this.backward) {

                this.#logger.log(`quick turn to walk back`);
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.BACK_WALK_WEIGHT).setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

            }

        }

        super.accelerate(val);

    }

    melee(val) {

        if (this.interacting || this.gunPointing) {

            return;

        }

        if (val) {

            if (this.forward) {

                this.#logger.log(`melee attack up`);

            } else if (this.backward) {

                this.#logger.log(`melee attack down`);

            }

            this.#logger.log(`melee attack!`);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[CLIPS.SWORD_SLASH.nick], ANIMATION_SETTINGS.MELEE, 1);

        } else {

            if (this.AWS.previousAction !== this.AWS.actions[CLIPS.INTERACT.nick] && 
                this.AWS.previousAction !== this.AWS.actions[CLIPS.IDLE_GUN_POINTING.nick]
            ) {

                this.#logger.log(`cancel melee attack!`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.SWORD_SLASH.nick], this.AWS.previousAction, ANIMATION_SETTINGS.MELEE, this.AWS.previousAction.weight);

            }

        }

        super.melee(val);

    }

    gunPoint(val) {

        if (this.interacting || this.meleeing) {

            return;

        }

        if (val) {

            if (this.forward) {

                this.#logger.log(`gun point up`);

            } else if (this.backward) {

                this.#logger.log(`gun point down`);

            }

            this.#logger.log(`gun point!`);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[CLIPS.IDLE_GUN_POINTING.nick], ANIMATION_SETTINGS.GUN_POINT, 1);

        } else {

            if (this.AWS.previousAction !== this.AWS.actions[CLIPS.INTERACT.nick] &&
                this.AWS.previousAction !== this.AWS.actions[CLIPS.SWORD_SLASH.nick]
            ) {

                this.#logger.log(`cancel gun point!`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE_GUN_POINTING.nick], this.AWS.previousAction, ANIMATION_SETTINGS.GUN_POINT, this.AWS.previousAction.weight);

            }

        }

        super.gunPoint(val);

    }

    interact(val) {

        if (this.attacking) {

            return;

        }

        if (val) {

            const endCallback = () => {

                super.interact(false);

            }

            this.#logger.log(`interact !`);
            this.AWS.prepareCrossFade(null, this.AWS.actions[CLIPS.INTERACT.nick], ANIMATION_SETTINGS.INTERACT, 1, false, false, ANIMATION_SETTINGS.INTERACT, endCallback);

        } else if (this.AWS.isLooping) {

            return;

        }

        super.interact(val);

    }

    finalTick(delta) {

        this.AWS.mixer.update(delta);

    }

}

export { SoldierFemale };