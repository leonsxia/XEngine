import { StairsSidePlane, StairsStepPlane } from '../../Models';
import { Slope } from './Slope';
import { yankeesBlue, basic } from '../../basic/colorBase';

const DEFAULT_STEP_HEIGHT = .25;

class Stairs extends Slope {

    isStairs = true;

    stepFront;
    stepSides = [];
    stepTop;

    #stepHeight;
    #stepDepth;
    #lastStepHeight;
    #steps;

    constructor(specs) {

        super(specs);

        const { depth = 1, height = 1, stepHeight = DEFAULT_STEP_HEIGHT} = specs;

        this.#stepHeight = stepHeight;
        this.#steps = Math.floor(height / stepHeight) + (height % stepHeight > 0 ? 1 : 0);
        this.#lastStepHeight = height % stepHeight;
        this.#stepDepth = depth / this.#steps;

        this.slope.mesh.visible = false;
        this.leftFace.mesh.visible = false;
        this.rightFace.mesh.visible = false;

        this.createSideFaces();
        this.createStepFaces();

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

        const { name, width = 1, depth = 1, height = 1, sideMap, sideNormal } = this.specs;
        const leftSideSpecs = this.makePlaneConfig({ name: `${name}_left_side`, width: depth, height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: sideMap, normalMap: sideNormal, leftHanded: true, color: basic });
        const rightSideSpecs = this.makePlaneConfig({ name: `${name}_right_side`, width: depth, height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: sideMap, normalMap: sideNormal, leftHanded: false, color: basic });

        const leftSide = new StairsSidePlane(leftSideSpecs);
        const rightSide = new StairsSidePlane(rightSideSpecs);
        leftSide.setPosition([width * .5, 0, 0])
            .setRotation([0, Math.PI * .5, 0])
            .receiveShadow(true)
            .castShadow(true);

        rightSide.setPosition([- width * .5, 0, 0])
            .setRotation([0, - Math.PI * .5, 0])
            .receiveShadow(true)
            .castShadow(true);

        this.stepSides.push(leftSide, rightSide);

        this.group.add(leftSide.mesh, rightSide.mesh);

    }

    createStepFaces() {

        const { name, width = 1, depth = 1, height = 1, frontMap, topMap, frontNormal, topNormal } = this.specs;
        const frontSpecs = this.makePlaneConfig({ name: `${name}_front`, width, height, depth, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: frontMap, normalMap: frontNormal, type: 'stairsFront', color: basic });
        const topSpecs = this.makePlaneConfig({ name: `${name}_top`, width, height: depth, depth: height, stepHeight: this.#stepHeight, steps: this.#steps, lastStepHeight: this.#lastStepHeight, stepDepth: this.#stepDepth, map: topMap, normalMap: topNormal, type: 'stairsTop', color: yankeesBlue });
        
        const front = new StairsStepPlane(frontSpecs);
        const top = new StairsStepPlane(topSpecs);

        front.receiveShadow(true)
            .castShadow(true);

        top.setRotation([- Math.PI * .5, 0, 0])
            .receiveShadow(true)
            .castShadow(true);
        
        this.stepFront = front;
        this.stepTop = top;

        this.group.add(front.mesh, top.mesh);

    }

}

export { Stairs };