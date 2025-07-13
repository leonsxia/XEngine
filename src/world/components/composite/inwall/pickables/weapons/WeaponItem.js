import { PickableItem } from "../PickableItem";

class WeaponItem extends PickableItem {

    isWeaponItem = true;

    weaponType;
    ammo;
    isArmed = false;    

    constructor(specs) {
        
        super(specs);

        const { weaponType, ammoInstance, isArmed = false } = specs;
        this.weaponType = weaponType;
        this.ammo = ammoInstance;
        this.isArmed = isArmed;

        this.count = 1;

    }

}

export { WeaponItem };