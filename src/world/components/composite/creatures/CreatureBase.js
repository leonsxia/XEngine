import { Logger } from "../../../systems/Logger";
import { CollisionBox, GLTFModel, Tofu } from "../../Models";
import { AnimateWorkstation } from "../../animation/AnimateWorkstation";
import { BS, AI as AICodes } from "../../basic/colorBase";
import { CAMERA_RAY_LAYER } from "../../utils/constants";
import { polarity } from "../../utils/enums";

const DEBUG = true;

class CreatureBase extends Tofu {

    specs;

    isActive = true;
    _isNoticed = false;
    _isAttacking = false;

    gltf;

    #logger = new Logger(DEBUG, 'CreatureBase');

    AWS;

    _clips = {};
    _animationSettings = {};

    typeMapping;

    collisionBoxes = new Map();

    isCreature = true;

    _delta = 0;
    _i = 0;

    onBeforeCollisionBoxChanged = () => {};
    onCollisionBoxChanged = () => {};

    constructor(specs) {

        const { name } = specs;
        const { src, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8, sovRadius = Math.max(width, width2, depth, depth2, height) } = specs;
        const { collisionSize = { width, depth, height } } = specs;
        const { rotateR = .9, vel = 0.7, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5 } = specs;
        const { clips, animationSetting } = specs;
        const { scale = [1, 1, 1], gltfScale = [1, 1, 1] } = specs;
        const { isActive = true, showBS = false, enableCollision = true, typeMapping } = specs;

        super({ name, size: { width, width2, depth, depth2, height, sovRadius }, collisionSize, rotateR, vel, turnbackVel, velEnlarge, rotateREnlarge });

        this.specs = specs;
        this.isActive = isActive;
        this.typeMapping = typeMapping;

        Object.assign(this._clips, clips);
        Object.assign(this._animationSettings, animationSetting);
        
        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(gltfScale);

        this.setScale(scale);

        if (enableCollision) {

            // this.createCollisionBox();
            this.createCollisionBoxes();
            this.switchCollisionBox(this.typeMapping.idle.nick, false);
            this.showCollisionBox(false);

        }

        this.showBS(showBS);

        this.group.add(this.gltf.group);

    }

