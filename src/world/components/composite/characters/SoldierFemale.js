import { CombatPlayerBase, Pistol, Bayonet, Revolver, SMGShort, Glock } from '../../Models';
import { SOLDIER_FEMALE_CLIPS as CLIPS, WEAPONS } from '../../utils/constants';
import { Logger } from '../../../systems/Logger';
import { WeaponActionMapping } from './WeaponActionMapping';

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
    INTERACT: .1
}

const WEAPON_ACTION_MAPPING = {
    [WEAPONS.NONE]: new WeaponActionMapping({
        name: 'emptyhand',
        idle: CLIPS.IDLE, walk: CLIPS.WALK, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING,
        idleCollisionSize: { width: .6, depth: .5, height: 1.78 },
        walkCollisionSize: { width: .6, depth: .8, height: 1.78 },
        runCollisionSize: { width: .6, depth: .85, height: 1.78 },
        attackCollisionSize: { width: .6, depth: .82, height: 1.78 }
    }),
    [WEAPONS.PISTOL1]: new WeaponActionMapping({ 
        name: 'pistol1',
        idle: CLIPS.IDLE_GUN, walk: CLIPS.WALK, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING, shoot: CLIPS.IDLE_GUN_SHOOT, 
        attackInterval: 0.7, fireRate: 1.2,
        idleCollisionSize: { width: .6, depth: .5, height: 1.78 },
        walkCollisionSize: { width: .6, depth: .8, height: 1.78 },
        runCollisionSize: { width: .6, depth: .85, height: 1.78 },
        attackCollisionSize: { width: .6, depth: .82, height: 1.78 }
    }),
    [WEAPONS.GLOCK]: new WeaponActionMapping({
        name: 'glock',
        idle: CLIPS.IDLE_GUN, walk: CLIPS.WALK, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING, shoot: CLIPS.IDLE_GUN_SHOOT, 
        attackInterval: 0.4667, fireRate: 1.8,
        idleCollisionSize: { width: .6, depth: .5, height: 1.78 },
        walkCollisionSize: { width: .6, depth: .8, height: 1.78 },
        runCollisionSize: { width: .6, depth: .85, height: 1.78 },
        attackCollisionSize: { width: .6, depth: .82, height: 1.78 }
    }),
    [WEAPONS.REVOLVER]: new WeaponActionMapping({
        name: 'revolver',
        idle: CLIPS.IDLE_GUN, walk: CLIPS.WALK, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING, shoot: CLIPS.IDLE_GUN_SHOOT, 
        attackInterval: 1.05, fireRate: 0.8,
        idleCollisionSize: { width: .6, depth: .5, height: 1.78 },
        walkCollisionSize: { width: .6, depth: .8, height: 1.78 },
        runCollisionSize: { width: .6, depth: .85, height: 1.78 },
        attackCollisionSize: { width: .6, depth: .82, height: 1.78 } 
    }),
    [WEAPONS.SMG_SHORT]: new WeaponActionMapping({
        name: 'smg_short',
        idle: CLIPS.IDLE_GUN, walk: CLIPS.WALK, run: CLIPS.RUN, aim: CLIPS.IDLE_GUN_POINTING, shoot: CLIPS.IDLE_GUN_SHOOT, 
        attackInterval: 0.08, fireRate: 10.2,
        idleCollisionSize: { width: .6, depth: .5, height: 1.78 },
        walkCollisionSize: { width: .6, depth: .8, height: 1.78 },
        runCollisionSize: { width: .6, depth: .85, height: 1.78 },
        attackCollisionSize: { width: .6, depth: .82, height: 1.78 } 
    }),
    [WEAPONS.BAYONET]: new WeaponActionMapping({
        name: 'bayonet',
        idle: CLIPS.IDLE, attack: CLIPS.SWORD_SLASH, attackInterval: 1.03, 
        prepareInterval: 0.5, fireRate: 1.25,
        ignoreCollisionBox: true
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
        const { vel = 1.2, rotateR = 1, velEnlarge = 2.8 } = specs;
        const { scale = [1, 1, 1] } = specs;
        const { sovRadius = 10, showBS = false, enableCollision = true } = specs;
        const { createDefaultBoundingObjects = true } = specs;        

        const weapons = [
            new Pistol({
                name: `${name}_pistol`,
                position: [- .18, - .028, .065],
                rotation: [- 0.35, - 1.3, - 1.6],
                fireRate: 1,
                ammo: 12
            }),
            new Glock({
                name: `${name}_glock19`,
                position: [- .18, - .08, .096],
                rotation: [1.2, 0, - .2],
                fireRate: 1.5,
                ammo: 19
            }),
            new Revolver({
                name: `${name}_magnum357`,
                position: [- .168, - .005, .075],
                rotation: [- 0.35, - 1.3, - 1.6],
                fireRate: 1,
                ammo: 6
            }),
            new SMGShort({
                name: `${name}_smg_short`,
                position: [- .18, - .028, .065],
                rotation: [- 0.35, - 1.3, - 1.6],
                fireRate: 1,
                ammo: 35,
                isSemiAutomatic: false
            }),
            new Bayonet({
                name: `${name}_bayonet`,
                scale: [.35, .3, .25],
                position: [- .18, .01, .046],
                rotation: [- .5, - 1, - .3],
                fireRate: 1.25
            })
        ];

        const weaponActionMapping = WEAPON_ACTION_MAPPING;
        const initialWeapon = weapons.find(w => w.weaponType === WEAPONS.GLOCK);

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            offsetY, offsetZ, width, width2, depth, depth2, height, collisionSize,
            vel, velEnlarge, rotateR,
            scale,
            clips: CLIPS,  animationSetting: ANIMATION_SETTINGS,
            sovRadius, showBS, enableCollision, createDefaultBoundingObjects,
            weaponActionMapping, initialWeapon, weapons
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
        
        this.armWeapon(this.initialWeapon);        
        
    }

}

export { SoldierFemale };