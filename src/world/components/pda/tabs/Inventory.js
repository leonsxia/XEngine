import { createInventory } from "../../../systems/htmlElements";
import { Logger } from "../../../systems/Logger";
import { ELEMENT_CLASS, PDA_OPERATE_MENU_LIST } from "../../../systems/ui/uiConstants";
import { addElementClass, removeElementClass } from "../../utils/htmlHelper";
import { ECG } from "./ECG";
import { TabPanel } from "./TabPanel";

const DEBUG = true;

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
    _selectedTargetIdx = 0;
    _size = 20;
    // for operate item menu
    _operateMenuReady = false;
    _currentOperateMenuItems = [];
    _currentOperateIdx = 0;
    _currentItem;
    // for shift and fast combine items
    _shiftReady = false;
    _shiftIdx = 0;
    _shiftSlotSize = 1;
    _shiftMenuReady = false;
    _shiftMenuItems = [];
    _shiftMenuIdx = 0;
    // for combine items
    _selectReady = false;
    _selectIdx = 0;
    _combinableIdxes = [];

    _source;
    _target;

    #logger = new Logger(DEBUG, 'Inventory');

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
                removeElementClass(this._html.operateMenuList, ELEMENT_CLASS.HIDDEN);
                addElementClass(this._html.operateMenuList, ELEMENT_CLASS.VISIBLE);
                this._attachTo._hints.applyHintInventoryOperateMenu();

            } else {

                this._operateMenuReady = false;
                removeElementClass(this._html.operateMenuList, ELEMENT_CLASS.VISIBLE);
                addElementClass(this._html.operateMenuList, ELEMENT_CLASS.HIDDEN);
                this._attachTo._hints.applyHintInventoryBase();

            }

        }

    }

    get shiftMenuReady() {

        return this._shiftMenuReady;

    }

    set shiftMenuReady(val) {

        if (this._shiftMenuReady !== val) {

            if (val && this.acquireShiftItemMenu()) {

                this._shiftMenuReady = true;
                removeElementClass(this._html.shiftMenuList, ELEMENT_CLASS.HIDDEN);
                addElementClass(this._html.shiftMenuList, ELEMENT_CLASS.VISIBLE);
                this._attachTo._hints.applyHintInventoryOperateMenu();

            } else {

                this._shiftMenuReady = false;
                removeElementClass(this._html.shiftMenuList, ELEMENT_CLASS.VISIBLE);
                addElementClass(this._html.shiftMenuList, ELEMENT_CLASS.HIDDEN);
                this._attachTo._hints.applyHintInventoryItemShift();

            }

        }

    }

    get shiftReady() {

        return this._shiftReady;

    }

    set shiftReady(val) {

        if (val) {

            const matched = this.getMatchedItem(this._currentIdx);
            const element = this._html.shiftDiv;
            if (matched) {
                
                this._shiftReady = true;
                removeElementClass(element, ELEMENT_CLASS.HIDE);
                removeElementClass(element, ELEMENT_CLASS.ITEM_SIZE_PREFIX);

                if (matched.itemSize === 2) {

                    addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_2);
                    this._shiftSlotSize = 2;

                } else {

                    addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_1);
                    this._shiftSlotSize = 1;

                }

                this._shiftIdx = this._currentIdx;
                removeElementClass(element, ELEMENT_CLASS.IDX);
                addElementClass(element, `${ELEMENT_CLASS.IDX}${this._currentIdx}`);
                this._attachTo._hints.applyHintInventoryItemShift();

            }

        } else {

            if (this._currentIdx !== this._shiftIdx) {

                this._source = this.getMatchedItem(this._currentIdx);
                this._target = this.getMatchedItem(this._shiftIdx);
                this._selectedTargetIdx = this._shiftIdx;

                if (this.checkCombinable(this._source, this._target)) {

                    this.shiftMenuReady = true;

                } else {

                    this.resetShiftState();
                    this.swapItems(this._currentIdx, this._shiftIdx);
                    this.focusedIndex = this._shiftIdx;

                }

            } else {

                this.resetShiftState();

            }

        }

    }

    get selectReady() {

        return this._selectReady;

    }

    set selectReady(val) {

        if (val === this._selectReady) return;

        if (val) {

            const matched = this.getMatchedItem(this._currentIdx);
            const element = this._html.selectDiv;
            if (matched) {

                this._selectReady = true;
                removeElementClass(element, ELEMENT_CLASS.HIDE);
                removeElementClass(element, ELEMENT_CLASS.ITEM_SIZE_PREFIX);

                if (matched.itemSize === 2) {

                    addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_2);

                } else {

                    addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_1);

                }

                this._selectIdx = this._currentIdx;
                removeElementClass(element, ELEMENT_CLASS.IDX);
                addElementClass(element, `${ELEMENT_CLASS.IDX}${this._currentIdx}`);
                this._attachTo._hints.applyHintInventoryItemSelect();

            }

        } else {

            this._selectReady = false;
            addElementClass(this._html.selectDiv, ELEMENT_CLASS.HIDE);
            this.resetSlots();
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

    get selectIndex() {

        return this._selectIdx;

    }

    set selectIndex(val) {

        this.processSelectSlot(val);

    }

    get currentOperateIndex() {

        return this._currentOperateIdx;

    }

    set currentOperateIndex(val) {

        const menuLength = this._currentOperateMenuItems.length;
        this._currentOperateIdx = val > 0 ? val % menuLength : (menuLength + val) % menuLength;

        for (let i = 0; i < menuLength; i++) {

            const li = this._currentOperateMenuItems[i];
            if (i === this._currentOperateIdx) {

                addElementClass(li, ELEMENT_CLASS.SELECTED);

            } else {

                removeElementClass(li, ELEMENT_CLASS.SELECTED);

            }

        }

    }

    get shiftMenuIndex() {

        return this._shiftMenuIdx;

    }

    set shiftMenuIndex(val) {

        const menuLength = this._shiftMenuItems.length;
        this._shiftMenuIdx = val > 0 ? val % menuLength : (menuLength + val) % menuLength;

        for (let i = 0; i < menuLength; i++) {

            const li = this._shiftMenuItems[i];
            if (i === this._shiftMenuIdx) {

                addElementClass(li, ELEMENT_CLASS.SELECTED);

            } else {

                removeElementClass(li, ELEMENT_CLASS.SELECTED);

            }

        }

    }

    resetShiftState() {

        this._shiftReady = false;
        addElementClass(this._html.shiftDiv, ELEMENT_CLASS.HIDE);
        this._attachTo._hints.applyHintInventoryBase();
        
    }

    resetShift() {

        this.shiftMenuReady = false;
        this.resetShiftState();

    }

    acquireItemOperateMenu() {

        let acquired = false;
        const item = this.getMatchedItem(this._currentIdx);
        this._currentItem = item;
        if (item) {

            if (item.isWeaponItem) {
                
                removeElementClass(this._html.operateMenuItems.equipMenuItem, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.operateMenuItems.useMenuItem, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.operateMenuItems.combineMenuItem, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.operateMenuItems.discardMenuItem, ELEMENT_CLASS.HIDE);

                if (item.isArmed) {

                    this._html.operateMenuItems.equipMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.UNEQUIP;
                    addElementClass(this._html.operateMenuItems.equipMenuItem.querySelector('span'), ELEMENT_CLASS.UNEQUIP);

                } else {

                    this._html.operateMenuItems.equipMenuItem.innerHTML = PDA_OPERATE_MENU_LIST.EQUIP;
                    removeElementClass(this._html.operateMenuItems.equipMenuItem.querySelector('span'), ELEMENT_CLASS.UNEQUIP);
                    
                }

                this._currentOperateMenuItems.length = 0;
                this._currentOperateMenuItems.push(
                    this._html.operateMenuItems.equipMenuItem,
                    this._html.operateMenuItems.examineMenuItem
                );
                this.currentOperateIndex = 0;

            } else if (item.isHealingItem) {

                addElementClass(this._html.operateMenuItems.equipMenuItem, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.operateMenuItems.useMenuItem, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.operateMenuItems.combineMenuItem, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.operateMenuItems.discardMenuItem, ELEMENT_CLASS.HIDE);

                this._currentOperateMenuItems.length = 0;
                this._currentOperateMenuItems.push(
                    this._html.operateMenuItems.useMenuItem,
                    this._html.operateMenuItems.examineMenuItem,
                    this._html.operateMenuItems.combineMenuItem,
                    this._html.operateMenuItems.discardMenuItem
                );
                this.currentOperateIndex = 0;

            } else if (item.isAmmoBoxItem) {

                addElementClass(this._html.operateMenuItems.equipMenuItem, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.operateMenuItems.useMenuItem, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.operateMenuItems.combineMenuItem, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.operateMenuItems.discardMenuItem, ELEMENT_CLASS.HIDE);

                this._currentOperateMenuItems.length = 0;
                this._currentOperateMenuItems.push(
                    this._html.operateMenuItems.examineMenuItem,
                    this._html.operateMenuItems.combineMenuItem,
                    this._html.operateMenuItems.discardMenuItem
                );
                this.currentOperateIndex = 0;

            }

            acquired = true;

        }

        return acquired;

    }

    acquireShiftItemMenu() {

        let acquired = false;
        const item = this.getMatchedItem(this._shiftIdx);
        if (item) {

            this._shiftMenuItems.length = 0;
            this._shiftMenuItems.push(
                this._html.shiftMenuItems.shiftCombineMenuItem,
                this._html.shiftMenuItems.shiftSwapMenuItem
            );
            this.shiftMenuIndex = 0;

            acquired = true;

        }

        return acquired;

    }

    checkSlotCombinable() {

        const slots = this._html.slotsDivList;
        const source = this.getMatchedItem(this._currentIdx);
        for (let i = 0, il = slots.length; i < il; i++) {

            const slot = slots[i];
            const item = this.getMatchedItem(i);
            if (i !== this._currentIdx && item && this.checkCombinable(source, item)) {

                this._combinableIdxes.push(i);

            } else {

                addElementClass(slot.firstChild, ELEMENT_CLASS.NOT_COMBINABLE);

            }

        }

    }

    resetSlots() {

        const slots = this._html.slotsDivList;
        for (let i = 0, il = slots.length; i < il; i++) {

            const slot = slots[i];
            removeElementClass(slot.firstChild, ELEMENT_CLASS.NOT_COMBINABLE);

        }
        this._combinableIdxes.length = 0;

    }

    processItemOperation() {

        this.#logger.func = this.processItemOperation.name;

        const pda = this._attachTo;
        const owner = pda._owner;
        if (this.shiftMenuReady) {

            switch (this._shiftMenuIdx) {

                case 0:

                    this.combineItems(this._source, this._target);
                    this.focusedIndex = this._shiftIdx;
                    break;

                case 1:

                    this.swapItems(this._currentIdx, this._shiftIdx);
                    this.focusedIndex = this._shiftIdx;
                    break;

            }

            this.resetShift();

        } else if (this.selectReady) {

            if (this._combinableIdxes.includes(this._selectIdx)) {

                const source = this.getMatchedItem(this._currentIdx);
                const target = this.getMatchedItem(this._selectIdx);
                this.combineItems(source, target);
                this.focusedIndex = this._selectIdx;
                this.selectReady = false;
                
            }

        } else if (this._currentItem.isWeaponItem) {

            const isMelee = this._currentItem.ammo.isMeleeWeapon;
            const weaponItem = this._currentItem;
            switch (this._currentOperateIdx) {

                case 0:

                    if (this._currentItem.isArmed) {

                        this.#logger.log(`process upequip weapon: ${weaponItem.name}`);
                        if (isMelee) {

                            owner.armMelee();

                        } else {

                            owner.armWeapon();

                        }

                    } else {

                        this.#logger.log(`process equip weapon: ${weaponItem.name}`);
                        const matched = this.getWeapon(weaponItem);
                        if (matched) {

                            if (isMelee) {

                                owner.armMelee(matched);

                            } else {

                                owner.armWeapon(matched);

                            }

                        }

                    }
                    break;

                case 1:
                    this.#logger.log(`process examine weapon: ${weaponItem.name}`);
                    break;

            }

            this.operateMenuReady = false;

        } else if (this._currentItem.isAmmoBoxItem) {

            this.operateMenuReady = false;
            const ammoBoxItem = this._currentItem;
            switch (this._currentOperateIdx) {

                case 0:
                    this.#logger.log(`process examine ammo box: ${ammoBoxItem.name}`);
                    break;
                case 1:

                    this.#logger.log(`process combine ammo box: ${ammoBoxItem.name}`);

                    this.selectReady = true;
                    this.checkSlotCombinable();

                    break;

                case 2:

                    this.#logger.log(`process discard ammo box: ${ammoBoxItem.name}`);

                    this.discardItem(ammoBoxItem);

                    break;

            }

        } else if (this._currentItem.isHealingItem) {

            this.operateMenuReady = false;
            const healingItem = this._currentItem;
            switch (this._currentOperateIdx) {

                case 0:

                    this.#logger.log(`process use healing item: ${healingItem.name}`);

                    this.consumeHealingItem(healingItem);

                    break;

                case 1:
                    this.#logger.log(`process examine healing item: ${healingItem.name}`);
                    break;
                case 2:

                    this.#logger.log(`process combine healing item: ${healingItem.name}`);

                    this.selectReady = true;
                    this.checkSlotCombinable();

                    break;

                case 3:

                    this.#logger.log(`process discard ammo box: ${healingItem.name}`);

                    this.discardItem(healingItem);

                    break;

            }

        }

    }

    processShiftSlot(val) {

        const element = this._html.shiftDiv;
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

        removeElementClass(element, ELEMENT_CLASS.IDX);
        addElementClass(element, `${ELEMENT_CLASS.IDX}${tarIdx}`);

        this._shiftIdx = tarIdx;

    }

    processSelectSlot(val) {

        const element = this._html.selectDiv;
        const lastSelectedItem = this.getMatchedItem(this._selectIdx);
        let tarIdx = val > 0 ? val % this._size : (this._size + val) % this._size;
        tarIdx = lastSelectedItem && lastSelectedItem.itemSize === 2 && lastSelectedItem.occupiedSlotIdx + 1 === tarIdx ? ++tarIdx : tarIdx;
        const selectedItem = this.getMatchedItem(tarIdx);

        if (selectedItem && selectedItem.itemSize === 2) {

            tarIdx = selectedItem.occupiedSlotIdx + 1 === tarIdx ? --tarIdx : tarIdx;
            removeElementClass(element, ELEMENT_CLASS.ITEM_SIZE_PREFIX);
            addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_2);

        } else {

            removeElementClass(element, ELEMENT_CLASS.ITEM_SIZE_PREFIX);
            addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_1);

        }

        removeElementClass(element, ELEMENT_CLASS.IDX);
        addElementClass(element, `${ELEMENT_CLASS.IDX}${tarIdx}`);

        this._selectIdx = tarIdx;

    }

    processFocusedSlot(val) {

        const element = this._html.focusedDiv;
        const prevIdx = this._currentIdx;
        const interval = val - prevIdx;
        let tarIdx = val > 0 ? val % this._size : (this._size + val) % this._size;

        const matched = this.getMatchedItem(tarIdx);

        if (matched && matched.itemSize === 2) {

            removeElementClass(element, ELEMENT_CLASS.ITEM_SIZE_PREFIX);
            if (tarIdx === matched.occupiedSlotIdx + 1) {

                if (Math.abs(interval) > 1 || interval === -1) {

                    tarIdx = matched.occupiedSlotIdx;
                    addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_2);

                } else if (interval === 1) {

                    tarIdx += 1;
                    const next = this.getMatchedItem(tarIdx);
                    if (next && next.itemSize === 2) {

                        addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_2);

                    } else {

                        addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_1);

                    }

                }

            } else {

                addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_2);

            }

        } else {

            removeElementClass(element, ELEMENT_CLASS.ITEM_SIZE_PREFIX);
            addElementClass(element, ELEMENT_CLASS.ITEM_SIZE_1);

        }
        
        removeElementClass(element, ELEMENT_CLASS.IDX);
        addElementClass(element, `${ELEMENT_CLASS.IDX}${tarIdx}`);

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

    getWeapon(item) {

        const pda = this._attachTo;
        const owner = pda._owner;
        const findIdx = owner.weapons.findIndex(w => w.weaponType === item.weaponType);
        let matched;
        if (findIdx > -1) {

            matched = this._attachTo._owner.weapons[findIdx];

        }

        return matched;

    }

    checkCombinable(source, target) {

        let combinable = false;

        if (
            source && target && target !== source &&
            (this.selectReady || target.occupiedSlotIdx === this._selectedTargetIdx || source.itemSize === 1) &&
            source.isFastCombinableItem && (
                source.itemType === target.itemType ||
                (source.category ? source.category === target.category : false) ||
                (source.isAmmoBoxItem && target.isWeaponItem)
            )
        ) {

            if (target.isAmmoBoxItem && !target.isFull) {

                combinable = true;

            } else if (target.isHealingItem) {

                combinable = target.checkCombinable(source);

            } else if (target.isWeaponItem) {

                combinable = target.checkCombinable(source);
                if (combinable) {

                    const matched = this.getWeapon(target);
                    if (matched) {

                        combinable = !matched.magzineFull;

                    }

                }

            }

        }

        return combinable;

    }

    combineItems(source, target) {

        const pda = this._attachTo;
        if (source.isAmmoBoxItem) {

            let originCount;            
            if (target.isWeaponItem) {

                const matched = this.getWeapon(target);
                if (matched) {

                    originCount = matched.ammoCount;
                    matched.fillMagzine(matched.ammoCount + source.count);
                    source.count = source.count - (matched.ammoCount - originCount);

                }

            } else {

                originCount = target.count;
                target.count += source.count;
                source.count = source.count - (target.count - originCount);

            }

            if (source.count === 0) {

                pda.removeInventoryItem(source);

            }

        } else if (source.isHealingItem) {

            const combined = target.combine(source);
            if (combined) {

                this.emptyItem(source);

            }

        }

    }

    swapItems(sourceIdx, targetIdx) {

        const source = this._source;
        let target = this._target;

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
        item.removeHtmlClass(ELEMENT_CLASS.IDX);
        item.addHtmlClass(`${ELEMENT_CLASS.IDX}${targetIdx}`);
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

    selectLeft() {

        this.selectIndex --;

    }

    selectRight() {

        this.selectIndex ++;

    }

    selectUp() {

        this.selectIndex -= 4;

    }

    selectDown() {

        this.selectIndex += 4;

    }

    operateMenuUp() {

        this.currentOperateIndex --;

    }

    operateMenuDown() {

        this.currentOperateIndex ++;

    }

    shiftMenuUp() {

        this.shiftMenuIndex --;

    }

    shiftMenuDown() {

        this.shiftMenuIndex ++;

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

            item.removeHtmlClass(ELEMENT_CLASS.IDX);
            item.addHtmlClass(`${ELEMENT_CLASS.IDX}${idx}`);
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
            item.removeHtmlClass(ELEMENT_CLASS.IDX);

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

                    item.equipInfo.classList.add(ELEMENT_CLASS.HIDE);
                    item.isArmed = false;
                    continue;

                }

                if (weapon.weaponType !== item.weaponType) {

                    item.equipInfo.classList.add(ELEMENT_CLASS.HIDE);
                    item.isArmed = false;

                } else {

                    item.equipInfo.classList.remove(ELEMENT_CLASS.HIDE);
                    item.isArmed = true;

                }

            }

        }

    }

    equipMelee(weapon) {

        for (let i = 0, il = this.items.length; i < il; i++) {

            const item = this.items[i];
            if (item.isWeaponItem && item.ammo.isMeleeWeapon) {

                if (!weapon) {

                    item.equipInfo.classList.add(ELEMENT_CLASS.HIDE);
                    item.isArmed = false;
                    continue;

                }

                if (weapon.weaponType !== item.weaponType) {

                    item.equipInfo.classList.add(ELEMENT_CLASS.HIDE);
                    item.isArmed = false;

                } else {

                    item.equipInfo.classList.remove(ELEMENT_CLASS.HIDE);
                    item.isArmed = true;

                }

            }

        }

    }

    consumeHealingItem(healingItem) {

        this.#logger.func = this.consumeHealingItem.name;

        const pda = this._attachTo;
        const owner = pda._owner;
        if (!owner.health.isFull) {

            this.#logger.log(`process use healing item: current HP: ${owner.health.current}, healing up ${healingItem.healCapacity}`);
            owner.health.current += healingItem.healCapacity;
            this.emptyItem(healingItem);

        } else {

            this.#logger.log(`process use healing item: health is full`);

        }

    }

    emptyItem(item) {

        item.count = 0;
        this._attachTo.removeInventoryItem(item);

    }

    discardItem(item) {

        const pda = this._attachTo;
        const owner = pda._owner;
        pda.removeInventoryItem(item);
        item.setDiscardPosition(owner);

    }

}

export { Inventory };