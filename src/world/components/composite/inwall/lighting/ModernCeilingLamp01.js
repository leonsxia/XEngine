import { Vector3 } from 'three';
import { GLTFModel, Sphere } from '../../../Models';
import { khaki } from '../../../basic/colorBase';
import { LightingObjectBase, BLOOM_TYPE_DEFAULT } from './LightingObjectBase';

const GLTF_SRC = 'in_room/lighting/modern_ceiling_lamp_01_1k/modern_ceiling_lamp_01_1k.gltf';

class ModernCeilingLamp01 extends LightingObjectBase {

    _radius = .2157;
    _ropeHeight = .63;
    _height = this._radius * 2 + this._ropeHeight;
    _topHeight = 1.168;

    _lampRadius = .23;
    _lamp;

    gltf;

    _lightY = - .3;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1] } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;
        const { bloomTransparency = .5, bloomIntensity = 5 } = specs;

        this._scale = [scale[0], scale[1], scale[0]];

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow }

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale([scale[0], scale[1], scale[0]]);

        // bloom object
        const lampSpecs = { name: `${name}_lamp`, size: { radius: this._lampRadius, widthSegments: 32, heightSegments: 32 }, color: khaki, transparent: true }
        const lamp = this._lamp = new Sphere(lampSpecs);

        this.bloomObjects = [lamp];
        this.setBloomObjectsFather();
        this.setBloomObjectsTransparent(bloomTransparency);
        this.setBloomObjectsLayers();
        this.setBloomObjectsVisible(false);
        this.addBloomObjects();
        this.setLightingMap(BLOOM_TYPE_DEFAULT, {
            bloomObject: lamp,
            intensity: 0,
            bloomIntensity,
            lightObject: null,
            position: new Vector3(0, this._lightY, 0),
            currentPosition: new Vector3()
        });

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

        return this._scale;

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
        this.updateLightingMap(needToUpdateLight);

        // update gltf scale
        this.gltf.setScale(this._scale);

    }

}

export { ModernCeilingLamp01 };