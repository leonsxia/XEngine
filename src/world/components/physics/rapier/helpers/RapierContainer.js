import { Vector3 } from 'three';

class RapierContainer {

    instances = [];
    actives = [];
    _scale = new Vector3(1, 1, 1);

    onActivesChanged = [];

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

        if (arguments.length > 1) {

            for (let i = 0; i < arguments.length; i++) {

                this.add(arguments[i]);

            }

            return this;

        }

        if (object.isMeshDesc || object.isMesh || object.isGroup) {

            this.instances.push(object);

        }

    }

    clearActives() {

        this.actives.length = 0;

    }

    setActiveInstances(names, needClear = true) {

        if (needClear) this.clearActives();

        for (let i = 0, il = names.length; i < il; i++) {

            const find = this.getInstanceByName(names[i]);
            if (find) {

                this.actives.push(find);

            }

        }

        this.doActivesChangedEvents();

        return this.actives;

    }

    getInstanceByName(name) {

        const instance = this.instances.find(i => i.name === name);

        return instance;

    }

    // events
    doActivesChangedEvents() {

        for (let i = 0, il = this.onActivesChanged.length; i < il; i++) {

            const event = this.onActivesChanged[i];
            event(this);

        }

    }

}

export { RapierContainer };