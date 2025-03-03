import { InputBase } from "../InputBase";
import { Logger } from "../../Logger";

const DEBUG = false;

class XBoxController extends InputBase {

    connected = false;
    gamepad = null;

    #LStickMoveLeft = false;
    #LStickMoveRight = false;
    #LStickMoveUp = false;
    #LStickMoveDown = false;
    #APressed = false;
    #XPressed = false;
    #YPressed = false;
    #RBPressed = false;
    #LTPressed = false;
    #RTPressed = false;

    #logger = new Logger(DEBUG, 'XBoxController');

    constructor(specs) {

        super(specs);

    }

    bindGamepadEvents() {

        this.#logger.func = 'bindGamepadEvents';

        window.addEventListener("gamepadconnected", (e) => {

            const gp = navigator.getGamepads()[e.gamepad.index];

            this.#logger.log(`Gamepad connected at index ${gp.index}: ${gp.id}. ${gp.buttons.length} buttons, ${gp.axes.length} axes.`);


        });

        window.addEventListener("gamepaddisconnected", (e) => {

            const gp = e.gamepad;

            this.#logger.log(`Gamepad disconnected at index ${gp.index}: ${gp.id}. ${gp.buttons.length} buttons, ${gp.axes.length} axes.`);

        });

    }

    tick() {

        if (this.controlType === InputBase.MOVEMENT_TYPE.TANKMOVE) {

            this.tankmoveTick();

        }

    }

    tankmoveTick() {        

        this.gamepad = navigator.getGamepads()[0];

        if (this.gamepad?.connected) {

            this.processTankmoveButtonEvents();
            this.processTankmoveStickEvents();

        }

    }

    processTankmoveStickEvents() {

        this.#logger.func = 'processTankmoveStickEvents';

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.MOVEMENT_TYPE.TANKMOVE;
        const actions = InputBase.MOVE_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const world = this.attachTo;

        const leftStickH = this.gamepad.axes[0];
        const leftStickV = this.gamepad.axes[1];
        
        const validMin = 0.4;
        const forwardValidMin = 0.1;
        const backwardValidMin = 0.45;

        if (leftStickH <= - validMin) {

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

        if (leftStickH >= validMin) {

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

        if (leftStickV <= - forwardValidMin) {

            if (!this.#LStickMoveUp) {

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

        if (leftStickV >= backwardValidMin) {

            if (!this.#LStickMoveDown) {

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
        const messageType = InputBase.MOVEMENT_TYPE.TANKMOVE;
        const actions = InputBase.MOVE_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
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

            this.#logger.log(`gamepad button LB pressed: ${btnLB.pressed}, value: ${btnLB.value}`);

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

}

export { XBoxController };