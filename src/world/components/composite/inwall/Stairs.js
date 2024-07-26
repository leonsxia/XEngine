import { PlaneGeometry } from 'three';
import { Plane } from '../../Models';
import { Slope } from './Slope';
import { yankeesBlue, basic } from '../../basic/colorBase';

const DEFAULT_STEP_HEIGHT = .25;

class Stairs extends Slope {

    isStairs = true;

    stepFronts = [];
    stepSides = [];
    stepTop;

    #stepHeight;
    #stepDepth;
    #lastStepHeight;
    #steps;

    constructor(specs) {

        super(specs);

        const { name, width = 1, depth = 1, height = 1, stepHeight = DEFAULT_STEP_HEIGHT } = specs;
        const { frontMap, topMap } = this.specs;

        this.name = name;

        this.#stepHeight = stepHeight;
        this.#steps = Math.floor(height / stepHeight) + (height % stepHeight > 0 ? 1 : 0);
        this.#lastStepHeight = height % stepHeight;
        this.#stepDepth = depth / this.#steps;

        this.slope.mesh.visible = false;
        this.leftFace.mesh.visible = false;
        this.rightFace.mesh.visible = false;

        const stepFrontSpecs = this.makePlaneConfig({ name: `${name}_step_front_template`, width, height: this.#stepHeight, color: basic, map: frontMap });
        const stepTopSpecs = this.makePlaneConfig({ name: `${name}_step_top_template`, width, height: this.#stepDepth, color: yankeesBlue, map: topMap });

        this.stepFronts.push(new Plane(stepFrontSpecs));
        this.stepTop = new Plane(stepTopSpecs);

        this.createTemplates();

    }

    async init() {

        await Promise.all([
            this.backFace.init(),
            this.bottomFace.init(),
            this.stepTop.init()
        ].concat(this.stepSides.map(side => side.init()), this.stepFronts.map(front => front.init())));

        this.createSteps();

    }

    createTemplates() {

        const { name, width, depth, height, sideMap, frontMap } = this.specs;

        for (let i = 0; i < this.#steps; i++) {

            const stepDepth = this.#stepDepth * i;
            const posZ = depth * .5 - this.#stepDepth * .5 - stepDepth;

            let sideHeight;

            if (i < this.#steps - 1 || this.#lastStepHeight === 0) {

                sideHeight = (i + 1) * this.#stepHeight;

            } else {

                sideHeight = i * this.#stepHeight + this.#lastStepHeight;

                const lastFrontSpecs = this.makePlaneConfig({ name: `${name}_step_front_last`, width, height: this.#lastStepHeight, color: basic, map: frontMap });
                const lastFront = new Plane(lastFrontSpecs);
                lastFront.setPosition([0, - height * .5 + sideHeight - this.#lastStepHeight * .5, depth * .5 - stepDepth]);

                this.stepFronts.push(lastFront);

                this.group.add(lastFront.mesh);

            }

            const sideLSpecs = this.makePlaneConfig({ name: `${name}_step_side_L_${i}`, width: this.#stepDepth, height: sideHeight, color: basic, map: sideMap });
            const sidePosY = (sideHeight - height) * .5;

            const sideL = new Plane(sideLSpecs);
            sideL.setPosition([width * .5, sidePosY, posZ]);
            sideL.setRotation([0, Math.PI * .5, 0]);

            this.stepSides.push(sideL);

        }

    }

    createSteps() {

        const { name, width, depth, height } = this.specs;

        for (let i = 0; i < this.#steps; i++) {

            const top = this.stepTop.clone(`${name}_step_top_${i}`);
            let sideL, sideR, sideHeight, stepHeight;

            top.setRotation([- Math.PI * .5, 0, 0]);

            const stepDepth = this.#stepDepth * i;
            const posZ = depth * .5 - this.#stepDepth * .5 - stepDepth;

            if (i < this.#steps - 1 || this.#lastStepHeight === 0) {

                stepHeight = this.#stepHeight * (i + 1);
                sideHeight = (i + 1) * this.#stepHeight;

                const front = this.stepFronts[0].clone(`${name}_step_front_${i}`);
                front.setPosition([0, - height * .5 + stepHeight - this.#stepHeight * .5, depth * .5 - stepDepth]);

                this.group.add(front.mesh);

            } else {

                stepHeight = this.#stepHeight * i + this.#lastStepHeight;
                sideHeight = i * this.#stepHeight + this.#lastStepHeight;

            }

            
            top.setPosition([0, - height * .5 + stepHeight, posZ]);

            const sidePosY = (sideHeight - height) * .5;

            sideL = this.stepSides[i];
            sideR = sideL.clone(`${name}_step_side_R_${i}`);
            sideR.setPosition([- width * .5, sidePosY, posZ]);
            sideR.setRotation([0, - Math.PI * .5, 0]);

            this.stepSides.push(sideR);

            this.group.add(top.mesh, sideL.mesh, sideR.mesh);

        }

    }

}

export { Stairs };