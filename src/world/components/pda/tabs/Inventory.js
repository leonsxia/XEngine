import { createInventory } from "../../../systems/htmlElements";
import { PDA_OPERATE_MENU_LIST } from "../../../systems/ui/uiConstants";
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
    _operateMenuReady = false;
    _currentOperateMenuItems = [];
    _currentOperateIdx = 0;
    _currentItem;

    constructor(specs) {

        super(specs);

        this._html = createInventory();
        this.ecg = new ECG();

    }

    async init() {

        await this.ecg.init();
        this._html.inventoryContainer.appendChild(this.ecg.container);

    }

    get isFull() {

        return this._availableSlots.length === 0;

    }

    get availableSlotsCount() {

        return this._availableSlots.length;

    }

    get operateMenuReady() {

        return this._operateMenuReady;

    }

    set operateMenuReady(val) {

        if (this._operateMenuReady !== val) {
            
            if (val && this.acquireItemOperateMenu()) {

                this._operateMenuReady = true;
                removeElementClass(this._html.operateMenuList, 'hidden');
                addElementClass(this._html.operateMenuList, 'visible');
                this._attachTo._hints.applyHintInventoryOperateMenu();

            } else {

                this._operateMenuReady = false;
                removeElementClass(this._html.operateMenuList, 'visible');
                addElementClass(this._html.operateMenuList, 'hidden');
                this._attachTo._hints.applyHintInventoryBase();

            }

        }        

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
                this._attachTo._hints.applyHintInventoryItemShift();

            }

        } else {

            this._shiftReady = false;
            
            if (this._currentIdx !== this._shiftIdx) {

                this.swapItems(this._currentIdx, this._shiftIdx);               

            }

            this.focusedIndex = this._shiftIdx;
            addElementClass(this._html.shiftSlot, 'hide');
            this._attachTo._hints.applyHintInventoryBase();

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

    get currentOperateIndex() {

        return this._currentOperateIdx;

    }

    set currentOperateIndex(val) {

        const menuLength = this._currentOperateMenuItems.length
        this._currentOperateIdx = val > 0 ? val % menuLength : (menuLength + val) % menuLength;

        for (let i = 0; i < menuLength; i++) {

            const li = this._currentOperateMenuItems[i];
            if (i === this._currentOperateIdx) {

                addElementClass(li, 'selected');

            } else {

                removeElementClass(li, 'selected');

            }

        }

    }

    acquireItemOperateMenu() {

        let acquired = false;
        const item = this.getMatchedItem(this._currentIdx);
        this._currentItem = item;
        if (item) {

            if (item.isWeaponItem) {
                
                removeElementClass(this._html.operateMenuItems.equipMenuItem, 'hide');
                addElementClass(this._html.operateMenuItems.useMenuItem, 'hide');
                addElementClass(this._html.operateMenuItems.combineMenuItem, 'hide');
                addElementClass(this._html.operateMenuItems.discardMenuItem, 'hide');

                if (item.isArmed) {

                    this._html.operateMenuItems.equipMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.DISARM;
                    addElementClass(this._html.operateMenuItems.equipMenuItem.querySelector('span'), 'disarm');

                } else {

                    this._html.operateMenuItems.equipMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.EQUIP;
                    removeElementClass(this._html.operateMenuItems.equipMenuItem.querySelector('span'), 'disarm');
                    
                }

                this._currentOperateMenuItems.length = 0;
                this._currentOperateMenuItems.push(
                    this._html.operateMenuItems.equipMenuItem,
                    this._html.operateMenuItems.examineMenuItem
                );
                this.currentOperateIndex = 0;
                this._html.operateMenuItems.equipMenuItem.classList.add('selected');

            } else if (item.isHealingItem) {

                addElementClass(this._html.operateMenuItems.equipMenuItem, 'hide');
                removeElementClass(this._html.operateMenuItems.useMenuItem, 'hide');
                removeElementClass(this._html.operateMenuItems.combineMenuItem, 'hide');
                removeElementClass(this._html.operateMenuItems.discardMenuItem, 'hide');

                this._currentOperateMenuItems.length = 0;
                this._currentOperateMenuItems.push(
                    this._html.operateMenuItems.useMenuItem,
                    this._html.operateMenuItems.examineMenuItem,
                    this._html.operateMenuItems.combineMenuItem,
                    this._html.operateMenuItems.discardMenuItem
                );
                this.currentOperateIndex = 0;
                this._html.operateMenuItems.useMenuItem.classList.add('selected');

            } else if (item.isAmmoBoxItem) {

                addElementClass(this._html.operateMenuItems.equipMenuItem, 'hide');
                addElementClass(this._html.operateMenuItems.useMenuItem, 'hide');
                removeElementClass(this._html.operateMenuItems.combineMenuItem, 'hide');
                removeElementClass(this._html.operateMenuItems.discardMenuItem, 'hide');

                this._currentOperateMenuItems.length = 0;
                this._currentOperateMenuItems.push(
                    this._html.operateMenuItems.examineMenuItem,
                    this._html.operateMenuItems.combineMenuItem,
                    this._html.operateMenuItems.discardMenuItem
                );
                this.currentOperateIndex = 0;
                this._html.operateMenuItems.useMenuItem.classList.add('selected');

            }

            acquired = true;

        }

        return acquired;

    }

    processShiftSlot(val) {

        const element = this._html.shiftSlot;
        const prevIdx = this._shiftIdx;
        const interval = val - prevIdx;
        let tarIdx = val > 0 ? val % this._size : (this._size + val) % this._size;
        if (this._shiftSlotSize === 2 && (tarIdx % 4 === 3 || tarIdx === this._size - 1)){

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

        const element = this._html.focusedDiv;
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

    swapItems(sourceIdx, targetIdx) {

        const source = this.getMatchedItem(sourceIdx);
        let target = this.getMatchedItem(targetIdx);

        if (target === source) target = undefined;

        if (!source) return false;

        if (target) {

            if (source.itemSize === target.itemSize) {

                if (source.itemSize === 2) {

                    if (targetIdx === sourceIdx - 1) {

                        this.changeItemSlot(source, targetIdx - 1);
                        this.changeItemSlot(target, sourceIdx, false);

                    } else {

                        if (targetIdx === target.occupiedSlotIdx + 1) {

                            const targetRightItem = this.getMatchedItem(targetIdx + 1);
                            this.changeItemSlot(target, sourceIdx);
                            this.changeItemSlot(source, targetIdx, false);
                            if (targetRightItem) {

                                if (targetRightItem.itemSize === 1) {

                                    this.changeItemSlot(targetRightItem, targetIdx - 1, false);

                                } else {

                                    this.changeItemSlot(source, targetIdx - 1, false);

                                }

                            }

                        } else {

                            this.changeItemSlot(target, sourceIdx);
                            this.changeItemSlot(source, targetIdx, false);

                        } 

                    }

                } else {

                    this.changeItemSlot(target, sourceIdx);
                    this.changeItemSlot(source, targetIdx, false);

                }

            } else if (source.itemSize === 1) {

                const insert2ndSlot = targetIdx === target.occupiedSlotIdx + 1;

                if (sourceIdx % 4 === 0) {

                    if (target.occupiedSlotIdx === sourceIdx + 1) {

                        this.changeItemSlot(source, targetIdx);
                        if (!insert2ndSlot) {

                            const lastItem = this.getMatchedItem(sourceIdx + 3);
                            if (lastItem) {

                                this.changeItemSlot(lastItem, sourceIdx);

                            }
                            this.changeItemSlot(target, targetIdx + 1, false);

                        } else {

                            this.changeItemSlot(target, sourceIdx, false);

                        }

                    } else if (target.occupiedSlotIdx === sourceIdx + 2) {
                        
                        const rightItem = this.getMatchedItem(sourceIdx + 1);
                        this.changeItemSlot(target, sourceIdx);
                        this.changeItemSlot(source, targetIdx, false);
                        if (rightItem) {

                            this.changeItemSlot(rightItem, insert2ndSlot ? targetIdx - 1 : targetIdx + 1, false);

                        }

                    } else {
                        
                        const rightItem = this.getMatchedItem(sourceIdx + 1);
                        this.changeItemSlot(target, sourceIdx);
                        this.changeItemSlot(source, targetIdx, false);
                        if (rightItem) {

                            if (rightItem.itemSize === 1) {

                                this.changeItemSlot(rightItem, insert2ndSlot ? targetIdx - 1 : targetIdx + 1, false);

                            } else {

                                const lastItem = this.getMatchedItem(sourceIdx + 3);
                                this.changeItemSlot(rightItem, sourceIdx + 2, false);

                                if (lastItem) {

                                    this.changeItemSlot(lastItem, insert2ndSlot ? targetIdx - 1 : targetIdx + 1, false);

                                }

                            }

                        }

                    }

                } else if (sourceIdx % 4 === 1) {

                    if (target.occupiedSlotIdx === sourceIdx + 1) {

                        if (targetIdx === sourceIdx + 1) {

                            const leftItem = this.getMatchedItem(sourceIdx - 1);
                            this.changeItemSlot(target, sourceIdx - 1);
                            this.changeItemSlot(source, targetIdx, false);
                            if (leftItem) {

                                this.changeItemSlot(leftItem, targetIdx + 1, false);

                            }

                        } else {

                            this.changeItemSlot(source, targetIdx);
                            this.changeItemSlot(target, sourceIdx, false);

                        }                                                                     

                    } else {

                        const leftItem = this.getMatchedItem(sourceIdx - 1);
                        const rightItem = this.getMatchedItem(sourceIdx + 1);                        

                        if (targetIdx === target.occupiedSlotIdx) {

                            this.changeItemSlot(target, sourceIdx);
                            this.changeItemSlot(source, targetIdx, false);
                            if (rightItem) {

                                if (rightItem.itemSize === 1) {

                                    this.changeItemSlot(rightItem, targetIdx + 1, false);

                                } else {

                                    if (leftItem) {

                                        this.changeItemSlot(leftItem, targetIdx + 1, false);

                                    }
                                    this.changeItemSlot(target, sourceIdx - 1, false);

                                }

                            }

                        } else {

                            this.changeItemSlot(target, sourceIdx - 1);
                            this.changeItemSlot(source, targetIdx, false);
                            if (leftItem) {

                                this.changeItemSlot(leftItem, targetIdx - 1, false);

                            }

                        }

                    }

                } else if (sourceIdx % 4 === 2) {
                    
                    const leftItem = this.getMatchedItem(sourceIdx - 1);
                    const rightItem = this.getMatchedItem(sourceIdx + 1);

                    if (targetIdx + 1 === sourceIdx) {

                        this.changeItemSlot(target, sourceIdx);
                        this.changeItemSlot(source, targetIdx, false);
                        if (rightItem) {

                            this.changeItemSlot(rightItem, targetIdx - 1, false);

                        }

                    } else if (target.occupiedSlotIdx === targetIdx) {

                        this.changeItemSlot(target, sourceIdx);
                        this.changeItemSlot(source, targetIdx, false);
                        if (rightItem) {

                            this.changeItemSlot(rightItem, targetIdx + 1, false);

                        }

                    } else {

                        this.changeItemSlot(target, sourceIdx - 1);
                        this.changeItemSlot(source, targetIdx, false);
                        if (leftItem) {

                            this.changeItemSlot(leftItem, targetIdx - 1, false);

                        }

                    }

                } else if (sourceIdx % 4 === 3) {

                    if (target.occupiedSlotIdx === sourceIdx - 2) {

                        this.changeItemSlot(source, targetIdx);
                        
                        if (targetIdx === sourceIdx - 1) {

                            const firstItem = this.getMatchedItem(sourceIdx - 3);
                            this.changeItemSlot(target, sourceIdx - 3, false);    

                            if (firstItem) {

                                this.changeItemSlot(firstItem, sourceIdx, false);

                            }

                        } else {

                            this.changeItemSlot(target, sourceIdx - 1, false);

                        }

                    } else {

                        const leftItem = this.getMatchedItem(sourceIdx - 1);
                        if (leftItem) {

                            if (leftItem.itemSize === 1) {

                                this.changeItemSlot(target, sourceIdx - 1);
                                this.changeItemSlot(source, targetIdx, false);
                                this.changeItemSlot(leftItem, insert2ndSlot ? targetIdx - 1 : targetIdx + 1, false);

                            } else {

                                this.changeItemSlot(target, sourceIdx - 1);
                                this.changeItemSlot(source, targetIdx, false);
                                this.changeItemSlot(leftItem, sourceIdx - 3, false);
                                const firstItem = this.getMatchedItem(sourceIdx - 3);
                                if (firstItem) {

                                    this.changeItemSlot(firstItem, insert2ndSlot ? targetIdx - 1 : targetIdx + 1, false);

                                }

                            }

                        } else {

                            this.changeItemSlot(target, sourceIdx - 1);
                            this.changeItemSlot(source, targetIdx, false);

                        }

                    }

                }

            } else {

                if (targetIdx % 4 === 0) {

                    if (sourceIdx === targetIdx + 1) {
                        
                        this.changeItemSlot(source, targetIdx);
                        this.changeItemSlot(target, sourceIdx + 1, false);

                    } else if (sourceIdx === targetIdx + 2) {

                        const targetRightItem = this.getMatchedItem(targetIdx + 1);
                        this.changeItemSlot(source, targetIdx);
                        this.changeItemSlot(target, sourceIdx, false);
                        
                        if (targetRightItem) {

                            this.changeItemSlot(targetRightItem, sourceIdx + 1, false);

                        }

                    } else {
                                                
                        const targetRightItem = this.getMatchedItem(targetIdx + 1);
                        if (targetRightItem) {

                            if (targetRightItem.itemSize === 1) {
                                
                                this.changeItemSlot(source, targetIdx);
                                this.changeItemSlot(target, sourceIdx, false);
                                this.changeItemSlot(targetRightItem, sourceIdx + 1, false);

                            } else {

                                this.changeItemSlot(targetRightItem, sourceIdx);
                                this.changeItemSlot(source, targetIdx, false);
                                this.changeItemSlot(target, targetIdx + 2, false);

                            }

                        } else {
                            
                            this.changeItemSlot(source, targetIdx);
                            this.changeItemSlot(target, sourceIdx, false);

                        }

                    }

                } else if (targetIdx % 4 === 1) {

                    if (sourceIdx === targetIdx + 1) {

                        this.changeItemSlot(source, targetIdx);
                        this.changeItemSlot(target, sourceIdx + 1, false);

                    } else {
                        
                        const targetRightItem = this.getMatchedItem(targetIdx + 1);                        
                        if (targetRightItem) {

                            if (targetRightItem.itemSize === 1) {

                                this.changeItemSlot(source, targetIdx);
                                this.changeItemSlot(target, sourceIdx, false);
                                this.changeItemSlot(targetRightItem, sourceIdx + 1, false);

                            } else {

                                this.changeItemSlot(targetRightItem, sourceIdx);
                                this.changeItemSlot(source, targetIdx, false);
                                this.changeItemSlot(target, targetIdx + 2, false);

                            }

                        } else {                            
                            
                            this.changeItemSlot(source, targetIdx);
                            this.changeItemSlot(target, sourceIdx, false);                            

                        }

                    }

                } else if (targetIdx % 4 === 2) {

                    const targetRightItem = this.getMatchedItem(targetIdx + 1);
                    this.changeItemSlot(source, targetIdx);
                    this.changeItemSlot(target, sourceIdx, false);
                    
                    if (targetRightItem) {

                        this.changeItemSlot(targetRightItem, sourceIdx + 1, false);

                    }

                }

            }

        } else {

            if (source.itemSize === 2) {

                const targetRightItem = this.getMatchedItem(targetIdx + 1);
                if (targetRightItem && targetRightItem !== source) {

                    if (targetRightItem.itemSize === 1) {

                        this.changeItemSlot(source, targetIdx);
                        this.changeItemSlot(targetRightItem, sourceIdx + 1 === targetIdx ? sourceIdx : sourceIdx + 1, false);

                    } else {

                        this.changeItemSlot(targetRightItem, sourceIdx);

                        if (sourceIdx + 1 === targetIdx) {

                            this.changeItemSlot(source, targetIdx + 1, false);

                        } else {

                            this.changeItemSlot(source, targetIdx, false);

                        }

                    }

                } else {

                    this.changeItemSlot(source, targetIdx);

                }

            } else {

                this.changeItemSlot(source, targetIdx);

            }

        }

    }

    changeItemSlot(item, targetIdx, clearSlot = true) {

        if (clearSlot) {

            this.setSlotOccupied(item.occupiedSlotIdx, false, item.itemSize);

        }

        item.occupiedSlotIdx = targetIdx;
        item.removeHtmlClass('idx');
        item.addHtmlClass(`idx-${targetIdx}`);
        this.setSlotOccupied(targetIdx, true, item.itemSize);

    }

    setSlotOccupied(idx, occupied, itemSize = 1) {
        
        if (occupied) {

            this._availableSlots = this._availableSlots.filter(s => s !== idx);
            this._html.slotsDivList[idx].classList.add('occupied');
            if (itemSize === 2) {

                const nextIdx = idx + 1;
                this._availableSlots = this._availableSlots.filter(s => s !== nextIdx);
                this._html.slotsDivList[nextIdx].classList.add('occupied');

            }

        } else {

            if (!this._availableSlots.includes(idx)) {

                this._availableSlots.push(idx);

            }

            this._html.slotsDivList[idx].classList.remove('occupied');

            if (itemSize === 2) {

                const nextIdx = idx + 1;

                if (!this._availableSlots.includes(nextIdx)) {

                    this._availableSlots.push(nextIdx);

                }

                this._html.slotsDivList[nextIdx].classList.remove('occupied');

            }

        }

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

    operateMenuUp() {

        this.currentOperateIndex --;

    }

    operateMenuDown() {

        this.currentOperateIndex ++;

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

                    if (itemSize === 2 && second === first + 1 && first % 4 !== 3 && first !== this._size - 1) {

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
        
        const { idx } = this.firstAvailableSlot(item.itemSize);
        if (idx >= 0) {

            this.items.push(item);
            item.isPicked = true;
            item.belongTo = this._attachTo._owner.name;

            item.removeHtmlClass('idx');
            item.addHtmlClass(`idx-${idx}`);
            item.occupiedSlotIdx = idx;

            this._html.itemsDivList.push(item.itemHtml);
            this._html.itemsPanel.appendChild(item.itemHtml);

            this.setSlotOccupied(idx, true, item.itemSize);

            return true;

        } else {

            return false;

        }

    }

    remove(item) {

        const idx = this.items.findIndex(i => i === item);

        if (idx > - 1) {

            this.items.splice(idx, 1);
            item.isPicked = false;
            item.belongTo = undefined;

            if (item.isWeaponItem) item.isArmed = false;

            this.setSlotOccupied(item.occupiedSlotIdx, false, item.itemSize);
            item.occupiedSlotIdx = -1;
            item.removeHtmlClass('idx');

            const itemDivIdx = this._html.itemsDivList.findIndex(div => div === item.itemHtml);
            this._html.itemsDivList.splice(itemDivIdx, 1);
            this._html.itemsPanel.removeChild(item.itemHtml);

            return true;

        } else {

            return false;

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