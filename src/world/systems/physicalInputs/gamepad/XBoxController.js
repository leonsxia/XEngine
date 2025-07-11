import { InputBase } from "../InputBase";
import { Logger } from "../../Logger";
import { CONTROL_TYPES } from "../../../components/utils/constants";

const DEBUG = false;

class XBoxController extends InputBase {

    isGamePad = true;

    connected = false;
    gamepad = null;

    #LStickMoveLeft = false;
    #LStickMoveRight = false;
    #LStickMoveUp = false;
    #LStickMoveDown = false;
    #RStickMoveLeft = false;
    #RStickMoveRight = false;
    #APressed = false;
    #BPressed = false;
    #XPressed = false;
    #YPressed = false;
    #LBPressed = false;
    #RBPressed = false;
    #LTPressed = false;
    #RTPressed = false;
    #LMenuPressed = false;

    #UpPressed = false;
    #DownPressed = false;
    #leftPressed = false;
    #rightPressed = false;

    #logger = new Logger(DEBUG, 'XBoxController');

    constructor(specs) {

        super(specs);

    }

    bindGamepadEvents() {

        this.#logger.func = 'bindGamepadEvents';

        window.addEventListener("gamepadconnected", (e) => {

            const gp = navigator.getGamepads()[e.gamepad.index];

            this.#logger.log(`Gamepad connected at index ${gp.index}: ${gp.id}. ${gp.buttons.length} buttons, ${gp.axes.length} axes.`);

            this.attachTo.switchInput(CONTROL_TYPES.XBOX);

        });

        window.addEventListener("gamepaddisconnected", (e) => {

            const gp = e.gamepad;

            this.#logger.log(`Gamepad disconnected at index ${gp.index}: ${gp.id}. ${gp.buttons.length} buttons, ${gp.axes.length} axes.`);

            this.connected = false;

            this.attachTo.switchInput(CONTROL_TYPES.XBOX);

        });

    }

    tick() {

        this.gamepad = navigator.getGamepads()[0];

        if (this.gamepad?.connected) {

            this.connected = true;
            this._triggered = false;
            if (this.controlTypes.includes(InputBase.CONTROL_TYPES.TANKMOVE)) {

                this.tankmoveTick();
                this.pdaTriggerTick();                

            }

            if (this.controlTypes.includes(InputBase.CONTROL_TYPES.PDA)) {

                this.pdaTick();

            }

            this._triggered = !this._triggered ? this.gamepad.buttons.find(btn => btn.pressed) ? true : false : true;
            if (this._triggered) {

                this.attachTo.switchInput(CONTROL_TYPES.XBOX);

            }

        }

    }

    pdaTriggerTick() {

        this.processPdaTriggerEvents();

    }

    pdaTick() {

        if (this.attachTo.currentScene.isPdaOn) {

            this.processPdaButtonEvents();

        }

    }

    tankmoveTick() {

        if (!this.attachTo.currentScene.isPdaOn) {

            this.processTankmoveButtonEvents();
            this.processTankmoveStickEvents();

        }

    }

