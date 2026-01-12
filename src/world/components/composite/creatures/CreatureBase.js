import { Logger } from "../../../systems/Logger";
import { CustomizedCreatureTofu, GLTFModel } from "../../Models";
import { AnimateWorkstation } from "../../animation/AnimateWorkstation";
import { AudioWorkstation } from "../../audio/AudioWorkstation";
import { BS, AI as AICodes } from "../../basic/colorBase";
import { CAMERA_RAY_LAYER, WEAPONS } from "../../utils/constants";
import { polarity } from "../../utils/enums";

const DEBUG = false;
const DEBUG_EVENTS = false;
const DEBUG_ATTACK = false;

class CreatureBase extends CustomizedCreatureTofu {

    specs;

    _isNoticed = false;

    gltf;

    #logger = new Logger(DEBUG, 'CreatureBase');
    #eventsLogger = new Logger(DEBUG_EVENTS, 'CreatureBase');
    #attackLogger = new Logger(DEBUG_ATTACK, 'CreatureBase');

    AWS;
    DAW;

    _clips = {};
    _animationSettings = {};

    _soundSettings = {};

    isCreature = true;

    _meleeWeapon;
    _delta = 0;
    _i = 0;
    // in every attack loop, it will set to true at first frame,
    // it will set to false when target out of damage range
    _attacked = false;

    constructor(specs) {

        const { name, currentRoom } = specs;
        const { src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetX, offsetY, offsetZ } = specs;
        const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8, sovRadius = Math.max(width, width2, depth, depth2, height) } = specs;
        const { collisionSize = { width, depth, height } } = specs;
        const { rotateR = .9, vel = 0.7, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5 } = specs;
        const { clips, animationSetting } = specs;
        const { soundSetting } = specs;
        const { scale = [1, 1, 1], gltfScale = [1, 1, 1] } = specs;
        const { isActive = true, showBS = false, enableCollision = true, typeMapping = {} } = specs;
        const { createDefaultBoundingObjects = true } = specs;
        const { HPMax = 100 } = specs;
        const { needAimRay = false, needFocusRay = true, focusHeight = 0 } = specs;

        super({ 
            name, 
            size: { width, width2, depth, depth2, height, sovRadius }, collisionSize, 
            rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge, 
            createDefaultBoundingObjects, enableCollision, typeMapping,
            HPMax, needAimRay, needFocusRay, focusHeight
        });

        this.specs = specs;
        this.isActive = isActive;
        this.currentRoom = currentRoom;

        Object.assign(this._clips, clips);
        Object.assign(this._animationSettings, animationSetting);
        Object.assign(this._soundSettings, soundSetting);
        
        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(gltfScale);

        this.setScale(scale);

        this.showBS(showBS);

