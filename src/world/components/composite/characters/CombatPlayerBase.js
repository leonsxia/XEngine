import { Matrix4 } from 'three';
import { CustomizedCombatTofu, GLTFModel } from '../../Models';
import { AnimateWorkstation } from '../../animation/AnimateWorkstation';
import { Logger } from '../../../systems/Logger';
import { CAMERA_RAY_LAYER, WEAPONS } from '../../utils/constants';
import { aimDirection, polarity } from '../../utils/enums';
import { Pda } from '../../pda/Pda';
import { resetObject3D } from '../../utils/objectHelper';
import { AudioWorkstation } from '../../audio/AudioWorkstation';

const DEBUG = false;
const DEBUG_WEAPON = true;
const DEBUG_DAMAGE = true;
const DEBUG_INTERACTION = true;
const DEBUG_SOUND = false;

const _m1 = new Matrix4();

class CombatPlayerBase extends CustomizedCombatTofu {

    specs;

    gltf;

    #logger = new Logger(DEBUG, 'CombatPlayerBase');
    #weaponLogger = new Logger(DEBUG_WEAPON, 'CombatPlayerBase');
    #damageLogger = new Logger(DEBUG_DAMAGE, 'CombatPlayerBase');
    #interactionLogger = new Logger(DEBUG_INTERACTION, 'CombatPlayerBase');
    #soundLogger = new Logger(DEBUG_SOUND, 'CombatPlayerBase');

    AWS;
    DAW;   

    _clips = {};
    _animationSettings = {};

    _soundSettings = {};

    armedWeapon;
    _meleeWeapon;

    isCombatPlayer = true;

    _delta = 0;
    _i = 0;
    _j = 0;
    _onMeleeHurtTargets = [];
    _cancelGunPoint = false;
    _cancelShoot = false;
    _cancelMelee = false;

    isInteractiveReady = false;
    readyToPickItem;

    currentRoom;

    constructor(specs) {

        const { name, src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8, sovRadius = Math.max(width, width2, depth, depth2, height) } = specs;
        const { collisionSize = { width, depth, height } } = specs;
        const { rotateR = .9, vel = 1.34, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5, aimVel = 3 * Math.PI, aimTime = .05 } = specs;
        const { clips, animationSetting } = specs;
        const { soundSetting } = specs;
        const { scale = [1, 1, 1], gltfScale = [1, 1, 1] } = specs;
        const { showBS = false } = specs;
        const { createDefaultBoundingObjects = true, enableCollision = true } = specs;
        const { weaponActionMapping = {}, initialWeaponType, weapons = [] } = specs;
        const { HPMax = 100 } = specs;

        super({ 
            name, 
            size: { width, width2, depth, depth2, height, sovRadius }, collisionSize, 
            rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge, aimVel, aimTime,
            createDefaultBoundingObjects, enableCollision,
            weaponActionMapping, initialWeaponType, weapons,
            HPMax
        });

        this.specs = specs;
        
        Object.assign(this._clips, clips);
        Object.assign(this._animationSettings, animationSetting);
        Object.assign(this._soundSettings, soundSetting);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(gltfScale);

        this.setScale(scale);

        // show bounding sphere
        this.showBS(showBS);
        
        this.group.add(this.gltf.group);

        this.pda = new Pda({ owner: this });

    }

