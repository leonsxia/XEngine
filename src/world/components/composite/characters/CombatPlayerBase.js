import { GLTFModel, Tofu } from '../../Models';
import { AnimateWorkstation } from '../../Animation/AnimateWorkstation';
import { Logger } from '../../../systems/Logger';

const DEBUG = true;
const CLIPS = {};
const ANIMATION_SETTINGS = {};

class CombatPlayerBase extends Tofu {

    gltf;

    #logger = new Logger(DEBUG, 'CombatPlayerBase');

    AWS;

    _tempAction;

    constructor(specs) {

        const { name, src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { width = .9, depth = .9, height = 1.8 } = specs;
        const { rotateR = .9, vel = 1.34, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5 } = specs;
        const {clips, animationSetting} = specs;

        super({ name, size: { width, depth, height }, rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge });

        Object.assign(CLIPS, clips);
        Object.assign(ANIMATION_SETTINGS, animationSetting);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);    
        
        this.group.add(this.gltf.group);

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

        this.#logger.func = this.movingForward.name;

        if (val) {

            if (this.accelerating) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache run for cancel gun pointing -- gun shoot up`);
                        this._tempAction = this.AWS.actions[CLIPS.RUN.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack up`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point up`);

                        }

                        this.#logger.log(`run in queue`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.RUN.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.RUN.nick, 1);

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.RUN.nick], ANIMATION_SETTINGS.WALK_TO_RUN);

                } else {

                    this.#logger.log(`idle to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.RUN.nick], ANIMATION_SETTINGS.IDLE_TO_RUN);

                }

            } else if (this.attacking) {

                if (this.shooting) {

                    this.#logger.log(`cache walk for cancel gun pointing -- gun shoot up`);
                    this._tempAction = this.AWS.actions[CLIPS.WALK.nick];

                } else {

                    if (this.meleeing) {

                        this.#logger.log(`melee attack up`);

                    } else if (this.gunPointing) {

                        this.#logger.log(`gun point up`);

                    }

                    this.#logger.log(`walk in queue`);
                    this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];

                } 
                
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

                        if (this.shooting) {

                            this.#logger.log(`cache walk turn for gun pointing`);
                            this._tempAction = this.AWS.actions[CLIPS.WALK.nick];
    
                        } else {

                            this.#logger.log(`walk turn in queue`);
                            this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];
                            
                        }

                        this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                    } else {

                        if (this.shooting) {

                            this.#logger.log(`cache idle for gun pointing`);
                            this._tempAction = this.AWS.actions[CLIPS.IDLE.nick];

                        } else {

                            this.#logger.log(`idle in queue`);
                            this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                        }

                        this.AWS.setActionEffectiveWeight(CLIPS.IDLE.nick, 1);
                        
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

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for gun pointing 2`);
                        this._tempAction = this.AWS.actions[CLIPS.WALK.nick];

                    }

                } else {

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for gun pointing 3`);
                        this._tempAction = this.AWS.actions[CLIPS.IDLE.nick];
                        
                    } else {

                        this.#logger.log(`idle in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.IDLE.nick, 1);

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

        this.#logger.func = this.movingBackward.name;

        if (val) {

            if (this.accelerating) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache quick turn for cancel gun pointing -- gun shoot down`);
                        this._tempAction = this.AWS.actions[CLIPS.WALK.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack down`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point down`);

                        }

                        this.#logger.log(`quick turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.QUICK_TURN_WEIGHT);

                } else if (!this.rotating) {

                    this.#logger.log(`quick turn 1`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_WALK, ANIMATION_SETTINGS.QUICK_TURN_WEIGHT);

                } else {

                    this.#logger.log(`back walk turn`);
                    this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

                }

            } else {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache walk backward for cancel gun pointing -- gun shoot down`);
                        this._tempAction = this.AWS.actions[CLIPS.WALK.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack down`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point down`);

                        }

                        this.#logger.log(`walk backward in queue`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.BACK_WALK_WEIGHT)
                            .setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to walk backward`);
                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.BACK_WALK_WEIGHT)
                        .setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

                } else {

                    this.#logger.log(`idle to walk backward`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_WALK, ANIMATION_SETTINGS.BACK_WALK_WEIGHT);
                    this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

                }
                
            }

        } else {

            if (this.attacking) {

                if (this.rotating) {

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[CLIPS.WALK.nick];

                    } else {

                        this.#logger.log(`walk turn in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[CLIPS.IDLE.nick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.IDLE.nick, 1);

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

        this.#logger.func = this.movingLeft.name;

        if (val) {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {
                        
                        this.#logger.log(`cache left walk turn for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[CLIPS.WALK.nick];

                    } else {
                        
                        this.#logger.log(`left turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle to left turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_TURN, ANIMATION_SETTINGS.TURN_WEIGHT);

                }

            } else if (this.backward) {

                this.#logger.log(`left back walk turn`);
                this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

            }

        } else {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[CLIPS.IDLE.nick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.IDLE.nick, 1);

                } else {

                    this.#logger.log(`left turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.TURN_TO_IDLE);

                }

            }
        }

        super.movingLeft(val);

    }

    movingRight(val) {

        this.#logger.func = this.movingRight.name;

        if (val) {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache right walk turn for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[CLIPS.WALK.nick];

                    } else {

                        this.#logger.log(`right turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle to right turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.IDLE_TO_TURN, ANIMATION_SETTINGS.TURN_WEIGHT);

                }

            } else if (this.backward) {

                this.#logger.log(`right back walk turn`);
                this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

            }

        } else {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[CLIPS.IDLE.nick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.IDLE.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.IDLE.nick, 1);

                } else {

                    this.#logger.log(`right turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], ANIMATION_SETTINGS.TURN_TO_IDLE);

                }

            }
        }

        super.movingRight(val);

    }

    accelerate(val) {       
        
        this.#logger.func = this.accelerate.name;

        if (val) {
            
            if (this.forward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache run for gun point after cancel shooting`);
                        this._tempAction = this.AWS.actions[CLIPS.RUN.nick];

                    } else if (this.gunPointing || this.meleeing) {

                        this.#logger.log(`run in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.RUN.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.RUN.nick, 1);

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

                    if (this.shooting) {

                        this.#logger.log(`cache walk for gun point after cancel shooting`);
                        this._tempAction = this.AWS.actions[CLIPS.WALK.nick];
                        

                    } else if (this.gunPointing || this.meleeing) {

                        this.#logger.log(`walk in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[CLIPS.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, 1);
                    
                } else {

                    this.#logger.log(`run to walk`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.WALK.nick], ANIMATION_SETTINGS.RUN_TO_WALK);

                }

            } else if (this.backward) {

                this.#logger.log(`quick turn to walk back`);
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, ANIMATION_SETTINGS.BACK_WALK_WEIGHT)
                    .setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

            }

        }

        super.accelerate(val);

    }

    melee(val) {

        this.#logger.func = this.melee.name;

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

        } else if (this.meleeing) {

            this.#logger.log(`cancel melee attack!`);
            this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.SWORD_SLASH.nick], this.AWS.previousAction, ANIMATION_SETTINGS.MELEE, this.AWS.previousAction.weight);

        }

        super.melee(val);

    }

    gunPoint(val) {

        this.#logger.func = this.gunPoint.name;

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

        } else if (this.gunPointing) {

            this.#logger.log(`cancel gun point!`);

            if (this.shooting) {

                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE_GUN_SHOOT.nick], this._tempAction, ANIMATION_SETTINGS.GUN_POINT, this._tempAction.weight);
                super.shoot(false);

            } else {

                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE_GUN_POINTING.nick], this.AWS.previousAction, ANIMATION_SETTINGS.GUN_POINT, this.AWS.previousAction.weight);

            }

        }

        super.gunPoint(val);

    }

    shoot(val) {

        this.#logger.func = this.shoot.name;

        if (this.gunPointing) {

            if (val) {

                this.#logger.log(`cache previous action for gun pointing`);
                this._tempAction = this.AWS.previousAction;

                if (this.forward) {

                    this.#logger.log(`gun shooting up`);
    
                } else if (this.backward) {
    
                    this.#logger.log(`gun shooting down`);
    
                }
    
                this.#logger.log(`gun shoot!`);
                this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[CLIPS.IDLE_GUN_SHOOT.nick], ANIMATION_SETTINGS.SHOOT, 1);                

            } else if (this.shooting) {

                this.#logger.log(`cancel gun shoot!`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE_GUN_SHOOT.nick], this.AWS.actions[CLIPS.IDLE_GUN_POINTING.nick], ANIMATION_SETTINGS.SHOOT, this.AWS.previousAction.weight);
                this.#logger.log(`restore cached previous action for gun pointing`);
                this.AWS.previousAction = this._tempAction;

            }

            super.shoot(val);

        } else {

            return;

        }

    }

    interact(val) {

        this.#logger.func = this.interact.name;

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

export { CombatPlayerBase };