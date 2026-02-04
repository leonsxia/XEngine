import { GeometryDesc, MeshDesc, StairsSidePlane, StairsStepPlane } from '../../Models';
import { Slope } from './Slope';
import { yankeesBlue, basic } from '../../basic/colorBase';
import { BOX_GEOMETRY, STAIRS_FRONT, STAIRS_TOP } from '../../utils/constants';

const DEFAULT_STEP_HEIGHT = .25;

class Stairs extends Slope {

    isStairs = true;

    stepFront;
    stepTop;
    stepLeftSide;
    stepRightSide;
    stepSides = [];

    #stepHeight;
    #stepDepth;
    #lastStepHeight;
    #steps;

    constructor(specs) {

        specs.needUpdate = false;
        
        super(specs);

        const { stepHeight = DEFAULT_STEP_HEIGHT } = specs;

        this.#stepHeight = stepHeight / this.scale[1];
        this.#steps = Math.ceil(this._height * this.scale[1] / stepHeight);
        this.#lastStepHeight = (this._height * this.scale[1] % stepHeight) / this.scale[1];
        this.#lastStepHeight = Number.parseFloat(this.#lastStepHeight.toFixed(3)) === 0 ? this.#stepHeight : this.#lastStepHeight;
        this.#stepDepth = this._depth / this.#steps;

        this.slope.visible = false;
        this.leftFace.visible = false;
        this.rightFace.visible = false;

        this.createSideFaces();
        this.createStepFaces();

        this.setPickLayers();

        this.update(false);

    }

    async init() {

        await Promise.all([
            this.backFace.init(),
            this.bottomFace.init(),
            this.stepFront.init(),
            this.stepTop.init()
        ].concat(

            this.stepSides.map(side => side.init())

        ));

    }

    createSideFaces() {

        const { name, sideMap, sideNormal, sideArm } = this.specs;
        const { receiveShadow = true, castShadow = true } = this.specs;
        const leftSideSpecs = this.makePlaneConfig({ name: `${name}_left_side`, width: this._depth, height: this._height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: sideMap, normalMap: sideNormal, armMap: sideArm, leftHanded: true, color: basic });
        const rightSideSpecs = this.makePlaneConfig({ name: `${name}_right_side`, width: this._depth, height: this._height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: sideMap, normalMap: sideNormal, armMap: sideArm, leftHanded: false, color: basic });

        const leftSide = this.stepLeftSide = new StairsSidePlane(leftSideSpecs);
        const rightSide = this.stepRightSide = new StairsSidePlane(rightSideSpecs);
        leftSide.setRotation([0, Math.PI * .5, 0])
            .receiveShadow(receiveShadow)
            .castShadow(castShadow);

        rightSide.setRotation([0, - Math.PI * .5, 0])
            .receiveShadow(receiveShadow)
            .castShadow(castShadow);

        this.stepSides.push(leftSide, rightSide);

        this.group.add(leftSide.mesh, rightSide.mesh);

    }

    createStepFaces() {

        const { name, frontMap, topMap, frontNormal, topNormal, frontArm, topArm } = this.specs;
        const { receiveShadow = true, castShadow = true } = this.specs;
        const frontSpecs = this.makePlaneConfig({ name: `${name}_front`, width: this._width, height: this._height, depth: this._depth, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: frontMap, normalMap: frontNormal, armMap: frontArm, type: STAIRS_FRONT, color: basic });
        const topSpecs = this.makePlaneConfig({ name: `${name}_top`, width: this._width, height: this._depth, depth: this._height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: topMap, normalMap: topNormal, armMap: topArm, type: STAIRS_TOP, color: yankeesBlue });
        
        const front = this.stepFront = new StairsStepPlane(frontSpecs);
        const top =  this.stepTop = new StairsStepPlane(topSpecs);

        front.receiveShadow(receiveShadow)
            .castShadow(castShadow);

        top.setRotation([- Math.PI * .5, 0, 0])
            .receiveShadow(receiveShadow)
            .castShadow(castShadow);

        this.group.add(front.mesh, top.mesh);

    }

    update(needToUpdateOBBnRay = true) {

        const width = this._width * this.scale[0];   

        // update sideFaces
        this.stepLeftSide.setScaleWithTexUpdate([this.scale[2], this.scale[1], 1])
            .setPosition([width * .5, 0, 0]);
        this.stepRightSide.setScaleWithTexUpdate([this.scale[2], this.scale[1], 1])
            .setPosition([- width * .5, 0, 0]);

        // update step front/top
        this.stepFront.setScaleWithTexUpdate(this.scale);
        this.stepTop.setScaleWithTexUpdate([this.scale[0], this.scale[2], this.scale[1]]);

        super.update(needToUpdateOBBnRay);

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];
        let { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;
        mass /= 4;

        const stepHeight = this.#stepHeight * height;
        const lastStepHeight = this.#lastStepHeight * height;
        const stepDepth = depth / this.#steps;
        for (let i = 0; i < this.#steps; i++) {

            const stepGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height: i < this.#steps - 1 ? stepHeight : lastStepHeight, depth: stepDepth })
            const stepMesh = new MeshDesc(stepGeo);
            stepMesh.name = `${this.name}_step_${i}_mesh_desc`;
            if (i < this.#steps - 1) {

                stepMesh.position.set(0, (stepHeight - height) * .5 + i * stepHeight, (depth - stepDepth) * .5 - i * stepDepth);

            } else {

                stepMesh.position.set(0, (height - lastStepHeight) * .5, (depth - stepDepth) * .5 - i * stepDepth);

            }

            stepMesh.userData.physics = { mass: 0, restitution, friction };
            this.rapierInstances.push(stepMesh);

        }

        const bottomGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height: depth, depth: 0 });
        const bottomMesh = new MeshDesc(bottomGeo);
        bottomMesh.name = `${this.name}_bottom_mesh_desc`;
        bottomMesh.position.set(0, - height * .5, 0);
        bottomMesh.rotation.set(Math.PI * .5, 0, 0);
        bottomMesh.userData.physics = { mass, restitution, friction };

        const backGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height, depth: 0 });
        const backMesh = new MeshDesc(backGeo);
        backMesh.name = `${this.name}_back_mesh_desc`;
        backMesh.position.set(0, 0, - depth * .5);
        backMesh.rotation.set(0, Math.PI, 0);
        backMesh.userData.physics = { mass, restitution, friction };

        this.leftFace.mesh.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this.rightFace.mesh.userData.physics = { mass, restitution, friction, manuallyLoad: true };

        this.rapierInstances.push(bottomMesh, backMesh, this.leftFace.mesh, this.rightFace.mesh);

    }

}

export { Stairs };