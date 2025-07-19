import { createInventoryItem } from "../../../../../systems/htmlElements";
import { PickableItem } from "../PickableItem";

class WeaponItem extends PickableItem {

    isWeaponItem = true;

    weaponType;
    ammo;
    isArmed = false;
    
    // html
    equipInfo;

    constructor(specs) {
        
        super(specs);

        const { weaponType, ammoInstance, isArmed = false } = specs;
        this.weaponType = weaponType;
        this.ammo = ammoInstance;
        this.isArmed = isArmed;

        this.count = this.ammo.count;

        // html
        this.createItemHtml();

    }

    get count() {

        return this.ammo.count;

    }

    set count(val) {

        this.ammo.count = val;

    }

    createItemHtml() {

        const { itemDiv, countInfo, equipInfo } = createInventoryItem({ imgUrl: this.specs.imgUrl, itemSize: this.itemSize });
        this.itemHtml = itemDiv;
        this.equipInfo = equipInfo;
        this.countInfo = countInfo;

        if (this.ammo.isMeleeWeapon) {

            this.countInfo.classList.add('hide');

        }

    }

    updateCountInfo(weapon) {
        
        this.countInfo.innerText = this.count;

        if (weapon) {

            this.countInfo.classList.remove('full', 'empty');
            if (this.count >= weapon.magzineCapacity) {

                this.countInfo.classList.add('full');

            } else if (this.count === 0) {

                this.countInfo.classList.add('empty');

            }

        }

    }

}

export { WeaponItem };