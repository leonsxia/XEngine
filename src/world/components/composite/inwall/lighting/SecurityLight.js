import { Vector3 } from 'three';
import { GLTFModel } from '../../../Models';
import { LightLamp } from './LightLamp';

const GLTF_SRC = 'inRoom/lighting/security_light_1k/security_light_1k.gltf';

class SecurityLight extends LightLamp {

    width = .33;
    height = .52;
    depth = .389;

    gltf;
    lightPosition = new Vector3(0, - 1.2, .07);

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1] } = specs;
        const { offsetY = .1, offsetZ = - this.depth * .5 } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs; 

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, offsetZ, receiveShadow, castShadow }

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale([scale[0], scale[1], scale[2]]);

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        // bloom object
        this.gltf.getMeshes(this.gltf.group);
        const lightGlass = this.gltf.meshes.find(m => m.name === 'security_light_glass');
        lightGlass.material = lightGlass.material.clone();
        lightGlass.alwaysVisible = true;

        this.bloomObjects = [lightGlass];
        this.setBloomObjectsFather();
        this.setBloomObjectsLayers();

        this.setPickLayers();

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