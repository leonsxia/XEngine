import { PickableItem } from "../PickableItem";

class AmmoBoxItem extends PickableItem {

    isAmmoItem = true;

    ammoBoxType;
    ammo;
    capacity;

    constructor(specs) {

        super(specs);

        const { ammoBoxType, ammoInstance, capacity } = specs;
        this.ammoBoxType = ammoBoxType;
        this.ammo = ammoInstance;
        this.capacity = capacity;

    }

    get count() {

        return this.ammo.count;

    }

    set count(val) {

        this.ammo.count = val > this.capacity ? this.capacity : val;

    }

    get ammoType() {

        return this.ammo.type;

    }    

}

export { AmmoBoxItem
    
 };