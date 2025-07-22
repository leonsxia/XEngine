import { createInventoryItem } from "../../../../../systems/htmlElements";
import { PickableItem } from "../PickableItem";

class AmmoBoxItem extends PickableItem {

    isAmmoBoxItem = true;

    ammoBoxType;
    ammo;
    capacity;

    constructor(specs) {

        super(specs);

        const { ammoBoxType, ammoInstance, capacity } = specs;
        this.ammoBoxType = ammoBoxType;
        this.ammo = ammoInstance;
        this.capacity = capacity;

         if (this.count > this.capacity) { 

            this.count = this.capacity;

        }

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

    createItemHtml() {

        const { itemDiv, countInfo } = createInventoryItem({ imgUrl: this._imgUrl, itemSize: this.itemSize });
        this.itemHtml = itemDiv;
        this.countInfo = countInfo;

        this.updateCountInfo();

    }

    updateCountInfo() {

        this.countInfo.innerText = this.count;

        if (this.count === this.capacity) {

            this.countInfo.classList.add('full');

        } else {

            this.countInfo.classList.remove('full');

        }

    }

}

export { AmmoBoxItem
    
 };