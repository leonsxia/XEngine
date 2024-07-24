import { Group } from 'three';
import { createCollisionPlane, createCollisionOBBPlane, createOBBBox } from '../../physics/collisionHelper';
import { yankeesBlue, green, basic } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

const DEFAULT_STEP_HEIGHT = .25;

class Stairs {

    name = '';

    #width;
    #height;
    #depth;
    #stepHeight;
    #stepDepth;
    #lastStepHeight;
    #steps;


    walls = []; // collision plane
    OBBTops = [];   // OBB plane
    OBBBottoms = [];    // OBB plane
    stepFronts = [];    // collision OBB plane

    isStairs = true;

    specs;

    constructor(specs) {

        this.specs = specs;

        const { name, width = 1, depth = 1, height = 1, stepHeight = DEFAULT_STEP_HEIGHT } = specs;
        const { showArrow = false } = specs;
        const { frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;

        this.name = name;
        this.#width = width;
        this.#depth = depth;
        this.#height = height;
        this.#stepHeight = stepHeight;
        this.#steps = Math.floor(height / stepHeight) + height % stepHeight > 0 ? 1 : 0;
        this.#lastStepHeight = height % stepHeight;
        this.#stepDepth = depth / this.#steps;

        this.group = new Group();

    }



    makePlaneConfig(specs) {
        
        const { width, height } = specs;
        const { baseSize = height, mapRatio, noRepeat = false } = this.specs;

        if (noRepeat) return specs;

        if (mapRatio) {
            specs.repeatU = width / (mapRatio * baseSize);
            specs.repeatV = height / baseSize;
        }

        specs.repeatModeU = REPEAT;
        specs.repeatModeV = REPEAT;

        return specs;
    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;
    }

    setRotationY(y) {

        this.group.rotation.y = y;

        this.walls.forEach(w => w.mesh.rotationY += y);

        this.stepFronts.forEach(sf => sf.mesh.rotationY += y);
        
        return this;

    }
}