import { Vector3 } from 'three';
import { GLTFModel } from '../../../Models';
import { LightLamp } from './LightLamp';

const GLTF_SRC = 'in_room/lighting/security_light_1k/security_light_1k.gltf';

class SecurityLight extends LightLamp {

    _width = .33;
    _height = .52;
    _depth = .389;

    gltf;

    _bloomLight;

    _lightY = -1.2;
    _lightZ = .07;
    lightPosition = new Vector3(0, this._lightY, this._lightZ);

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
        this.gltf.getMeshes(this.gltf.group);
        const lightGlass = this._bloomLight = this.gltf.meshes.find(m => m.name === 'security_light_glass');
        lightGlass.material = lightGlass.material.clone();
        lightGlass.alwaysVisible = true;

        this.bloomObjects = [lightGlass];
        this.setBloomObjectsFather();
        this.setBloomObjectsLayers();

        this.update(false);

        this.setPickLayers();

    }

    update(needToUpdateLight = true) {

        // update bloom object linked point light position
        const lightY = this._lightY * this.scale[1];
        const lightZ = this._lightZ * this.scale[2];
        const bloomLightPosition = new Vector3(0, lightY, lightZ);

        if (needToUpdateLight) {

            const lightObj = this._bloomLight.linked;
            const { light } = lightObj;

            light.position.sub(this.lightPosition).add(bloomLightPosition);

        }

        this.lightPosition.copy(bloomLightPosition);

        // update gltf scale
        this.gltf.setScale(this._scale);

    }

    addLight(lightObj) {

        const { light } = lightObj;

        light.position.add(this.lightPosition);

        this.lightObjs.push(lightObj);
        this.lightIntensities.push(light.intensity);

        this.bloomObjects[0].linked = lightObj;
        this.bloomObjects[0].material.color.copy(light.color);
        this.bindBloomEvents(lightObj);

        this.group.add(light);

    }

    setLightPosition(light, position) {

        const pos = new Vector3(...position);
        light.position.copy(pos.add(this.lightPosition));

    }

    getLightPosition(light) {

        return light.position.clone().sub(this.lightPosition);

    }

}

export { SecurityLight };