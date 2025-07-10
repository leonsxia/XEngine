import { createPdaMenu } from "../../systems/htmlElements";
import { GAMEPAD_BUTTONS, KEYS, PDA_MENU_NAMES } from "../../systems/ui/uiConstants";
import { CONTROL_TYPES } from "../utils/constants";

class PdaMenu {

    _currentIdx = 1;
    _tabCount = 3;

    constructor() {

        const { menu, menuUl, menuLiLeft, menuLiRight, menuLiCenter, menuCenterDivMain, menuCenterDots } = createPdaMenu();
        this.menu = menu;
        this.menuUl = menuUl,
        this.menuLiLeft = menuLiLeft;
        this.menuLiRight = menuLiRight;
        this.menuLiCenter = menuLiCenter;
        this.menuCenterDivMain = menuCenterDivMain;
        this.menuCenterDots = menuCenterDots;

    }

    get currentIndex() {

        return this._currentIdx;

    }

    /**
     * @param {number} val
     */
    set currentIndex(val) {

        this._currentIdx = val > 0 ? val % this._tabCount : (this._tabCount + val) % this._tabCount;

    }

    get leftIndex() {

        return this._currentIdx === 0 ?
            this._tabCount - 1 : this._currentIdx - 1;

    }

    get rightIndex() {

        return this._currentIdx === this._tabCount - 1 ?
            0 : this._currentIdx + 1;

    }

    shiftLeft() {

        this.currentIndex --;
        this.applyContent();
        this.highlightDot();

    }

    shiftRight() {
        
        this.currentIndex ++;
        this.applyContent();
        this.highlightDot()

    }

    applyContent() {

        this.menuLiLeft.lastChild.innerText = PDA_MENU_NAMES[this.leftIndex];
        this.menuLiRight.lastChild.innerText = PDA_MENU_NAMES[this.rightIndex];
        this.menuLiCenter.firstChild.innerText = PDA_MENU_NAMES[this._currentIdx];

    }

    highlightDot() {

        for (let i = 0, il = this.menuCenterDots.length; i < il; i++){

            const dot = this.menuCenterDots[i];
            if (dot.classList.contains('current')) {

                dot.classList.remove('current');

            }

            if (i === this._currentIdx) {

                dot.classList.add('current');

            }

        }

    }

    switchControlType(type = CONTROL_TYPES.KEYBOARD) {

        switch (type) {

            case CONTROL_TYPES.KEYBOARD:

                this.menuLiLeft.firstChild.innerText = KEYS.Q;
                this.menuLiRight.firstChild.innerText = KEYS.E;
                break;

            case CONTROL_TYPES.XBOX:

                this.menuLiLeft.firstChild.innerText = GAMEPAD_BUTTONS.LB;
                this.menuLiRight.firstChild.innerText = GAMEPAD_BUTTONS.RB;
                break;

        }

    }

}

export { PdaMenu };