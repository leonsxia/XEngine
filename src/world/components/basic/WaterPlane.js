import { Vector2, Vector3 } from 'three';
import { Water } from 'three/addons/objects/Water2.js';
import { BasicObject } from './BasicObject';
import { loadedTextures } from '../utils/textureHelper';
import { WATER_PLANE, TEXTURE_NAMES } from '../utils/constants';
import { colorStr } from './colorBase';
import { Logger } from '../../systems/Logger';

const DEBUG = false;
const _v1 = new Vector3();

class WaterPlane extends BasicObject {

    isWater = true;

    _color;
    _flowX;
    _flowY;
    _waterScale;  // waterScale

    _normalMap0;
    _normalMap1;

    _cachedWidth;
    _cachedHeight;

    #logger = new Logger(DEBUG, 'WaterPlane');

    constructor(specs) {

        specs.needMaterial = false;
        super(WATER_PLANE, specs);

        const { color = [255, 255, 255], flowX = 1, flowY = 0, textureWidth = 512, textureHeight = 512, waterScale = 1, flowSpeed = 0.03 } = specs;
        let { normalMap0, normalMap1 } = specs;
        const waterColor = colorStr(...color);
        const flowDirection = new Vector2(flowX, flowY);

        this._normalMap0 = normalMap0 ?? loadedTextures[TEXTURE_NAMES.WATER_1_M_NORMAL];
        this._normalMap1 = normalMap1 ?? loadedTextures[TEXTURE_NAMES.WATER_2_M_NORMAL];

        this._color = new Array(...color);
        this._waterScale = waterScale;
        this._flowX = flowX;
        this._flowY = flowY;
        
        const waterConfig = {
            color: waterColor,
            scale: waterScale,
            flowDirection,
            flowSpeed,
            textureWidth,
            textureHeight,
            normalMap0: this._normalMap0,
            normalMap1: this._normalMap1
        };
        this.mesh = new Water(this.geometry, waterConfig);

        this.mesh.name = specs.name;

        this.mesh.father = this;

        this.bindEvents();

    }

    bindEvents() {

        const listener = (event) => {

            this.#logger.log(`${event.message}`);
            this._cachedWidth = this.geometry.parameters.width * this.mesh.getWorldScale(_v1).x;
            this._cachedHeight = this.geometry.parameters.height * this.mesh.getWorldScale(_v1).y;

        }
        const type = 'scaleChanged';

        this.addEventListener(type, listener);

    }

    get waterColor() {

        return this._color;

    }

    set waterColor(color) {

        this._color = new Array(...color);
        this.mesh.material.uniforms['color'].value.setStyle(colorStr(...color));

    }

    get waterScale() {

        return this._waterScale;

    }

    set waterScale(scale) {

        this._waterScale = scale;
        this.mesh.material.uniforms[ 'config' ].value.w = scale;

    }

    get waterFlowX() {

        return this._flowX;

    }

    set waterFlowX(val) {

        this._flowX = val;
        this.mesh.material.uniforms['flowDirection'].value.x = val;
        this.mesh.material.uniforms['flowDirection'].value.normalize();

    }

    get waterFlowY() {

        return this._flowY;

    }

    set waterFlowY(val) {

        this._flowY = val;
        this.mesh.material.uniforms['flowDirection'].value.y = val;
        this.mesh.material.uniforms['flowDirection'].value.normalize();

    }    

    get width() {

        if (!this._cachedWidth) {

            this._cachedWidth = this.geometry.parameters.width * this.mesh.getWorldScale(_v1).x;

        }

        return this._cachedWidth;

    }

    get height() {

        if (!this._cachedHeight) {

            this._cachedHeight = this.geometry.parameters.height * this.mesh.getWorldScale(_v1).y;

        }

        return this._cachedHeight;

    }

    updateTexScale() {

        this.setConfig({ 
            texScale: [this.scale.x, this.scale.y], 
            mapRatio: this.geometry.parameters.width / this.geometry.parameters.height
        });

        if (this._normalMap0) {

            this.setTexture(this._normalMap0, true);

        }

        if (this._normalMap1) {

            this.setTexture(this._normalMap1, true);

        }

    }

    update() {

        this.updateTexScale();

    }

}

export { WaterPlane };