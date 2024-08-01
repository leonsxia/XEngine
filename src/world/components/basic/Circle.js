import { Mesh } from 'three';
import { BasicObject } from './BasicObject';
import { CIRCLE } from '../utils/constants';

class Circle extends BasicObject {

    constructor(specs) {

        super(CIRCLE, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

    }

    async init() {

        await this.initBasic();

    }

}

export { Circle };