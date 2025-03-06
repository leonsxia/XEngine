import { StairsSidePlane, StairsStepPlane } from '../../Models';
import { Slope } from './Slope';
import { yankeesBlue, basic } from '../../basic/colorBase';
import { STAIRS_FRONT, STAIRS_TOP } from '../../utils/constants';

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

        const { name, sideMap, sideNormal } = this.specs;
        const { receiveShadow = true, castShadow = true } = this.specs;
        const leftSideSpecs = this.makePlaneConfig({ name: `${name}_left_side`, width: this._depth, height: this._height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: sideMap, normalMap: sideNormal, leftHanded: true, color: basic });
        const rightSideSpecs = this.makePlaneConfig({ name: `${name}_right_side`, width: this._depth, height: this._height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: sideMap, normalMap: sideNormal, leftHanded: false, color: basic });

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

        const { name, frontMap, topMap, frontNormal, topNormal } = this.specs;
        const { receiveShadow = true, castShadow = true } = this.specs;
        const frontSpecs = this.makePlaneConfig({ name: `${name}_front`, width: this._width, height: this._height, depth: this._depth, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: frontMap, normalMap: frontNormal, type: STAIRS_FRONT, color: basic });
        const topSpecs = this.makePlaneConfig({ name: `${name}_top`, width: this._width, height: this._depth, depth: this._height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: topMap, normalMap: topNormal, type: STAIRS_TOP, color: yankeesBlue });
        
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
        this.stepLeftSide.setScale([this.scale[2], this.scale[1], 1])
            .setPosition([width * .5, 0, 0]);
        this.stepRightSide.setScale([this.scale[2], this.scale[1], 1])
            .setPosition([- width * .5, 0, 0]);

        // update step front/top
        this.stepFront.setScale(this.scale);
        this.stepTop.setScale([this.scale[0], this.scale[2], this.scale[1]]);

        super.update(needToUpdateOBBnRay);

    }

}

export { Stairs };