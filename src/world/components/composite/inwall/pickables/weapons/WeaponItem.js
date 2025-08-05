import { createInventoryItem } from "../../../../../systems/htmlElements";
import { ELEMENT_CLASS } from "../../../../../systems/ui/uiConstants";
import { addElementClass, removeElementClass } from "../../../../utils/htmlHelper";
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

    }

    get count() {

        return this.ammo.count;

    }

    set count(val) {

        this.ammo.count = val;

    }

    get ammoType() {

        return this.ammo.type;

    }

    createItemHtml() {

        const { itemDiv, countInfo, equipInfo } = createInventoryItem({ imgUrl: this._imgUrl, itemSize: this.itemSize, isWeaponItem: true });
        this.itemHtml = itemDiv;
        this.equipInfo = equipInfo;
        this.countInfo = countInfo;

        if (this.ammo.isMeleeWeapon) {

            addElementClass(this.countInfo, ELEMENT_CLASS.HIDE);

        }

    }

    updateCountInfo(weapon) {
        
        this.countInfo.innerText = this.count;

        if (weapon) {

            removeElementClass(this.countInfo, ELEMENT_CLASS.FULL, ELEMENT_CLASS.EMPTY);
            if (this.count >= weapon.magzineCapacity) {

                addElementClass(this.countInfo, ELEMENT_CLASS.FULL);

            } else if (this.count === 0) {

                addElementClass(this.countInfo, ELEMENT_CLASS.EMPTY);

            }

        }

    }

    checkCombinable(target) {

        let combinable = false;

        if (target.isAmmoBoxItem && target.ammoType === this.ammoType) {

            combinable = true;

        }

        return combinable;

    }

}

export { WeaponItem };