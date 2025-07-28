import { createInventory } from "../../../systems/htmlElements";
import { addElementClass, removeElementClass } from "../../utils/htmlHelper";
import { ECG } from "./ECG";
import { TabPanel } from "./TabPanel";

class Inventory extends TabPanel {

    items = [];
    _availableSlots = [
        0, 1, 2, 3,
        4, 5, 6, 7,
        8, 9, 10, 11, 
        12, 13, 14, 15,
        16, 17, 18, 19
    ];
    _currentIdx = 0;
    _size = 20;
    _shiftReady = false;
    _shiftIdx = 0;
    _shiftSlotSize = 1;

    constructor(specs) {

        super(specs);

        this._html = createInventory();
        this.ecg = new ECG();

    }

    async init() {

        await this.ecg.init();
        this._html.inventoryContainer.appendChild(this.ecg.container);

    }

    get shiftReady() {

        return this._shiftReady;

    }

    set shiftReady(val) {

        if (val) {

            const matched = this.getMatchedItem(this._currentIdx);
            if (matched) {
                
                this._shiftReady = true;
                removeElementClass(this._html.shiftSlot, 'hide');
                removeElementClass(this._html.shiftSlot, 'item-size-');

                if (matched.itemSize === 2) {

                    addElementClass(this._html.shiftSlot, 'item-size-2');
                    this._shiftSlotSize = 2;

                } else {

                    addElementClass(this._html.shiftSlot, 'item-size-1');
                    this._shiftSlotSize = 1;

                }

                this._shiftIdx = this._currentIdx;
                removeElementClass(this._html.shiftSlot, 'idx');
                addElementClass(this._html.shiftSlot, `idx-${this._currentIdx}`);

            }

        } else {

            this._shiftReady = false;
            const matched = this.getMatchedItem(this._shiftIdx);
            if (matched) {

                // todo

            }

            addElementClass(this._html.shiftSlot, 'hide');

        }

    }

    get focusedIndex() {
        
        return this._currentIdx;

    }

    set focusedIndex(val) {

        this.processFocusedSlot(val);

    }

    get shiftIndex() {

        return this._shiftIdx;

    }

    set shiftIndex(val) {

        this.processShiftSlot(val);

    }

    processShiftSlot(val) {

        const element = this._html.shiftSlot;
        const prevIdx = this._shiftIdx;
        const interval = val - prevIdx;
        let tarIdx = val > 0 ? val % this._size : (this._size + val) % this._size;
        if (this._shiftSlotSize === 2 && tarIdx % 4 === 3){

            if (interval > 0) {

                tarIdx = ++tarIdx % this._size;

            } else {

                tarIdx = --tarIdx;

            }

        }

        removeElementClass(element, 'idx');
        addElementClass(element, `idx-${tarIdx}`);

        this._shiftIdx = tarIdx;

    }

    processFocusedSlot(val) {

        const element = this._html.focusedSlot;
        const prevIdx = this._currentIdx;
        const interval = val - prevIdx;
        let tarIdx = val > 0 ? val % this._size : (this._size + val) % this._size;

        const matched = this.getMatchedItem(tarIdx);

        if (matched && matched.itemSize === 2) {

            removeElementClass(element, 'item-size-');
            if (tarIdx === matched.occupiedSlotIdx + 1) {

                if (Math.abs(interval) > 1 || interval === -1) {

                    tarIdx = matched.occupiedSlotIdx;
                    addElementClass(element, 'item-size-2');

                } else if (interval === 1) {

                    tarIdx += 1;
                    const next = this.getMatchedItem(tarIdx);
                    if (next && next.itemSize === 2) {

                        addElementClass(element, 'item-size-2');

                    } else {

                        addElementClass(element, 'item-size-1');

                    }

                }

            } else {

                addElementClass(element, 'item-size-2');

            }

        } else {

            removeElementClass(element, 'item-size-');
            addElementClass(element, 'item-size-1');

        }
        
        removeElementClass(element, 'idx');
        addElementClass(element, `idx-${tarIdx}`);

        this._currentIdx = tarIdx;

    }

    getMatchedItem(idx) {

        let matched;
        for (let i = 0, il = this.items.length; i < il; i++) {

            const item = this.items[i];
            if (item.occupiedSlotIdx === idx || (item.itemSize === 2 && item.occupiedSlotIdx + 1 === idx)) {

                matched = item;
                break;

            }

        }

        return matched;

    }

    resetShift() {

        removeElementClass(this._html.shiftSlot, 'idx');
        addElementClass(this._html.shiftSlot, 'hide');
        this._shiftReady = false;

    }

    focusLeft() {

        this.focusedIndex --;

    }

    focusRight() {

        this.focusedIndex ++;

    }

    focusUp() {

        this.focusedIndex -= 4;

    }

    focusDown() {

        this.focusedIndex += 4;

    }

    shiftLeft() {

        this.shiftIndex --;

    }

    shiftRight() {

        this.shiftIndex ++;

    }

    shiftUp() {

        this.shiftIndex -= 4;

    }

    shiftDown() {

        this.shiftIndex += 4;

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
                        first !== 3 && first !== 7 && first !== 11 && first !== 15 && first !== 19
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