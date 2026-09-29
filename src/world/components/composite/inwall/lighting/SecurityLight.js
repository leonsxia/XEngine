import { Vector3 } from 'three';
import { GLTFModel } from '../../../Models';
import { LightLamp, BLOOM_TYPE_DEFAULT } from './LightLamp';

const GLTF_SRC = 'in_room/lighting/security_light_1k/security_light_1k.gltf';

class SecurityLight extends LightLamp {

    _width = .33;
    _height = .52;
    _depth = .389;

    gltf;

    _bloomLight;

    _lightY = -1.2;
    _lightZ = .07;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1] } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow }

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        // bloom object
        const lightGlass = this._bloomLight = this.gltf.meshes.find(m => m.name === 'security_light_glass');
        lightGlass.material = lightGlass.material.clone();
        lightGlass.alwaysVisible = true;

        this.bloomObjects = [lightGlass];
        this.setBloomObjectsFather();
        this.setBloomObjectsLayers();
        this.setLightingMap(BLOOM_TYPE_DEFAULT, {
            bloomObject: lightGlass,
            intensity: 0,
            lightObject: null,
            position: new Vector3(0, this._lightY, this._lightZ),
            currentPosition: new Vector3()
        });

        this.update(false);

        this.setPickLayers();

    }

    update(needToUpdateLight = true) {

        // update bloom object linked point light position
        this.updateLightingMap(needToUpdateLight);

        // update gltf scale
        this.gltf.setScale(this._scale);

    }

}

export { SecurityLight };