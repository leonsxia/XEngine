import { MathUtils } from 'three';
import { WaterPlane, Plane } from '../../Models';
import { createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { colorHex, colorStr } from '../../basic/colorBase';

class WaterCube extends ObstacleBase {

    isWaterCube = true;

    color;
    flowX;
    flowY;
    scale;
    waterFace;
    faces = [];
    
    constructor(specs) {

        super(specs);

        this.specs = specs;
        const { name, width, depth, height } = specs;
        const { color = [255, 255, 255], flowX = 1, flowY = 0, scale = 1, flowSpeed = 0.03, normalMap0, normalMap1 } = specs;
        const waterColor = colorHex(...color);

        this.color = color;
        this.scale = scale;
        this.flowX = flowX;
        this.flowY = flowY;
        
        const boxSpecs = { size: { width, depth, height } };

        const FBSpecs = { width, height, color: waterColor, transparent: true };
        const LRSpecs = { width: depth, height, color: waterColor, transparent: true };
        const TBSpecs = { width, height: depth, color: waterColor, transparent: true };
        const waterSpecs = { width, height: depth, color, flowX, flowY, scale, flowSpeed, normalMap0, normalMap1 };

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], false, false);

        const frontFace = new Plane(FBSpecs);
        const backFace = new Plane(FBSpecs);
        const leftFace = new Plane(LRSpecs);
        const rightFace = new Plane(LRSpecs);
        const bottomFace = new Plane(TBSpecs);

        this.waterFace = new WaterPlane(waterSpecs);

        this.setFace(frontFace, `${name}_front`, [0, 0, depth * .5], [0, 0, 0]);
        this.setFace(backFace, `${name}_back`, [0, 0, - depth * .5], [0, Math.PI, 0]);
        this.setFace(leftFace, `${name}_left`, [width * .5, 0, 0], [0, Math.PI * .5, 0]);
        this.setFace(rightFace, `${name}_right`, [- width * .5, 0, 0], [0, - Math.PI * .5, 0]);
        this.setFace(bottomFace, `${name}_bottom`, [0, - height * .5, 0], [Math.PI * .5, 0, 0]);
        this.setFace(this.waterFace, `${name}_water`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], false);

        this.faces = [frontFace, backFace, leftFace, rightFace, bottomFace];

        this.box.mesh.visible = false;

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

        return this.color;

    }

    set waterColor(color) {

        this.color = color;
        this.waterFace.mesh.material.uniforms['color'].value.setStyle(colorStr(...color));

        this.faces.forEach(face => {

            face.material.color.setStyle(colorStr(...color));

        });

    }

    get waterScale() {

        return this.scale;

    }

    set waterScale(scale) {

        this.scale = scale;
        this.waterFace.mesh.material.uniforms[ 'config' ].value.w = scale;

    }

    get waterFlowX() {

        return this.flowX;

    }

    set waterFlowX(val) {

        this.flowX = val;
        this.waterFace.mesh.material.uniforms['flowDirection'].value.x = val;
        this.waterFace.mesh.material.uniforms['flowDirection'].value.normalize();

    }

    get waterFlowY() {

        return this.flowY;

    }

    set waterFlowY(val) {

        this.flowY = val;
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
}

export { WaterCube };