import { container, createPdaContainer } from "../../systems/htmlElements";
import { Logger } from "../../systems/Logger";
import { CONTROL_TYPES } from "../utils/constants";
import { PdaMenu } from "./PdaMenu";
import { Inventory } from "./tabs/Inventory";

const DEBUG = true;

class Pda {

    _theme;
    _pdaContainer;
    _visible = false;
    onVisibleChanged = [];
    onInventoryItemChanged = [];

    _pdaMenu;
    _inventory;

    _xboxControllerConnected;

    #logger = new Logger(DEBUG, 'Pda');

    constructor(specs) {

        const { theme = 'default-theme' } = specs;
        const { pdaContainer } = createPdaContainer(theme);
        this._pdaContainer = pdaContainer;

        this._pdaMenu = new PdaMenu({ attachTo: this });
        this._pdaContainer.appendChild(this._pdaMenu.menu);

        this._inventory = new Inventory({ attachTo: this });
        this._pdaContainer.appendChild(this._inventory._html.inventoryContainer);

        this._owner = specs.owner;

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
            this._pdaContainer.style.display = 'block';

        } else {

            this._pdaContainer.style.display = 'none';

        }

        for (let i = 0, il = this.onVisibleChanged.length; i < il; i++) {

            const callback = this.onVisibleChanged[i];
            if (typeof callback === 'function') {
                callback(val);
            }

        }

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

    }

    showPanel(panelIdx) {

        switch(panelIdx) {

            case 0:
                break;
            case 1:
                this._inventory._html.inventoryContainer.classList.remove('hide');
                break;
            case 2:
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