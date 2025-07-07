import { container, getScenePosition, createPdaContainer } from "../../systems/htmlElements";
import { hexToRGBA, seaSaltHeavy, seaSaltLight } from "../basic/colorBase";

const BACKGROUND = `linear-gradient(90deg, ${hexToRGBA(seaSaltLight, .65)} 0%, ${hexToRGBA(seaSaltHeavy, .9)} 100%)`;
const BLUR = 'blur(2px)';

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

            container.appendChild(this._pdaContainer);
            this.updatePosition();            

        } else {

            container.removeChild(this._pdaContainer);

        }

        for (let i = 0, il = this.onVisibleChanged.length; i < il; i++) {

            const callback = this.onVisibleChanged[i];
            if (typeof callback === 'function') {
                callback(val);
            }

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