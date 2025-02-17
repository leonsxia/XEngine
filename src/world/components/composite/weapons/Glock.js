import { WeaponBase } from '../../Models';
import { GLOCK_CLIPS as CLIPS, WEAPONS } from '../../utils/constants';

const GLTF_SRC = 'weapons/Glock19.glb';
const ANIMATION_SETTINGS = {
    SHOOT: 0.1
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
            fireRate: 1, 
            ammo: 19,
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