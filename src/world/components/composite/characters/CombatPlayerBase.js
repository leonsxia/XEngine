import { GLTFModel, Tofu } from '../../Models';
import { AnimateWorkstation } from '../../animation/AnimateWorkstation';
import { Logger } from '../../../systems/Logger';
import { CAMERA_RAY_LAYER } from '../../utils/constants';

const DEBUG = false;
const DEBUG_WEAPON = true;

class CombatPlayerBase extends Tofu {

    specs;

    gltf;

    #logger = new Logger(DEBUG, 'CombatPlayerBase');
    #weaponLogger = new Logger(DEBUG_WEAPON, 'CombatPlayerBase');

    AWS;

    weapons = [];
    weaponActionMapping = {};

    _clips = {};
    _animationSettings = {};

    _tempAction;

    _idleNick;  // current idle
    idleNick;   // default idle
    armedWeapon;
    _meleeWeapon;

    isCombatPlayer = true;

    _delta = 0;
    _i = 0;
    _cancelGunPoint = false;
    _cancelShoot = false;

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

        await Promise.all([
            this.gltf.init(),
            ...this.initPromises()
        ]);

        this.showSkeleton(false);

        this.gltf.traverse((mesh) => {
            
            mesh.layers.enable(CAMERA_RAY_LAYER);

        });

        this.bindEvents();

