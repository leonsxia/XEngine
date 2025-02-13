import { Group } from 'three';
import { GLTFModel } from '../../Models';
import { loadedGLTFModels } from '../../utils/gltfHelper';
import { Logger } from '../../../systems/Logger';

const DEBUG = true;

class WeaponBase {

    gltf;
    group;
    _weaponType;
    _damage;
    _fireRate = 1;
    _ammo;
    ammoCount;

    constructor(specs) {

        const { name, scale = [1, 1, 1] } = specs;
        const { position = [0, 0, 0], rotation = [0, 0, 0] } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { weaponType, fireRate = 1, ammo } = specs;
        let { src } = specs;

        this._weaponType = weaponType;
        this._fireRate = fireRate;
        this._ammo = this.ammoCount = ammo;

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

    fillMagzine(ammo = this.ammoCount) {

        this._ammo = ammo;
        
    }

}

export { WeaponBase };