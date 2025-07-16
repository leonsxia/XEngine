import { Vector3 } from 'three';
import { GLTFModel, Sphere } from '../../../Models';
import { khaki } from '../../../basic/colorBase';
import { LightLamp } from './LightLamp';

const GLTF_SRC = 'in_room/lighting/modern_ceiling_lamp_01_1k/modern_ceiling_lamp_01_1k.gltf';

class ModernCeilingLamp01 extends LightLamp {

    _radius = .2157;
    _ropeHeight = .63;
    _height = this._radius * 2 + this._ropeHeight;
    _topHeight = 1.168;

    _lampRadius = .23;
    _lamp;

    gltf;

    _lightY = - .3;
    lightPosition = new Vector3(0, this._lightY, 0);

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1] } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = [scale[0], scale[1], scale[0]];

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow }

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale([scale[0], scale[1], scale[0]]);

        // bloom object
        const lampSpecs = { name: `${name}_lamp`, size: { radius: this._lampRadius, widthSegments: 32, heightSegments: 32 }, color: khaki, useBasicMaterial: true, transparent: true }
        const lamp = this._lamp = new Sphere(lampSpecs);

        this.bloomObjects = [lamp];
        this.setBloomObjectsFather();
        this.setBloomObjectsTransparent();
        this.setBloomObjectsLayers();
        this.setBloomObjectsVisible(false);
        this.addBloomObjects();

        this.update(false);

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

    }

    get scaleR() {

        return this._scale[0];

    }

    set scaleR(r) {

        this._scale[0] = this._scale[2] = r;

        this.update();

    }

    get scale() {

        return [this._scale[0], this._scale[1]];

    }

    set scale(val = [1, 1]) {

        this._scale = [val[0], val[1], val[0]];

        this.update();

    }

    update(needToUpdateLight = true) {

        // update bloom lamp
        const ropeHeight = this._ropeHeight * this.scale[1];
        // const height = this._height * this.scale[1];
        // const lampY = (height - ropeHeight) * .5 - height * .5;
        const lampY = - ropeHeight * .5;

        this._lamp.setScale(this._scale).setPosition([0, lampY, 0]);

        // update bloom lamp linked point light position
        const lightY = this._lightY * this.scale[1];
        const lampLightPosition = new Vector3(0, lightY, 0);

        if (needToUpdateLight) {

            const lightObj = this._lamp.linked;
            const { light } = lightObj;

            light.position.sub(this.lightPosition).add(lampLightPosition);

        }

        this.lightPosition.copy(lampLightPosition);

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

export { ModernCeilingLamp01 };