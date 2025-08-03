import { getRandomFloat } from "../../utils/mathHelper";

class Ammo {

    onCountChanged = [];

    constructor(specs) {

        const { count = 0, type = 'normal', damage = 0, offset0 = 0, offset1 = offset0 } = specs;
        const { isMeleeWeapon = false, durability = 100 } = specs;

        this._count = count;
        this._type = type;
        this._damage = damage;
        this._offset0 = offset0;
        this._offset1 = offset1;

        this.isMeleeWeapon = isMeleeWeapon;
        this._durability = durability;

    }

    updateAmmoProperties(ammo) {

        this._type = ammo._type;
        this._count = ammo._count;
        this._damage = ammo._damage;
        this._offset0 = ammo._offset0;
        this._offset1 = ammo._offset1;

        this.doCountChangedEvents();

    }

    get count() {

        return this._count;

    }

    set count(val) {

        this._count = Math.max(val, 0);
        this.doCountChangedEvents();

    }

    get durability() {

        return this._durability;

    }

    set durability(val) {

        this._durability = val;

    }

    get damage() {

        return this._damage;

    }

    get realDamage() {

        const floatDmg = parseFloat(getRandomFloat(this._offset0, this._offset1).toFixed(2));

        return this._damage + floatDmg;

    }

    set damage(val) {

        this._damage = val;

    }

    get offset0() {

        return this._offset0;

    }

    set offset0(val) {

        this._offset0 = val;

    }

    get offset1() {

        return this._offset1;

    }

    set offset1(val) {

        this._offset1 = val;

    }

    doCountChangedEvents() {

        for (let i = 0, il = this.onCountChanged.length; i < il; i++) {

            const callback = this.onCountChanged[i];
            if (typeof callback === 'function') {

                callback(this);

            }

        }

    }

    toJSON() {

        const output = {};
        output.type = this._type;
        output.count = this._count;
        output.damage = this._damage;
        output.offset0 = this._offset0;
        output.offset1 = this._offset1;

        return output;

    }

}

export { Ammo };