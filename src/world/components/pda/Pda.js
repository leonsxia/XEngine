import { container, createPdaContainer } from "../../systems/htmlElements";
import { Logger } from "../../systems/Logger";
import { ECG_STATE } from "../../systems/ui/uiConstants";
import { CONTROL_TYPES } from "../utils/constants";
import { PdaMenu } from "./PdaMenu";
import { Files } from "./tabs/Files";
import { Inventory } from "./tabs/Inventory";
import { Maps } from "./tabs/Maps";

const DEBUG = true;

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
                
        this._owner = specs.owner;

        this.bindHealthChangeEvents();

    }

    async init() {

        await this._inventory.init();
        this._pdaContainer.appendChild(this._pdaMenu.menu);
        this._pdaContainer.appendChild(this._inventory._html.inventoryContainer);
        this._pdaContainer.appendChild(this._maps._html.mapsContainer);
        this._pdaContainer.appendChild(this._files._html.filesContainer);

        // initialize inventory as default panel
        this._pdaMenu.currentIndex = 1;

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
            this._pdaContainer.classList.remove('hide');

        } else {

            this._pdaContainer.classList.add('hide');

        }

        for (let i = 0, il = this.onVisibleChanged.length; i < il; i++) {

            const callback = this.onVisibleChanged[i];
            if (typeof callback === 'function') {
                callback(val);
            }

        }

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

        this._inventory._html.inventoryContainer.classList.add('hide');
        this._files._html.filesContainer.classList.add('hide');
        this._maps._html.mapsContainer.classList.add('hide');

    }

    showPanel(panelIdx) {

        switch(panelIdx) {

            case 0:
                this._maps._html.mapsContainer.classList.remove('hide');
                break;
            case 1:
                this._inventory._html.inventoryContainer.classList.remove('hide');
                break;
            case 2:
                this._files._html.filesContainer.classList.remove('hide');
                break;

        }

    }

    // control events start
    goUp(val) {
        this.#logger.func = this.goUp.name;
        this.#logger.log(`goUp: ${val}`);
    }

    goDown(val) {
        this.#logger.func = this.goDown.name;
        this.#logger.log(`goDown: ${val}`);
    }

    goLeft(val) {
        this.#logger.func = this.goLeft.name;
        this.#logger.log(`goLeft: ${val}`);
    }

    goRight(val) {
        this.#logger.func = this.goRight.name;
        this.#logger.log(`goRight: ${val}`);
    }

    confirm(val) {
        this.#logger.func = this.confirm.name;
        this.#logger.log(`confirm: ${val}`);
    }

    cancel(val) {
        this.#logger.func = this.cancel.name;
        this.#logger.log(`cancel: ${val}`);
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
        this.#logger.log(`moveItem: ${val}`);
    }

    xboxControllerConnected(val) {

        if (val && !this._xboxControllerConnected) {

            this._pdaMenu.switchControlType(CONTROL_TYPES.XBOX);
            this._xboxControllerConnected = true;

        } else if (!val && this._xboxControllerConnected) {

            this._pdaMenu.switchControlType(CONTROL_TYPES.KEYBOARD);
            this._xboxControllerConnected = false;

        }

    }
    // control events end

    // inventory
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

        this._inventory.add(item);
        this.doInventoryItemChangedEvents(item);

    }

    removeInventoryItem(item) {

        this._inventory.remove(item);        
        this.doInventoryItemChangedEvents(item);

    }

    doInventoryItemChangedEvents(item) {

        for (let i = 0, il = this.onInventoryItemChanged.length; i < il; i++) {

            const callback = this.onInventoryItemChanged[i];
            if (typeof callback === 'function') {

                callback(item);

            }

        }

    }

}

export { Pda };