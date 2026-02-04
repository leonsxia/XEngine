import { Group } from 'three';
import { Box, Cylinder } from '../../../Models';

class LadderItem {

    _width = .6;
    _height = 1;
    _depth = .1;

    #bodyWidth = .12;
    #stickRadius = .025;
    _stickGap = .24;
    _stickNum = 1;

    _bodyLeft;
    _bodyRight;
    _sticks = [];

    _scale = [1, 1, 1];
    _initialScale = [1, 1, 1];

    group;

    constructor(specs) {

        this.group = new Group();

        this.specs = specs;
        const { name, scale = [1, 1, 1] } = this.specs;
        this._scale = this._initialScale = new Array(...scale);

        const { bodyMap, bodyNormalMap, castShadow = true, receiveShadow = true} = this.specs;
        const bodyConfig = { 
            size: { width: this.#bodyWidth, depth: this._depth, height: this._height },  
            map: bodyMap, normalMap: bodyNormalMap
        };
        const blSpecs = this.makeBoxConfig(Object.assign({name: `${name}_left_body`}, bodyConfig), 0);
        const brSpecs = this.makeBoxConfig(Object.assign({name: `${name}_right_body`}, bodyConfig), 1);
        this._bodyLeft = new Box(blSpecs);
        this._bodyRight = new Box(brSpecs);
        this._bodyLeft.castShadow(castShadow).receiveShadow(receiveShadow);
        this._bodyRight.castShadow(castShadow).receiveShadow(receiveShadow);

        this.group.add(this._bodyLeft.mesh, this._bodyRight.mesh);

        const { segments = 8, map, normalMap } = this.specs;
        const {stickGap = .24} = this.specs;
        const stickConfig = {
            radius: this.#stickRadius, height: this._width - .001, segments,
            map, normalMap
        };
        this._stickGap = stickGap;
        const totalGap = this._stickGap + this.#stickRadius * 2;
        this._stickNum = Math.floor(this._height * this.scale[1] / totalGap);

        for (let i = 0, il = this._stickNum; i < il; i++) {

            const lconfig = this.makeCylinderConfig(Object.assign({name: `${name}_stick_${i}`}, stickConfig), i);
            const stick = new Cylinder(lconfig);
            stick.setRotation([Math.PI * .5, 0, Math.PI * .5])
                .castShadow(castShadow)
                .receiveShadow(receiveShadow);
            this._sticks.push(stick);

            this.group.add(stick.mesh);

        }

    }

    async init() {

        const loadPromises = [];
        for (let i = 0, il = this._sticks.length; i < il; i++) {

            loadPromises.push(this._sticks[i].init());

        }

        loadPromises.push(
            this._bodyLeft.init(),
            this._bodyRight.init()
        );

        await Promise.all(loadPromises);

    }

    makeBoxConfig(specs, idx) {
        
        const { bodyBaseSize = this._height, bodyMapRatio, lines = false, transparent = true } = this.specs;
        const { roughness = 1, metalness = 0 } = this.specs;

        specs.lines = lines;
        specs.offsetX = idx / 2;
        specs.mapRatio = bodyMapRatio;
        specs.baseSize = bodyBaseSize;
        specs.transparent = transparent;
        specs.roughness = roughness;
        specs.metalness = metalness;

        return specs;

    }

    makeCylinderConfig(specs, idx) {

        const { baseSize = this._height, mapRatio, lines = false, transparent = true } = this.specs;
        const { roughness = 1, metalness = 0 } = this.specs;

        specs.lines = lines;
        specs.offsetX = idx / this._stickNum;
        specs.mapRatio = mapRatio;
        specs.baseSize = baseSize;
        specs.transparent = transparent;
        specs.roughness = roughness;
        specs.metalness = metalness;

        return specs;

    }

    get scale() {

        return this._scale;

    }

    set scale(val) {

        this._scale = new Array(...val);

        this.update();

    }

    set visible(val) {

        this._bodyLeft.visible = val;
        this._bodyRight.visible = val;

        for (let i = 0, il = this._sticks.length; i < il; i++) {

            this._sticks[i].visible = val;

        }

    }

    update() {

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const halfHeight = height * .5;
        const heightRatio = this._scale[1] / this._initialScale[1];
        const totalGap = (this._stickGap + this.#stickRadius * 2) * heightRatio;
        const startY = (height - this._stickNum * totalGap + this._stickGap * heightRatio) * .5;

        this._bodyLeft.setScaleWithTexUpdate(this.scale)
            .setPosition([width * .5 - this.#bodyWidth * this.scale[0] * .5, 0, 0]);
        
        this._bodyRight.setScaleWithTexUpdate(this.scale)
            .setPosition([- width * .5 + this.#bodyWidth * this.scale[0] * .5, 0, 0]);
       
        for (let i = 0, il = this._sticks.length; i < il; i++) {

            const stick = this._sticks[i];            
            stick.setScaleWithTexUpdate([this.scale[2], this.scale[0], this.scale[2]])
                .setPosition([0, - halfHeight + i * totalGap + this.#stickRadius + startY, 0]);

        }

    }

}

export { LadderItem };