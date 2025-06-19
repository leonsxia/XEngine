import { WeaponBase } from '../../Models';
import { GLOCK_CLIPS as CLIPS, WEAPONS } from '../../utils/constants';
import { Ammo } from './Ammo';

const GLTF_SRC = 'weapons/Glock19.glb';
const ANIMATION_SETTINGS = {
    SHOOT: 0.1,
    CANCEL_SHOOT: 0.1,
    EMPTY: 0.08
};

class Glock extends WeaponBase {

    constructor(specs) {

        const superSpecs = {
            weaponType: WEAPONS.GLOCK,
            name: null,
            scale: [.025, .025, .025],
            position: [0, 0, 0], 
            rotation: [0, 0, 0],
            offsetX: 0, 
            offsetY: 0, 
            offsetZ: 0,
            receiveShadow: true, 
            castShadow: true,
            src: GLTF_SRC,
            damageRange: 13,
            attackInterval: 0.4667,
            fireRate: 1.8,
            ammo: new Ammo({ count: 20, damage: 18, offset: - 5, offset1: 10 }),
            magzineCapacity: 20,
            isSemiAutomatic: true,
            clips: CLIPS, animationSetting: ANIMATION_SETTINGS
        };

        Object.assign(superSpecs, specs);

        super(superSpecs);

        this._shootNick = CLIPS.SHOOT.nick;

    }

    async init() {

        await super.init();

        this.AWS.makeSubAction(this._shootNick, this._emptyNick, 0, 7, {
            loopOnce: true, 
            startImmediately: false,
            timeScale: 10
        }, 30);

    }

}

export { Glock };