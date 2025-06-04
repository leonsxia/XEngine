import { CreatureBase } from "../../Models";
import { ZOMBIE_MALE_CLIPS as CLIPS } from "../../utils/constants";
import { Logger } from '../../../systems/Logger';

const GLTF_SRC = 'creatures/zombie_male.glb';

const DEBUG = true;
const ANIMATION_SETTINGS = {
    IDLE_TO_WALK: 0.1,
    IDLE_TO_WALK2: 0.1,
    WALK_TO_IDLE: 0.3,
    WALK2_TO_IDLE: 0.3,
    IDLE_TO_TURN: 0.1,
    TURN_TO_IDLE: 0.1,
    WALK_TURN_TO_ZERO_TURN: 0.3,
    WALK_TIMESCALE: 2.1,
    WALK2_TIMESCALE: 1.5,
    TURN_WEIGHT: 0.7,
    ATTACK: 0.2
};

class ZombieMale extends CreatureBase {

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(DEBUG, 'ZombieMale');

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetY = - 2.225, offsetZ = - .3 } = specs;
        const { width = .63, width2 = .63, depth = .9, depth2 = .7, height = 1.8 } = specs;
        const { vel = .37, rotateR = 1.1 } = specs;
        const { scale = [1, 1, 1], gltfScale = [.4, .4, .4] } = specs;
        const { sovRadius = 6.5, showBS = false, enableCollision = true } = specs;
        const { walknick = CLIPS.WALK.nick } = specs;

        const animationSetting = Object.assign({}, ANIMATION_SETTINGS);
        if (walknick !== CLIPS.WALK.nick) {
            
            animationSetting.IDLE_TO_WALK = ANIMATION_SETTINGS.IDLE_TO_WALK2;
            animationSetting.WALK_TO_IDLE = ANIMATION_SETTINGS.WALK2_TO_IDLE;
            animationSetting.WALK_TIMESCALE = ANIMATION_SETTINGS.WALK2_TIMESCALE;

        }

        const setup = { 
            name, src, receiveShadow, castShadow, hasBones, 
            offsetY, offsetZ, width, width2, depth, depth2, height, 
            vel, rotateR,
            scale, gltfScale,
            clips: CLIPS,  animationSetting: animationSetting,
            sovRadius, showBS, enableCollision
        };

        super(setup);

        this._idleNick = CLIPS.IDLE.nick;
        this._walkNick = walknick === CLIPS.WALK.nick ? CLIPS.WALK.nick : CLIPS.WALK2.nick;

        this.showTofu(false);

    }

    async init() {

        await super.init();

        this.AWS.setActionEffectiveTimeScale(this._walkNick, this._animationSettings.WALK_TIMESCALE);
   
    }

}

export { ZombieMale };