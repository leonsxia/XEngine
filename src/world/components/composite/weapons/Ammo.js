import { getRandomFloat } from "../../utils/mathHelper";

class Ammo {

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

    }

    get count() {

        return this._count;

    }

    set count(val) {

        if (val <= 0) val = 0;

        this._count = val;

    }

    get durability() {

        return this._durability;

    }

    set durability(val) {

        this._durability = val;

    }

    get damage() {

        const floatDmg = parseFloat(getRandomFloat(this._offset0, this._offset1).toFixed(2));

        return this._damage + floatDmg;

    }

}

export { Ammo };