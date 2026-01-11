import { Vector3 } from 'three';

class RapierContainer {

    instances = [];
    _scale = new Vector3(1, 1, 1);

    constructor() { }

    get scale() {

        return this._scale;

    }

    set scale(val) {

        this._scale.set(...val);

        for (let i = 0, il = this.instances.length; i < il; i++) {

            const instance = this.instances[i];
            instance.scale.copy(this._scale);

        }

    }

    add(object) {

        if (object.isMeshDesc || object.isMesh || object.isGroup) {

            this.instances.push(object);

        }

    }

}

export { RapierContainer };