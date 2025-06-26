import { Logger } from "../../../systems/Logger";
import { CustomizedCreatureTofu, GLTFModel } from "../../Models";
import { AnimateWorkstation } from "../../animation/AnimateWorkstation";
import { BS, AI as AICodes } from "../../basic/colorBase";
import { CAMERA_RAY_LAYER } from "../../utils/constants";
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

    _clips = {};
    _animationSettings = {};

    isCreature = true;

    _meleeWeapon;
    _delta = 0;
    _i = 0;
    // in every attack loop, it will set to true at first frame,
    // it will set to false when target out of damage range
    _attacked = false;

    constructor(specs) {

        const { name } = specs;
        const { src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8, sovRadius = Math.max(width, width2, depth, depth2, height) } = specs;
        const { collisionSize = { width, depth, height } } = specs;
        const { rotateR = .9, vel = 0.7, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5 } = specs;
        const { clips, animationSetting } = specs;
        const { scale = [1, 1, 1], gltfScale = [1, 1, 1] } = specs;
        const { isActive = true, showBS = false, enableCollision = true, typeMapping = {} } = specs;
        const { createDefaultBoundingObjects = true } = specs;
        const { HPMax = 100 } = specs;

        super({ 
            name, 
            size: { width, width2, depth, depth2, height, sovRadius }, collisionSize, 
            rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge, 
            createDefaultBoundingObjects, enableCollision, typeMapping,
            HPMax
        });

        this.specs = specs;
        this.isActive = isActive;

        Object.assign(this._clips, clips);
        Object.assign(this._animationSettings, animationSetting);
        
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

    async init() {
        
        await Promise.all([this.gltf.init()]);

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

    bindEvents() {
    
        const type = 'visibleChanged';
        const listener = (event) => {

            this.#logger.log(`${this.gltf.name}: ${event.message}`);
            this.gltf.setLayers(CAMERA_RAY_LAYER);

        };

        this.gltf.addEventListener(type, listener);
        this.gltf.eventList.set(type, listener);

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

                    super.melee(false);

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
                console.log(`${this.name} attack fade out`);

            }

            const endCallback = () => {

                this.hurt(false);
                hurtAction.ignoreFinishedEvent = undefined;
                attackAction.ignoreFinishedEvent = undefined;
                attackAction.ignoreFadeOut = undefined;

            }

            this.#logger.log(`${this.name} is on hurt`);
            this.AWS.prepareCrossFade(null, hurtAction, this._animationSettings.HURT, 1, false, false, this._animationSettings.HURT, endCallback);

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
        this.switchHelperComponents();

    }

    damageReceiveTick(params) {

        this.#logger.func = this.damageReceiveTick.name;

        const { damage } = params;

        this.health.current -= damage;

        if (this.health.currentLife > 0) {

            this.hurt(true);

        } else {
          
            this.clearInSightTargets();
            this.die(true);

        }

        if (this.forward || this.turningLeft || this.turningRight) {

            this.stopMovingActions();

        }

        if (this.dead) {

            this.setAllBoundingBoxLayers(false);

        }

    }

    attackTick(params) {

        this.#attackLogger.func = this.attackTick.name;

        if (this.hurting || this.dead) return;

        const { delta, target } = params;
        const result = {
            damage: 0,
            onTarget: null
        }
        
        if (this.checkTargetInDamageRange(target).in) {

            if (!this.meleeing) {

                if (!this._attacked) {

                    this.stopMovingActions();

                }

                this.melee(true);
                this.setAiming();

            }            

        } else {

            if (!this.meleeing) {

                this._i = 0;
                this._target = null;
                this._attacked = false;

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
                        result.damage = this._meleeWeapon.ammo.damage;
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
        
        this.hurt(false);
        this.die(false);
        this.melee(false);
        this.stopMovingActions();
        this.AWS.resetAllActions();

    }

    onSovSphereTriggerEnter(target) {

        this.#eventsLogger.func = this.onSovSphereTriggerEnter.name;
        this.#eventsLogger.log(`${this.name} sov sphere trigger entered by ${target.name}`);

        if (this._inSightTargets.length === 1) {

            this._isNoticed = true;
            this.sovBoundingSphereMesh.material.color.setHex(AICodes.targetInRange);

        }
        
    }

    onSovSphereTriggerExit(target) {

        this.#eventsLogger.func = this.onSovSphereTriggerExit.name;
        this.#eventsLogger.log(`${target.name} exited ${this.name}'s sov sphere trigger`);

        if (this._inSightTargets.length === 0) {

            this._isNoticed = false;
            this.sovBoundingSphereMesh.material.color.setHex(BS);

        }

    }

    onInSightTargetsCleared() {

        this._isNoticed = false;

    }

    onInSightTargetsRemoved() {

        if (this._inSightTargets.length === 0) {

            this._isNoticed = false;

        }

    }

    mixerTick(delta) {

        this.AWS.mixer.update(delta);

    }

}

export { CreatureBase };