        this.group.add(this.gltf.group);

    }

    get isNoticed() {

        return this._isNoticed;

    }

    set isNoticed(val) {

        if (val) {

            this.DAW.play(this._soundSettings.NOTICED);

        } else {

            this.DAW.stop(this._soundSettings.NOTICED);

        }

        this._isNoticed = val;

    }

    async init() {
        
        await Promise.all([this.gltf.init()]);

        this.showSkeleton(false);
        this.bindEvents();

        this.gltf.visible = true;

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: this._clips });
        this.AWS.init();

        this.DAW = new AudioWorkstation();
        // stop and dispose all sounds when disposed
        this.onDisposed.push(() => {
            this.DAW.dispose();
        });

        this.trackResources();
        
    }

    trackResources() {

        super.trackResources();

        this.track(this.gltf?.skeleton);

    }

    addSoundsToGroup(soundName) {

        const sound = this.DAW.registerSound(soundName);
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

    bindEvents() {
    
        const type = 'visibleChanged';
        const listener = (event) => {

            this.#logger.log(`${this.gltf.name}: ${event.message}`);
            this.gltf.setLayers(CAMERA_RAY_LAYER);

        };

        this.gltf.addEventListener(type, listener);

    }

    showSkeleton(show) {

        if (this.gltf.skeleton) {

            this.gltf.skeleton.visible = show;

        }

    }

    movingForward(val) {

        if (val) {

            if (!this.forward) {

                if (this.rotating) {

                    this.#logger.log(`zero turn to walk turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.walk.nick], this.AWS.actions[this.typeMapping.walk.nick], this._animationSettings.WALK_TURN_TO_ZERO_TURN, 1);

                } else {

                    this.#logger.log('idle to walk');
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.idle.nick], this.AWS.actions[this.typeMapping.walk.nick], this._animationSettings.IDLE_TO_WALK);

                }

                super.movingForward(true);
                this.switchHelperComponents();

            }

        } else {

            if (this.forward) {

                if (this.rotating) {

                    this.#logger.log(`walk turn to zero turn`);
                    this.AWS.setActionEffectiveWeight(this.typeMapping.walk.nick, this._animationSettings.TURN_WEIGHT);

                } else {

                    this.#logger.log(`walk to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.walk.nick], this.AWS.actions[this.typeMapping.idle.nick], this._animationSettings.WALK_TO_IDLE);

                } 

                super.movingForward(false);
                this.switchHelperComponents();

            }

        }

    }

    movingLeft(val) {

        if (val) {

            if (this.turningRight) {

                this.movingRight(false);

            }
            
            if (!this.turningLeft) {

                if (!this.forward) {
          
                    this.#logger.log(`idle to left turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.idle.nick], this.AWS.actions[this.typeMapping.walk.nick], this._animationSettings.IDLE_TO_TURN, this._animationSettings.TURN_WEIGHT);

                    this.AWS.setActionEffectiveTimeScale(this.typeMapping.walk.nick, this._animationSettings.WALK_TIMESCALE);

                }

                super.movingLeft(true);
                this.switchHelperComponents();

            }

        } else {

            if (this.turningLeft) {

                if (!this.forward) {

                    this.#logger.log(`left turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.walk.nick], this.AWS.actions[this.typeMapping.idle.nick], this._animationSettings.TURN_TO_IDLE);

                }

                super.movingLeft(false);
                this.switchHelperComponents();

            }

        }

    }

    movingRight(val) {

        if (val) {

            if (this.turningLeft) {

                this.movingLeft(false);

            }

            if (!this.turningRight) {

                if (!this.forward) {

                    this.#logger.log(`idle to right turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.idle.nick], this.AWS.actions[this.typeMapping.walk.nick], this._animationSettings.IDLE_TO_TURN, this._animationSettings.TURN_WEIGHT);

                    this.AWS.setActionEffectiveTimeScale(this.typeMapping.walk.nick, this._animationSettings.WALK_TIMESCALE);

                }

                super.movingRight(true);
                this.switchHelperComponents();

            }
            
        } else {

            if (this.turningRight) {

                if (!this.forward) {

                    this.#logger.log(`right turn to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.walk.nick], this.AWS.actions[this.typeMapping.idle.nick], this._animationSettings.TURN_TO_IDLE);

                }

                super.movingRight(false);
                this.switchHelperComponents();

            }

        }

    }

    melee(val) {

        this.#logger.func = this.melee.name;

        if (val) {

            if (!this.meleeing) {

                this.startAttackTimer();

                const endCallback = () => {

                    this.melee(false);

                }

                this.AWS.prepareCrossFade(null, this.AWS.actions[this.typeMapping.attack.nick], this._animationSettings.ATTACK, 1, false, false, this._animationSettings.ATTACK, endCallback);                

            }

        }

        super.melee(val);
        this.switchHelperComponents();

    }

    hurt(val) {

        this.#logger.func = this.hurt.name;

        if (val) {

            const hurtAction = this.AWS.actions[this.typeMapping.hurt.nick];
            const attackAction = this.AWS.actions[this.typeMapping.attack.nick];
            if (this.AWS.activeAction === hurtAction) {

                this.AWS.fadeToPrevious();
                hurtAction.ignoreFinishedEvent = true;

            } else if (this.AWS.activeAction === attackAction) {

                this.AWS.fadeToPrevious();
                attackAction.ignoreFinishedEvent = true;
                attackAction.ignoreFadeOut = true;
                super.melee(false);
                this._i = 0;

            }

            const endCallback = () => {

                this.hurt(false);
                hurtAction.ignoreFinishedEvent = undefined;
                attackAction.ignoreFinishedEvent = undefined;
                attackAction.ignoreFadeOut = undefined;

            }

            this.#logger.log(`${this.name} is on hurt`);
            this.AWS.prepareCrossFade(null, hurtAction, this._animationSettings.HURT, this._animationSettings.HURT_WEIGHT, false, false, this._animationSettings.HURT, endCallback);

        }

        super.hurt(val);

    }

    die(val) {

        this.#logger.func = this.die.name;

        if (val) {

            this.#logger.log(`${this.name} is dead`);

            const dieAction = this.AWS.actions[this.typeMapping.die.nick];
            const hurtAction = this.AWS.actions[this.typeMapping.hurt.nick];
            const attackAction = this.AWS.actions[this.typeMapping.attack.nick];
            if (this.AWS.activeAction === hurtAction) {

                this.AWS.fadeToPrevious();
                hurtAction.ignoreFinishedEvent = true;
                hurtAction.ignoreFadeOut = true;

            } else if (this.AWS.activeAction === attackAction) {

                this.AWS.fadeToPrevious();
                attackAction.ignoreFinishedEvent = true;
                attackAction.ignoreFadeOut = true;
                super.melee(false);
                this._i = 0;

            }

            const endCallback = () => {

                this.isActive = false;
                hurtAction.ignoreFinishedEvent = undefined;
                hurtAction.ignoreFadeOut = undefined;
                attackAction.ignoreFinishedEvent = undefined;
                attackAction.ignoreFadeOut = undefined;
                this.AWS.isLooping = false;

            }
            dieAction.ignoreFadeOut = true;

            this.AWS.prepareCrossFade(null, dieAction, this._animationSettings.DIE, 1, false, false, 0, endCallback);

        }        

        super.die(val);

    }

    damageReceiveTick(params) {

        this.#logger.func = this.damageReceiveTick.name;

        const { damage, attackBy } = params;

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
            this.rapierContainer.setActiveInstances([this.rapierInstances.DEAD_BODY]);

        }

        if (this.forward || this.turningLeft || this.turningRight) {

            super.movingLeft(false);
            super.movingRight(false);
            super.movingForward(false);

        }

        this.switchHelperComponents();

        if (this.dead) {

            this.setAllBoundingBoxLayers(false);

        }

    }

    processDamageSound(attackBy) {

        this.DAW.stop(this._soundSettings.NOTICED);
        this.DAW.stop(this._soundSettings.ATTACK);
        this.DAW.stop(this._meleeWeapon.fireSound);

        switch(attackBy) {

            case WEAPONS.BAYONET:

                this.DAW.play(this._soundSettings.KNIFE_HIT);
                break;

            case WEAPONS.GLOCK:
            case WEAPONS.PISTOL1:
            case WEAPONS.REVOLVER:
            case WEAPONS.SMG_SHORT:

                this.DAW.play(this._soundSettings.BULLET_HIT);
                break;

        }

        this.DAW.play(this._soundSettings.HURT);

    }

    attackTick(params) {

        this.#attackLogger.func = this.attackTick.name;

        if (this.hurting || this.dead) return;

        const { delta, target } = params;
        const result = {
            damage: 0,
            onTarget: null,
            attackBy: null
        }
        
        if (this.checkTargetInDamageRange(target).in) {

            if (!this.meleeing) {

                if (!this._attacked) {

                    this.stopMovingActions();

                }

                this.melee(true);
                this.setAiming();
                this.DAW.stop(this._soundSettings.NOTICED);
                this.DAW.play(this._soundSettings.ATTACK, false);
                this.DAW.play(this._meleeWeapon.fireSound);                

            }

        } else {

            if (!this.meleeing) {

                this._i = 0;
                this._target = null;
                this._attacked = false;
                this.DAW.play(this._soundSettings.NOTICED, false);

            }

        }

        if (this.meleeing) {

            this._delta += delta;
            
            if (this._delta >= this._meleeWeapon.prepareInterval) {

                if (!this._attacked) {

                    this._i++;
                    this.#attackLogger.log(`${this.name} attacks on ${target.name}: ${this._i}`);
                    this._attacked = true;

                    if (this.checkTargetInDamageRange(target).in) {

                        result.onTarget = target;
                        result.attackBy = this._meleeWeapon.weaponType;
                        result.damage = this._meleeWeapon.ammo.realDamage;
                        this.#attackLogger.log(`right in the face!`);

                    } else {

                        this.#attackLogger.log(`but missed...`);

                    }

                }

            }

        }

        return result;

    }

    movingTick() {

        this.#logger.func = this.movingTick.name;

        if (this.hurting || this.dead || this._target) {

            return;

        }

        if (this._isNoticed) {

            const target = this.getNearestInSightTarget(null, this._inSightTargets, false);
            const { dirAngle } = target;

            if (dirAngle.angle < 0.01) {

                this.movingLeft(false);
                this.movingRight(false);

            } else if (dirAngle.angle > 0.26) {
                
                if (dirAngle.direction === polarity.left) {

                    this.movingLeft(true);

                } else {

                    this.movingRight(true);

                }

            }

            this.movingForward(true);

        } else {

            this.stopMovingActions();
            this._focusTarget = null;

        }

    }

    stopMovingActions() {

        this.movingLeft(false);
        this.movingRight(false);
        this.movingForward(false);

    }

    setAiming() {

        this._target = this.getNearestInSightTarget(null, this._inSightTargets, false, 'angle');
        this._j = this._inSightTargets.findIndex(t => t.instance === this._target.instance);

        if (!this._target) {
            
            this.aimingRad = 0;
            return;
        
        }

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

    startAttackTimer() {

        this._delta = 0;
        this._attacked = false;

    }

    // inherited by child
    setInitialActions() {}

    resetAnimation() {
        
        super.hurt(false);
        super.die(false);
        super.melee(false);
        super.movingLeft(false);
        super.movingRight(false);
        super.movingForward(false);
        this.switchHelperComponents();
        this.AWS.resetAllActions();
        this.rapierContainer.setActiveInstances([this.rapierInstances.CHARACTER_CONTROLLER]);

    }

    onSovSphereTriggerEnter(target) {

        this.#eventsLogger.func = this.onSovSphereTriggerEnter.name;
        this.#eventsLogger.log(`${this.name} sov sphere trigger entered by ${target.name}`);

        if (this._inSightTargets.length > 0) {

            this.isNoticed = true;
            this.sovBoundingSphereMesh.material.color.setHex(AICodes.targetInRange);

        }
        
    }

    onSovSphereTriggerExit(target) {

        this.#eventsLogger.func = this.onSovSphereTriggerExit.name;
        this.#eventsLogger.log(`${target.name} exited ${this.name}'s sov sphere trigger`);

        if (this._inSightTargets.length === 0) {

            this.isNoticed = false;
            this.sovBoundingSphereMesh.material.color.setHex(BS);

        }

    }

    onInSightTargetsCleared() {

        this.isNoticed = false;

    }

    onInSightTargetsRemoved() {

        if (this._inSightTargets.length === 0) {

            this.isNoticed = false;

        }

    }

    animationMixerTick(delta) {

        this.AWS.mixer.update(delta);

    }

}

export { CreatureBase };