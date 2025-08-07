import { container, createPdaContainer } from "../../systems/htmlElements";
import { Logger } from "../../systems/Logger";
import { ECG_STATE, ELEMENT_CLASS } from "../../systems/ui/uiConstants";
import { CONTROL_TYPES } from "../utils/constants";
import { addElementClass, removeElementClass } from "../utils/htmlHelper";
import { PdaHint } from "./PdaHint";
import { PdaMenu } from "./PdaMenu";
import { Files } from "./tabs/Files";
import { Inventory } from "./tabs/Inventory";
import { Maps } from "./tabs/Maps";

const DEBUG = true;
const TABS = {
    MAP: 'MAP',
    INVENTORY: 'INVENTORY',
    FIELS: 'FILES'
}

class Pda {

    _theme;
    _pdaContainer;
    _visible = false;
    onVisibleChanged = [];
    onInventoryItemChanged = [];

    _pdaMenu;
    _inventory;
    _maps;
    _files;
    _hints;

    _xboxControllerConnected;

    #logger = new Logger(DEBUG, 'Pda');

    constructor(specs) {

        const { theme = 'default-theme' } = specs;
        const { pdaContainer } = createPdaContainer(theme);
        this._pdaContainer = pdaContainer;

        this._pdaMenu = new PdaMenu({ attachTo: this });
        this._inventory = new Inventory({ attachTo: this });        
        this._maps = new Maps({ attachTo: this });        
        this._files = new Files({ attachTo: this });
        this._hints = new PdaHint({ attachTo: this });
                
        this._owner = specs.owner;

        this.bindHealthChangeEvents();

    }

    async init() {

        await Promise.all([
            this._inventory.init(),
            this._hints.init()
        ]);
        this._pdaContainer.appendChild(this._pdaMenu.menu);
        this._pdaContainer.appendChild(this._inventory._html.inventoryContainer);
        this._pdaContainer.appendChild(this._inventory._html.itemViewerPanel);
        this._pdaContainer.appendChild(this._maps._html.mapsContainer);
        this._pdaContainer.appendChild(this._files._html.filesContainer);
        this._pdaContainer.appendChild(this._hints.hintPanel);

        // initialize inventory as default panel
        this._pdaMenu.currentIndex = 1;

        this.addPdaToContainer();

    }

    get visible() {

        return this._visible;

    }

    set visible(val) {

        this._visible = val;

        if (val) {

            if (!this._pdaContainer.parentNode) {

                this.addPdaToContainer();

            }

            this.resetInventory();
            this.showElement(this._pdaContainer, true);

        } else {

            this.showElement(this._pdaContainer, false);
            this._inventory.itemViewerEnabled = false;

        }

        for (let i = 0, il = this.onVisibleChanged.length; i < il; i++) {

            const callback = this.onVisibleChanged[i];
            if (typeof callback === 'function') {
                callback(val);
            }

        }

    }

    get currentTab() {

        let current;
        switch (this._pdaMenu.currentIndex) {

            case 0:
                current = TABS.MAP;
                break;
            case 1:
                current = TABS.INVENTORY;
                break;
            case 2:
                current = TABS.FIELS;
                break;

        }

        return current;

    }

    bindHealthChangeEvents() {

        const cautionBottom = 25;
        const cautionTop = 70;

        this._owner.health.onHealthChangeEvents.push((health) => {

            if (health.currentLife < cautionTop && health.currentLife >= cautionBottom) {

                this._inventory.ecg.switchState(ECG_STATE.CAUTION);

            } else if (health.currentLife < cautionBottom) {

                this._inventory.ecg.switchState(ECG_STATE.DANGER);

            } else {

                this._inventory.ecg.switchState(ECG_STATE.FINE);

            }

        });
    }

    addPdaToContainer() {

        // Append the pda container to the main container
        container.appendChild(this._pdaContainer);

    }

    removePdaFromContainer() {

        // Remove the pda container from the main container
        if (this._pdaContainer.parentNode) {

            this._pdaContainer.parentNode.removeChild(this._pdaContainer);

        }

    }

