import { Mesh, Vector3 } from 'three';
import { BasicObject } from './BasicObject';
import { CAPSULE } from '../utils/constants';

const _v1 = new Vector3();

class Capsule extends BasicObject {

    _cachedRadius;
    _cachedHeight;

    constructor(specs) {

        super(CAPSULE, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

        this.mesh.father = this;

    }

    async init () {

        await this.initBasic();

    }

    // scale.x === scale.z
    get radius() {

        if (!this._cachedRadius) {

            this._cachedRadius = this.geometry.parameters.radius * this.mesh.getWorldScale(_v1).x;

        }

        return this._cachedRadius;

    }

    get height() {

        if (!this._cachedHeight) {

            this._cachedHeight = this.geometry.parameters.height * this.mesh.getWorldScale(_v1).y;

        }

        return this._cachedHeight;

    }

}

export { Capsule };