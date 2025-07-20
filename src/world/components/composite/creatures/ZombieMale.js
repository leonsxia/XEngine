import { CreatureBase, WeaponBase } from "../../Models.js";
import { ZOMBIE_MALE_CLIPS as CLIPS } from "../../utils/constants";
import { Logger } from '../../../systems/Logger';
import { CreatureTypeMapping } from "./CreatureTypeMapping";
import { Ammo } from "../weapons/Ammo";

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
    HURT_WEIGHT: 1,
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
        attackCollisionSize: { width: .63, depth: .7, height: 1.8 },
        idleBoundingFaceSize: { width: .63, depth: .6, height: 1.8, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .63, depth: .9, height: 1.8, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .63, depth: .7, height: 1.8, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .63, depth: .7, height: 1.8, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .63, depth: .4, height: 1.8 },
        walkBoundingBoxSize: { width: .63, depth: .75, height: 1.8},
        attackBoundingBoxSize: { width: .63, depth: .75, height: 1.8},
        pushingBoxSize: { height: 1.8, depth: .7 },
        weapon: new WeaponBase({
            name: `zombie_male_standard_claw`,
            fireRate: 1.1,
            prepareInterval: 1.1,
            damageRange: .7,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 20, offset0: - 8, offset1: 8 }),
            isDefault: true
        })
    }),
    VARIANT1: new CreatureTypeMapping({
        name: 'variant1',
        idle: CLIPS.IDLE, walk: CLIPS.WALK2, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH2, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 1.5, idleToWalk: 0.1, walkToIdle: 0.3,
        idleCollisionSize: { width: .63, depth: .6, height: 1.8 },
        walkCollisionSize: { width: .63, depth: .9, height: 1.8 },
        attackCollisionSize: { width: .63, depth: .7, height: 1.8 },
        idleBoundingFaceSize: { width: .63, depth: .6, height: 1.8, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .63, depth: .9, height: 1.8, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .63, depth: .7, height: 1.8, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .63, depth: .7, height: 1.8, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .63, depth: .4, height: 1.8 },
        walkBoundingBoxSize: { width: .63, depth: .75, height: 1.8 },
        attackBoundingBoxSize: { width: .63, depth: .75, height: 1.8},
        pushingBoxSize: { height: 1.8, depth: .9 },
        weapon: new WeaponBase({
            name: `zombie_male_variant1_claw`,
            fireRate: 1.25,
            prepareInterval: .95,
            damageRange: .7,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 20, offset0: - 8, offset1: 8 }),
            isDefault: true
        })
    }),
    VARIANT2: new CreatureTypeMapping({
        name: 'variant2',
        idle: CLIPS.IDLE, walk: CLIPS.WLAK3, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 1, idleToWalk: 0.2, walkToIdle: 0.3,
        idleCollisionSize: { width: .63, depth: .6, height: 1.8 },
        walkCollisionSize: { width: .63, depth: 1.17, height: 0.8 },
        attackCollisionSize: { width: .63, depth: .7, height: 1.8 },
        idleBoundingFaceSize: { width: .63, depth: .6, height: 1.8, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .63, depth: 1.12, height: 1.8, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .63, depth: 1.07, height: 1.8, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .63, depth: .7, height: 1.8, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .63, depth: .4, height: 1.8 },
        walkBoundingBoxSize: { width: .63, depth: 1.12, height: 1.8},
        attackBoundingBoxSize: { width: .63, depth: .75, height: 1.8},
        pushingBoxSize: { height: 1.8, depth: 1.12 },
        weapon: new WeaponBase({
            name: `zombie_male_variant2_claw`,
            fireRate: 1.5,
            prepareInterval: .7,
            damageRange: .7,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 35, offset0: - 8, offset1: 8 }),
            isDefault: true
        })
    }),
    VARIANT3: new CreatureTypeMapping({
        name: 'variant3',
        idle: CLIPS.IDLE, walk: CLIPS.CRAWL, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH2, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 1, idleToWalk: 0.3, walkToIdle: 0.3,
        idleCollisionSize: { width: .63, depth: .6, height: 1.8 },
        walkCollisionSize: { width: .63, depth: 1.12, height: 0.8 },
        attackCollisionSize: { width: .63, depth: .7, height: 1.8 },
        idleBoundingFaceSize: { width: .63, depth: .6, height: 1.8, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .63, depth: 1.12, height: 1.8, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .63, depth: 1.07, height: 1.8, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .63, depth: .7, height: 1.8, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .63, depth: .4, height: 1.8 },
        walkBoundingBoxSize: { width: .63, depth: 1.12, height: 1.8 },
        attackBoundingBoxSize: { width: .63, depth: .75, height: 1.8},
        pushingBoxSize: { height: 1.8, depth: 1.12 },
        weapon: new WeaponBase({
            name: `zombie_male_variant3_claw`,
            fireRate: 1,
            prepareInterval: 1.2,
            damageRange: .7,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 15, offset0: - 8, offset1: 8 }),
            isDefault: true
        })
    })
};

class ZombieMale extends CreatureBase {

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(DEBUG, 'ZombieMale');

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { width = .63, width2 = .63, depth = .9, depth2 = .7, height = 1.8 } = specs;
        const { collisionSize = { width, depth: .7, height } } = specs;
        const { vel = .37, rotateR = 1.1 } = specs;
        const { scale = [1, 1, 1], gltfScale = [.4, .4, .4] } = specs;
        const { isActive = true, sovRadius = 6.5, showBS = false, enableCollision = true } = specs;
        const { variant = 'standard' } = specs;
        const { createDefaultBoundingObjects = false } = specs;
        const { HPMax = 100 } = specs;

        const animationSetting = Object.assign({}, ANIMATION_SETTINGS);

        const typeMapping = ZOMBIE_TYPES_MAPPING[variant.toUpperCase()] ?? ZOMBIE_TYPES_MAPPING.STANDARD;
        if (typeMapping) {

            animationSetting.IDLE_TO_WALK = typeMapping.idleToWalk;
            animationSetting.WALK_TO_IDLE = typeMapping.walkToIdle;
            animationSetting.WALK_TIMESCALE = typeMapping.walkTimeScale;

        }

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            width, width2, depth, depth2, height, collisionSize,
            vel, rotateR,
            scale, gltfScale,
            clips: CLIPS,  animationSetting: animationSetting,
            isActive, sovRadius, showBS, enableCollision,
            typeMapping,
            createDefaultBoundingObjects,
            HPMax
        };

        super(setup);

        this.showTofu(false);

    }

    async init() {

        await super.init();

        this._meleeWeapon = this.typeMapping.weapon;
        this.damageRange = this._meleeWeapon.damageRange;
        this.damageRadius = this._meleeWeapon.damageRadius;

        this.setInitialActions();
   
    }

    setInitialActions() {

        this.AWS.setActionEffectiveTimeScale(this.typeMapping.walk.nick, this._animationSettings.WALK_TIMESCALE);
        this.AWS.setActionEffectiveTimeScale(this.typeMapping.hurt.nick, this._animationSettings.HURT_TIMESCALE);
        this.AWS.setActionEffectiveTimeScale(this.typeMapping.attack.nick, this._meleeWeapon.fireRate);

    }

}

export { ZombieMale };