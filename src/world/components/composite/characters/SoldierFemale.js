import { CombatPlayerBase, Pistol, Bayonet, Revolver, SMGShort, Glock } from '../../Models';
import { SOLDIER_FEMALE_CLIPS as CLIPS, WEAPONS } from '../../utils/constants';
import { Logger } from '../../../systems/Logger';
import { WeaponActionMapping } from './WeaponActionMapping';
import { Ammo } from '../weapons/Ammo';

const GLTF_SRC = 'characters/soldier_female.glb';
const ANIMATION_SETTINGS = {
    IDLE_TO_WALK: 0.1,
    IDLE_TO_RUN: 0.2,
    WALK_TO_RUN: 0.2,
    WALK_TO_IDLE: 0.3,    
    RUN_TO_IDLE: 0.3,
    RUN_TO_WALK: 0.2,
    IDLE_TO_TURN: 0.1,
    TURN_TO_IDLE: 0.1,
    WALK_TURN_TO_ZERO_TURN: 0.3,
    RUN_TURN_TO_ZERO_TURN: 0.3,
    BACK_WALK_WEIGHT: 0.7,
    TURN_WEIGHT: 0.7,
    QUICK_TURN_WEIGHT: 0.7,
    MELEE: .2,
    GUN_POINT: .2,
    SHOOT: .1,
    INTERACT: .1,
    HURT: 0.1,
    DIE: 0.1
}

