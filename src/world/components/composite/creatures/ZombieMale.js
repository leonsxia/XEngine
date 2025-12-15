import { CreatureBase, WeaponBase } from "../../Models.js";
import { ZOMBIE_MALE_CLIPS as CLIPS, WEAPONS } from "../../utils/constants";
import { Logger } from '../../../systems/Logger';
import { CreatureTypeMapping } from "./CreatureTypeMapping";
import { Ammo } from "../weapons/Ammo";
import { SOUND_NAMES } from "../../utils/audioConstants.js";

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

const SOUND_SETTINGS = {
    WALK_LEFT_PLAYED: false,
    WALK_RIGHT_PLAYED: false,
    WALKING_STEP_INTERVAL: 0.8,
    KNIFE_HIT: SOUND_NAMES.KNIFE_FLESH_HIT,
    BULLET_HIT: SOUND_NAMES.BULLET_FLESH_HIT
}

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
            weaponType: WEAPONS.ZOMBIE_CLAW,
            fireRate: 1.1,
            prepareInterval: 1.1,
            damageRange: .7,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 20, offset0: - 8, offset1: 8 }),
            isDefault: true,
            soundFire: SOUND_NAMES.CLAW_ATTACK
        }),
        sounds: {
            NOTICED: SOUND_NAMES.MALE_ZOMBIE_MOAN,
            HURT: SOUND_NAMES.MALE_ZOMBIE_HURT,
            ATTACK: SOUND_NAMES.MALE_ZOMBIE_ATTACK,
            WALK_LEFT: SOUND_NAMES.MALE_ZOMBIE_WALK_LEFT,
            WALK_RIGHT: SOUND_NAMES.MALE_ZOMBIE_WALK_RIGHT,
            WALKING_STEP_INTERVAL: 1.85
        }
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
            weaponType: WEAPONS.ZOMBIE_CLAW,
            fireRate: 1.25,
            prepareInterval: .95,
            damageRange: .7,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 20, offset0: - 8, offset1: 8 }),
            isDefault: true,
            soundFire: SOUND_NAMES.CLAW_ATTACK
        }),
        sounds: {
            NOTICED: SOUND_NAMES.MALE_ZOMBIE_MOAN,
            HURT: SOUND_NAMES.MALE_ZOMBIE_HURT,
            ATTACK: SOUND_NAMES.MALE_ZOMBIE_ATTACK,
            WALK_LEFT: SOUND_NAMES.MALE_ZOMBIE_WALK_LEFT,
            WALK_RIGHT: SOUND_NAMES.MALE_ZOMBIE_WALK_RIGHT,
            WALKING_STEP_INTERVAL: .8
        }
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
            weaponType: WEAPONS.ZOMBIE_CLAW,
            fireRate: 1.5,
            prepareInterval: .7,
            damageRange: .7,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 35, offset0: - 8, offset1: 8 }),
            isDefault: true,
            soundFire: SOUND_NAMES.CLAW_ATTACK
        }),
        sounds: {
            NOTICED: SOUND_NAMES.MALE_ZOMBIE_FAST_BREATH,
            HURT: SOUND_NAMES.MALE_ZOMBIE_SCREAM_HURT,
            ATTACK: SOUND_NAMES.MALE_ZOMBIE_SCREAM_ATTACK,
            WALK_LEFT: SOUND_NAMES.MALE_ZOMBIE_WALK_LEFT,
            WALK_RIGHT: SOUND_NAMES.MALE_ZOMBIE_WALK_RIGHT,
            WALKING_STEP_INTERVAL: 0.4
        }
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
            weaponType: WEAPONS.ZOMBIE_CLAW,
            fireRate: 1,
            prepareInterval: 1.2,
            damageRange: .7,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 15, offset0: - 8, offset1: 8 }),
            isDefault: true,
            soundFire: SOUND_NAMES.CLAW_ATTACK
        }),
        sounds: {
            NOTICED: SOUND_NAMES.MALE_ZOMBIE_MOAN,
            HURT: SOUND_NAMES.MALE_ZOMBIE_HURT,
            ATTACK: SOUND_NAMES.MALE_ZOMBIE_ATTACK,
            ignoreWalkSounds: true,
        }
    }),
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
        const soundSetting = Object.assign({}, SOUND_SETTINGS);

        const typeMapping = ZOMBIE_TYPES_MAPPING[variant.toUpperCase()] ?? ZOMBIE_TYPES_MAPPING.STANDARD;
        if (typeMapping) {

            animationSetting.IDLE_TO_WALK = typeMapping.idleToWalk;
            animationSetting.WALK_TO_IDLE = typeMapping.walkToIdle;
            animationSetting.WALK_TIMESCALE = typeMapping.walkTimeScale;
            
            Object.assign(soundSetting, typeMapping.sounds);

        }

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            width, width2, depth, depth2, height, collisionSize,
            vel, rotateR,
            scale, gltfScale,
            clips: CLIPS,  animationSetting: animationSetting,
            soundSetting,
            isActive, sovRadius, showBS, enableCollision,
            typeMapping,
            createDefaultBoundingObjects,
            HPMax,
            focusHeight: .4
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

    registerSounds() {

        this.addSoundsToGroup(SOUND_NAMES.KNIFE_FLESH_HIT);
        this.addSoundsToGroup(SOUND_NAMES.BULLET_FLESH_HIT);

        for (const soundKey in this.typeMapping.sounds) {

            const soundName = this.typeMapping.sounds[soundKey];
            this.addSoundsToGroup(soundName);

        }

        return this;

    }

    audioMixerTick() {

        if (this._soundSettings.ignoreWalkSounds) return;

        const daw = this.DAW;
        const walkAction = this.AWS.actions[this.typeMapping.walk.nick].action;
        if (walkAction.isRunning() && !this.isInAir) {

            if (walkAction.time < this._soundSettings.WALKING_STEP_INTERVAL) {

                if (!this._soundSettings.WALK_LEFT_PLAYED) {

                    // console.log(`walk: left`);
                    this._soundSettings.WALK_LEFT_PLAYED = true;
                    this._soundSettings.WALK_RIGHT_PLAYED = false;
                    daw.play(this._soundSettings.WALK_LEFT);

                }                

            } else {

                if (!this._soundSettings.WALK_RIGHT_PLAYED) {

                    // console.log(`walk: right`);
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

    }

}

export { ZombieMale };