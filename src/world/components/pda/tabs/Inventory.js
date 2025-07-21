import { createInventory } from "../../../systems/htmlElements";
import { ECG } from "./ECG";
import { TabPanel } from "./TabPanel";

class Inventory extends TabPanel {

    items = [];
    _availableSlots = [
        0, 1, 2, 3,
        4, 5, 6, 7,
        8, 9, 10, 11, 
        12, 13, 14, 15
    ];

    constructor(specs) {

        super(specs);

        this._html = createInventory();
        this.ecg = new ECG();

    }

    async init() {

        await this.ecg.init();
        this._html.inventoryContainer.appendChild(this.ecg.container);

    }

    firstAvailableSlot(itemSize = 1) {

        let idx, slotIdx;
        if (this._availableSlots.length >= itemSize) {

            const sorted = this._availableSlots.sort((a, b) => a - b);
            for (let i = 0, il = sorted.length; i < il; i++) {

                const first = sorted[i];                

                if (itemSize === 1) {

                    idx = first;
                    slotIdx = this._availableSlots.findIndex(s => s === idx);
                    break;

                }

                if (sorted.length >= 2) {

                    const second = sorted[i + 1];

                    if (itemSize === 2 && second === first + 1 && (
                        first !== 3 && first !== 7 && first !== 11 && first !== 15
                    )) {

                        idx = first;
                        slotIdx = this._availableSlots.findIndex(s => s === idx);
                        break;

                    }

                }

            }
            
        }

        return { idx, slotIdx };

    }

    add(item) {

        this.items.push(item);
        item.isPicked = true;
        item.belongTo = this._attachTo._owner.name;

        const { idx, slotIdx } = this.firstAvailableSlot(item.itemSize);
        if (idx >= 0) {

            item.removeHtmlClass('idx');
            item.addHtmlClass(`idx-${idx}`);
            item.occupiedSlotIdx = idx;

            this._html.itemsDivList.push(item.itemHtml);
            this._html.itemsPanel.appendChild(item.itemHtml);

            this._availableSlots.splice(slotIdx, 1);
            this._html.slotsDivList[idx].classList.add('occupied');
            if (item.itemSize === 2) {

                this._availableSlots.splice(slotIdx, 1);
                this._html.slotsDivList[idx + 1].classList.add('occupied');

            }

        }

    }

    remove(item) {

        const idx = this.items.findIndex(i => i === item);

        if (idx > - 1) {

            this.items.splice(idx, 1);
            item.isPicked = false;
            item.belongTo = undefined;

            if (item.isWeaponItem) item.isArmed = false;

            this._availableSlots.push(item.occupiedSlotIdx);
            this._html.slotsDivList[item.occupiedSlotIdx].classList.remove('occupied');
            if (item.itemSize === 2) {

                this._availableSlots.push(item.occupiedSlotIdx + 1);
                this._html.slotsDivList[item.occupiedSlotIdx + 1].classList.remove('occupied');

            }
            item.occupiedSlotIdx = -1;
            item.removeHtmlClass('idx');

            const itemDivIdx = this._html.itemsDivList.findIndex(div => div === item.itemHtml);
            this._html.itemsDivList.splice(itemDivIdx, 1);
            this._html.itemsPanel.removeChild(item.itemHtml);

        }

    }

    findItems(predication) {

        return this.items.filter(predication);

    }

    equipFirearm(weapon) {

        for (let i = 0, il = this.items.length; i < il; i++) {

            const item = this.items[i];
            if (item.isWeaponItem && !item.ammo.isMeleeWeapon) {

                if (!weapon) {

                    item.equipInfo.classList.add('hide');
                    continue;

                }

                if (weapon.weaponType !== item.weaponType) {

                    item.equipInfo.classList.add('hide');

                } else {

                    item.equipInfo.classList.remove('hide');

                }

            }

        }

    }

    equipMelee(weapon) {

        for (let i = 0, il = this.items.length; i < il; i++) {

            const item = this.items[i];
            if (item.isWeaponItem && item.ammo.isMeleeWeapon) {

                if (!weapon) {

                    item.equipInfo.classList.add('hide');
                    continue;

                }

                if (weapon.weaponType !== item.weaponType) {

                    item.equipInfo.classList.add('hide');

                } else {

                    item.equipInfo.classList.remove('hide');

                }

            }

        }

    }

}

export { Inventory };