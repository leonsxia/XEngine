import { Mesh } from 'three';
import { BasicObject } from './BasicObject';
import { TRIANGLE } from '../utils/constants';

class TrianglePlane extends BasicObject {

    constructor(specs) {

        super(TRIANGLE, specs);

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

    update() {

        this.setConfig({ texScale: [this.scale.x, this.scale.y] })
            .updateTextures();

    }

}

export { TrianglePlane };