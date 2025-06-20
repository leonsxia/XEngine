import { CreatureBase } from "../../Models";
import { ZOMBIE_MALE_CLIPS as CLIPS } from "../../utils/constants";
import { Logger } from '../../../systems/Logger';
import { CreatureTypeMapping } from "./CreatureTypeMapping";

const GLTF_SRC = 'creatures/zombie_male.glb';

const DEBUG = true;
const ANIMATION_SETTINGS = {
    IDLE_TO_WALK: 0.1,
    WALK_TO_IDLE: 0.3,
    IDLE_TO_TURN: 0.1,
    TURN_TO_IDLE: 0.1,
    WALK_TURN_TO_ZERO_TURN: 0.3,
    WALK_TIMESCALE: 2.1,
    TURN_WEIGHT: 0.7,
    ATTACK: 0.2,
    HURT: 0.1,
    DIE: 0.2,
    HURT_TIMESCALE: 2
};

const ZOMBIE_TYPES_MAPPING = {
    STANDARD: new CreatureTypeMapping({
        name: 'standard',
        idle: CLIPS.IDLE, walk: CLIPS.WALK, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 2.1, idleToWalk: 0.1, walkToIdle: 0.3,
        idleCollisionSize: { width: .63, depth: .6, height: 1.8 },
        walkCollisionSize: { width: .63, depth: .9, height: 1.8 },
        idleBoundingFaceSize: { width: .63, depth: .6, height: 1.8, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .63, depth: .9, height: 1.8, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .63, depth: .7, height: 1.8, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .63, depth: .4, height: 1.8 },
        walkBoundingBoxSize: { width: .63, depth: .75, height: 1.8},
        pushingBoxSize: { height: 1.8, depth: .9 }
    }),
    VARIANT1: new CreatureTypeMapping({
        name: 'variant1',
        idle: CLIPS.IDLE, walk: CLIPS.WALK2, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH2, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 1.5, idleToWalk: 0.1, walkToIdle: 0.3,
        idleCollisionSize: { width: .63, depth: .6, height: 1.8 },
        walkCollisionSize: { width: .63, depth: .9, height: 1.8 },
        idleBoundingFaceSize: { width: .63, depth: .6, height: 1.8, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .63, depth: .9, height: 1.8, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .63, depth: .7, height: 1.8, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .63, depth: .4, height: 1.8 },
        walkBoundingBoxSize: { width: .63, depth: .75, height: 1.8},
        pushingBoxSize: { height: 1.8, depth: .9 }
    }),
    VARIANT2: new CreatureTypeMapping({
        name: 'variant2',
        idle: CLIPS.IDLE, walk: CLIPS.WLAK3, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 1, idleToWalk: 0.2, walkToIdle: 0.3,
        idleCollisionSize: { width: .63, depth: .6, height: 1.8 },
        walkCollisionSize: { width: .63, depth: 1.55, height: 0.8 },
        idleBoundingFaceSize: { width: .63, depth: .6, height: 1.8, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .63, depth: 1.5, height: 1.8, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .63, depth: 1.3, height: 1.8, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .63, depth: .4, height: 1.8 },
        walkBoundingBoxSize: { width: .63, depth: 1.5, height: 1.8},
        pushingBoxSize: { height: 1.8, depth: 1.5 }
    }),
    VARIANT3: new CreatureTypeMapping({
        name: 'variant3',
        idle: CLIPS.IDLE, walk: CLIPS.CRAWL, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH2, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 1, idleToWalk: 0.3, walkToIdle: 0.3,
        idleCollisionSize: { width: .63, depth: .6, height: 1.8 },
        walkCollisionSize: { width: .63, depth: 1.5, height: 0.8 },
        idleBoundingFaceSize: { width: .63, depth: .6, height: 1.8, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .63, depth: 1.5, height: 1.8, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .63, depth: 1.3, height: 1.8, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .63, depth: .4, height: 1.8 },
        walkBoundingBoxSize: { width: .63, depth: 1.5, height: 1.8},
        pushingBoxSize: { height: 1.8, depth: 1.5 }
    })
};

class ZombieMale extends CreatureBase {

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(DEBUG, 'ZombieMale');

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetY = - 2.225, offsetZ = 0 } = specs;
        const { width = .63, width2 = .63, depth = .9, depth2 = .7, height = 1.8 } = specs;
        const { collisionSize = { width, depth: .7, height } } = specs;
        const { vel = .37, rotateR = 1.1 } = specs;
        const { scale = [1, 1, 1], gltfScale = [.4, .4, .4] } = specs;
        const { isActive = true, sovRadius = 6.5, showBS = false, enableCollision = true } = specs;
        const { variant = 'standard' } = specs;
        const { createDefaultBoundingObjects = false } = specs;

        const animationSetting = Object.assign({}, ANIMATION_SETTINGS);

        const typeMapping = ZOMBIE_TYPES_MAPPING[variant.toUpperCase()] ?? ZOMBIE_TYPES_MAPPING.STANDARD;
        if (typeMapping) {

            animationSetting.IDLE_TO_WALK = typeMapping.idleToWalk;
            animationSetting.WALK_TO_IDLE = typeMapping.walkToIdle;
            animationSetting.WALK_TIMESCALE = typeMapping.walkTimeScale;

        }

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            offsetY, offsetZ, width, width2, depth, depth2, height, collisionSize,
            vel, rotateR,
            scale, gltfScale,
            clips: CLIPS,  animationSetting: animationSetting,
            isActive, sovRadius, showBS, enableCollision,
            typeMapping,
            createDefaultBoundingObjects
        };

        super(setup);

        this.showTofu(false);

    }

    async init() {

        await super.init();
        
        this.setInitialActions();
   
    }

    setInitialActions() {

        this.AWS.setActionEffectiveTimeScale(this.typeMapping.walk.nick, this._animationSettings.WALK_TIMESCALE);
        this.AWS.setActionEffectiveTimeScale(this.typeMapping.hurt.nick, this._animationSettings.HURT_TIMESCALE);

    }

}

export { ZombieMale };