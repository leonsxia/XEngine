import { createPdaHintElements } from "../../systems/htmlElements";
import { ELEMENT_CLASS, XBOX_CONTROLLER_ICON_NAMES } from "../../systems/ui/uiConstants";
import { CONTROL_TYPES } from "../utils/constants";
import { hintIndex } from "../utils/enums";
import { addElementClass, removeElementClass } from "../utils/htmlHelper";
import { getImageUrl } from "../utils/imageHelper";

class PdaHint {

    _hintGroup = [];
    _hintIdx = -1;

    constructor(specs) {

        this._attachTo = specs.attachTo;

    }

    async init() {

        const [
            btnViewUrl, 
            btnDPadUpUrl, btnDPadDownUrl, btnDPadLeftUrl, btnDPadRightUrl,
            btnLStickClickUrl, btnRStickClickUrl,
            btnLTUrl, btnRTUrl
        ] = await Promise.all([
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.VIEW),
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.DPAD_UP),
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.DPAD_DOWN),
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.DPAD_LEFT),
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.DPAD_RIGHT),
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.LSTICK_CLICK),
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.RSTICK_CLICK),
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.LT),
            getImageUrl(XBOX_CONTROLLER_ICON_NAMES.RT),
        ]);

        this._html = createPdaHintElements({
            btnViewUrl,
            btnDPadUpUrl, btnDPadDownUrl, btnDPadLeftUrl, btnDPadRightUrl,
            btnLStickClickUrl, btnRStickClickUrl,
            btnLTUrl, btnRTUrl
        });

    }

    get hintPanel() {

        return this._html.hintPanel;

    }

    switchControlType(type = CONTROL_TYPES.KEYBOARD) {

        switch (type) {

            case CONTROL_TYPES.KEYBOARD:

                addElementClass(this._html.closeBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.closeKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.confirmBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.confirmKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.cancelBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.cancelKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.moveBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.moveKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.resetBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.resetKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.upBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.upKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.downBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.downKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.leftBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.leftKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.rightBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rightKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.rotateBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rotateUpKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rotateDownKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rotateLeftKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rotateRightKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.zoomBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.zoomInKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.zoomOutKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.leftFileGroupBtn, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.rightFileGroupBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.leftFileGroupKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rightFileGroupKey, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.leftFlipPageBtn, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.rightFlipPageBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.leftFlipPageKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rightFlipPageKey, ELEMENT_CLASS.HIDE);
                break;

            case CONTROL_TYPES.XBOX:

                addElementClass(this._html.closeKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.closeBtn, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.confirmKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.confirmBtn, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.cancelKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.cancelBtn, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.moveKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.moveBtn, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.resetKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.resetBtn, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.upKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.upBtn, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.downKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.downBtn, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.leftKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.leftBtn, ELEMENT_CLASS.HIDE);

                addElementClass(this._html.rightKey, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rightBtn, ELEMENT_CLASS.HIDE);

                removeElementClass(this._html.rotateBtn, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.rotateUpKey, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.rotateDownKey, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.rotateLeftKey, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.rotateRightKey, ELEMENT_CLASS.HIDE);

                removeElementClass(this._html.zoomBtn, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.zoomInKey, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.zoomOutKey, ELEMENT_CLASS.HIDE);

                removeElementClass(this._html.leftFileGroupBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rightFileGroupBtn, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.leftFileGroupKey, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.rightFileGroupKey, ELEMENT_CLASS.HIDE);

                removeElementClass(this._html.leftFlipPageBtn, ELEMENT_CLASS.HIDE);
                removeElementClass(this._html.rightFlipPageBtn, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.leftFlipPageKey, ELEMENT_CLASS.HIDE);
                addElementClass(this._html.rightFlipPageKey, ELEMENT_CLASS.HIDE);
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

        if (this._hintIdx === hintIndex.inventoryBase) return;

        this._hintGroup.length = 0;
        this._hintGroup.push(
            this._html.leftHint, this._html.rightHint, this._html.upHint, this._html.downHint,
            this._html.moveHint, this._html.confirmHint, this._html.closeHint
        );

        this.clearHintPanel();
        this.applyHintGroup();

        this._hintIdx = hintIndex.inventoryBase;

    }

    applyHintInventoryItemShift() {

        if (this._hintIdx === hintIndex.inventoryShift) return;

        this._hintGroup.length = 0;
        this._hintGroup.push(
            this._html.leftHint, this._html.rightHint, this._html.upHint, this._html.downHint,
            this._html.moveHint, this._html.cancelHint
        );

        this.clearHintPanel();
        this.applyHintGroup();

        this._hintIdx = hintIndex.inventoryShift;

    }

    applyHintInventoryOperateMenu() {

        if (this._hintIdx === hintIndex.inventoryOperateMenu) return;

        this._hintGroup.length = 0;
        this._hintGroup.push(
            this._html.upHint, this._html.downHint,
            this._html.confirmHint, this._html.cancelHint
        );

        this.clearHintPanel();
        this.applyHintGroup();

        this._hintIdx = hintIndex.inventoryOperateMenu;

    }

    applyHintInventoryItemSelect() {

        if (this._hintIdx === hintIndex.inventorySelect) return;

        this._hintGroup.length = 0;
        this._hintGroup.push(
            this._html.leftHint, this._html.rightHint, this._html.upHint, this._html.downHint,
            this._html.confirmHint, this._html.cancelHint
        );

        this.clearHintPanel();
        this.applyHintGroup();

        this._hintIdx = hintIndex.inventorySelect;

    }

    applyHintItemViewer() {

        if (this._hintIdx === hintIndex.itemViewer) return;

        this._hintGroup.length = 0;
        this._hintGroup.push(
            this._html.rotateHint, this._html.zoomHint, 
            this._html.resetHint, this._html.cancelHint
        );

        this.clearHintPanel();
        this.applyHintGroup();

        this._hintIdx = hintIndex.itemViewer;

    }

    applyHintMapsBase() {

        if (this._hintIdx === hintIndex.mapsBase) return;

        this._hintGroup.length = 0;
        this._hintGroup.push(this._html.closeHint);

        this.clearHintPanel();
        this.applyHintGroup();

        this._hintIdx = hintIndex.mapsBase;

    }

    applyHintFilessBase() {

        if (this._hintIdx === hintIndex.filesBase) return;

        this._hintGroup.length = 0;
        this._hintGroup.push(this._html.changeFileGroupHint, this._html.flipPageHint, this._html.closeHint);

        this.clearHintPanel();
        this.applyHintGroup();

        this._hintIdx = hintIndex.filesBase;

    }

}

export { PdaHint };