        this.gltf.visible = true;

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: this._clips });
        this.AWS.init();

    }

    initPromises() {

        const loadPromises = [];

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            loadPromises.push(this.weapons[i].init());

        }

        return loadPromises;

    }

    attachWeapons(hand) {

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            hand.attach(this.weapons[i].group);

        }

    }

    bindEvents() {

        const type = 'visibleChanged';
        const listener = (event) => {

            this.#logger.log(`${this.gltf.name}: ${event.message}`);
            this.gltf.setLayers(CAMERA_RAY_LAYER);

        };

        if (!this.gltf.hasEventListener(type, listener)) {

            this.gltf.addEventListener(type, listener);

        }

    }

    get meleeAttackAction() {

        return this.weaponActionMapping[this._meleeWeapon.weaponType];

    }

    get armedWeaponAction() {

        return this.weaponActionMapping[this.armedWeapon.weaponType];

    }

    setupWeaponScale() {

        const { scale = [1, 1, 1] } = this.specs;

        this.weapons.forEach(weaponItem => {

            weaponItem.group.scale.x *= scale[0];
            weaponItem.group.scale.y *= scale[1];
            weaponItem.group.scale.z *= scale[2];

        });

    }

    armWeapon(weapon) {

        if (weapon) {

            this.switchWeapon(weapon);
            this.switchIdleAction(this.weaponActionMapping[weapon.weaponType].idle.nick);
            this.armedWeapon = weapon;

            const { shoot: { nick }, fireRate } = this.weaponActionMapping[weapon.weaponType];
            this.AWS.setActionEffectiveTimeScale(nick, fireRate);

        } else {

            this.switchWeapon();
            this.switchIdleAction(this.idleNick);

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

            this.armedWeapon = null;

            this.weapons.forEach(weaponItem => {

                weaponItem.visible = false;

            });
            
            return;

        }

        this.weapons.forEach(weaponItem => {

            if (weaponItem === weapon) {

                weaponItem.visible = true;

            } else {

                weaponItem.visible = false;

            }

        });

    }

    showArmedWeapon(show) {

        if (this.armedWeapon) {

            this.armedWeapon.visible = show;

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

                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.RUN.nick, 1);

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

                this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, 1);

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

                        // TEST: turing and press shift -> gun fire -> press and release w while gun firing
                        this.AWS.setActionWeightTimeScaleInCallback (this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

                    } else {

                        if (this.shooting) {

                            this.#logger.log(`cache idle for gun pointing`);
                            this._tempAction = this.AWS.actions[this._idleNick];

                        } else {

                            this.#logger.log(`idle in queue`);
                            this.AWS.previousAction = this.AWS.actions[this._idleNick];

                        }

                        // TEST: gun fire -> run and release w while gun firing
                        this.AWS.setActionWeightTimeScaleInCallback(this._idleNick, 1);
                        // TEST: gun fire -> press and hold w, then press hold shift, then release w -> walk backward
                        this.AWS.clearActionCallback(this._clips.WALK.nick);
                        
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

                    // TEST: turning -> gun fire -> press and release w once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for gun pointing 2`);
                        this._tempAction = this.AWS.actions[this._clips.WALK.nick];

                    }

                } else {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for gun pointing 2`);
                        this._tempAction = this.AWS.actions[this._idleNick];
                        
                    } else {

                        this.#logger.log(`idle in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[this._idleNick];

                    }

                    // TEST: gun fire -> press and release w once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this._idleNick, 1);
                    // TEST: gun fire -> press and release w once -> walk backward
                    this.AWS.clearActionCallback(this._clips.WALK.nick);

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

                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, this._animationSettings.QUICK_TURN_WEIGHT, -1);
                    
                } else if (!this.rotating) {

                    this.#logger.log(`quick turn 1`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._idleNick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.IDLE_TO_WALK, this._animationSettings.QUICK_TURN_WEIGHT);
                    this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

                } else {

                    this.#logger.log(`back walk turn`);
                    this.AWS.setActionEffectiveTimeScale(this._clips.WALK.nick, -1);

                }

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

                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, this._animationSettings.BACK_WALK_WEIGHT, -1);

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

                    // TEST: turning -> gun fire -> press and release s once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

                } else {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this._idleNick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this._idleNick];

                    }

                    // TEST: gun fire -> press and release s once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this._idleNick, 1);
                    // TEST: gun point or gun fire -> press w twice quickly while gun firing
                    this.AWS.clearActionCallback(this._clips.WALK.nick);

                }

            } else if (!this.rotating) {

                this.#logger.log(`walk back to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[this._clips.WALK.nick], this.AWS.actions[this._idleNick], this._animationSettings.WALK_TO_IDLE);
                // TEST: quick turn -> release shift and walk backward -> walk forward
                this.AWS.clearActionCallback(this._clips.WALK.nick);

            } else {

                this.#logger.log(`walk back to turning`);
                this.AWS.setActionEffectiveWeight(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);
                // TEST: walk back turning -> press shift -> release shift and walk back and turning -> release s and turning -> walk forward
                this.AWS.clearActionCallback(this._clips.WALK.nick);

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

                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);
                    
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

                    // TEST: gun fire -> press and release a once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this._idleNick, 1);
                    // TEST: gun fire -> press and releas a once -> walk forward
                    this.AWS.clearActionCallback(this._clips.WALK.nick);

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

                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, this._animationSettings.TURN_WEIGHT);

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

                    // TEST: gun fire -> press and release a once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this._idleNick, 1);
                    // TEST: gun fire -> press and releas d once -> walk forward
                    this.AWS.clearActionCallback(this._clips.WALK.nick);

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

                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.RUN.nick, 1);

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

                    // TEST: walk or run -> gun firing -> accelerate (shift -> w) -> relese shift while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, 1);

                    
                } else {

                    this.#logger.log(`run to walk`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this._clips.RUN.nick], this.AWS.actions[this._clips.WALK.nick], this._animationSettings.RUN_TO_WALK);

                }

            } else if (this.backward) {

                this.#logger.log(`quick turn to walk back`);
                // TEST: quick turn -> gun firing -> release shift while gun firing
                this.AWS.setActionWeightTimeScaleInCallback(this._clips.WALK.nick, this._animationSettings.BACK_WALK_WEIGHT, -1);

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

            this.startAttackTimer();

            if (this.forward) {

                this.#logger.log(`melee attack up`);

            } else if (this.backward) {

                this.#logger.log(`melee attack down`);

            }

            this.#logger.log(`melee attack!`);
            this.switchWeapon(this._meleeWeapon);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.meleeAttackAction.attack.nick], this._animationSettings.MELEE, 1);

        } else if (this.meleeing) {

            this.#logger.log(`cancel melee attack!`);
            this.switchWeapon(this.armedWeapon);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.previousAction, this._animationSettings.MELEE, this.AWS.previousAction.weight);

        }

        super.melee(val);

    }

    gunPoint(val) {

        this.#logger.func = this.gunPoint.name;

        if (this.interacting || this.meleeing || !this.armedWeapon) {

            return;

        }

        if (val) {

            if (this.forward) {

                this.#logger.log(`gun point up`);

            } else if (this.backward) {

                this.#logger.log(`gun point down`);

            }

            this.isQuickTuring = false;

            this.#logger.log(`gun point!`);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.armedWeaponAction.aim.nick], this._animationSettings.GUN_POINT, 1);

            super.gunPoint(val);

        } else if (this.gunPointing) {

            if (this.armedWeapon.isFiring && this.armedWeapon.isSemiAutomatic) {

                this._cancelGunPoint = true;

            } else {

                this.cancelGunPoint();

            }

        }

    }

    cancelGunPoint() {

        this.#logger.func = this.cancelGunPoint.name;

        this.#logger.log(`cancel gun point!`);

        if (this.shooting || this.armedWeapon.isFiring) {

            this.armedWeapon.isFiring = false;

            this.AWS.prepareCrossFade(this.AWS.activeAction, this._tempAction, this._animationSettings.GUN_POINT, this._tempAction.weight);

            this.armedWeapon.cancelShoot();

            super.shoot(false);

        } else {

            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.previousAction, this._animationSettings.GUN_POINT, this.AWS.previousAction.weight);

        }

        this._cancelGunPoint = false;
        this._cancelShoot = false;
        super.gunPoint(false);

    }

    shoot(val) {

        this.#logger.func = this.shoot.name;

        if (!this.armedWeapon) {

            return;

        }

        if (this.gunPointing) {

            if (val) {

                if (this.armedWeapon.magzineEmpty) {

                    this.armedWeapon.weaponEmpty();
                    return;

                }

                if (this.armedWeapon.isFiring) {
                    
                    this._cancelShoot = false;
                    return;
                }

                this.startAttackTimer();

                this.armedWeapon.isFiring = true;

                this.#logger.log(`cache previous action for gun pointing`);
                this._tempAction = this.AWS.previousAction;

                if (this.forward) {

                    this.#logger.log(`gun shooting up`);
    
                } else if (this.backward) {
    
                    this.#logger.log(`gun shooting down`);
    
                }
    
                this.#logger.log(`gun shoot!`);
                this.#logger.log(`active: ${this.AWS.activeAction.nick}`)
                this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.armedWeaponAction.shoot.nick], this._animationSettings.SHOOT, 1);

                this.armedWeapon.shoot();

                super.shoot(val);

            } else if (this.shooting) {

                if (this.armedWeapon.isFiring && this.armedWeapon.isSemiAutomatic) {

                    this._cancelShoot = true;

                } else {

                    this.cancelGunShoot();

                }

            }

        } else {

            return;

        }

    }

    cancelGunShoot() {

        this.#logger.func = this.cancelGunShoot.name;

        this.#logger.log(`cancel gun shoot!`);
        this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.armedWeaponAction.aim.nick], this._animationSettings.SHOOT, this.AWS.previousAction.weight);
        this.#logger.log(`restore cached previous action for gun pointing`);
        this.AWS.previousAction = this._tempAction;

        this.armedWeapon.isFiring = false;

        this._cancelShoot = false;

        this.armedWeapon.cancelShoot();

        super.shoot(false);

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

    reloadWeapon(weapon) {

        weapon.fillMagzine();

    }

    reloadAllWeapons() {

        this.#weaponLogger.func = this.reloadAllWeapons.name;

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            const weaponItem = this.weapons[i];

            if (!weaponItem.ammoCount) continue;

            this.reloadWeapon(weaponItem);

            this.#weaponLogger.log(`${weaponItem.weaponType} reload magzine, ammo count: ${weaponItem.ammo}`);

        }

    }

    startAttackTimer() {

        this._delta = 0;
        this._i = 0;

    }

    tickWeaponAttack(delta) {        

        this.#weaponLogger.func = this.tickWeaponAttack.name;        

        if (this.shooting || this.meleeing || this.armedWeapon?.isFiring) {

            this._delta += delta;

            let attackInterval;

            if (this.armedWeapon && (this.armedWeapon.isFiring || this.shooting) && this._i <= this.armedWeapon.ammoCount) {

                attackInterval = this.armedWeaponAction.attackInterval * this._i;

                if (this._i === 0 || this._delta >= attackInterval) {

                    if (this._cancelGunPoint) {

                        this.cancelGunPoint();

                    } else if (this._cancelShoot) {
                        
                        this.cancelGunShoot();                        

                    } else {

                        this._i++;

                        if (this.armedWeapon.magzineEmpty) {

                            this.armedWeapon.isFiring = false;
                            this.cancelGunShoot();
                            this.#weaponLogger.log(`${this.armedWeapon.weaponType} magzine empty`);
                            this.armedWeapon.weaponEmpty();

                        } else {

                            this.armedWeapon.ammo--;
                            this.#weaponLogger.log(`${this.armedWeapon.weaponType} fire ${this._i}, ammo count: ${this.armedWeapon.ammo}`);

                            this.armedWeapon.shoot();

                        }

                    }

                }


            } else if (this.meleeing) {

                attackInterval = this.meleeAttackAction.attackInterval * this._i + this.meleeAttackAction.prepareInterval;

                if (this._delta >= attackInterval) {

                    this._i++;
                    this.#weaponLogger.log(`${this._meleeWeapon.weaponType} attack ${this._i}`);

                }

            }
            
        }

    }

    finalTick(delta) {

        this.AWS.mixer.update(delta);

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            const weapon = this.weapons[i];

            if (!weapon.visible) continue;
            
            weapon.AWS?.mixer.update(delta);

        }

    }

}

export { CombatPlayerBase };