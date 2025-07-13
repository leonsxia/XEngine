import { PickableItem } from "../PickableItem";

class WeaponItem extends PickableItem {

    isWeaponItem = true;

    _weaponType;
    _ammo;

    constructor(specs) {
        
        super(specs);

        const { weaponType, ammo } = specs;
        this._weaponType = weaponType;
        this._ammo = ammo;

    }

}

export { WeaponItem };