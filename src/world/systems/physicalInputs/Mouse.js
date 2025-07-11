import { CONTROL_TYPES } from "../../components/utils/constants";
import { InputBase } from "./InputBase";

class Mouse extends InputBase {    

    constructor(specs) {

        super(specs);

    }

    bindAllEvents() {

        this.bindMouseEvent();
        this.bindTouchEvent();

    }

    bindMouseEvent() {

        window.addEventListener('mousemove', () => {

            this.attachTo.switchInput(CONTROL_TYPES.MOUSE);

        });

    }

    bindTouchEvent() {

        window.addEventListener('touchstart', () => {

            this.attachTo.switchInput(CONTROL_TYPES.MOUSE);

        });

    }

}

export { Mouse };