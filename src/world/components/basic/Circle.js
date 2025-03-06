import { Mesh } from 'three';
import { BasicObject } from './BasicObject';
import { CIRCLE } from '../utils/constants';

class Circle extends BasicObject {

    constructor(specs) {

        super(CIRCLE, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

        this.mesh.father = this;

    }

    async init() {

        await this.initBasic();

    }

    update() {

        this.setConfig({ texScale: [this.scale.x] }).updateTextures();

    }

}

export { Circle };