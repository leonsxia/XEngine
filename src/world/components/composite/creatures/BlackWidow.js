import { CreatureBase, WeaponBase } from '../../Models.js';
import { BLACK_WIDOW_CLIPS as CLIPS } from '../../utils/constants.js';
import { CreatureTypeMapping } from './CreatureTypeMapping';
import { Ammo } from '../weapons/Ammo.js';

const GLTF_SRC = 'creatures/black_widow.glb';

const ANIMATION_SETTINGS = {
    IDLE_TO_WALK: 0.1,
    WALK_TO_IDLE: 0.3,
    IDLE_TO_TURN: 0.1,
    TURN_TO_IDLE: 0.1,
    WALK_TURN_TO_ZERO_TURN: 0.3,
    WALK_TIMESCALE: 1,
    HURT_TIMESCALE: 1.5,
    TURN_WEIGHT: 0.7,
    HURT_WEIGHT: 0.25,
    ATTACK: 0.2,
    HURT: 0.1,
    DIE: 0.2,
}

const BLACK_WIDOW_TYPES_MAPPING = {
    STANDARD: new CreatureTypeMapping({
        name: 'standard',
        idle: CLIPS.IDLE, walk: CLIPS.WALK, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 1, idleToWalk: 0.1, walkToIdle: 0.3,
        idleCollisionSize: { width: .68, depth: .7, height: .75 },
        walkCollisionSize: { width: .68, depth: 1.1, height: .75 },
        attackCollisionSize: { width: .68, depth: .8, height: .75 },
        idleBoundingFaceSize: { width: .68, depth: .7, height: .75, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .68, depth: 1, height: .75, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .68, depth: .8, height: .75, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .68, depth: .8, height: .75, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .68, depth: .5, height: .75 },
        walkBoundingBoxSize: { width: .68, depth: .85, height: .75 },
        attackBoundingBoxSize: { width: .68, depth: .85, height: .75 },
        pushingBoxSize: { height: .75, depth: .8 },
        weapon: new WeaponBase({
            name: `black_widow_standard_claw`,
            fireRate: .6,
            prepareInterval: .53,
            damageRange: .65,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 20, offset0: - 5, offset1: 5 }),
            isDefault: true
        }),
        gltfScale: [.4, .4, .4],
        offset: [0, -0.925, 0]
    }),
    DESCENDANT: new CreatureTypeMapping({
        name: 'descendant',
        idle: CLIPS.IDLE, walk: CLIPS.WALK, hurt: CLIPS.HIT_RECEIVE, die: CLIPS.DEATH, rotate: { nick: 'rotate' }, attack: CLIPS.ATTACK, walkTimeScale: 1.8, idleToWalk: 0.1, walkToIdle: 0.3,
        idleCollisionSize: { width: .39, depth: .4, height: .75 },
        walkCollisionSize: { width: .39, depth: .55, height: .75 },
        attackCollisionSize: { width: .39, depth: .45, height: .75 },
        idleBoundingFaceSize: { width: .39, depth: .4, height: .75, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .39, depth: .55, height: .75, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .39, depth: .45, height: .75, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .39, depth: .45, height: .75, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .39, depth: .3, height: .75 },
        walkBoundingBoxSize: { width: .39, depth: .475, height: .75 },
        attackBoundingBoxSize: { width: .39, depth: .475, height: .75 },
        pushingBoxSize: { height: .75, depth: .5 },
        weapon: new WeaponBase({
            name: `black_widow_standard_claw`,
            fireRate: .6,
            prepareInterval: .53,
            damageRange: .45,
            damageRadius: Math.PI * 2,
            ammo: new Ammo({ isMeleeWeapon: true, damage: 8, offset0: - 5, offset1: 3 }),
            isDefault: true
        }),
        gltfScale: [.2, .2,.2],
        offset: [0, -1.85, 0]
    })
};

class BlackWidow extends CreatureBase {

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { vel = 1.2, rotateR = 1.1 } = specs;
        const { scale = [1, 1, 1] } = specs;
        const { isActive = true, sovRadius = 6.5, showBS = false, enableCollision = true } = specs;
        const { variant = 'standard' } = specs;
        const { createDefaultBoundingObjects = false } = specs;
        const { HPMax = 80 } = specs;
        let { width, width2, depth, depth2, height } = specs;
        let { gltfScale = [1, 1, 1] } = specs;
        let { offsetY } = specs;

        const animationSetting = Object.assign({}, ANIMATION_SETTINGS);

        const typeMapping = BLACK_WIDOW_TYPES_MAPPING[variant.toUpperCase()] ?? BLACK_WIDOW_TYPES_MAPPING.STANDARD;
        animationSetting.IDLE_TO_WALK = typeMapping.idleToWalk;
        animationSetting.WALK_TO_IDLE = typeMapping.walkToIdle;
        animationSetting.WALK_TIMESCALE = typeMapping.walkTimeScale;
        width = width2 = typeMapping.idleBoundingFaceSize.width;
        depth = depth2 = typeMapping.idleBoundingFaceSize.depth;
        height = typeMapping.idleBoundingFaceSize.height;
        gltfScale = typeMapping.gltfScale;
        offsetY = typeMapping.offset[1];

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            offsetY, width, width2, depth, depth2, height,
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

export { BlackWidow };