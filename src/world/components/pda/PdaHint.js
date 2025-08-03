import { createPdaHintElements } from "../../systems/htmlElements";
import { CONTROL_TYPES } from "../utils/constants";
import { addElementClass, removeElementClass } from "../utils/htmlHelper";

class PdaHint {

    _hintGroup = [];

    constructor(specs) {

        this._html = createPdaHintElements();
        this._attachTo = specs.attachTo;

    }

    get hintPanel() {

        return this._html.hintPanel;

    }

    switchControlType(type = CONTROL_TYPES.KEYBOARD) {

        switch (type) {

            case CONTROL_TYPES.KEYBOARD:

                addElementClass(this._html.closeBtn, 'hide');
                removeElementClass(this._html.closeKey, 'hide');

                addElementClass(this._html.confirmBtn, 'hide');
                removeElementClass(this._html.confirmKey, 'hide');

                addElementClass(this._html.cancelBtn, 'hide');
                removeElementClass(this._html.cancelKey, 'hide');

                addElementClass(this._html.moveBtn, 'hide');
                removeElementClass(this._html.moveKey, 'hide');

                addElementClass(this._html.upBtn, 'hide');
                removeElementClass(this._html.upKey, 'hide');

                addElementClass(this._html.downBtn, 'hide');
                removeElementClass(this._html.downKey, 'hide');

                addElementClass(this._html.leftBtn, 'hide');
                removeElementClass(this._html.leftKey, 'hide');

                addElementClass(this._html.rightBtn, 'hide');
                removeElementClass(this._html.rightKey, 'hide');
                break;

            case CONTROL_TYPES.XBOX:

                addElementClass(this._html.closeKey, 'hide');
                removeElementClass(this._html.closeBtn, 'hide');

                addElementClass(this._html.confirmKey, 'hide');
                removeElementClass(this._html.confirmBtn, 'hide');

                addElementClass(this._html.cancelKey, 'hide');
                removeElementClass(this._html.cancelBtn, 'hide');

                addElementClass(this._html.moveKey, 'hide');
                removeElementClass(this._html.moveBtn, 'hide');

                addElementClass(this._html.upKey, 'hide');
                removeElementClass(this._html.upBtn, 'hide');

                addElementClass(this._html.downKey, 'hide');
                removeElementClass(this._html.downBtn, 'hide');

                addElementClass(this._html.leftKey, 'hide');
                removeElementClass(this._html.leftBtn, 'hide');

                addElementClass(this._html.rightKey, 'hide');
                removeElementClass(this._html.rightBtn, 'hide');
                break;

        }

    }

    clearHintPanel() {

        while (this.hintPanel.firstChild) { 

            this.hintPanel.removeChild(this.hintPanel.lastChild);

        }

    }

    applyHintGroup() {

        for (let i = 0, il = this._hintGroup.length; i < il; i++) {

            const hint = this._hintGroup[i];
            this.hintPanel.appendChild(hint);

        }

    }

    applyHintInventoryBase() {

        this._hintGroup.length = 0;
        this._hintGroup.push(
            this._html.leftHint, this._html.rightHint, this._html.upHint, this._html.downHint,
            this._html.moveHint, this._html.confirmHint, this._html.closeHint);

        this.clearHintPanel();
        this.applyHintGroup();

    }

    applyHintInventoryItemShift() {

        this._hintGroup.length = 0;
        this._hintGroup.push(
            this._html.leftHint, this._html.rightHint, this._html.upHint, this._html.downHint,
            this._html.moveHint, this._html.closeHint);

        this.clearHintPanel();
        this.applyHintGroup();

    }

    applyHintInventoryOperateMenu() {

        this._hintGroup.length = 0;
        this._hintGroup.push(
            this._html.upHint, this._html.downHint,
            this._html.confirmHint, this._html.cancelHint
        );

        this.clearHintPanel();
        this.applyHintGroup();

    }

    applyHintMapsBase() {

        this._hintGroup.length = 0;
        this._hintGroup.push(this._html.closeHint);

        this.clearHintPanel();
        this.applyHintGroup();

    }

    applyHintFilessBase() {

        this._hintGroup.length = 0;
        this._hintGroup.push(this._html.closeHint);

        this.clearHintPanel();
        this.applyHintGroup();

    }

}

export { PdaHint };