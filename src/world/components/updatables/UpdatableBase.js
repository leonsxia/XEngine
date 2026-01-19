class UpdatableBase {

    _attachTo;
    _concats = [];
    _cachedRoomObjects = [];

    constructor() {}

    get attachTo() {

        return this._attachTo;

    }

    set attachTo(val) {

        this._attachTo = val;
        this.init();

    }

    get currentRoom() {

        return this.attachTo.currentRoom;

    }

    // inherited by children
    get currentRoomObjects() {

        return this._cachedRoomObjects;

    }
    
    resetCachedRoomObjects() {

        this._cachedRoomObjects.length = 0;
        this.currentRoomObjects;

    }

    // for inheritation
    init() { };

    concatObjects(...objects) {

        this._concats.length = 0;
        this._concats.push(...objects);

    }

}

export { UpdatableBase };