    processPdaTriggerEvents() {

        this.#logger.func = 'processTankmoveButtonEvents';

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.TANKMOVE;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const world = this.attachTo;

        const btnLMenu = this.gamepad.buttons[8];

        if (btnLMenu.pressed) {

            if (!this.#LMenuPressed) {

                this.#logger.log(`gamepad button left menu pressed: ${btnLMenu.pressed}, value: ${btnLMenu.value}`);

                this.#LMenuPressed = true;
                eventDispatcher.publish(messageType, actions.PDA_INFO, world.current, this.#LMenuPressed);

                this.#logger.log(`pda: ${this.#LMenuPressed}`);

            }

        } else {

            if (this.#LMenuPressed) {

                this.#logger.log(`gamepad button A pressed: ${btnLMenu.pressed}, value: ${btnLMenu.value}`);

                this.#LMenuPressed = false;
                eventDispatcher.publish(messageType, actions.PDA_INFO, world.current, this.#LMenuPressed);

                this.#logger.log(`pda: ${this.#LMenuPressed}`);

            }

        }

    }

    processTankmoveStickEvents() {

        this.#logger.func = 'processTankmoveStickEvents';

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.TANKMOVE;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const world = this.attachTo;

        const leftStickH = this.gamepad.axes[0];
        const leftStickV = this.gamepad.axes[1];
        const rightStickH = this.gamepad.axes[2];
        // const rightStickV = this.gamepad.axes[3];
        
        const LStickHValidMin = 0.4;
        const LStickForwardValidMin = 0.1;
        const LStickBackwardValidMin = 0.45;
        const RStickHValidMin = 0.4;

        // if right stick valid, clear left stick events first
        if (Math.abs(rightStickH) >= RStickHValidMin) {

            if (this.#LStickMoveUp) {

                this.#LStickMoveUp = false;
                eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#LStickMoveUp);

            }

            if (this.#LStickMoveDown) {

                this.#LStickMoveDown = false;
                eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#LStickMoveDown);

            }

            if (this.#LStickMoveLeft) {

                this.#LStickMoveLeft = false;
                eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#LStickMoveLeft);

            }

            if (this.#LStickMoveRight) {

                this.#LStickMoveRight = false;
                eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#LStickMoveRight);

            }

        }

        // process right stick events
        if (rightStickH <= - RStickHValidMin) {

            this._triggered = true;

            if (!this.#RStickMoveLeft) {

                this.#logger.log(`gamepad R stick moving left: ${rightStickH}`);

                this.#RStickMoveLeft = true;
                eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#RStickMoveLeft);

                this.#logger.log(`move left: ${this.#RStickMoveLeft}`);

            }

        } else {

            if (this.#RStickMoveLeft) {

                this.#logger.log(`gamepad R stick moving left: ${rightStickH}`);

                this.#RStickMoveLeft = false;
                eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#RStickMoveLeft);

                this.#logger.log(`move left: ${this.#RStickMoveLeft}`);

            }

        }

        if (rightStickH >= RStickHValidMin) {

            this._triggered = true;

            if (!this.#RStickMoveRight) {

                this.#logger.log(`gamepad R stick moving right: ${rightStickH}`);

                this.#RStickMoveRight = true;
                eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#RStickMoveRight);

                this.#logger.log(`move right: ${this.#RStickMoveRight}`);

            }

        } else {

            if (this.#RStickMoveRight) {

                this.#logger.log(`gamepad R stick moving right: ${rightStickH}`);

                this.#RStickMoveRight = false;
                eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#RStickMoveRight);

                this.#logger.log(`move right: ${this.#RStickMoveRight}`);

            }

        }

        // if right stick activated, disable left stick, other wise recover left stick events
        if (Math.abs(rightStickH) >= RStickHValidMin) {            
                        
            return;

        }

        // if right stick not activated, process left stick events
        if (leftStickH <= - LStickHValidMin) {

            this._triggered = true;

            if (!this.#LStickMoveLeft) {

                this.#logger.log(`gamepad L stick moving left: ${leftStickH}`);

                this.#LStickMoveLeft = true;
                eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#LStickMoveLeft);

                this.#logger.log(`move left: ${this.#LStickMoveLeft}`);

            }

        } else {

            if (this.#LStickMoveLeft) {

                this.#logger.log(`gamepad L stick moving left: ${leftStickH}`);

                this.#LStickMoveLeft = false;
                eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#LStickMoveLeft);

                this.#logger.log(`move left: ${this.#LStickMoveLeft}`);

            }

        }

        if (leftStickH >= LStickHValidMin) {

            this._triggered = true;

            if (!this.#LStickMoveRight) {

                this.#logger.log(`gamepad L stick moving right: ${leftStickH}`);

                this.#LStickMoveRight = true;
                eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#LStickMoveRight);

                this.#logger.log(`move right: ${this.#LStickMoveRight}`);

            }

        } else {

            if (this.#LStickMoveRight) {

                this.#logger.log(`gamepad L stick moving right: ${leftStickH}`);

                this.#LStickMoveRight = false;
                eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#LStickMoveRight);

                this.#logger.log(`move right: ${this.#LStickMoveRight}`);

            }

        }

        if (leftStickV <= - LStickForwardValidMin) {

            this._triggered = true;

            if (!this.#LStickMoveUp && !this.#LStickMoveDown) {

                this.#logger.log(`gamepad L stick moving forward: ${leftStickH}`);

                this.#LStickMoveUp = true;
                eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#LStickMoveUp);

                this.#logger.log(`move forward: ${this.#LStickMoveUp}`);

            }

        } else {

            if (this.#LStickMoveUp) {

                this.#logger.log(`gamepad L stick moving forward: ${leftStickH}`);

                this.#LStickMoveUp = false;
                eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#LStickMoveUp);

                this.#logger.log(`move forward: ${this.#LStickMoveUp}`);

            }

        }

        if (leftStickV >= LStickBackwardValidMin) {

            this._triggered = true;

            if (!this.#LStickMoveDown && !this.#LStickMoveUp) {

                this.#logger.log(`gamepad L stick moving backward: ${leftStickH}`);

                this.#LStickMoveDown = true;
                eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#LStickMoveDown);

                this.#logger.log(`move backward: ${this.#LStickMoveDown}`);

            }

        } else {

            if (this.#LStickMoveDown) {

                this.#logger.log(`gamepad L stick moving backward: ${leftStickH}`);

                this.#LStickMoveDown = false;
                eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#LStickMoveDown);

                this.#logger.log(`move backward: ${this.#LStickMoveDown}`);

            }

        }

    }

    processTankmoveButtonEvents() {

        this.#logger.func = 'processTankmoveButtonEvents';

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.TANKMOVE;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const world = this.attachTo;

        const btnA = this.gamepad.buttons[0];
        const btnB = this.gamepad.buttons[1];
        const btnX = this.gamepad.buttons[2];
        const btnY = this.gamepad.buttons[3];
        const btnLB = this.gamepad.buttons[4];
        const btnRB = this.gamepad.buttons[5];
        const btnLT = this.gamepad.buttons[6];
        const btnRT = this.gamepad.buttons[7];

        if (btnA.pressed) {

            if (!this.#APressed) {

                this.#logger.log(`gamepad button A pressed: ${btnA.pressed}, value: ${btnA.value}`);

                this.#APressed = true;
                eventDispatcher.publish(messageType, actions.INTERACT, world.current, this.#APressed);

                this.#logger.log(`interact: ${this.#APressed}`);

            }

        } else {

            if (this.#APressed) {

                this.#logger.log(`gamepad button A pressed: ${btnA.pressed}, value: ${btnA.value}`);

                this.#APressed = false;
                eventDispatcher.publish(messageType, actions.INTERACT, world.current, this.#APressed);

                this.#logger.log(`interact: ${this.#APressed}`);

            }

        }

        if (btnB.pressed) {

            this.#logger.log(`gamepad button B pressed: ${btnB.pressed}, value: ${btnB.value}`);

        }

        if (btnX.pressed) {

            if (!this.#XPressed) {

                this.#logger.log(`gamepad button X pressed: ${btnX.pressed}, value: ${btnX.value}`);

                this.#XPressed = true;
                eventDispatcher.publish(messageType, actions.ACCELERATE, world.current, this.#XPressed);

                this.#logger.log(`accelerate: ${this.#XPressed}`);

            }

        } else {

            if (this.#XPressed) {

                this.#logger.log(`gamepad button X pressed: ${btnX.pressed}, value: ${btnX.value}`);

                this.#XPressed = false;
                eventDispatcher.publish(messageType, actions.ACCELERATE, world.current, this.#XPressed);

                this.#logger.log(`accelerate: ${this.#XPressed}`);

            }

        }

        if (btnY.pressed) {

            if (!this.#YPressed) {

                this.#logger.log(`gamepad button Y pressed: ${btnY.pressed}, value: ${btnY.value}`);

                this.#YPressed = true;
                eventDispatcher.publish(messageType, actions.JUMP, world.current, this.#YPressed);

                this.#logger.log(`jump: ${this.#YPressed}`);

            }

        } else {

            if (this.#YPressed) {

                this.#logger.log(`gamepad button Y pressed: ${btnY.pressed}, value: ${btnY.value}`);

                this.#YPressed = false;
                eventDispatcher.publish(messageType, actions.JUMP, world.current, this.#YPressed);

                this.#logger.log(`jump: ${this.#YPressed}`);

            }

        }

        if (btnLB.pressed) {

            if (!this.#LBPressed) {

                this.#logger.log(`gamepad button LB pressed: ${btnLB.pressed}, value: ${btnLB.value}`);

                this.#LBPressed = true;
                eventDispatcher.publish(messageType, actions.NEXT_AIM_TARGET, world.current, this.#LBPressed);

                this.#logger.log(`next aim target: ${this.#LBPressed}`);

            }

        } else {

            if (this.#LBPressed) {

                this.#logger.log(`gamepad button LB pressed: ${btnLB.pressed}, value: ${btnLB.value}`);

                this.#LBPressed = false;
                eventDispatcher.publish(messageType, actions.NEXT_AIM_TARGET, world.current, this.#LBPressed);

                this.#logger.log(`next aim target: ${this.#LBPressed}`);

            }

        }

        if (btnRB.pressed) {

            if (!this.#RBPressed) {

                this.#logger.log(`gamepad button RB pressed: ${btnRB.pressed}, value: ${btnRB.value}`);

                this.#RBPressed = true;
                eventDispatcher.publish(messageType, actions.MELEE, world.current, this.#RBPressed);

                this.#logger.log(`melee: ${this.#RBPressed}`);

            }

        } else {

            if (this.#RBPressed) {

                this.#logger.log(`gamepad button RB pressed: ${btnRB.pressed}, value: ${btnRB.value}`);

                this.#RBPressed = false;
                eventDispatcher.publish(messageType, actions.MELEE, world.current, this.#RBPressed);

                this.#logger.log(`melee: ${this.#RBPressed}`);

            }

        }

        if (btnLT.pressed) {

            if (!this.#LTPressed) {

                this.#logger.log(`gamepad button LT pressed: ${btnLT.pressed}, value: ${btnLT.value}`);

                this.#LTPressed = true;
                eventDispatcher.publish(messageType, actions.GUN_POINT, world.current, this.#LTPressed);

                this.#logger.log(`gun point: ${this.#LTPressed}`);

            }

        } else {

            if (this.#LTPressed) {

                this.#logger.log(`gamepad button LT pressed: ${btnLT.pressed}, value: ${btnLT.value}`);

                this.#LTPressed = false;
                eventDispatcher.publish(messageType, actions.GUN_POINT, world.current, this.#LTPressed);

                this.#logger.log(`gun point: ${this.#LTPressed}`);

            }

        }

        if (btnRT.pressed) {

            if (!this.#RTPressed) {

                this.#logger.log(`gamepad button RT pressed: ${btnRT.pressed}, value: ${btnRT.value}`);

                this.#RTPressed = true;
                eventDispatcher.publish(messageType, actions.SHOOT, world.current, this.#RTPressed);

                this.#logger.log(`shoot: ${this.#RTPressed}`);


            }

        } else {

            if (this.#RTPressed) {

                this.#logger.log(`gamepad button RT pressed: ${btnRT.pressed}, value: ${btnRT.value}`);

                this.#RTPressed = false;
                eventDispatcher.publish(messageType, actions.SHOOT, world.current, this.#RTPressed);

                this.#logger.log(`shoot: ${this.#RTPressed}`);

            }

        }

    }

    processPdaButtonEvents() {

        this.#logger.func = 'processPdaButtonEvents';

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.PDA;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const world = this.attachTo;

        const btnUp = this.gamepad.buttons[12];
        const btnDown = this.gamepad.buttons[13];
        const btnLeft = this.gamepad.buttons[14];
        const btnRight = this.gamepad.buttons[15];
        const btnA = this.gamepad.buttons[0];
        const btnB = this.gamepad.buttons[1];
        const btnLB = this.gamepad.buttons[4];
        const btnRB = this.gamepad.buttons[5];

        if (btnUp.pressed) {

            if (!this.#UpPressed) {

                this.#logger.log(`gamepad button up pressed: ${btnUp.pressed}, value: ${btnUp.value}`);

                this.#UpPressed = true;
                eventDispatcher.publish(messageType, actions.UP, world.current, this.#UpPressed);

                this.#logger.log(`up: ${this.#UpPressed}`);

            }

        } else {

            if (this.#UpPressed) {

                this.#logger.log(`gamepad button up pressed: ${btnUp.pressed}, value: ${btnUp.value}`);

                this.#UpPressed = false;
                eventDispatcher.publish(messageType, actions.UP, world.current, this.#UpPressed);

                this.#logger.log(`up: ${this.#UpPressed}`);

            }

        }

        if (btnDown.pressed) {

            if (!this.#DownPressed) {

                this.#logger.log(`gamepad button down pressed: ${btnDown.pressed}, value: ${btnDown.value}`);

                this.#DownPressed = true;
                eventDispatcher.publish(messageType, actions.DOWN, world.current, this.#DownPressed);

                this.#logger.log(`down: ${this.#DownPressed}`);

            }

        } else {

            if (this.#DownPressed) {

                this.#logger.log(`gamepad button down pressed: ${btnDown.pressed}, value: ${btnDown.value}`);

                this.#DownPressed = false;
                eventDispatcher.publish(messageType, actions.DOWN, world.current, this.#DownPressed);

                this.#logger.log(`down: ${this.#DownPressed}`);

            }

        }

        if (btnLeft.pressed) {

            if (!this.#leftPressed) {

                this.#logger.log(`gamepad button left pressed: ${btnLeft.pressed}, value: ${btnLeft.value}`);

                this.#leftPressed = true;
                eventDispatcher.publish(messageType, actions.LEFT, world.current, this.#leftPressed);

                this.#logger.log(`left: ${this.#leftPressed}`);

            }

        } else {

            if (this.#leftPressed) {

                this.#logger.log(`gamepad button left pressed: ${btnLeft.pressed}, value: ${btnLeft.value}`);

                this.#leftPressed = false;
                eventDispatcher.publish(messageType, actions.LEFT, world.current, this.#leftPressed);

                this.#logger.log(`left: ${this.#leftPressed}`);

            }

        }

        if (btnRight.pressed) {

            if (!this.#rightPressed) {

                this.#logger.log(`gamepad button right pressed: ${btnRight.pressed}, value: ${btnRight.value}`);

                this.#rightPressed = true;
                eventDispatcher.publish(messageType, actions.RIGHT, world.current, this.#rightPressed);

                this.#logger.log(`right: ${this.#rightPressed}`);

            }

        } else {

            if (this.#rightPressed) {

                this.#logger.log(`gamepad button right pressed: ${btnRight.pressed}, value: ${btnRight.value}`);

                this.#rightPressed = false;
                eventDispatcher.publish(messageType, actions.RIGHT, world.current, this.#rightPressed);

                this.#logger.log(`right: ${this.#rightPressed}`);

            }

        }

        if (btnA.pressed) {

            if (!this.#APressed) {

                this.#logger.log(`gamepad button A pressed: ${btnA.pressed}, value: ${btnA.value}`);

                this.#APressed = true;
                eventDispatcher.publish(messageType, actions.CONFIRM, world.current, this.#APressed);

                this.#logger.log(`confirm: ${this.#APressed}`);

            }

        } else {

            if (this.#APressed) {

                this.#logger.log(`gamepad button A pressed: ${btnA.pressed}, value: ${btnA.value}`);

                this.#APressed = false;
                eventDispatcher.publish(messageType, actions.CONFIRM, world.current, this.#APressed);

                this.#logger.log(`confirm: ${this.#APressed}`);

            }

        }

        if (btnB.pressed) {

            if (!this.#BPressed) {

                this.#logger.log(`gamepad button B pressed: ${btnB.pressed}, value: ${btnB.value}`);

                this.#BPressed = true;
                eventDispatcher.publish(messageType, actions.CANCEL, world.current, this.#BPressed);

                this.#logger.log(`cancel: ${this.#BPressed}`);

            }

        } else {

            if (this.#BPressed) {

                this.#logger.log(`gamepad button B pressed: ${btnB.pressed}, value: ${btnB.value}`);

                this.#BPressed = false;
                eventDispatcher.publish(messageType, actions.CANCEL, world.current, this.#BPressed);

                this.#logger.log(`cancel: ${this.#BPressed}`);

            }

        }

        if (btnLB.pressed) {

            if (!this.#LBPressed) {

                this.#logger.log(`gamepad button LB pressed: ${btnLB.pressed}, value: ${btnLB.value}`);

                this.#LBPressed = true;
                eventDispatcher.publish(messageType, actions.SHIFT_LEFT, world.current, this.#LBPressed);

                this.#logger.log(`shiftLeft: ${this.#LBPressed}`);

            }

        } else {

            if (this.#LBPressed) {

                this.#logger.log(`gamepad button LB pressed: ${btnLB.pressed}, value: ${btnLB.value}`);

                this.#LBPressed = false;
                eventDispatcher.publish(messageType, actions.SHIFT_LEFT, world.current, this.#LBPressed);

                this.#logger.log(`shiftLeft: ${this.#LBPressed}`);

            }

        }

        if (btnRB.pressed) {

            if (!this.#RBPressed) {

                this.#logger.log(`gamepad button RB pressed: ${btnRB.pressed}, value: ${btnRB.value}`);

                this.#RBPressed = true;
                eventDispatcher.publish(messageType, actions.SHIFT_RIGHT, world.current, this.#RBPressed);

                this.#logger.log(`shiftRight: ${this.#RBPressed}`);

            }

        } else {

            if (this.#RBPressed) {

                this.#logger.log(`gamepad button RB pressed: ${btnRB.pressed}, value: ${btnRB.value}`);

                this.#RBPressed = false;
                eventDispatcher.publish(messageType, actions.SHIFT_RIGHT, world.current, this.#RBPressed);

                this.#logger.log(`shiftRight: ${this.#RBPressed}`);

            }

        }

    }

}

export { XBoxController };