    hideAllPanels() {

        this.showElement(this._inventory._html.inventoryContainer, false);
        this.showElement(this._files._html.filesContainer, false);
        this.showElement(this._maps._html.mapsContainer, false);

        this.resetInventory();

    }

    showPanel(panelIdx) {

        switch(panelIdx) {

            case 0:
                this.showElement(this._maps._html.mapsContainer, true);
                this._hints.applyHintMapsBase();
                break;
            case 1:
                this.showElement(this._inventory._html.inventoryContainer, true);
                this._hints.applyHintInventoryBase();
                break;
            case 2:
                this.showElement(this._files._html.filesContainer, true);
                this._hints.applyHintFilessBase();
                break;

        }

    }

    // control events start
    goUp(val) {
        this.#logger.func = this.goUp.name;
        // this.#logger.log(`goUp: ${val}`);

        if (val) {

            if (this.currentTab === TABS.INVENTORY) {

                if (this._inventory.operateMenuReady) {

                    this._inventory.operateMenuUp();

                } else if (this._inventory.shiftMenuReady) {

                    this._inventory.shiftMenuUp();

                } else if (this._inventory.shiftReady) {

                    this._inventory.shiftUp();

                } else if (this._inventory.selectReady) {

                    this._inventory.selectUp();

                } else {

                    this._inventory.focusUp();

                }

            }

        }

    }

    goDown(val) {
        this.#logger.func = this.goDown.name;
        // this.#logger.log(`goDown: ${val}`);

        if (val) {

            if (this.currentTab === TABS.INVENTORY) {

                if (this._inventory.operateMenuReady) {

                    this._inventory.operateMenuDown();

                } else if (this._inventory.shiftMenuReady) {

                    this._inventory.shiftMenuDown();

                } else if (this._inventory.shiftReady) {

                    this._inventory.shiftDown();

                } else if (this._inventory.selectReady) {

                    this._inventory.selectDown();

                } else {

                    this._inventory.focusDown();

                }

            }

        }

    }

    goLeft(val) {
        this.#logger.func = this.goLeft.name;
        // this.#logger.log(`goLeft: ${val}`);

        if (val) {

            if (this.currentTab === TABS.INVENTORY) {

                if (this._inventory.operateMenuReady || this._inventory.shiftMenuReady) return;

                if (this._inventory.shiftReady) {

                    this._inventory.shiftLeft();

                }  else if (this._inventory.selectReady) {

                    this._inventory.selectLeft();

                } else {

                    this._inventory.focusLeft();

                }

            }

        }

    }

    goRight(val) {
        this.#logger.func = this.goRight.name;
        // this.#logger.log(`goRight: ${val}`);

        if (val) {

            if (this.currentTab === TABS.INVENTORY) {

                if (this._inventory.operateMenuReady || this._inventory.shiftMenuReady) return;

                if (this._inventory.shiftReady) {

                    this._inventory.shiftRight();

                } else if (this._inventory.selectReady) {

                    this._inventory.selectRight();

                } else {

                    this._inventory.focusRight();                    

                }

            }

        }

    }

    confirm(val) {
        this.#logger.func = this.confirm.name;
        // this.#logger.log(`confirm: ${val}`);

        if (val) {

            if (this.currentTab === TABS.INVENTORY) {

                if (!this._inventory.shiftReady && !this._inventory.itemViewerEnabled) {

                    if (this._inventory.operateMenuReady || this._inventory.selectReady) {

                        this._inventory.processItemOperation();

                    } else {

                        this._inventory.operateMenuReady = true;

                    }

                } else {

                    if (this._inventory.shiftMenuReady) {

                        this._inventory.processItemOperation();

                    }

                }

            }

        }

    }

    cancel(val) {
        this.#logger.func = this.cancel.name;
        // this.#logger.log(`cancel: ${val}`);

        if (val) {

            if (this.currentTab === TABS.INVENTORY) {

                if (this._inventory.operateMenuReady) {

                    this._inventory.operateMenuReady = false;

                } else if (this._inventory.shiftMenuReady) {

                    this._inventory.shiftMenuReady = false;

                } else if (this._inventory.shiftReady) {

                    this._inventory.resetShiftState();

                } else if (this._inventory.selectReady) {

                    this._inventory.selectReady = false;

                } else if (this._inventory.itemViewerEnabled) {

                    this._inventory.itemViewerEnabled = false;

                }

            }

        }

    }

