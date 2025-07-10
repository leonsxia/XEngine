import { container, getScenePosition, createPdaContainer } from "../../systems/htmlElements";
import { Logger } from "../../systems/Logger";
import { hexToRGBA, moonlitAsteroidHeavy, moonlitAsteroidLight, moonlitAsteroidMedium } from "../basic/colorBase";

// const BACKGROUND = `linear-gradient(90deg, ${hexToRGBA(seaSaltLight, .65)} 0%, ${hexToRGBA(seaSaltHeavy, .9)} 100%)`;
const BACKGROUND = `linear-gradient(to bottom, ${hexToRGBA(moonlitAsteroidLight, .65)}, ${hexToRGBA(moonlitAsteroidMedium, .8)}, ${hexToRGBA(moonlitAsteroidHeavy, .9)})`;
const BLUR = 'blur(5px)';
const DEBUG = true;

class Pda {

    _pdaContainer;
    _visible = false;
    onVisibleChanged = [];

    #logger = new Logger(DEBUG, 'Pda');

    constructor(specs) {

        const { background = BACKGROUND } = specs;
        const backdropFilter = BLUR;
        // Create the pda container and div with the specified background and backdrop filter
        const { pdaContainer } = createPdaContainer({ background, backdropFilter });
        this._pdaContainer = pdaContainer;

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
            this.updatePosition();            

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

    updatePosition() {

        const scenePosition = getScenePosition();
        this._pdaContainer.style.left = `${scenePosition.left}px`;
        this._pdaContainer.style.top = `${scenePosition.top}px`;
        this._pdaContainer.style.width = `${scenePosition.width}px`;
        this._pdaContainer.style.height = `${scenePosition.height}px`;

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
        this.#logger.log(`shiftLeft: ${val}`);
    }

    shiftRight(val) {
        this.#logger.func = this.shiftRight.name;
        this.#logger.log(`shiftRight: ${val}`);
    }

    moveItem(val) {
        this.#logger.func = this.moveItem.name;
        this.#logger.log(`moveItem: ${val}`);
    }

}

export { Pda };