const WEAPON_ACTION_MAPPING = {
    [WEAPONS.NONE]: new WeaponActionMapping({
        name: 'emptyhand',
        idle: CLIPS.IDLE, walk: CLIPS.WALK, rotate: { nick: 'rotate' }, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING,
        hurt: { body: CLIPS.HIT_RECEIVE, head: CLIPS.HIT_RECEIVE_2 },
        die: CLIPS.DEATH,
        idleCollisionSize: { width: .65, depth: .75, height: 1.78 },
        walkCollisionSize: { width: .65, depth: .85, height: 1.78 },
        runCollisionSize: { width: .65, depth: .9, height: 1.78 },
        attackCollisionSize: { width: .65, depth: .95, height: 1.78 },
        idleBoundingFaceSize: { width: .6, depth: .75, height: 1.78, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .6, depth: .8, height: 1.78, bbfThickness: .18, gap: .1 },
        runBoundingFaceSize: { width: .6, depth: .85, height: 1.78, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .6, depth: .7, height: 1.78, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .6, depth: .9, height: 1.78, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .6, depth: .6, height: 1.78 },
        walkBoundingBoxSize: { width: .63, depth: .7, height: 1.78 },
        runBoundingBoxSize: { width: .63, depth: .75, height: 1.78 },
        attackBoundingBoxSize: {width: .63, depth: .72, height: 1.78 },
        pushingBoxSize: { height: 1.78, depth: .85 }
    }),
    [WEAPONS.PISTOL1]: new WeaponActionMapping({ 
        name: 'pistol1',
        idle: CLIPS.IDLE_GUN, walk: CLIPS.WALK, rotate: { nick: 'rotate' }, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING, shoot: CLIPS.IDLE_GUN_SHOOT,
        hurt: { body: CLIPS.HIT_RECEIVE, head: CLIPS.HIT_RECEIVE_2 },
        die: CLIPS.DEATH,
        idleCollisionSize: { width: .65, depth: .75, height: 1.78 },
        walkCollisionSize: { width: .65, depth: .85, height: 1.78 },
        runCollisionSize: { width: .65, depth: .9, height: 1.78 },
        attackCollisionSize: { width: .65, depth: .95, height: 1.78 },
        idleBoundingFaceSize: { width: .6, depth: .75, height: 1.78, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .6, depth: .8, height: 1.78, bbfThickness: .18, gap: .1 },
        runBoundingFaceSize: { width: .6, depth: .85, height: 1.78, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .6, depth: .7, height: 1.78, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .6, depth: .9, height: 1.78, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .6, depth: .6, height: 1.78 },
        walkBoundingBoxSize: { width: .6, depth: .7, height: 1.78 },
        runBoundingBoxSize: { width: .6, depth: .75, height: 1.78 },
        attackBoundingBoxSize: {width: .6, depth: .72, height: 1.78 },
        pushingBoxSize: { height: 1.78, depth: .85 }
    }),
    [WEAPONS.GLOCK]: new WeaponActionMapping({
        name: 'glock',
        idle: CLIPS.IDLE_GUN, walk: CLIPS.WALK, rotate: { nick: 'rotate' }, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING, shoot: CLIPS.IDLE_GUN_SHOOT,
        hurt: { body: CLIPS.HIT_RECEIVE, head: CLIPS.HIT_RECEIVE_2 },
        die: CLIPS.DEATH,
        idleCollisionSize: { width: .65, depth: .75, height: 1.78 },
        walkCollisionSize: { width: .65, depth: .85, height: 1.78 },
        runCollisionSize: { width: .65, depth: .9, height: 1.78 },
        attackCollisionSize: { width: .65, depth: .95, height: 1.78 },
        idleBoundingFaceSize: { width: .6, depth: .75, height: 1.78, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .6, depth: .8, height: 1.78, bbfThickness: .18, gap: .1 },
        runBoundingFaceSize: { width: .6, depth: .85, height: 1.78, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .6, depth: .7, height: 1.78, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .6, depth: .9, height: 1.78, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .6, depth: .6, height: 1.78 },
        walkBoundingBoxSize: { width: .6, depth: .7, height: 1.78 },
        runBoundingBoxSize: { width: .6, depth: .75, height: 1.78 },
        attackBoundingBoxSize: {width: .6, depth: .72, height: 1.78 },
        pushingBoxSize: { height: 1.78, depth: .85 }
    }),
    [WEAPONS.REVOLVER]: new WeaponActionMapping({
        name: 'revolver',
        idle: CLIPS.IDLE_GUN, walk: CLIPS.WALK, rotate: { nick: 'rotate' }, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING, shoot: CLIPS.IDLE_GUN_SHOOT,
        hurt: { body: CLIPS.HIT_RECEIVE, head: CLIPS.HIT_RECEIVE_2 },
        die: CLIPS.DEATH,
        idleCollisionSize: { width: .65, depth: .75, height: 1.78 },
        walkCollisionSize: { width: .65, depth: .85, height: 1.78 },
        runCollisionSize: { width: .65, depth: .9, height: 1.78 },
        attackCollisionSize: { width: .65, depth: .95, height: 1.78 },
        idleBoundingFaceSize: { width: .6, depth: .75, height: 1.78, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .6, depth: .8, height: 1.78, bbfThickness: .18, gap: .1 },
        runBoundingFaceSize: { width: .6, depth: .85, height: 1.78, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .6, depth: .7, height: 1.78, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .6, depth: .9, height: 1.78, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .6, depth: .6, height: 1.78 },
        walkBoundingBoxSize: { width: .6, depth: .7, height: 1.78 },
        runBoundingBoxSize: { width: .6, depth: .75, height: 1.78 },
        attackBoundingBoxSize: {width: .6, depth: .72, height: 1.78 },
        pushingBoxSize: { height: 1.78, depth: .85 }
    }),
    [WEAPONS.SMG_SHORT]: new WeaponActionMapping({
        name: 'smg_short',
        idle: CLIPS.IDLE_GUN, walk: CLIPS.WALK, rotate: { nick: 'rotate' }, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING, shoot: CLIPS.IDLE_GUN_SHOOT,
        hurt: { body: CLIPS.HIT_RECEIVE, head: CLIPS.HIT_RECEIVE_2 },
        die: CLIPS.DEATH,
        idleCollisionSize: { width: .65, depth: .75, height: 1.78 },
        walkCollisionSize: { width: .65, depth: .85, height: 1.78 },
        runCollisionSize: { width: .65, depth: .9, height: 1.78 },
        attackCollisionSize: { width: .65, depth: .95, height: 1.78 },
        idleBoundingFaceSize: { width: .6, depth: .75, height: 1.78, bbfThickness: .18, gap: .1 },
        walkBoundingFaceSize: { width: .6, depth: .8, height: 1.78, bbfThickness: .18, gap: .1 },
        runBoundingFaceSize: { width: .6, depth: .85, height: 1.78, bbfThickness: .18, gap: .1 },
        rotateBoundingFaceSize: { width: .6, depth: .7, height: 1.78, bbfThickness: .18, gap: .1 },
        attackBoundingFaceSize: { width: .6, depth: .9, height: 1.78, bbfThickness: .18, gap: .1 },
        idleBoundingBoxSize: { width: .6, depth: .6, height: 1.78 },
        walkBoundingBoxSize: { width: .6, depth: .7, height: 1.78 },
        runBoundingBoxSize: { width: .6, depth: .75, height: 1.78 },
        attackBoundingBoxSize: {width: .6, depth: .72, height: 1.78 },
        pushingBoxSize: { height: 1.78, depth: .85 }
    }),
    [WEAPONS.BAYONET]: new WeaponActionMapping({
        name: 'bayonet',
        idle: CLIPS.IDLE, attack: CLIPS.SWORD_SLASH,
        hurt: { body: CLIPS.HIT_RECEIVE, head: CLIPS.HIT_RECEIVE_2 },
        die: CLIPS.DEATH,
        ignoreCollisionBox: true,
        ignoreBoundingFace: true,
        ignoreBoundingBox: true,
        ignorePushingBox: true
    })
}