    async init() {
        
        await Promise.all([this.gltf.init()]);

        this.showSkeleton(false);

        this.gltf.traverse((mesh) => {

            mesh.layers.enable(CAMERA_RAY_LAYER);

        });

        this.bindEvents();

        this.gltf.visible = true;

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: this._clips });
        this.AWS.init();
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

    createCollisionBoxes() {

        const { name, idleCollisionSize, walkCollisionSize } = this.typeMapping;
        const idleCBoxSpecs = {
            name: `${this.name}-${name}-idle-cBox`, 
            width: idleCollisionSize.width, depth: idleCollisionSize.depth, height: idleCollisionSize.height, 
            enableWallOBBs: true, showArrow: false, lines: false,
            ignoreFaces: [4, 5]
        };
        const walkCBoxSpecs = {
            name: `${this.name}-${name}-walk-cBox`, 
            width: walkCollisionSize.width, depth: walkCollisionSize.depth, height: walkCollisionSize.height, 
            enableWallOBBs: true, showArrow: false, lines: false,
            ignoreFaces: [4, 5]
        };

        this.collisionBoxes.clear();
        this.collisionBoxes.set(this.typeMapping.idle.nick, new CollisionBox(idleCBoxSpecs));
        this.collisionBoxes.set(this.typeMapping.walk.nick, new CollisionBox(walkCBoxSpecs));

        this.collisionBoxes.get(this.typeMapping.idle.nick).father = this;
        this.collisionBoxes.get(this.typeMapping.walk.nick).father = this;
        
    }

    switchCollisionBox(action, forceEvent = true) {

        if (forceEvent) this.onBeforeCollisionBoxChanged(this);

        const cbox = this.collisionBoxes.get(action);

        this.walls = [];
        this.walls.push(...cbox.walls);

        if (this.collisionBox) {

            this.group.remove(this.collisionBox.group);

        }

        this.group.add(cbox.group);
        this.collisionBox = cbox;
        this.showCollisionBox(false);

        if (forceEvent) this.onCollisionBoxChanged(this);

    }

    movingForward(val) {

        if (val) {

            if (!this.forward) {

                if (this._isAttacking) {

                    this.#logger.log(`walk in queue`);
                    this.AWS.previousAction = this.AWS.actions[this.typeMapping.walk.nick];
                    this.AWS.setActionWeightTimeScaleInCallback(this.typeMapping.walk.nick, 1, this._animationSettings.WALK_TIMESCALE);

                } else if (!this.rotating) {

                    this.#logger.log('idle to walk');
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.idle.nick], this.AWS.actions[this.typeMapping.walk.nick], this._animationSettings.IDLE_TO_WALK);
                    this.switchCollisionBox(this.typeMapping.walk.nick);

                } else if (this.rotating) {

                    this.#logger.log(`zero turn to walk turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.walk.nick], this.AWS.actions[this.typeMapping.walk.nick], this._animationSettings.WALK_TURN_TO_ZERO_TURN, 1);

                }

                super.movingForward(true);

            }

        } else {

            if (this.forward) {

                if (this._isAttacking) {

                    if (this.rotating) {

                        this.#logger.log(`walk turn in queue 2`);
                        this.AWS.setActionWeightTimeScaleInCallback(this.typeMapping.walk.nick, this._animationSettings.TURN_WEIGHT, this._animationSettings.WALK_TIMESCALE);

                    } else {

                        this.#logger.log(`idle in queue 2`);
                        this.AWS.previousAction = this.AWS.actions[this.typeMapping.idle.nick];

                        // TEST: gun fire -> press and release w once while gun firing
                        this.AWS.setActionWeightTimeScaleInCallback(this.typeMapping.idle.nick, 1);
                        // TEST: gun fire -> press and release w once -> walk backward
                        this.AWS.clearActionCallback(this.typeMapping.walk.nick);

                    }

                } else if (!this.rotating) {

                    this.#logger.log(`walk to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.walk.nick], this.AWS.actions[this.typeMapping.idle.nick], this._animationSettings.WALK_TO_IDLE);
                    this.switchCollisionBox(this.typeMapping.idle.nick);

                } else {

                    this.#logger.log(`walk turn to zero turn`);
                    this.AWS.setActionEffectiveWeight(this.typeMapping.walk.nick, this._animationSettings.TURN_WEIGHT);

                }

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

                if (!this.forward) {

                    if (this._isAttacking) {

                        this.#logger.log(`left turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[this.typeMapping.walk.nick];
                        this.AWS.setActionWeightTimeScaleInCallback(this.typeMapping.walk.nick, this._animationSettings.TURN_WEIGHT, this._animationSettings.WALK_TIMESCALE);

                    } else {

                        this.#logger.log(`idle to left turn`);
                        this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.idle.nick], this.AWS.actions[this.typeMapping.walk.nick], this._animationSettings.IDLE_TO_TURN, this._animationSettings.TURN_WEIGHT);
                        this.switchCollisionBox(this.typeMapping.walk.nick);

                    }

                    this.AWS.setActionEffectiveTimeScale(this.typeMapping.walk.nick, this._animationSettings.WALK_TIMESCALE);

                }

                super.movingLeft(true);

            }

        } else {

            if (this.turningLeft) {

                if (!this.forward) {

                    if (this._isAttacking) {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this.typeMapping.idle.nick];

                        // TEST: gun fire -> press and release a once while gun firing
                        this.AWS.setActionWeightTimeScaleInCallback(this.typeMapping.idle.nick, 1);
                        // TEST: gun fire -> press and releas a once -> walk forward
                        this.AWS.clearActionCallback(this.typeMapping.walk.nick);

                    } else {

                        this.#logger.log(`left turn to idle`);
                        this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.walk.nick], this.AWS.actions[this.typeMapping.idle.nick], this._animationSettings.TURN_TO_IDLE);
                        this.switchCollisionBox(this.typeMapping.walk.nick);

                    }

                }

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

                if (!this.forward) {

                    if (this._isAttacking) {

                        this.#logger.log(`right turn in queue`);
                        this.AWS.previousAction = this.AWS.actions[this.typeMapping.walk.nick];

                        this.AWS.setActionWeightTimeScaleInCallback(this.typeMapping.walk.nick, this._animationSettings.TURN_WEIGHT);

                    } else {

                        this.#logger.log(`idle to right turn`);
                        this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.idle.nick], this.AWS.actions[this.typeMapping.walk.nick], this._animationSettings.IDLE_TO_TURN, this._animationSettings.TURN_WEIGHT);
                        this.switchCollisionBox(this.typeMapping.walk.nick);

                    }

                    this.AWS.setActionEffectiveTimeScale(this.typeMapping.walk.nick, this._animationSettings.WALK_TIMESCALE);

                }

                super.movingRight(true);

            }
            
        } else {

            if (this.turningRight) {

                if (!this.forward) {

                    if (this._isAttacking) {

                        this.#logger.log(`idle in queue 3`);
                        this.AWS.previousAction = this.AWS.actions[this.typeMapping.idle.nick];

                        // TEST: gun fire -> press and release a once while gun firing
                        this.AWS.setActionWeightTimeScaleInCallback(this.typeMapping.idle.nick, 1);
                        // TEST: gun fire -> press and releas d once -> walk forward
                        this.AWS.clearActionCallback(this.typeMapping.walk.nick);

                    } else {

                        this.#logger.log(`right turn to idle`);
                        this.AWS.prepareCrossFade(this.AWS.actions[this.typeMapping.walk.nick], this.AWS.actions[this.typeMapping.idle.nick], this._animationSettings.TURN_TO_IDLE);
                        this.switchCollisionBox(this.typeMapping.walk.nick);

                    }

                }

                super.movingRight(false);

            }

        }

    }

    onSovSphereTriggerEnter(target) {

        this.#logger.func = this.onSovSphereTriggerEnter.name;
        this.#logger.log(`${this.name} sov sphere trigger entered by ${target.name}`);

        if (this._inSightTargets.length === 1) {

            this._isNoticed = true;
            this.sovBoundingSphereMesh.material.color.setHex(AICodes.targetInRange);

        }
        
    }

    onSovSphereTriggerExit(target) {

        this.#logger.func = this.onSovSphereTriggerExit.name;
        this.#logger.log(`${target.name} exited ${this.name}'s sov sphere trigger`);

        if (this._inSightTargets.length === 0) {

            this._isNoticed = false;
            this.sovBoundingSphereMesh.material.color.setHex(BS);

        }

    }

    movingTick() {

        this.#logger.func = this.movingTick.name;

        if (this._isNoticed) {

            this._target = this.getNearestInSightTarget(null, this._inSightTargets, false);
            const dirAngle = this.getTargetDirectionAngle(this._target);

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

            this.movingLeft(false);
            this.movingRight(false);
            this.movingForward(false);

        }

    }

    mixerTick(delta) {

        this.AWS.mixer.update(delta);

    }

}

export { CreatureBase };