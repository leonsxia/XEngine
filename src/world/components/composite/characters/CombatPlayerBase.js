import { Matrix4, Quaternion, Vector3 } from 'three';
import { CustomizedCombatTofu, GLTFModel } from '../../Models';
import { AnimateWorkstation } from '../../animation/AnimateWorkstation';
import { Logger } from '../../../systems/Logger';
import { CAMERA_RAY_LAYER, WEAPONS } from '../../utils/constants';
import { polarity } from '../../utils/enums';

const DEBUG = false;
const DEBUG_WEAPON = true;

class CombatPlayerBase extends CustomizedCombatTofu {

    specs;

    gltf;

    #logger = new Logger(DEBUG, 'CombatPlayerBase');
    #weaponLogger = new Logger(DEBUG_WEAPON, 'CombatPlayerBase');

    AWS;    

    _clips = {};
    _animationSettings = {};

    _tempAction;

    armedWeapon;
    _meleeWeapon;

    isCombatPlayer = true;

    _delta = 0;
    _i = 0;
    _j = 0;
    _onMeleeHurtTargets = [];
    _cancelGunPoint = false;
    _cancelShoot = false;
    
    constructor(specs) {

        const { name, src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8, sovRadius = Math.max(width, width2, depth, depth2, height) } = specs;
        const { collisionSize = { width, depth, height } } = specs;
        const { rotateR = .9, vel = 1.34, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5, aimVel = 3 * Math.PI, aimTime = .05 } = specs;
        const { clips, animationSetting } = specs;
        const { scale = [1, 1, 1], gltfScale = [1, 1, 1] } = specs;
        const { showBS = false } = specs;
        const { createDefaultBoundingObjects = true, enableCollision = true } = specs;
        const { weaponActionMapping = {}, initialWeapon, weapons = [] } = specs;

        super({ 
            name, 
            size: { width, width2, depth, depth2, height, sovRadius }, collisionSize, 
            rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge, aimVel, aimTime,
            createDefaultBoundingObjects, enableCollision,
            weaponActionMapping, initialWeapon, weapons
        });

        this.specs = specs;
        
        Object.assign(this._clips, clips);
        Object.assign(this._animationSettings, animationSetting);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(gltfScale);

        this.setScale(scale);

        // show bounding sphere
        this.showBS(showBS);
        
        this.group.add(this.gltf.group);

    }

