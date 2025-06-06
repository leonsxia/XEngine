import { MathUtils } from 'three';
import { WaterPlane, Plane } from '../../Models';
import { createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { colorHex, colorStr } from '../../basic/colorBase';

class WaterCube extends ObstacleBase {

    isWaterCube = true;

    _width = 1;
    _height = 1;
    _depth = 1;

    _color;
    _flowX;
    _flowY;
    _waterScale;
    waterFace;
    faces = [];

    frontFace;
    backFace;
    leftFace;
    rightFace;
    bottomFace;

    _waterDensity = 1;
    
    constructor(specs) {

        super(specs);

        this.specs = specs;

        const { name, waterDensity = 1 } = specs;
        const { color = [255, 255, 255], flowX = 1, flowY = 0, waterScale = 1, flowSpeed = 0.03, normalMap0, normalMap1 } = specs;
        const waterColor = colorHex(...color);
        const { scale = [1, 1, 1] } = specs;

        this._scale = new Array(...scale);

        this._waterDensity = waterDensity;
        this._color = new Array(...color);
        this._waterScale = waterScale;
        this._flowX = flowX;
        this._flowY = flowY;
        
        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height } };

        const FBSpecs = { width: this._width, height: this._height, color: waterColor, transparent: true };
        const LRSpecs = { width: this._depth, height: this._height, color: waterColor, transparent: true };
        const TBSpecs = { width: this._width, height: this._depth, color: waterColor, transparent: true };
        const waterSpecs = { width: this._width, height: this._depth, color, flowX, flowY, waterScale, flowSpeed, normalMap0, normalMap1 };

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], false, false);

        const frontFace = this.frontFace = new Plane(FBSpecs);
        const backFace = this.backFace = new Plane(FBSpecs);
        const leftFace = this.leftFace = new Plane(LRSpecs);
        const rightFace = this.rightFace = new Plane(LRSpecs);
        const bottomFace = this.bottomFace = new Plane(TBSpecs);

        this.waterFace = new WaterPlane(waterSpecs);

        this.setFace(frontFace, `${name}_front`, [0, 0, 0], [0, 0, 0]);
        this.setFace(backFace, `${name}_back`, [0, 0, 0], [0, Math.PI, 0]);
        this.setFace(leftFace, `${name}_left`, [0, 0, 0], [0, Math.PI * .5, 0]);
        this.setFace(rightFace, `${name}_right`, [0, 0, 0], [0, - Math.PI * .5, 0]);
        this.setFace(bottomFace, `${name}_bottom`, [0, 0, 0], [Math.PI * .5, 0, 0]);
        this.setFace(this.waterFace, `${name}_water`, [0, 0, 0], [- Math.PI * .5, 0, 0], false);

        this.faces = [frontFace, backFace, leftFace, rightFace, bottomFace];

        this.box.visible = false;

        this.update();

        this.group.add(
            this.box.mesh,
            frontFace.mesh,
            backFace.mesh,
            leftFace.mesh,
            rightFace.mesh,
            bottomFace.mesh,
            this.waterFace.mesh
        );

        this.setPickLayers();

    }

    setFace(face, name, position, rotation, setTransparent = true) {

        face.setName(name)
            .setPosition(position)
            .setRotation(rotation);
        
        if (setTransparent) {

            face.setTransparent(true, .8);

        }

    }

    get waterColor() {

        return this._color;

    }

    set waterColor(color) {

        this._color = new Array(...color);
        this.waterFace.mesh.material.uniforms['color'].value.setStyle(colorStr(...color));

        for (let i = 0, il = this.faces.length; i < il; i++) {

            const face = this.faces[i];

            face.material.color.setStyle(colorStr(...color));

        }

    }

    get waterDensity() {

        return this._waterDensity;

    }

    set waterDensity(den) {
        
        this._waterDensity = den;

    }

    get waterScale() {

        return this._waterScale;

    }

    set waterScale(scale) {

        this._waterScale = scale;
        this.waterFace.mesh.material.uniforms[ 'config' ].value.w = scale;

    }

    get waterFlowX() {

        return this._flowX;

    }

    set waterFlowX(val) {

        this._flowX = val;
        this.waterFace.mesh.material.uniforms['flowDirection'].value.x = val;
        this.waterFace.mesh.material.uniforms['flowDirection'].value.normalize();

    }

    get waterFlowY() {

        return this._flowY;

    }

    set waterFlowY(val) {

        this._flowY = val;
        this.waterFace.mesh.material.uniforms['flowDirection'].value.y = val;
        this.waterFace.mesh.material.uniforms['flowDirection'].value.normalize();

    }

    get rotationXDegree() {

        return MathUtils.radToDeg(this.group.rotation.x);

    }

    set rotationXDegree(value) {

        this.group.rotation.x = MathUtils.degToRad(value);

    }

    get rotationYDegree() {

        return MathUtils.radToDeg(this.group.rotation.y);

    }

    set rotationYDegree(value) {

        this.group.rotation.y = MathUtils.degToRad(value);

    }

    get rotationZDegree() {

        return MathUtils.radToDeg(this.group.rotation.z);

    }

    set rotationZDegree(value) {

        this.group.rotation.z = MathUtils.degToRad(value);

    }

    update(needToUpdateOBBnRay = true) {

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];

        this.frontFace.setScaleWithTexUpdate([this.scale[0], this.scale[1], 1])
            .setPosition([0, 0, depth * .5]);

        this.backFace.setScaleWithTexUpdate([this.scale[0], this.scale[1], 1])
            .setPosition([0, 0, - depth * .5]);

        this.leftFace.setScaleWithTexUpdate([this.scale[2], this.scale[1], 1])
            .setPosition([width * .5, 0, 0]);

        this.rightFace.setScaleWithTexUpdate([this.scale[2], this.scale[1], 1])
            .setPosition([- width * .5, 0, 0]);        

        this.bottomFace.setScaleWithTexUpdate([this.scale[0], this.scale[2], 1])
            .setPosition([0, - height * .5, 0]);

        this.waterFace.setScaleWithTexUpdate([this.scale[0], this.scale[2], 1])
            .setPosition([0, height * .5, 0]);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {
            
            this.updateOBBs();

        }

    }

}

export { WaterCube };