import { Vector2 } from 'three';
import { Water } from 'three/addons/objects/Water2.js';
import { BasicObject } from './BasicObject';
import { loadedTextures } from '../utils/textureHelper';
import { WATER_PLANE, TEXTURE_NAMES } from '../utils/constants';
import { colorStr } from './colorBase';

class WaterPlane extends BasicObject {

    isWater = true;

    _color;
    _flowX;
    _flowY;
    _scale;  // waterScale

    constructor(specs) {

        specs.needMaterial = false;
        super(WATER_PLANE, specs);

        const { color = [255, 255, 255], flowX = 1, flowY = 0, textureWidth = 512, textureHeight = 512, waterScale = 1, flowSpeed = 0.03 } = specs;
        let { normalMap0, normalMap1 } = specs;
        const waterColor = colorStr(...color);
        const flowDirection = new Vector2(flowX, flowY);

        if (!normalMap0 && !normalMap1) {

            normalMap0 = loadedTextures[TEXTURE_NAMES.WATER_1_M_NORMAL];
            normalMap1 = loadedTextures[TEXTURE_NAMES.WATER_2_M_NORMAL];

        }

        this._color = color;
        this._scale = waterScale;
        this._flowX = flowX;
        this._flowY = flowY;
        
        const waterConfig = {
            color: waterColor,
            scale: waterScale,
            flowDirection,
            flowSpeed,
            textureWidth,
            textureHeight,
            normalMap0,
            normalMap1
        };
        this.mesh = new Water(this.geometry, waterConfig);

        this.mesh.name = specs.name;

        this.mesh.father = this;

    }

    get waterColor() {

        return this._color;

    }

    set waterColor(color) {

        this._color = color;
        this.mesh.material.uniforms['color'].value.setStyle(colorStr(...color));

    }

    get waterScale() {

        return this._scale;

    }

    set waterScale(scale) {

        this._scale = scale;
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

        return this.geometry.parameters.width * this.mesh.scale.x;

    }

    get height() {

        return this.geometry.parameters.height * this.mesh.scale.y;

    }

}

export { WaterPlane };