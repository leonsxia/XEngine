import { Vector3 } from 'three';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, Sphere } from '../../../Models';
import { khaki } from '../../../basic/colorBase';

const GLTF_SRC = 'inRoom/lighting/modern_ceiling_lamp_01_1k/modern_ceiling_lamp_01_1k.gltf';

class ModernCeilingLamp01 extends ObstacleBase {

    radius = .2157;
    ropeHeight = .583;
    height = this.radius * 2 + this.ropeHeight;
    topHeight = 1.168;

    gltf;
    lightPosition = new Vector3(0, - .3, 0);

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1], lines = true } = specs;
        const { offsetY = this.height * .5 - this.topHeight } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs; 

        this.radius *= scale[0];
        this.height *= scale[1];

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow }

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale([scale[0], scale[1], scale[0]]);

        // bloom object
        const lampSpecs = { name: `${name}_lamp`, size: { radius: .3, widthSegments: 16, heightSegments: 16 }, color: khaki, useBasicMaterial: true, transparent: true }
        const lamp = new Sphere(lampSpecs);
        const lampY = this.radius - this.height * .5;
        lamp.setPosition([0, lampY, 0]);
        
        this.bloomObjects = [lamp];
        this.setBloomObjectsFather();
        this.setBloomObjectsTransparent();
        this.setBloomObjectsLayers();
        this.setBloomObjectsVisible(false);
        this.addBloomObjects();

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

    }

    addLight(lightObj) {

        const { light } = lightObj;

        light.position.add(this.lightPosition);

        this.lightObjs.push(lightObj);
        this.lightIntensities.push(light.intensity);

        this.group.add(light);

    }

}

export { ModernCeilingLamp01 };