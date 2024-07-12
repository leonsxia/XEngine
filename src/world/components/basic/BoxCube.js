import { Mesh, MathUtils } from 'three'
import { BasicObject } from './BasicObject';

class BoxCube extends BasicObject {
    #radiansPerSecond = MathUtils.degToRad(8.59);

    constructor(specs) {
        super('box', specs);
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;
    }

    async init (specs) {
        await this.initBasic(specs);
    }

    tick(delta) {
        this.mesh.rotation.y += delta * this.#radiansPerSecond;
    }
}

export { BoxCube };