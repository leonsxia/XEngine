import { Group } from 'three';
import { createCollisionPlane, createOBBPlane, createCollisionTrianglePlane, createCollisionPlaneFree } from '../../physics/collisionHelper';
import { Slope } from './Slope';
import { yankeesBlue, basic } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

const DEFAULT_STEP_HEIGHT = .25;

class Stairs extends Slope {

    #width;
    #height;
    #depth;
    #stepHeight;
    #stepDepth;
    #lastStepHeight;
    #steps;

    constructor(specs) {

        super(specs);

        const { name, width = 1, depth = 1, height = 1, stepHeight = DEFAULT_STEP_HEIGHT } = specs;
        const { showArrow = false, enableOBBs = false } = specs;
        const { frontMap, backMap, leftMap, rightMap, slopeMap, bottomMap } = specs;

        this.name = name;

        this.#width = width;
        this.#depth = depth;
        this.#height = height;
        this.#stepHeight = stepHeight;
        this.#steps = Math.floor(height / stepHeight) + height % stepHeight > 0 ? 1 : 0;
        this.#lastStepHeight = height % stepHeight;
        this.#stepDepth = depth / this.#steps;

    }

}

export { Stairs };