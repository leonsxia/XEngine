import { container, getScenePosition, createPdaContainer } from "../../systems/htmlElements";
import { hexToRGBA, moonlitAsteroidHeavy, moonlitAsteroidLight, moonlitAsteroidMedium } from "../basic/colorBase";

// const BACKGROUND = `linear-gradient(90deg, ${hexToRGBA(seaSaltLight, .65)} 0%, ${hexToRGBA(seaSaltHeavy, .9)} 100%)`;
const BACKGROUND = `linear-gradient(to bottom, ${hexToRGBA(moonlitAsteroidLight, .65)}, ${hexToRGBA(moonlitAsteroidMedium, .8)}, ${hexToRGBA(moonlitAsteroidHeavy, .9)})`;
const BLUR = 'blur(5px)';

class Pda {

    _pdaContainer;
    _pdaDiv;
    _visible = false;
    onVisibleChanged = [];

    constructor() {

        const background = BACKGROUND;
        const backdropFilter = BLUR;
        // Create the pda container and div with the specified background and backdrop filter
        const { pdaContainer, pdaDiv } = createPdaContainer({background, backdropFilter});
        this._pdaContainer = pdaContainer;
        this._pdaDiv = pdaDiv;

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
        this._pdaContainer.style.width = this._pdaDiv.style.width = `${scenePosition.width}px`;
        this._pdaContainer.style.height = this._pdaDiv.style.height = `${scenePosition.height}px`;

    }

}

export { Pda };