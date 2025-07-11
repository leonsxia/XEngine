import { container, createPdaContainer } from "../../systems/htmlElements";
import { Logger } from "../../systems/Logger";
import { CONTROL_TYPES } from "../utils/constants";
import { PdaMenu } from "./PdaMenu";

const DEBUG = true;

class Pda {

    _theme;
    _pdaContainer;
    _visible = false;
    onVisibleChanged = [];

    _pdaMenu;

    _xboxControllerConnected;

    #logger = new Logger(DEBUG, 'Pda');

    constructor(specs) {

        const { theme = 'default-theme' } = specs;
        const { pdaContainer } = createPdaContainer(theme);
        this._pdaContainer = pdaContainer;

        this._pdaMenu = new PdaMenu();
        this._pdaContainer.appendChild(this._pdaMenu.menu);

        this._attachTo = specs.attachTo;

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

}

export { Pda };