    async init() {

        await Promise.all([
            this.gltf.init(),
            ...this.initPromises()
        ]);

        this.showSkeleton(false);
        this.bindEvents();

        this.gltf.visible = true;

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: this._clips });
        this.AWS.init();

        this.trackResources();

    }

    trackResources() {

        super.trackResources();

        this.track(this.gltf?.skeleton);

    }

    initPromises() {

        const loadPromises = [];

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            loadPromises.push(this.weapons[i].init());

        }

        return loadPromises;

    }

    attachWeapons(hand) {

        // must revert group to zero position and quaternion but keep scale infomation so weapon position could be right
        this.group.updateWorldMatrix(true, false);

        const _m1 = new Matrix4().compose(this.group.getWorldPosition(new Vector3()), this.group.getWorldQuaternion(new Quaternion()), new Vector3(1, 1, 1));
        this.group.applyMatrix4(_m1.clone().invert());

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            hand.attach(this.weapons[i].group);            

        }

        // transform back
        this.group.applyMatrix4(_m1);

    }

    bindEvents() {

        const type = 'visibleChanged';
        const listener = (event) => {

            this.#logger.log(`${this.gltf.name}: ${event.message}`);
            this.gltf.setLayers(CAMERA_RAY_LAYER);

        };

        this.gltf.addEventListener(type, listener);
        this.gltf.eventList.set(type, listener);

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
            this.switchWeaponAction(this.weaponActionMapping[weapon.weaponType]);
            this.armedWeapon = weapon;

            const { shoot: { nick } } = this.weaponActionMapping[weapon.weaponType];
            const fireRate = weapon.fireRate;
            this.AWS.setActionEffectiveTimeScale(nick, fireRate);

        } else {

            this.switchWeapon();
            this.switchWeaponAction(this.weaponActionMapping[WEAPONS.NONE]);

        }

        this.switchHelperComponents();

    }

    switchWeaponAction(weaponAction) {

        const { idle, walk, run } = weaponAction;
        
        // replace initial action with current idle action
        if (!this.currentActionType) {

            this.AWS.setActionEffectiveWeight(this.AWS.activeAction.nick, 0);
            this.AWS.previousAction = this.AWS.activeAction = this.AWS.actions[idle.nick];
            this.AWS.setWeight(this.AWS.actions[idle.nick], 1);

        } else {

            if (idle.nick !== this.currentActionType.idle.nick) {
                
                this.AWS.copyActionEffectiveWeight(idle.nick, this.currentActionType.idle.nick);
                this.AWS.setActionEffectiveWeight(this.currentActionType.idle.nick, 0);

            }

            if (walk.nick !== this.currentActionType.walk.nick) {

                this.AWS.copyActionEffectiveWeight(walk.nick, this.currentActionType.walk.nick);
                this.AWS.setActionEffectiveWeight(this.currentActionType.walk.nick, 0);

            }

            if (run.nick !== this.currentActionType.run.nick) {

                this.AWS.copyActionEffectiveWeight(run.nick, this.currentActionType.run.nick);
                this.AWS.setActionEffectiveWeight(this.currentActionType.run.nick, 0);

            }

        }

        this.currentActionType = weaponAction;
        
    }

    switchWeapon(weapon) {

        if (!weapon) {

            this.armedWeapon = null;

            this.weapons.forEach(weaponItem => {

                weaponItem.visible = false;

            });

            this.damageRange = 0;
            this.damageRadius = 0;
            
            return;

        }

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            const w = this.weapons[i];

            if (w === weapon) {

                w.visible = true;
                this.damageRange = weapon.damageRange;
                this.damageRadius = weapon.damageRadius;

            } else {

                w.visible = false;

            }

        }

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
                        this._tempAction = this.AWS.actions[this.currentActionType.run.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack up`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point up`);

                        }

                        this.#logger.log(`run in queue`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.run.nick];

                    }

                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.run.nick, 1);

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.run.nick], this._animationSettings.WALK_TO_RUN);

                } else {

                    this.#logger.log(`idle to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.idle.nick], this.AWS.actions[this.currentActionType.run.nick], this._animationSettings.IDLE_TO_RUN);

                }

            } else if (this.attacking) {

                if (this.shooting) {

                    this.#logger.log(`cache walk for cancel gun pointing -- gun shoot up`);
                    this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];

                } else {

                    if (this.meleeing) {

                        this.#logger.log(`melee attack up`);

                    } else if (this.gunPointing) {

                        this.#logger.log(`gun point up`);

                    }
                    
                    this.#logger.log(`walk in queue`);
                    this.AWS.previousAction = this.AWS.actions[this.currentActionType.walk.nick];

                }

                this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, 1);

            } else if (!this.rotating) {

                this.#logger.log('idle to walk');
                this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.idle.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.IDLE_TO_WALK);

            } else if (this.rotating) {

                this.#logger.log(`zero turn to walk turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.WALK_TURN_TO_ZERO_TURN, 1);

            }

        } else {
            
            if (this.accelerating) {

                if (this.attacking) {

                    if (this.rotating) {                        

                        if (this.shooting) {

                            this.#logger.log(`cache walk turn for gun pointing`);
                            this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];
    
                        } else {

                            this.#logger.log(`walk turn in queue`);
                            this.AWS.previousAction = this.AWS.actions[this.currentActionType.walk.nick];
                            
                        }

                        // TEST: turing and press shift -> gun fire -> press and release w while gun firing
                        this.AWS.setActionWeightTimeScaleInCallback (this.currentActionType.walk.nick, this._animationSettings.TURN_WEIGHT);

                    } else {

                        if (this.shooting) {

                            this.#logger.log(`cache idle for gun pointing`);
                            this._tempAction = this.AWS.actions[this.currentActionType.idle.nick];

                        } else {

                            this.#logger.log(`idle in queue`);
                            this.AWS.previousAction = this.AWS.actions[this.currentActionType.idle.nick];

                        }

                        // TEST: gun fire -> run and release w while gun firing
                        this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.idle.nick, 1);
                        // TEST: gun fire -> press and hold w, then press hold shift, then release w -> walk backward
                        this.AWS.clearActionCallback(this.currentActionType.walk.nick);
                        
                    }

                } else if (this.rotating) {

                    this.#logger.log(`run to zero turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.run.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.RUN_TO_WALK, this._animationSettings.TURN_WEIGHT);

                } else {

                    this.#logger.log(`run to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.run.nick], this.AWS.actions[this.currentActionType.idle.nick], this._animationSettings.RUN_TO_IDLE);

                }

            } else if (this.attacking) {

                if (this.rotating) {

                    this.#logger.log(`walk turn in queue 2`);

                    // TEST: turning -> gun fire -> press and release w once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, this._animationSettings.TURN_WEIGHT);

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for gun pointing 2`);
                        this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];

                    }

                } else {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for gun pointing 2`);
                        this._tempAction = this.AWS.actions[this.currentActionType.idle.nick];
                        
                    } else {

                        this.#logger.log(`idle in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.idle.nick];

                    }

                    // TEST: gun fire -> press and release w once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.idle.nick, 1);
                    // TEST: gun fire -> press and release w once -> walk backward
                    this.AWS.clearActionCallback(this.currentActionType.walk.nick);

                }

            } else if (!this.rotating) {

                this.#logger.log(`walk to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.idle.nick], this._animationSettings.WALK_TO_IDLE);

            } else {

                this.#logger.log(`walk turn to zero turn`);
                this.AWS.setActionEffectiveWeight(this.currentActionType.walk.nick, this._animationSettings.TURN_WEIGHT);

            }
            
        }      
        
        super.movingForward(val);
        this.switchHelperComponents();

    }

    movingBackward(val) {

        this.#logger.func = this.movingBackward.name;

        if (val) {

            if (this.accelerating) {

                if (this.attacking && !this.rotating) {

                    if (this.shooting) {

                        this.#logger.log(`cache quick turn for cancel gun pointing -- gun shoot down`);
                        this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack down`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point down`);

                        }

                        this.#logger.log(`quick turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.walk.nick];

                    }

                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, this._animationSettings.QUICK_TURN_WEIGHT, -1);
                    
                } else if (!this.rotating) {

                    this.#logger.log(`quick turn 1`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.idle.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.IDLE_TO_WALK, this._animationSettings.QUICK_TURN_WEIGHT);
                    this.AWS.setActionEffectiveTimeScale(this.currentActionType.walk.nick, -1);

                } else {

                    this.#logger.log(`back walk turn`);
                    this.AWS.setActionEffectiveTimeScale(this.currentActionType.walk.nick, -1);

                }

            } else {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache walk backward for cancel gun pointing -- gun shoot down`);
                        this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];

                    } else {

                        if (this.meleeing) {

                            this.#logger.log(`melee attack down`);

                        } else if (this.gunPointing) {

                            this.#logger.log(`gun point down`);

                        }

                        this.#logger.log(`walk backward in queue`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.walk.nick];

                    }

                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, this._animationSettings.BACK_WALK_WEIGHT, -1);

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to walk backward`);
                    this.AWS.setActionEffectiveWeight(this.currentActionType.walk.nick, this._animationSettings.BACK_WALK_WEIGHT)
                        .setActionEffectiveTimeScale(this.currentActionType.walk.nick, -1);

                } else {

                    this.#logger.log(`idle to walk backward`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.idle.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.IDLE_TO_WALK, this._animationSettings.BACK_WALK_WEIGHT);
                    this.AWS.setActionEffectiveTimeScale(this.currentActionType.walk.nick, -1);

                }
                
            }

        } else {

            if (this.attacking) {

                if (this.rotating) {

                    if (this.shooting) {

                        this.#logger.log(`cache walk turn for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];

                    } else {

                        this.#logger.log(`walk turn in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.walk.nick];

                    }

                    // TEST: turning -> gun fire -> press and release s once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, this._animationSettings.TURN_WEIGHT);

                } else {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this.currentActionType.idle.nick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.idle.nick];

                    }

                    // TEST: gun fire -> press and release s once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.idle.nick, 1);
                    // TEST: gun point or gun fire -> press w twice quickly while gun firing
                    this.AWS.clearActionCallback(this.currentActionType.walk.nick);

                }

            } else if (!this.rotating) {

                this.#logger.log(`walk back to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.idle.nick], this._animationSettings.WALK_TO_IDLE);
                // TEST: quick turn -> release shift and walk backward -> walk forward
                this.AWS.clearActionCallback(this.currentActionType.walk.nick);

            } else {

                this.#logger.log(`walk back to turning`);
                this.AWS.setActionEffectiveWeight(this.currentActionType.walk.nick, this._animationSettings.TURN_WEIGHT);
                // TEST: walk back turning -> press shift -> release shift and walk back and turning -> release s and turning -> walk forward
                this.AWS.clearActionCallback(this.currentActionType.walk.nick);

            }

            this.AWS.setActionEffectiveTimeScale(this.currentActionType.walk.nick, 1);

        }

        super.movingBackward(val);
        this.switchHelperComponents();

    }

    movingLeft(val) {

        this.#logger.func = this.movingLeft.name;

        if (val) {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {
                        
                        this.#logger.log(`cache left walk turn for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];

                    } else {
                        
                        this.#logger.log(`left turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.walk.nick];

                    }

                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, this._animationSettings.TURN_WEIGHT);
                    
                } else {

                    this.#logger.log(`idle to left turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.idle.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.IDLE_TO_TURN, this._animationSettings.TURN_WEIGHT);

                }

                this.AWS.setActionEffectiveTimeScale(this.currentActionType.walk.nick, 1);

            } else if (this.backward) {

                this.#logger.log(`left back walk turn`);
                this.AWS.setActionEffectiveTimeScale(this.currentActionType.walk.nick, -1);

            }

        } else {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this.currentActionType.idle.nick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.idle.nick];

                    }

                    // TEST: gun fire -> press and release a once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.idle.nick, 1);
                    // TEST: gun fire -> press and releas a once -> walk forward
                    this.AWS.clearActionCallback(this.currentActionType.walk.nick);

                } else {

                    this.#logger.log(`left turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.idle.nick], this._animationSettings.TURN_TO_IDLE);

                }

            }
        }

        super.movingLeft(val);
        this.switchHelperComponents();

    }

    movingRight(val) {

        this.#logger.func = this.movingRight.name;

        if (val) {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache right walk turn for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];

                    } else {

                        this.#logger.log(`right turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.walk.nick];

                    }

                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, this._animationSettings.TURN_WEIGHT);

                } else {

                    this.#logger.log(`idle to right turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.idle.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.IDLE_TO_TURN, this._animationSettings.TURN_WEIGHT);

                }

                this.AWS.setActionEffectiveTimeScale(this.currentActionType.walk.nick, 1);

            } else if (this.backward) {

                this.#logger.log(`right back walk turn`);
                this.AWS.setActionEffectiveTimeScale(this.currentActionType.walk.nick, -1);

            }

        } else {

            if (!this.forward && !this.backward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache idle for cancel gun pointing`);
                        this._tempAction = this.AWS.actions[this.currentActionType.idle.nick];

                    } else {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.idle.nick];

                    }

                    // TEST: gun fire -> press and release a once while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.idle.nick, 1);
                    // TEST: gun fire -> press and releas d once -> walk forward
                    this.AWS.clearActionCallback(this.currentActionType.walk.nick);

                } else {

                    this.#logger.log(`right turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.idle.nick], this._animationSettings.TURN_TO_IDLE);

                }

            }
        }

        super.movingRight(val);
        this.switchHelperComponents();

    }

    accelerate(val) {       
        
        this.#logger.func = this.accelerate.name;

        if (val) {
            
            if (this.forward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache run for gun point after cancel shooting`);
                        this._tempAction = this.AWS.actions[this.currentActionType.run.nick];

                    } else if (this.gunPointing || this.meleeing) {

                        this.#logger.log(`run in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.run.nick];

                    }

                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.run.nick, 1);

                } else {

                    this.#logger.log(`walk to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.run.nick], this._animationSettings.WALK_TO_RUN);

                }

            } else if (this.isBackward && !this.rotating) {

                this.#logger.log(`quick turn 2`);

            }
            
        } else {

            if (this.forward) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`cache walk for gun point after cancel shooting`);
                        this._tempAction = this.AWS.actions[this.currentActionType.walk.nick];
                        

                    } else if (this.gunPointing || this.meleeing) {

                        this.#logger.log(`walk in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[this.currentActionType.walk.nick];

                    }

                    // TEST: walk or run -> gun firing -> accelerate (shift -> w) -> relese shift while gun firing
                    this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, 1);

                    
                } else {

                    this.#logger.log(`run to walk`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.run.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.RUN_TO_WALK);

                }

            } else if (this.backward) {

                this.#logger.log(`quick turn to walk back`);
                // TEST: quick turn -> gun firing -> release shift while gun firing
                this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, this._animationSettings.BACK_WALK_WEIGHT, -1);

            }

        }

        super.accelerate(val);
        this.switchHelperComponents();

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
        this.switchHelperComponents();

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
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.currentActionType.aim.nick], this._animationSettings.GUN_POINT, 1);

            super.gunPoint(val);
            this.switchHelperComponents();
            this.setAiming();

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
        this.switchHelperComponents();

    }

    shoot(val) {

        this.#logger.func = this.shoot.name;

        if (!this.armedWeapon) {

            return;

        }

        if (this.gunPointing) {

            if (val) {

                if (this.isAimTurning) {

                    this._shootInQueue = true;
                    return;

                }

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
                this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.currentActionType.shoot.nick], this._animationSettings.SHOOT, 1);

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
        this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.currentActionType.aim.nick], this._animationSettings.SHOOT, this.AWS.previousAction.weight);
        this.#logger.log(`restore cached previous action for gun pointing`);
        this.AWS.previousAction = this._tempAction;

        this.armedWeapon.isFiring = false;

        this._cancelShoot = false;

        this.armedWeapon.cancelShoot();

        super.shoot(false);

    }

    nextAimTarget(val) {

        if (val) {

            if (this.gunPointing && !this.isAimTurning) {

                super.nextAimTarget(true);
                this.setAimToNext();

            }
        } else {

            super.nextAimTarget(false);

        }

    }

    interact(val) {

        this.#logger.func = this.interact.name;

        if (this.attacking || this.interacting) {

            return;

        }

        if (val) {

            const endCallback = () => {

                super.interact(false);
                this.showArmedWeapon(true);
                this.switchHelperComponents();

            }

            this.#logger.log(`interact !`);
            this.showArmedWeapon(false);
            this.AWS.prepareCrossFade(null, this.AWS.actions[this._clips.INTERACT.nick], this._animationSettings.INTERACT, 1, false, false, this._animationSettings.INTERACT, endCallback);

        } else if (this.AWS.isLooping) {

            return;

        }

        super.interact(val);
        this.switchHelperComponents();

    }

    reloadWeapon(weapon) {

        weapon.fillMagzine();

    }

    reloadAllWeapons() {

        this.#weaponLogger.func = this.reloadAllWeapons.name;

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            const weaponItem = this.weapons[i];

            if (weaponItem.ammo.isMeleeWeapon) continue;

            this.reloadWeapon(weaponItem);

            this.#weaponLogger.log(`${weaponItem.weaponType} reload magzine, ammo count: ${weaponItem.ammoCount}`);

        }

    }

    startAttackTimer() {

        this._delta = 0;
        this._i = 0;

    }

    attackTick(params) {

        const { delta, aimObjects, enemies } = params;
        this.#weaponLogger.func = this.attackTick.name;
        const result = {
            damage: 0,
            onTarget: null
        };

        if (this.shooting || this.meleeing || this.armedWeapon?.isFiring) {

            this._delta += delta;

            let attackInterval;

            if (this.armedWeapon && (this.armedWeapon.isFiring || this.shooting) && this._i <= this.armedWeapon.magzineCapacity) {

                attackInterval = this.armedWeapon.attackInterval * this._i;

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

                            this.armedWeapon.ammoCount--;

                            const damage = this.armedWeapon.ammo.damage;
                            result.damage = damage;
                            this.#weaponLogger.log(`${this.armedWeapon.weaponType} fire ${this._i}, ammo count: ${this.armedWeapon.ammoCount}, damage: ${damage}`);

                            const intersects = this.checkAimRayIntersect(aimObjects);

                            if (intersects.length > 0) {

                                result.onTarget = [intersects[0]];

                            }

                            this.armedWeapon.shoot();

                        }

                    }

                }


            } else if (this.meleeing) {

                let attackStartInterval = this._meleeWeapon.attackInterval * this._i + this._meleeWeapon.startTime;
                let attackEndInterval = this._meleeWeapon.attackInterval * this._i + this._meleeWeapon.endTime;

                if (this._delta >= attackStartInterval && this._delta <= attackEndInterval) {

                    // this.#weaponLogger.log(`melee attack on: ${this._i}`);
                    this._meleeWeapon.hittingBox.updateOBB(false);

                    const on = [];
                    for (let i = 0, il = enemies.length; i < il; i++) {

                        const enemy = enemies[i];

                        if (this._onMeleeHurtTargets.indexOf(enemy) > -1) continue;

                        if (this._meleeWeapon.hittingBox.obb.intersectsOBB(enemy.obb)) {

                            on.push(enemy);
                            this._onMeleeHurtTargets.push(enemy);

                        }

                    }

                    result.onTarget = on;

                    const damage = this._meleeWeapon.ammo.damage;
                    result.damage = damage;

                    if (on.length > 0) {

                        this.#weaponLogger.log(`${this._meleeWeapon.weaponType} attack ${this._i}, damage: ${damage}`);

                    }

                } else if (this._delta > attackEndInterval) {

                    this._i++;
                    this._onMeleeHurtTargets = [];

                }

            }
            
        }

        return result;

    }

    setAiming() {

        this.#weaponLogger.func = this.aimTick.name;

        this._target = this.getNearestInSightTarget(null, this._inSightTargets, false, 'angle');
        this._j = this._inSightTargets.findIndex(t => t.instance === this._target.instance);

        if (!this._target) {
            
            this.aimingRad = 0;
            return;
        
        }

        this.aimTowardsTo(this._target);

    }

    setAimToNext() {

        this.#weaponLogger.func = this.setAimToNext.name;

        if (this._inSightTargets.length === 0) return;

        this.resetAimingState(this);
        const nextIdx = ++ this._j % this._inSightTargets.length;
        this._target = this._inSightTargets[nextIdx];

        this.aimTowardsTo(this._target);

    }

    aimTowardsTo(target) {

         const { dirAngle } = target;

        if (dirAngle.angle > 0) {

            if (dirAngle.direction === polarity.left) {

                this.aimingRad = dirAngle.angle;

            } else {

                this.aimingRad = - dirAngle.angle;
            }

        } else {

            this.aimingRad = 0;

        }

    }

    mixerTick(delta) {

        this.AWS.mixer.update(delta);

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            const weapon = this.weapons[i];

            if (!weapon.visible) continue;
            
            weapon.AWS?.mixer.update(delta);

        }

    }

}

export { CombatPlayerBase };