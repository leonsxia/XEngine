import { Mesh } from 'three';
import { BasicObject } from './BasicObject';

class StairsStepPlane extends BasicObject {

    constructor(specs) {

        super(specs.type, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

        this.mesh.father = this;
        
    }

    async init () {

        this.initBasic();

    }

    get width() {

        return this.geometry.parameters.width * this.mesh.scale.x;

    }

    get height() {

        return this.geometry.parameters.height * this.mesh.scale.y;

    }
}

export { StairsStepPlane };