const DEBUG = true;

class SoldierFemale extends CombatPlayerBase {

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(DEBUG, 'SoldierFemale');

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetY = - .89, offsetZ = - .1 } = specs;
        const { width = .6, width2 = .6, depth = .8, depth2 = .7, height = 1.78 } = specs;
        // if collision box's depth is less than bounding face's depth,
        // it will let player harder to push against enemies
        const { collisionSize = { width, depth, height } } = specs;
        const { vel = 1.2, rotateR = 1, velEnlarge = 2.8, aimVel = 3 * Math.PI, aimTime = .2 } = specs;
        const { scale = [1, 1, 1] } = specs;
        const { sovRadius = 10, showBS = false, enableCollision = true } = specs;
        const { createDefaultBoundingObjects = false } = specs;    
        const { HPMax = 100 } = specs;    

        const armedHeight = .4;
        const weapons = [
            new Pistol({
                name: `${name}_pistol`,
                position: [- .18, - .028, .065],
                rotation: [- 0.35, - 1.3, - 1.6],
                damageRange: 10,
                damageRadius: 0.52, // 30 degree
                armedHeight,
                attackInterval: 0.7, 
                fireRate: 1.2,
                ammo: new Ammo({ count: 12, damage: 20, offset0: - 5, offset1: 5 }),
                magzineCapacity: 12
            }),
            new Glock({
                name: `${name}_glock19`,
                position: [- .18, - .08, .096],
                rotation: [1.2, 0, - .2],
                damageRange: 13,
                damageRadius: 0.52, // 30 degree
                armedHeight,
                attackInterval: 0.4667,
                fireRate: 1.8,
                ammo: new Ammo({ count: 50, damage: 18, offset0: - 5, offset1: 10 }),
                magzineCapacity: 50
            }),
            new Revolver({
                name: `${name}_magnum357`,
                position: [- .168, - .005, .075],
                rotation: [- 0.35, - 1.3, - 1.6],
                damageRange: 16,
                damageRadius: 0.52, // 30 degree
                armedHeight,
                attackInterval: 1.05,
                fireRate: 0.8,
                ammo: new Ammo({ count: 6, damage: 60, offset0: - 10, offset1: 45 }),
                magzineCapacity: 6
            }),
            new SMGShort({
                name: `${name}_smg_short`,
                position: [- .18, - .028, .065],
                rotation: [- 0.35, - 1.3, - 1.6],
                damageRange: 9,
                damageRadius: 0.52, // 30 degree
                armedHeight,
                attackInterval: 0.08,
                fireRate: 10.2,
                ammo: new Ammo({ count: 35, damage: 7, offset0: - 2, offset1: 2 }),
                magzineCapacity: 35,
                isSemiAutomatic: false
            }),
            new Bayonet({
                name: `${name}_bayonet`,
                scale: [.35, .3, .25],
                position: [- .18, .01, .046],
                rotation: [- .5, - 1, - .3],
                obbSize: { size: { width: .03, depth: .01, height: .35 } },
                obbPosition: [- .075, .038, .215],
                obbRotation: [- .37, - 1.02, 1.38],
                attackInterval: 1.03,
                damageRange: 1.55,
                damageRadius: 1.75, // 100 degree
                armedHeight: 0,
                startTime: 0.15,
                endTime: 0.49,
                fireRate: 1.25,
                ammo: new Ammo({ isMeleeWeapon: true, damage: 20, offset0: - 10, offset1: 10 })
            })
        ];

        const weaponActionMapping = WEAPON_ACTION_MAPPING;
        const initialWeaponType = WEAPONS.NONE;

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            offsetY, offsetZ, width, width2, depth, depth2, height, collisionSize,
            vel, velEnlarge, rotateR, aimVel, aimTime,
            scale,
            clips: CLIPS,  animationSetting: ANIMATION_SETTINGS,
            sovRadius, showBS, enableCollision, createDefaultBoundingObjects,
            weaponActionMapping, initialWeaponType, weapons,
            HPMax
        };

        super(setup);
        
        this.showTofu(false);

    }

    async init() {

        await super.init();

        this._meleeWeapon = this.weapons.find(w => w.weaponType === WEAPONS.BAYONET);
        this.AWS.setActionEffectiveTimeScale(this.meleeAttackAction.attack.nick, this._meleeWeapon.fireRate);

        const holdingHand = this.gltf.getChildByName('WristR');
        this.attachWeapons(holdingHand);

        this.setupWeaponScale();
        
        this.armWeapon();
        
    }

}

export { SoldierFemale };