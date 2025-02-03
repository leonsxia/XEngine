import { GLTFModel, Tofu } from '../../Models';
import { AnimateWorkstation } from '../../Animation/AnimateWorkstation';
import { Logger } from '../../../systems/Logger';

const DEBUG = true;

class CombatPlayerBase extends Tofu {

    specs;

    gltf;

    #logger = new Logger(DEBUG, 'CombatPlayerBase');

    AWS;

    weapons = {};

    _clips = {};
    _animationSettings = {};

    _tempAction;

    _idleNick;
    idleNick;
    armedIdleNick;

    _armedWeapon;
    _meleeWeapon;

    constructor(specs) {

        const { name, src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8 } = specs;
        const { rotateR = .9, vel = 1.34, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5 } = specs;
        const { clips, animationSetting } = specs;
        const { scale = [1, 1, 1] } = specs;

        super({ name, size: { width, width2, depth, depth2, height }, rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge });

        this.specs = specs;
        
        Object.assign(this._clips, clips);
        Object.assign(this._animationSettings, animationSetting);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        super.setScale(scale);
        
        this.group.add(this.gltf.group);

    }

    async init() {

        await this.gltf.init();

        this.showSkeleton(false);

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: this._clips });
        this.AWS.init();

    }

    setupWeaponScale() {

        const { scale = [1, 1, 1] } = this.specs;

        for (const item in this.weapons) {

            const weaponItem = this.weapons[item];

            weaponItem.group.scale.x *= scale[0];
            weaponItem.group.scale.y *= scale[1];
            weaponItem.group.scale.z *= scale[2];

        }

    }

    armWeapon(armedWeapon, idleName) {

        if (armedWeapon) {

            this.switchWeapon(armedWeapon);
            this.switchIdleAction(idleName);
            this._armedWeapon = armedWeapon;

        } else {

            this.switchWeapon();
            this.switchIdleAction(idleName);

        }

    }

    switchIdleAction(idleName, needToSetState = true) {

        this.AWS.setActionEffectiveWeight(this._idleNick, 0);
        this.AWS.setActionEffectiveWeight(idleName, 1);
        this.AWS.actions[idleName].play();

        if (needToSetState) {

            this.AWS.previousAction = this.AWS.activeAction = this.AWS.actions[idleName];

        }

        this._idleNick = idleName;
        
    }

    switchWeapon(weapon) {

        if (!weapon) {

            this._armedWeapon = null;

            for (const item in this.weapons) {

                const weaponItem = this.weapons[item];
                weaponItem.group.visible = false;

            }
            
            return;

        }

        for (const item in this.weapons) {

            const weaponItem = this.weapons[item];
            const { group } = weaponItem;

            if (weaponItem === weapon) {

                group.visible = true;

            } else {

                group.visible = false;

            }

        }

    }

    showArmedWeapon(show) {

        if (this._armedWeapon) {

            this._armedWeapon.group.visible = show;

        }

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
                        this._tempAction = this.AWS.actions[this._clips.RUN.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack up`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point up`);

                        }

                        this.#logger.log(`run in queue`);
                        this.AWS.previousAction = this.AWS.actions[this._clips.RUN.nick];

                    }

                    this.AWS.setActionEffectiveWeight(this._clips.RUN.nick, 1);

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._clips.WALK.nick], this.AWS.actions[this._clips.RUN.nick], this._animationSettings.WALK_TO_RUN);

                } else {

                    this.#logger.log(`idle to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._idleNick], this.AWS.actions[this._clips.RUN.nick], this._animationSettings.IDLE_TO_RUN);

                }

            } else if (this.attacking) {

                if (this.shooting) {

                    this.#logger.log(`cache walk for cancel gun pointing -- gun shoot up`);
                    this._tempAction = this.AWS.actions[this._clips.WALK.nick];

                } else {

                    if (this.meleeing) {

                        this.#logger.log(`melee attack up`);

                    } else if (this.gunPointing) {

                        this.#logger.log(`gun point up`);

                    }
                    
                    this.#logger.log(`walk in queue`);
                    this.AWS.previousAction = this.AWS.actions[this._clips.WALK.nick];

                }

                this.AWS.actions[this._clips.WALK.nick].callback = () => {

                    this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, 1);

                };                

            } else if (!this.rotating) {

                this.#logger.log('idle to walk');
                this.AWS.prepareCrossFade(this.AWS.actions[this._idleNick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.IDLE_TO_WALK);

            } else if (this.rotating) {

                this.#logger.log(`zero turn to walk turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[this._clips.WALK.nick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.WALK_TURN_TO_ZERO_TURN, 1);

            }

        } else {
            
            if (this.accelerating) {

                if (this.attacking) {

                    if (this.rotating) {                        

                        if (this.shooting) {

                            this.#logger.log(`cache walk turn for gun pointing`);
                            this._tempAction = this.AWS.actions[this._clips.WALK.nick];
    
                        } else {

                            this.#logger.log(`walk turn in queue`);
                            this.AWS.previousAction = this.AWS.actions[this._clips.WALK.nick];
                            
                        }

                        this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

                    } else {

                        if (this.shooting) {

                            this.#logger.log(`cache idle for gun pointing`);
                            this._tempAction = this.AWS.actions[this._idleNick];

                        } else {

                            this.#logger.log(`idle in queue`);
                            this.AWS.previousAction = this.AWS.actions[this._idleNick];

                        }

                        this.AWS.setActionEffectiveWeight(this._idleNick, 1);
                        
                    }

                } else if (this.rotating) {

                    this.#logger.log(`run to zero turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._clips.RUN.nick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.RUN_TO_WALK, this._animationSettings.TURN_WEIGHT);

                } else {

                    this.#logger.log(`run to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._clips.RUN.nick], this.AWS.actions[this._idleNick], this._animationSettings.RUN_TO_IDLE);

                }

            } else if (this.attacking) {

                if (this.rotating) {

                    this.#logger.log(`walk turn in queue 2`);

                    this.AWS.actions[this._clips.WALK.nick].callback = () => {

                        this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

                    };                    

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for gun pointing 2`);
                        this._tempAction = this.AWS.actions[this._clips.WALK.nick];

                    }

                } else {

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for gun pointing 3`);
                        this._tempAction = this.AWS.actions[this._idleNick];
                        
                    } else {

                        this.#logger.log(`idle in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[this._idleNick];

                    }

                    this.AWS.setActionEffectiveWeight(this._idleNick, 1);

                }

            } else if (!this.rotating) {

                this.#logger.log(`walk to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[this._clips.WALK.nick], this.AWS.actions[this._idleNick], this._animationSettings.WALK_TO_IDLE);

            } else {

                this.#logger.log(`walk turn to zero turn`);
                this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

            }
            
        }      
        
        super.movingForward(val);

    }

    movingBackward(val) {

        this.#logger.func = this.movingBackward.name;

        if (val) {

            if (this.accelerating) {

                if (this.attacking && !this.rotating) {

                    if (this.shooting) {

                        this.#logger.log(`cache quick turn for cancel gun pointing -- gun shoot down`);
                        this._tempAction = this.AWS.actions[this._clips.WALK.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack down`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point down`);

                        }

                        this.#logger.log(`quick turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[this._clips.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.QUICK_TURN_WEIGHT);
                    // this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

                } else if (!this.rotating) {

                    this.#logger.log(`quick turn 1`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._idleNick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.IDLE_TO_WALK, this._animationSettings.QUICK_TURN_WEIGHT);
                    // this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

                } else {

                    this.#logger.log(`back walk turn`);
                    // this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

                }

                this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

            } else {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache walk backward for cancel gun pointing -- gun shoot down`);
                        this._tempAction = this.AWS.actions[this._clips.WALK.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack down`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point down`);

                        }

                        this.#logger.log(`walk backward in queue`);
                        this.AWS.previousAction = this.AWS.actions[this._clips.WALK.nick];

                    }

                    this.AWS.actions[this._clips.WALK.nick].callback = () => {

                        this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.BACK_WALK_WEIGHT)
                            .setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

                    };

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to walk backward`);
                    this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.BACK_WALK_WEIGHT)
                        .setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

                } else {

                    this.#logger.log(`idle to walk backward`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._idleNick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.IDLE_TO_WALK, this._animationSettings.BACK_WALK_WEIGHT);
                    this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

                }
                
            }

        } else {

            if (this.attacking) {

                if (this.rotating) {

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this._clips.WALK.nick];

                    } else {

                        this.#logger.log(`walk turn in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this._clips.WALK.nick];

                    }

                    this.AWS.actions[this._clips.WALK.nick].callback = () => {

                        this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

                    }

                } else {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this._idleNick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this._idleNick];

                    }

                    this.AWS.setActionEffectiveWeight(this._idleNick, 1);

                }

            } else if (!this.rotating) {

                this.#logger.log(`walk back to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[this._clips.WALK.nick], this.AWS.actions[this._idleNick], this._animationSettings.WALK_TO_IDLE);

            } else {

                this.#logger.log(`walk back to turning`);
                this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT)

            }

            this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, 1);

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
                        this._tempAction = this.AWS.actions[this._clips.WALK.nick];

                    } else {
                        
                        this.#logger.log(`left turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[this._clips.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle to left turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._idleNick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.IDLE_TO_TURN, this._animationSettings.TURN_WEIGHT);

                }

                this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, 1);

            } else if (this.backward) {

                this.#logger.log(`left back walk turn`);
                this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

            }

        } else {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this._idleNick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this._idleNick];

                    }

                    this.AWS.setActionEffectiveWeight(this._idleNick, 1);

                } else {

                    this.#logger.log(`left turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._clips.WALK.nick], this.AWS.actions[this._idleNick], this._animationSettings.TURN_TO_IDLE);

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
                        this._tempAction = this.AWS.actions[this._clips.WALK.nick];

                    } else {

                        this.#logger.log(`right turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[this._clips.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle to right turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._idleNick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.IDLE_TO_TURN, this._animationSettings.TURN_WEIGHT);

                }

                this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, 1);

            } else if (this.backward) {

                this.#logger.log(`right back walk turn`);
                this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

            }

        } else {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this._idleNick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this._idleNick];

                    }

                    this.AWS.setActionEffectiveWeight(this._idleNick, 1);

                } else {

                    this.#logger.log(`right turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._clips.WALK.nick], this.AWS.actions[this._idleNick], this._animationSettings.TURN_TO_IDLE);

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
                        this._tempAction = this.AWS.actions[this._clips.RUN.nick];

                    } else if (this.gunPointing || this.meleeing) {

                        this.#logger.log(`run in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[this._clips.RUN.nick];

                    }

                    this.AWS.setActionEffectiveWeight(this._clips.RUN.nick, 1);

                } else {

                    this.#logger.log(`walk to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._clips.WALK.nick], this.AWS.actions[this._clips.RUN.nick], this._animationSettings.WALK_TO_RUN);

                }

            } else if (this.isBackward && !this.rotating) {

                this.#logger.log(`quick turn 2`);

            }
            
        } else {

            if (this.forward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache walk for gun point after cancel shooting`);
                        this._tempAction = this.AWS.actions[this._clips.WALK.nick];
                        

                    } else if (this.gunPointing || this.meleeing) {

                        this.#logger.log(`walk in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[this._clips.WALK.nick];

                    }

                    this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, 1);
                    
                } else {

                    this.#logger.log(`run to walk`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._clips.RUN.nick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.RUN_TO_WALK);

                }

            } else if (this.backward) {

                this.#logger.log(`quick turn to walk back`);
                this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.BACK_WALK_WEIGHT)
                    .setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

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
            this.switchWeapon(this._meleeWeapon);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this._clips.SWORD_SLASH.nick], this._animationSettings.MELEE, 1);

        } else if (this.meleeing) {

            this.#logger.log(`cancel melee attack!`);
            this.switchWeapon(this._armedWeapon);
            this.AWS.prepareCrossFade(this.AWS.actions[this._clips.SWORD_SLASH.nick], this.AWS.previousAction, this._animationSettings.MELEE, this.AWS.previousAction.weight);

        }

        super.melee(val);

    }

    gunPoint(val) {

        this.#logger.func = this.gunPoint.name;

        if (this.interacting || this.meleeing || !this._armedWeapon) {

            return;

        }

        if (val) {

            if (this.forward) {

                this.#logger.log(`gun point up`);

            } else if (this.backward) {

                this.#logger.log(`gun point down`);

            }

            this.#logger.log(`gun point!`);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this._clips.IDLE_GUN_POINTING.nick], this._animationSettings.GUN_POINT, 1);

        } else if (this.gunPointing) {

            this.#logger.log(`cancel gun point!`);

            if (this.shooting) {

                this.AWS.prepareCrossFade(this.AWS.actions[this._clips.IDLE_GUN_SHOOT.nick], this._tempAction, this._animationSettings.GUN_POINT, this._tempAction.weight);
                super.shoot(false);

            } else {

                this.AWS.prepareCrossFade(this.AWS.actions[this._clips.IDLE_GUN_POINTING.nick], this.AWS.previousAction, this._animationSettings.GUN_POINT, this.AWS.previousAction.weight);

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
                this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this._clips.IDLE_GUN_SHOOT.nick], this._animationSettings.SHOOT, 1);                

            } else if (this.shooting) {

                this.#logger.log(`cancel gun shoot!`);
                this.AWS.prepareCrossFade(this.AWS.actions[this._clips.IDLE_GUN_SHOOT.nick], this.AWS.actions[this._clips.IDLE_GUN_POINTING.nick], this._animationSettings.SHOOT, this.AWS.previousAction.weight);
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
                this.showArmedWeapon(true);

            }

            this.#logger.log(`interact !`);
            this.showArmedWeapon(false);
            this.AWS.prepareCrossFade(null, this.AWS.actions[this._clips.INTERACT.nick], this._animationSettings.INTERACT, 1, false, false, this._animationSettings.INTERACT, endCallback);

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