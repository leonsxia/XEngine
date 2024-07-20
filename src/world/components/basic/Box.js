import { Mesh } from 'three'
import { BasicObject } from './BasicObject';

class Box extends BasicObject {
    #mapSrc;

    constructor(specs) {
        super('box', specs);

        const { name, map } = specs;

        this.#mapSrc = map;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = name;
    }

    async init () {
        await this.initBasic({ map: this.#mapSrc });
    }

    get width() {
        return this.geometry.parameters.width * this.mesh.scale.x;
    }

    get height() {
        return this.geometry.parameters.width * this.mesh.scale.y;
    }

    get depth() {
        return this.geometry.parameters.depth * this.mesh.scale.z;
    }
}

export { Box };