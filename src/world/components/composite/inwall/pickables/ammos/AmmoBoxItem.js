import { createInventoryItem } from "../../../../../systems/htmlElements";
import { PickableItem } from "../PickableItem";

class AmmoBoxItem extends PickableItem {

    isAmmoBoxItem = true;
    isFastCombinableItem = true;

    itemType;
    ammo;
    capacity;

    constructor(specs) {

        super(specs);

        const { ammoBoxType, ammoInstance, capacity } = specs;
        this.itemType = ammoBoxType;
        this.ammo = ammoInstance;
        this.capacity = capacity;

        if (this.count > this.capacity) {

            this.count = this.capacity;

        }

        this.ammo.onCountChanged.push(() => {

            this.updateCountInfo();

        });

    }

    get count() {

        return this.ammo.count;

    }

    set count(val) {

        this.ammo.count = val > this.capacity ? this.capacity : Math.max(val, 0);
        this._available = this.count > 0 ? true : false;

    }

    get ammoType() {

        return this.ammo.type;

    }

    get isFull() {

        return this.count === this.capacity;

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