import { CombatPlayerBase } from '../../Models';
import { SOLDIER_FEMALE_CLIPS as CLIPS } from '../../utils/constants';
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

    #logger = new Logger(DEBUG, 'SoldierFemale');

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetY = - .89, offsetZ = - .1 } = specs;
        const { width = .6, depth = .9, height = 1.78 } = specs;

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            offsetY, offsetZ, width, depth, height, 
            clips: CLIPS,  animationSetting: ANIMATION_SETTINGS
        };

        super(setup);

        this.showTofu(false);

    }

}

export { SoldierFemale };