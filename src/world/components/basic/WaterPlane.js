import { Vector2 } from 'three';
import { Water } from 'three/addons/objects/Water2.js';
import { BasicObject } from './BasicObject';
import { loadedTextures } from '../utils/textureHelper';
import { WATER_PLANE, TEXTURE_NAMES } from '../utils/constants';
import { colorStr } from './colorBase';

class WaterPlane extends BasicObject {

    isWater = true;

    color;
    flowX;
    flowY;
    scale;

    constructor(specs) {

        specs.needMaterial = false;
        super(WATER_PLANE, specs);

        const { color = [255, 255, 255], flowX = 1, flowY = 0, textureWidth = 512, textureHeight = 512, scale = 1, flowSpeed = 0.03 } = specs;
        let { normalMap0, normalMap1 } = specs;
        const waterColor = colorStr(...color);
        const flowDirection = new Vector2(flowX, flowY);

        if (!normalMap0 && !normalMap1) {

            normalMap0 = loadedTextures[TEXTURE_NAMES.WATER_1_M_NORMAL];
            normalMap1 = loadedTextures[TEXTURE_NAMES.WATER_2_M_NORMAL];

        }

        this.color = color;
        this.scale = scale;
        this.flowX = flowX;
        this.flowY = flowY;
        
        const waterConfig = {
            color: waterColor,
            scale,
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

        return this.color;

    }

    set waterColor(color) {

        this.color = color;
        this.mesh.material.uniforms['color'].value.setStyle(colorStr(...color));

    }

    get waterScale() {

        return this.scale;

    }

    set waterScale(scale) {

        this.scale = scale;
        this.mesh.material.uniforms[ 'config' ].value.w = scale;

    }

    get waterFlowX() {

        return this.flowX;

    }

    set waterFlowX(val) {

        this.flowX = val;
        this.mesh.material.uniforms['flowDirection'].value.x = val;
        this.mesh.material.uniforms['flowDirection'].value.normalize();

    }

    get waterFlowY() {

        return this.flowY;

    }

    set waterFlowY(val) {

        this.flowY = val;
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