    async init() {

        await Promise.all([
            this.gltf.init(),
            ...this.initPromises(),
            this.pda.init()
        ]);

        this.showSkeleton(false);
        this.bindEvents();
        this.bindWeaponEvents();

        this.gltf.visible = true;

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: this._clips });
        this.AWS.init();

        this.DAW = new AudioWorkstation();
        this.onDisposed.push(() => {
            this.DAW.stopAll();
        });

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

    addSoundsToGroup(soundName) {

        const sound = this.DAW.getSound(soundName);
        if (sound) {

            this.group.add(sound);

        }

    }

    setupSounds(camera) {

        this.DAW.changeCamera(camera);
        return this;

    }

    // inherited by child classes
    registerSounds() {

        return this;

    }

    addPickableItem(item) {

        const result = this.pda.addInventoryItem(item);

        if (!result) return;

        if (item.isWeaponItem) {

            const matched = this.weapons.find(w => w.weaponType === item.weaponType);

            if (matched) {

                matched.updateWeaponProperties(item);

                if (item.isArmed) {

                    if (!matched.ammo.isMeleeWeapon) {

                        this.armWeapon(matched);

                    } else {

                        this.armMelee(matched);

                    }

                }

            }

        }

    }

    updateRoomInfo(room) {

        this.currentRoom = room.name;
        this.pda.updateInventoryItems();

    }

    attachWeapons(hand) {

        this.group.updateMatrix();

        _m1.copy(this.group.matrix);
        resetObject3D(this.group);

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

    }

    bindWeaponEvents() {

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            this.weapons[i].onAmmoChanged.push((weapon) => {

                this.pda.updateInventoryWeapon(weapon);

            });

        }

    }

    get meleeAttackAction() {

        return this.weaponActionMapping[this._meleeWeapon.weaponType];

    }

    get armedWeaponAction() {

        return this.weaponActionMapping[this.armedWeapon.weaponType];

    }

    armMelee(weapon) {

        this._meleeWeapon = weapon;
        this.pda.changeMelee(weapon);
        weapon?.registerSounds(
            this.DAW.getSound(weapon.fireSound)
        );

    }

    armWeapon(weapon) {

        if (weapon) {

            this.switchWeapon(weapon);
            this.switchWeaponAction(this.weaponActionMapping[weapon.weaponType]);
            this.armedWeapon = weapon;

            const { shoot: { nick } } = this.weaponActionMapping[weapon.weaponType];
            const fireRate = weapon.fireRate;
            this.AWS.setActionEffectiveTimeScale(nick, fireRate);
            weapon.registerSounds(
                this.DAW.getSound(weapon.fireSound),
                this.DAW.getSound(weapon.emptySound)
            )

        } else {

            this.switchWeapon();
            this.switchWeaponAction(this.weaponActionMapping[WEAPONS.NONE]);

        }

        this.pda.changeFirearm(weapon);
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

                if (this.AWS.activeAction === this.AWS.actions[this.currentActionType.idle.nick]) {
                    this.AWS.activeAction = this.AWS.actions[idle.nick];
                }

            }

            if (walk.nick !== this.currentActionType.walk.nick) {

                this.AWS.copyActionEffectiveWeight(walk.nick, this.currentActionType.walk.nick);
                this.AWS.setActionEffectiveWeight(this.currentActionType.walk.nick, 0);

                if (this.AWS.activeAction === this.AWS.actions[this.currentActionType.walk.nick]) {
                    this.AWS.activeAction = this.AWS.actions[walk.nick];
                }

            }

            if (run.nick !== this.currentActionType.run.nick) {

                this.AWS.copyActionEffectiveWeight(run.nick, this.currentActionType.run.nick);
                this.AWS.setActionEffectiveWeight(this.currentActionType.run.nick, 0);

                if (this.AWS.activeAction === this.AWS.actions[this.currentActionType.run.nick]) {
                    this.AWS.activeAction = this.AWS.actions[run.nick];
                }

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
            this.armedHeight = 0;
            
            return;

        }

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            const w = this.weapons[i];

            if (w === weapon) {

                w.visible = true;
                this.damageRange = weapon.damageRange;
                this.damageRadius = weapon.damageRadius;
                this.armedHeight = weapon.armedHeight;
                this.updateAimRay();

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

    pdaInfo(val) {

        if (this.isActing) return;

        if (val) {

            this.pda.visible = !this.pda.visible;

        }

    }

    inventoryInfo(val) {

        if (this.isActing) return;

        if (val) {

            this.pda.visible = !this.pda.visible;
            if (this.pda.visible) {

                this.pda._pdaMenu.currentIndex = 1;

            }

        }

    }

    // animation controls
    movingForward(val) {

        if (this.dead) return;

        this.#logger.func = this.movingForward.name;

        if (val) {

            if (this.accelerating) {

                if (this.attacking) {

                    if (this.shooting) {

                        this.#logger.log(`shoot up`);
                        this.aimDirection = aimDirection.forwardUp;

                    } else if (this.meleeing) {

                        this.#logger.log(`melee attack up`);

                    } else if (this.gunPointing) {

                        this.#logger.log(`gun point up`);
                        this.aimDirection = aimDirection.forwardUp;

                    }

                } else if (this.rotating) {

                    this.#logger.log(`walk turn to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.run.nick], this._animationSettings.WALK_TO_RUN);

                } else {

                    this.#logger.log(`idle to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.idle.nick], this.AWS.actions[this.currentActionType.run.nick], this._animationSettings.IDLE_TO_RUN);

                }

            } else if (this.attacking) {

                if (this.shooting) {

                    this.#logger.log(`shoot up`);
                    this.aimDirection = aimDirection.forwardUp;

                } else if (this.meleeing) {

                    this.#logger.log(`melee attack up`);

                } else if (this.gunPointing) {

                    this.#logger.log(`gun point up`);
                    this.aimDirection = aimDirection.forwardUp;

                }

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

                    if (this.shooting) {

                        this.#logger.log(`cancel shoot up`);
                        this.aimDirection = aimDirection.forward;

                    } else if (this.meleeing) {

                        this.#logger.log(`cancel melee attack up`);

                    } else if (this.gunPointing) {

                        this.#logger.log(`cancel gun point up`);
                        this.aimDirection = aimDirection.forward;

                    }

                } else if (this.rotating) {

                    this.#logger.log(`run to zero turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.run.nick], this.AWS.actions[this.currentActionType.walk.nick], this._animationSettings.RUN_TO_WALK, this._animationSettings.TURN_WEIGHT);

                } else {

                    this.#logger.log(`run to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.run.nick], this.AWS.actions[this.currentActionType.idle.nick], this._animationSettings.RUN_TO_IDLE);

                }

            } else if (this.attacking) {

                if (this.shooting) {

                    this.#logger.log(`cancel shoot up`);
                    this.aimDirection = aimDirection.forward;

                } else if (this.meleeing) {

                    this.#logger.log(`cancel melee attack up`);

                } else if (this.gunPointing) {

                    this.#logger.log(`cancel gun point up`);
                    this.aimDirection = aimDirection.forward;

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

        if (this.dead) return;

        this.#logger.func = this.movingBackward.name;

        if (val) {

            if (this.accelerating) {

                if (this.attacking && !this.rotating) {

                    if (this.shooting) {

                        this.#logger.log(`shoot down`);
                        this.aimDirection = aimDirection.forwardDown;

                    } else if (this.meleeing) {

                        this.#logger.log(`melee attack down`);

                    } else if (this.gunPointing) {

                        this.#logger.log(`gun point down`);
                        this.aimDirection = aimDirection.forwardDown;

                    }
                    
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

                        this.#logger.log(`shoot down`);
                        this.aimDirection = aimDirection.forwardDown;

                    } else if (this.meleeing) {

                        this.#logger.log(`melee attack down`);

                    } else if (this.gunPointing) {

                        this.#logger.log(`gun point down`);
                        this.aimDirection = aimDirection.forwardDown;

                    }

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

                if (this.shooting) {

                    this.#logger.log(`cancel shoot down`);
                    this.aimDirection = aimDirection.forward;

                } else if (this.meleeing) {

                    this.#logger.log(`cancel melee attack down`);

                } else if (this.gunPointing) {

                    this.#logger.log(`cancel gun point down`);
                    this.aimDirection = aimDirection.forward;

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

        if (this.dead) return;

        this.#logger.func = this.movingLeft.name;

        if (val) {

            if (!this.forward && !this.backward) {

                if (!this.attacking) {

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

                if (!this.attacking){

                    this.#logger.log(`left turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.idle.nick], this._animationSettings.TURN_TO_IDLE);

                }

            }
        }

        super.movingLeft(val);
        this.switchHelperComponents();

    }

    movingRight(val) {

        if (this.dead) return;

        this.#logger.func = this.movingRight.name;

        if (val) {

            if (!this.forward && !this.backward) {

                if (!this.attacking) {

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

                if (!this.attacking) {

                    this.#logger.log(`right turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.idle.nick], this._animationSettings.TURN_TO_IDLE);

                }

            }
        }

        super.movingRight(val);
        this.switchHelperComponents();

    }

    accelerate(val) {

        if (this.dead) return;
        
        this.#logger.func = this.accelerate.name;

        if (val) {
            
            if (this.forward) {

                if (!this.attacking) {

                    this.#logger.log(`walk to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.currentActionType.walk.nick], this.AWS.actions[this.currentActionType.run.nick], this._animationSettings.WALK_TO_RUN);

                }

            } else if (this.isBackward && !this.rotating) {

                this.#logger.log(`quick turn 2`);

            }
            
        } else {

            if (this.forward) {

                if (!this.attacking) {

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

    getMovingAction() {

        let endAction;
        if (!this.forward && !this.backward && this.rotating) {

            endAction = this.AWS.actions[this.currentActionType.walk.nick];
            this.AWS.setActionEffectiveWeight(this.currentActionType.walk.nick, this._animationSettings.TURN_WEIGHT);

        } else if (this.forward) {

            if (this.accelerating) {

                endAction = this.AWS.actions[this.currentActionType.run.nick];
                this.AWS.setActionEffectiveWeight(this.currentActionType.run.nick, 1);

            } else {

                endAction = this.AWS.actions[this.currentActionType.walk.nick];
                this.AWS.setActionEffectiveWeight(this.currentActionType.walk.nick, 1);

            }

        } else if (this.backward) {

            endAction = this.AWS.actions[this.currentActionType.walk.nick];
            this.AWS.setActionWeightTimeScaleInCallback(this.currentActionType.walk.nick, this._animationSettings.QUICK_TURN_WEIGHT, -1);

        } else {

            endAction = this.AWS.actions[this.currentActionType.idle.nick];
            this.AWS.setActionEffectiveWeight(this.currentActionType.idle.nick, 1);

        }

        return endAction;

    }

    melee(val) {

        if (this.gunPointing || this.dead || !this._meleeWeapon) {

            return;

        }

        this.#logger.func = this.melee.name;

        if (val) {

            if (this._meleeWeapon.isFiring) {

                this._cancelMelee = false;
                return;

            }

            this.startAttackTimer();
            this._meleeWeapon.isFiring = true;

            if (this.forward) {

                this.#logger.log(`melee attack up`);

            } else if (this.backward) {

                this.#logger.log(`melee attack down`);

            }

            this.#logger.log(`melee attack!`);
            if (!this.interacting && !this.hurting) this.switchWeapon(this._meleeWeapon);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.meleeAttackAction.attack.nick], this._animationSettings.MELEE, 1);
            this.aimingRad = 0;

            super.melee(val);
            this.switchHelperComponents();

        } else if (this.meleeing) {

            if (!this.hurting && this._meleeWeapon.isFiring) {

                this._cancelMelee = true;

            } else {

                this.cancelMelee();

            }

        }

    }

    cancelMelee() {

        this.#logger.func = this.cancelMelee.name;
        this.#logger.log(`cancel melee attack!`);

        this.switchWeapon(this.armedWeapon);

        const endAction = this.getMovingAction();

        if (this.hurting) {

            this.AWS.cachedAction = endAction;

        } else {

            this.AWS.prepareCrossFade(this.AWS.activeAction, endAction, this._animationSettings.MELEE, endAction.weight);

        }

        this._cancelMelee = false;
        this._meleeWeapon.isFiring = false;
        super.melee(false);
        this.switchHelperComponents();
        this._soundSettings.MELEE_SOUND_PLAYED = false;

    }

    gunPoint(val) {

        if (this.meleeing || !this.armedWeapon || this.dead) {

            return;

        }

        this.#logger.func = this.gunPoint.name;

        if (val) {

            if (this.forward) {

                this.#logger.log(`gun point up`);
                this.aimDirection = aimDirection.forwardUp;

            } else if (this.backward) {

                this.#logger.log(`gun point down`);
                this.aimDirection = aimDirection.forwardDown;

            }

            this.stopQuickTurning();

            this.#logger.log(`gun point!`);
            this.AWS.prepareCrossFade(this.AWS.activeAction, this.AWS.actions[this.currentActionType.aim.nick], this._animationSettings.GUN_POINT, 1);

            super.gunPoint(val);
            this.switchHelperComponents();
            this.setAiming();

        } else if (this.gunPointing) {

            if (!this.hurting && this.armedWeapon.isFiring && this.armedWeapon.isSemiAutomatic) {

                this._cancelGunPoint = true;

            } else {

                this.cancelGunPoint();

            }

        }

    }

    cancelGunPoint() {

        this.#logger.func = this.cancelGunPoint.name;

        this.#logger.log(`cancel gun point!`);        

        const endAction = this.getMovingAction();

        if (this.hurting) {

            this.AWS.cachedAction = endAction;
            this.armedWeapon.isFiring = false;
            this.armedWeapon.cancelShoot();
            super.shoot(false);

        } else if (this.shooting || this.armedWeapon.isFiring) {            

            this.AWS.prepareCrossFade(this.AWS.activeAction, endAction, this._animationSettings.GUN_POINT, endAction.weight);
            this.armedWeapon.isFiring = false;
            this.armedWeapon.cancelShoot();
            super.shoot(false);

        } else {

            this.AWS.prepareCrossFade(this.AWS.activeAction, endAction, this._animationSettings.GUN_POINT, endAction.weight);

        }

        this.aimDirection = aimDirection.forward;
        this._cancelGunPoint = false;
        this._cancelShoot = false;
        super.gunPoint(false);
        this.switchHelperComponents();

    }

    shoot(val) {

        if (!this.armedWeapon || this.dead) {

            return;

        }

        this.#logger.func = this.shoot.name;

        if (this.gunPointing) {

            if (val) {

                if (this.isAimTurning) {

                    this._shootInQueue = true;
                    return;

                }

                if (this.armedWeapon.magzineEmpty) {

                    this.armedWeapon.weaponEmpty();
                    this.DAW.play(this.armedWeapon.emptySound);
                    return;

                }

                if (this.armedWeapon.isFiring) {
                    
                    this._cancelShoot = false;
                    return;
                }

                this.startAttackTimer();

                this.armedWeapon.isFiring = true;

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

                if (!this.hurting && this.armedWeapon.isFiring && this.armedWeapon.isSemiAutomatic) {

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

        const endAction = this.AWS.actions[this.currentActionType.aim.nick];
        if (this.hurting) {

            this.AWS.cachedAction = endAction;

        } else {

            this.AWS.prepareCrossFade(this.AWS.activeAction, endAction, this._animationSettings.SHOOT, endAction.weight);

        }

        this._cancelShoot = false;
        this.armedWeapon.isFiring = false;
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

        if (!this.isInteractiveReady || this.attacking || this.interacting || this.dead) {

            return;

        }

        this.#logger.func = this.interact.name;

        if (val) {

            const endCallback = () => {

                if (!this.hurting && !this.dead && this.readyToPickItem) {

                    this.#interactionLogger.log(`player: ${this.name} picked item: ${this.readyToPickItem.name}`);
                    this.addPickableItem(this.readyToPickItem);
                    
                    if (this.readyToPickItem.isPicked) {

                        this.readyToPickItem = undefined;

                    }

                }

                super.interact(false);
                this.switchHelperComponents();

                if (!this.meleeing) {

                    this.showArmedWeapon(true);

                } else {

                    this.switchWeapon(this._meleeWeapon);

                }

                if (this.gunPointing) {

                    this.resetAimingState(this);
                    this.setAiming();

                }

            }

            this.#logger.log(`interact !`);
            this.showArmedWeapon(false);
            this.AWS.prepareCrossFade(null, this.AWS.actions[this._clips.INTERACT.nick], this._animationSettings.INTERACT, 1, false, false, this._animationSettings.INTERACT, endCallback);            

            super.interact(true);
            this.switchHelperComponents();

        } else if (this.AWS.isLooping) {

            return;

        }        

    }

    hurt(val) {

        this.#damageLogger.func = this.hurt.name;

        if (val) {

            const hurtAction = this.AWS.actions[this.currentActionType.hurt.body.nick];
            const interactAction = this.AWS.actions[this._clips.INTERACT.nick];
            if (this.AWS.activeAction === hurtAction) {

                this.AWS.fadeToPrevious();
                hurtAction.ignoreFinishedEvent = true;

            } else if (this.AWS.activeAction === interactAction) {

                this.AWS.fadeToPrevious();
                interactAction.ignoreFadeOut = true;

            }

            if (this._cancelGunPoint) {

                this.cancelGunPoint();

            }

            if (this._cancelShoot) {

                this.cancelGunShoot();

            }

            if (this._cancelMelee) {

                this.cancelMelee();

            }

            const endCallback = () => {

                super.hurt(false);
                hurtAction.ignoreFinishedEvent = undefined;
                interactAction.ignoreFadeOut = undefined;
                this.AWS.isLooping = false;
                this.startAttackTimer();
                this.switchHelperComponents();

                if (!this.meleeing) {

                    this.showArmedWeapon(true);

                } else {

                    this.switchWeapon(this._meleeWeapon);

                }

                if (this.gunPointing) {

                    this.resetAimingState(this);
                    this.setAiming();

                }

            }

            this.#logger.log(`${this.name} is on hurt`);
            this.AWS.prepareCrossFade(null, hurtAction, this._animationSettings.HURT, 1, false, false, this._animationSettings.HURT, endCallback);

            // stop aim turning
            this.aimingRad = 0;
        }

        super.hurt(val);

    }

    die(val) {

        this.#damageLogger.func = this.die.name;

        if (val) {

            this.#damageLogger.log(`${this.name} is dead`);

            const dieAction = this.AWS.actions[this.currentActionType.die.nick];
            const hurtAction = this.AWS.actions[this.currentActionType.hurt.body.nick];
            const interactAction = this.AWS.actions[this._clips.INTERACT.nick];
            if (this.AWS.activeAction === hurtAction) {

                this.AWS.fadeToPrevious();
                hurtAction.ignoreFinishedEvent = true;
                hurtAction.ignoreFadeOut = true;

            } else if (this.AWS.activeAction === interactAction) {

                this.AWS.fadeToPrevious();
                interactAction.ignoreFadeOut = true;

            }

            const endCallback = () => {

                this.isActive = false;
                hurtAction.ignoreFinishedEvent = undefined;
                hurtAction.ignoreFadeOut = undefined;
                interactAction.ignoreFadeOut = undefined;
                this.AWS.isLooping = false;

            }

            dieAction.ignoreFadeOut = true;
            this.AWS.prepareCrossFade(null, dieAction, this._animationSettings.DIE, 1, false, false, 0, endCallback);

        }

        super.die(val);

    }

    damageReceiveTick(params) {

        this.#damageLogger.func = this.damageReceiveTick.name;

        const { damage, attackBy /*hitPart*/ } = params;

        this.health.current -= damage;

        this.setStateAfterDamageReceived();
        this.processDamageSound(attackBy);

    }

    setStateAfterDamageReceived() {

        if (this.health.currentLife > 0) {

            this.hurt(true);

        } else {

            this.clearInSightTargets();
            this.die(true);

        }

        this.stopQuickTurning();
        this.resetClimbingState();
        this.switchHelperComponents();

        if (this.dead) {

            this.resetWeaponState();
            this.stopAllMotionStates();
            this.setAllBoundingBoxLayers(false);

        }

    }

    processDamageSound(attackBy) {

        switch (attackBy) {

            case WEAPONS.ZOMBIE_CLAW:

                this.DAW.play(this._soundSettings.CLAW_HIT);
                break;

        }

        this.DAW.play(this._soundSettings.HURT);

    }

    resetWeaponState() {

        if (this.armedWeapon) {

            this.armedWeapon.isFiring = false;
            this.armedWeapon.cancelShoot();

        }

        if (this._meleeWeapon) {

            this._meleeWeapon.isFiring = false;

        }

        this.switchWeapon(this.armedWeapon);

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
        this._onMeleeHurtTargets.length = 0;

    }

    attackTick(params) {

        if (this.hurting || this.dead) return;

        const { delta, aimObjects, enemies } = params;
        this.#weaponLogger.func = this.attackTick.name;
        const result = {
            damage: 0,
            onTarget: null,
            attackBy: null
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

                            this.cancelGunShoot();
                            this.#weaponLogger.log(`${this.armedWeapon.weaponType} magzine empty`);
                            this.armedWeapon.weaponEmpty();
                            this.DAW.play(this.armedWeapon.emptySound);

                        } else {

                            this.armedWeapon.ammoCount--;

                            const damage = this.armedWeapon.ammo.realDamage;
                            result.damage = damage;
                            this.#weaponLogger.log(`${this.armedWeapon.weaponType} fire ${this._i}, ammo count: ${this.armedWeapon.ammoCount}, damage: ${damage}`);

                            const intersects = this.checkAimRayIntersect(aimObjects);

                            if (intersects.length > 0) {

                                result.onTarget = [intersects[0]];
                                result.attackBy = this.armedWeapon.weaponType;

                            }

                            this.armedWeapon.shoot();
                            this.DAW.play(this.armedWeapon.fireSound);

                        }

                    }

                }


            } else if (this.meleeing) {

                attackInterval = this._meleeWeapon.attackInterval * this._i;
                let attackStartInterval = this._meleeWeapon.attackInterval * this._i + this._meleeWeapon.startTime;
                let attackEndInterval = this._meleeWeapon.attackInterval * this._i + this._meleeWeapon.endTime;

                if (this._i > 0 && this._delta > attackInterval && this._cancelMelee) {

                    this.cancelMelee();

                } else if (this._delta >= attackStartInterval && this._delta <= attackEndInterval) {

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
                    result.attackBy = this._meleeWeapon.weaponType;

                    const damage = this._meleeWeapon.ammo.realDamage;
                    result.damage = damage;

                    if (on.length > 0) {

                        this.#weaponLogger.log(`${this._meleeWeapon.weaponType} attack ${this._i}, damage: ${damage}`);

                    }

                    if (!this._soundSettings.MELEE_SOUND_PLAYED) {

                        this.DAW.play(this._meleeWeapon.fireSound);
                        this._soundSettings.MELEE_SOUND_PLAYED = true;

                    }

                } else if (this._delta > attackEndInterval) {

                    this._i++;
                    this._onMeleeHurtTargets.length = 0;
                    this.#weaponLogger.log(`melee attack: ${this._i}`);
                    this._soundSettings.MELEE_SOUND_PLAYED = false;

                }

            }
            
        }

        return result;

    }

    setAiming() {

        this.#weaponLogger.func = this.aimTick.name;

        this._target = this.getNearestInSightTarget(null, this._inSightTargets, false, 'angle');
        this._j = this._inSightTargets.findIndex(t => t.instance === this._target.instance);

        if (!this._target || this.interacting || this.hurting) {
            
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

    stopAllMotionStates() {

        if (this.turningLeft) super.movingLeft(false);
        if (this.turningRight) super.movingRight(false);
        if (this.forward) super.movingForward(false);
        if (this.backward) super.movingBackward(false);
        if (this.accelerating) super.accelerate(false);
        if (this.interacting) super.interact(false);
        if (this.gunPointing) super.gunPoint(false);
        if (this.shooting) super.shoot(false);
        if (this.meleeing) super.melee(false);

    }

    resetAnimation() {

        this.hurt(false);
        this.die(false);
        this.stopAllMotionStates();
        this.switchHelperComponents();
        this.stopQuickTurning();
        this.resetClimbingState();
        this.resetWeaponState();
        this.AWS.resetAllActions();
        this.AWS.setActionEffectiveWeight(this.currentActionType.idle.nick, 1);
        this.AWS.activeAction = this.AWS.previousAction = this.AWS.actions[this.currentActionType.idle.nick];

    }

    animationMixerTick(delta) {

        this.AWS.mixer.update(delta);

        for (let i = 0, il = this.weapons.length; i < il; i++) {

            const weapon = this.weapons[i];

            if (!weapon.visible) continue;
            
            weapon.AWS?.mixer.update(delta);

        }        

    }

    audioMixerTick() {

        this.#soundLogger.func = this.audioMixerTick.name;
        const daw = this.DAW;

        const walkAction = this.AWS.actions[this._clips.WALK.nick].action;
        // console.log(`time: ${this.AWS.actions[this._clips.WALK.nick].action.time}, timeScale: ${this.AWS.actions[this._clips.WALK.nick].action.timeScale}`);
        if (walkAction.isRunning()) {

            if (walkAction.time < this._soundSettings.WALKING_STEP_INTERVAL) {

                if (!this._soundSettings.WALK_LEFT_PLAYED) {

                    this.#soundLogger.log(`walk: left`);
                    this._soundSettings.WALK_LEFT_PLAYED = true;
                    this._soundSettings.WALK_RIGHT_PLAYED = false;
                    daw.play(this._soundSettings.WALK_LEFT);

                }                

            } else {

                if (!this._soundSettings.WALK_RIGHT_PLAYED) {

                    this.#soundLogger.log(`walk: right`);
                    this._soundSettings.WALK_LEFT_PLAYED = false;
                    this._soundSettings.WALK_RIGHT_PLAYED = true;
                    daw.play(this._soundSettings.WALK_RIGHT);

                }

            }

        } else {

            this._soundSettings.WALK_LEFT_PLAYED = false;
            this._soundSettings.WALK_RIGHT_PLAYED = false;
            daw.stop(this._soundSettings.WALK_LEFT);
            daw.stop(this._soundSettings.WALK_RIGHT);

        }

        const runAction = this.AWS.actions[this._clips.RUN.nick].action;
        if (runAction.isRunning()) {

            if (runAction.time < this._soundSettings.RUNNING_STEP_INTERVAL) {

                if (!this._soundSettings.RUN_RIGHT_PLAYED) {

                    this.#soundLogger.log(`run: right`);
                    this._soundSettings.RUN_LEFT_PLAYED = false;
                    this._soundSettings.RUN_RIGHT_PLAYED = true;
                    daw.play(this._soundSettings.RUN_LEFT);

                }

            } else {

                if (!this._soundSettings.RUN_LEFT_PLAYED) {

                    this.#soundLogger.log(`run: left`);
                    this._soundSettings.RUN_LEFT_PLAYED = true;
                    this._soundSettings.RUN_RIGHT_PLAYED = false;
                    daw.play(this._soundSettings.RUN_RIGHT);

                }
                

            }

        } else {

            this._soundSettings.RUN_LEFT_PLAYED = false;
            this._soundSettings.RUN_RIGHT_PLAYED = false;
            daw.stop(this._soundSettings.RUN_LEFT);
            daw.stop(this._soundSettings.RUN_RIGHT);

        }

    }

}

export { CombatPlayerBase };