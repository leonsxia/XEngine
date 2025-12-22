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
        this._concats.push(...objects);

    }

}

export { UpdatableBase };