import { CombatPlayerBase, Pistol, Bayonet } from '../../Models';
import { SOLDIER_FEMALE_CLIPS as CLIPS, WEAPONS } from '../../utils/constants';
import { Logger } from '../../../systems/Logger';

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

const DEBUG = true;

class SoldierFemale extends CombatPlayerBase {

    weapons = {}
    #logger = new Logger(DEBUG, 'SoldierFemale');

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetY = - .89, offsetZ = - .1 } = specs;
        const { width = .7, depth = .9, height = 1.78 } = specs;
        const { vel = 1.2, velEnlarge = 2.8 } = specs;
        const { scale = [1, 1, 1] } = specs;

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            offsetY, offsetZ, width, depth, height, 
            vel, velEnlarge,
            scale,
            clips: CLIPS,  animationSetting: ANIMATION_SETTINGS
        };

        super(setup);

        this._idleNick = CLIPS.IDLE.nick;

        this.weapons[WEAPONS.PISTOL1] = new Pistol({ 
            name: `${name}_pistol`,
            position: [- .18, - .028 , .065],
            rotation: [- 0.35, - 1.3, - 1.6]
        });

        this.weapons[WEAPONS.BAYONET] = new Bayonet({
            name: `${name}_bayonet`,
            scale: [.35, .3, .25],
            position: [- .18, .01 , .046],
            rotation: [- .5, - 1, - .3]
        });

        this.showTofu(false);

    }

    async init() {

        await Promise.all([
            this.weapons[WEAPONS.PISTOL1].init(), 
            this.weapons[WEAPONS.BAYONET].init(), 
            super.init()
        ]);

        this._armedWeapon = this.weapons[WEAPONS.PISTOL1];
        this._meleeWeapon = this.weapons[WEAPONS.BAYONET];

        const holdingHand = this.gltf.getChildByName('WristR');
        holdingHand.attach(this.weapons[WEAPONS.PISTOL1].group);
        holdingHand.attach(this.weapons[WEAPONS.BAYONET].group);

        this.setupWeaponScale();
        
        this.switchWeapon(this.weapons[WEAPONS.PISTOL1]);

        this.switchIdleAction(CLIPS.IDLE_GUN.nick);

        this.idleNick = CLIPS.IDLE.nick;
        this.armedIdleNick = CLIPS.IDLE_GUN.nick;
        
    }

}

export { SoldierFemale };