    shiftLeft(val) {
        this.#logger.func = this.shiftLeft.name;
        // this.#logger.log(`shiftLeft: ${val}`);

        if (val) {

            this._pdaMenu.shiftLeft();

        }

    }

    shiftRight(val) {
        this.#logger.func = this.shiftRight.name;
        // this.#logger.log(`shiftRight: ${val}`);

        if (val) {

            this._pdaMenu.shiftRight();

        }

    }

    moveItem(val) {
        this.#logger.func = this.moveItem.name;
        // this.#logger.log(`moveItem: ${val}`);

        if (val) {

            if (this.currentTab === TABS.INVENTORY) {

                if (!this._inventory.operateMenuReady && !this._inventory.shiftMenuReady && !this._inventory.selectReady &&
                    !this._inventory.itemViewerEnabled
                ) {

                    this._inventory.shiftReady = !this._inventory.shiftReady;

                }

            }            

        }

    }

    xboxControllerConnected(val) {

        if (val && !this._xboxControllerConnected) {

            this._pdaMenu.switchControlType(CONTROL_TYPES.XBOX);
            this._hints.switchControlType(CONTROL_TYPES.XBOX);
            this._xboxControllerConnected = true;

        } else if (!val && this._xboxControllerConnected) {

            this._pdaMenu.switchControlType(CONTROL_TYPES.KEYBOARD);
            this._hints.switchControlType(CONTROL_TYPES.KEYBOARD);
            this._xboxControllerConnected = false;

        }

    }
    // control events end

    // inventory
    get inventory() {

        return this._inventory;

    }

    resetInventory() {

        this._inventory.operateMenuReady = false;
        this._inventory.focusedIndex = 0;
        this._inventory.resetShift();
        this._inventory.selectReady = false;

    }

    changeFirearm(weapon) {

        this._inventory.equipFirearm(weapon);

    }

    changeMelee(weapon) {

        this._inventory.equipMelee(weapon);

    }

    findInventoryItems(predication) {

        return this._inventory.findItems(predication);

    }

    updateInventoryItems() {

        for (let i = 0, il = this._inventory.items.length; i < il; i++) {

            const item = this._inventory.items[i];
            item.currentRoom = this._owner.currentRoom;

        }

    }

    updateInventoryWeapon(weapon) {

        this.#logger.func = this.updateInventoryWeapon.name;

        const filter = this._inventory.findItems(i => i.weaponType === weapon.weaponType);
        if (filter.length > 0) {

            const weaponItem = filter[0];
            weaponItem.ammo.updateAmmoProperties(weapon.ammo);
            weaponItem.updateCountInfo(weapon);
            this.#logger.log(`weapon item: ${weaponItem.name}, count: ${weaponItem.ammo.count}`);

        } else {

            this.#logger.log(`there is no item bound to weapon: ${weapon.name}`);

        }

    }

    addInventoryItem(item) {

        const result = this._inventory.add(item);
        if (result) {

            this.doInventoryItemChangedEvents(item);

        }

        return result;

    }

    removeInventoryItem(item) {

        const result = this._inventory.remove(item);
        if (result) {

            this.doInventoryItemChangedEvents(item);

        }

        return result;

    }

    doInventoryItemChangedEvents(item) {

        for (let i = 0, il = this.onInventoryItemChanged.length; i < il; i++) {

            const callback = this.onInventoryItemChanged[i];
            if (typeof callback === 'function') {

                callback(item);

            }

        }

    }

    showElement(element, show) {

        if (show) {

            removeElementClass(element, ELEMENT_CLASS.HIDDEN);
            addElementClass(element, ELEMENT_CLASS.VISIBLE);

        } else {

            removeElementClass(element, ELEMENT_CLASS.VISIBLE);
            addElementClass(element, ELEMENT_CLASS.HIDDEN);

        }

    }

}

export { Pda };