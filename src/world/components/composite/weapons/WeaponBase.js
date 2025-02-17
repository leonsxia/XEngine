import { Group } from 'three';
import { GLTFModel } from '../../Models';
import { loadedGLTFModels } from '../../utils/gltfHelper';
import { Logger } from '../../../systems/Logger';
import { AnimateWorkstation } from '../../Animation/AnimateWorkstation';

const DEBUG = true;

class WeaponBase {

    gltf;
    group;

    specs;

    AWS;
    _clips = {};
    _animationSettings = {};

    _weaponType;
    _damage;
    _fireRate = 1;
    _ammo;
    _isFiring = false;
    _isSemiAutomatic = true;
    ammoCount;

    _shootNick;
    _emptyNick = 'empty';
    _animateMapping = {};

    constructor(specs) {

        const { name, scale = [1, 1, 1] } = specs;
        const { position = [0, 0, 0], rotation = [0, 0, 0] } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { weaponType, fireRate = 1, ammo, isSemiAutomatic = true } = specs;
        const { clips, animationSetting } = specs;
        let { src } = specs;

        this.specs = specs;

        this._weaponType = weaponType;
        this._fireRate = fireRate;
        this._ammo = this.ammoCount = ammo;
        this._isSemiAutomatic = isSemiAutomatic;

        Object.assign(this._clips, clips);
        Object.assign(this._animationSettings, animationSetting);

        if (loadedGLTFModels[weaponType]) {

            src = loadedGLTFModels[weaponType];

        }

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);
        this.gltf.setPosition(position);
        this.gltf.setRotation(rotation);

        this.group = new Group();

        this.group.add(this.gltf.group);

    }

    async init() {

        await this.gltf.init();

        if (!loadedGLTFModels[this._weaponType]) {

            loadedGLTFModels[this._weaponType] = this.gltf.gltf;

        }

        if (Object.getOwnPropertyNames(this._clips).length) {

            this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: this._clips });

            this.AWS.init();

            this.AWS.setActionEffectiveTimeScale(this._shootNick, this._fireRate);

        }

    }

    get weaponType() {

        return this._weaponType;

    }

    get fireRate() {

        return this._fireRate;

    }

    get ammo() {

        return this._ammo;

    }

    set ammo(val) {

        this._ammo = val;

    }

    get magzineEmpty() {

        return this._ammo === 0;

    }

    get isFiring() {

        return this._isFiring;

    }

    set isFiring(val) {

        this._isFiring = val;

    }

    get isSemiAutomatic() {

        return this._isSemiAutomatic;

    }

    set isSemiAutomatic(val) {

        this._isSemiAutomatic = val;
        
    }

    get animateEnabled() {

        return this.AWS ? true: false;
        
    }

    fillMagzine(ammo = this.ammoCount) {

        this._ammo = ammo;

        this.resetWeaponEmpty();

    }

    shoot() {

        if (this.animateEnabled) {

            this.AWS.playAction(this._shootNick);
            // this.AWS.prepareCrossFade(this.AWS.actions[this._shootNick], this.AWS.actions[this._shootNick], this._animationSettings.SHOOT, 1);

        }

    }

    cancelShoot() {

        if (this.animateEnabled) {

            this.AWS.setActionEffectiveWeight(this._shootNick, 0);

        }

    }

    weaponEmpty() {

        if (this.animateEnabled) {

            this.AWS.prepareCrossFade(this.AWS.actions[this._shootNick], this.AWS.actions[this._emptyNick], 0.08, 1);

        }

    }

    resetWeaponEmpty() {

        if (this.animateEnabled) {

            this.AWS.actions[this._emptyNick].stop();

        }

    }

}

export { WeaponBase };