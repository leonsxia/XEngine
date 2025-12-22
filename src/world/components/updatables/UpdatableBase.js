class UpdatableBase {

    _attachTo;
    _concats = [];

    constructor() {}

    get attachTo() {

        return this._attachTo;

    }

    set attachTo(val) {

        this._attachTo = val;
        this.init();

    }

    // for inheritation
    init() { };

    concatObjects(...objects) {

        this._concats.length = 0;

        for (let i = 0, il = objects.length; i < il; i++) {

            const obj = objects[i];
            this._concats.push(obj);

        }

    }

}

export { UpdatableBase };