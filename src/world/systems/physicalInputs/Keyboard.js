import { CONTROL_TYPES } from "../../components/utils/constants";
import { Logger } from "../Logger";
import { InputBase } from "./InputBase";

const DEBUG = false;

class Keyboard extends InputBase {

    // player tankmove and others
    #movingLeft = false;
    #movingRight = false;
    #movingForward = false;
    #movingBackward = false;
    #accelerate = false;
    #jump = false;
    #melee = false;
    #interact = false;
    #gunPointing = false;
    #shoot = false;
    #nextAimTarget = false;
    #pda = false;
    #inventory = false;

    // pda
    #up = false;
    #down = false;
    #left = false;
    #right = false;
    #confirm = false;
    #cancel = false;
    #shiftLeft = false;
    #shiftRight = false;
    #moveItem = false;

    #logger = new Logger(DEBUG, 'Keyboard');

    constructor(specs) {

        super(specs);

    }

    static get isKeyboardOn() {

        let isOn = false;
        for (const key in Keyboard.KEYS) {

            if (Keyboard.KEYS[key].isDown) {
                isOn = true;
                break;
            }

        }

        return isOn;

    }

    bindAllMoves() {

        this.bindTriggerEvents();

        if (this.controlTypes.includes(InputBase.CONTROL_TYPES.TANKMOVE)) {

            this.bindKeysToTankMove();
            this.bindKeysToPdaTriggers();

        }

        if (this.controlTypes.includes(InputBase.CONTROL_TYPES.PDA)) {
            
            this.bindKeysToPdaControl();

        }

    }

    bindTriggerEvents() {

         window.addEventListener('keydown', e => {

            const world = this.attachTo;

            if (!world.currentScene || world.currentScene.isScenePaused()) return;

            e.preventDefault(); // prevent default browser behavior for keys

            this.attachTo.switchInput(CONTROL_TYPES.KEYBOARD);

         });

    }

    recoverMoveEventFromPda() {

        if (this.attachTo.currentScene.isPdaOn) return;

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.TANKMOVE;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const { A, D, W, S, J, K, L, Shift } = Keyboard.KEYS;
        const world = this.attachTo;

        // recover move events
        if (A.isDown && !this.#movingLeft) {

            if (!D.isDown) {

                this.#movingLeft = true;
                eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#movingLeft);

            }

        } else if (!A.isDown && this.#movingLeft) {

            this.#movingLeft = false;
            eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#movingLeft);

        }

        if (D.isDown && !this.#movingRight) {

            if (!A.isDown) {

                this.#movingRight = true;
                eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#movingRight);

            }

        } else if (!D.isDown && this.#movingRight) {

            this.#movingRight = false;
            eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#movingRight);

        }

        if (W.isDown && !this.#movingForward) {

            if (!S.isDown) {

                this.#movingForward = true;
                eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#movingForward);

            }

        } else if (!W.isDown && this.#movingForward) {

            this.#movingForward = false;
            eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#movingForward);

        }

        if (S.isDown && !this.#movingBackward) {

            if (!W.isDown) {

                this.#movingBackward = true;
                eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#movingBackward);

            }

        } else if (!S.isDown && this.#movingBackward) {

            this.#movingBackward = false;
            eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#movingBackward);

        }

        if (Shift.isDown && !this.#accelerate) {

            this.#accelerate = true;
            eventDispatcher.publish(messageType, actions.ACCELERATE, world.current, this.#accelerate);

        } else if (!Shift.isDown && this.#accelerate) {

            this.#accelerate = false;
            eventDispatcher.publish(messageType, actions.ACCELERATE, world.current, this.#accelerate);

        }

        if (J.isDown && !this.#gunPointing) {

            this.#gunPointing = true;
            eventDispatcher.publish(messageType, actions.GUN_POINT, world.current, this.#gunPointing);

        }

        if (K.isDown && !this.#shoot) {

            this.#shoot = true;
            eventDispatcher.publish(messageType, actions.SHOOT, world.current, this.#shoot);

        }

        if (L.isDown && !this.#melee) {

            this.#melee = true;
            eventDispatcher.publish(messageType, actions.MELEE, world.current, this.#melee);

        }

    }

    bindKeysToPdaTriggers() {

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.TANKMOVE;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const { I, Tab } = Keyboard.KEYS;
        const world = this.attachTo;

         window.addEventListener('keydown', e => {

            if (!world.currentScene || world.currentScene.isScenePaused()) return;

            switch (e.key) {

                case I.lower:
                case I.upper:

                    if (!I.isDown) {

                        I.isDown = true;
                        this.#inventory = true;

                        // this.#logger.log('pda');
                        eventDispatcher.publish(messageType, actions.INVENTORY_INFO, world.current, this.#inventory);

                    }

                    break;

                case Tab.code:

                    if (!Tab.isDown) {

                        Tab.isDown = true;
                        this.#pda = true;

                        // this.#logger.log('tab');
                        eventDispatcher.publish(messageType, actions.PDA_INFO, world.current, true);

                     }

                     break;

             }

        });

        window.addEventListener('keyup', e => {

            if (!world.currentScene || world.currentScene.isScenePaused()) return;

            switch (e.key) {

                case I.lower:
                case I.upper:

                    I.isDown = false;
                    this.#inventory = false;

                    // this.#logger.log('cancel pda');
                    eventDispatcher.publish(messageType, actions.INVENTORY_INFO, world.current, this.#inventory);

                    this.recoverMoveEventFromPda();

                    break;

                case Tab.code:

                    Tab.isDown = false;
                    this.#pda = false;

                    // this.#logger.log('cancel tab');
                    eventDispatcher.publish(messageType, actions.PDA_INFO, world.current, this.#pda);

                    this.recoverMoveEventFromPda();
                    // make sure when pda is on the gui and cursor should hide
                    world.switchInput(CONTROL_TYPES.KEYBOARD);

                    break;

            }

        });

    }

    bindKeysToTankMove() {

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.TANKMOVE;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const { A, D, W, S, J, K, L, P, F, Shift, Space } = Keyboard.KEYS;
        const world = this.attachTo;

        window.addEventListener('keydown', e => {

            if (!world.currentScene || world.currentScene.isScenePaused() || world.currentScene.isPdaOn) return;

            switch (e.key) {
                case A.lower:
                case A.upper:
                case 'ArrowLeft':

                    if (!A.isDown) {

                        A.isDown = true;

                        if (!D.isDown) {

                            // this.#logger.log('<');
                            this.#movingLeft = true;

                            eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#movingLeft);

                        } else {

                            // this.#logger.log('stop >'); // stop on local x
                            this.#movingRight = false;

                            eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#movingRight);

                        }

                        // this.logMovement();

                    }

                    break;

                case D.lower:
                case D.upper:
                case 'ArrowRight':

                    if (!D.isDown) {

                        D.isDown = true;

                        if (!A.isDown) {

                            // this.#logger.log('>');
                            this.#movingRight = true;

                            eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#movingRight);

                        } else {

                            // this.#logger.log('stop <'); // stop on local x
                            this.#movingLeft = false;

                            eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#movingLeft);

                        }

                        // this.logMovement();

                    }

                    break;

                case W.lower:
                case W.upper:
                case 'ArrowUp':

                    if (!W.isDown) {

                        W.isDown = true;

                        if (!S.isDown) {

                            // this.#logger.log('^');
                            this.#movingForward = true;

                            eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#movingForward);

                        } else {

                            // this.#logger.log('stop v');
                            this.#movingBackward = false;

                            eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#movingBackward);

                        }

                        // this.logMovement();

                    }

                    break;

                case S.lower:
                case S.upper:
                case 'ArrowDown':

                    if (!S.isDown) {

                        S.isDown = true;

                        if (!W.isDown) {

                            // this.#logger.log('v');
                            this.#movingBackward = true;

                            eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#movingBackward);

                        } else {

                            // this.#logger.log('stop ^');
                            this.#movingForward = false;

                            eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#movingForward);

                        }

                        // this.logMovement();

                    }

                    break;

                case L.lower:
                case L.upper:

                    if (!L.isDown) {

                        L.isDown = true;
                        this.#melee = true;

                        // this.#logger.log('melee');
                        eventDispatcher.publish(messageType, actions.MELEE, world.current, this.#melee);

                    }

                    break;

                case J.lower:
                case J.upper:

                    if (!J.isDown) {

                        J.isDown = true;
                        this.#gunPointing = true;

                        // this.#logger.log('gun pointing');
                        eventDispatcher.publish(messageType, actions.GUN_POINT, world.current, this.#gunPointing);

                    }

                    break;

                case K.lower:
                case K.upper:

                    if (!K.isDown) {

                        K.isDown = true;
                        this.#shoot = true;

                        // this.#logger.log('gun shooting');
                        eventDispatcher.publish(messageType, actions.SHOOT, world.current, this.#shoot);

                    }

                    break;

                case F.lower:
                case F.upper:

                    if (!F.isDown) {

                        F.isDown = true;
                        this.#interact = true;

                        // this.#logger.log('interact');
                        eventDispatcher.publish(messageType, actions.INTERACT, world.current, this.#interact);

                    }

                    break;

                case P.lower:
                case P.upper:

                    if (!P.isDown) {

                        P.isDown = true;
                        this.#nextAimTarget = true;

                        // this.#logger.log('nextAimTarget');
                        eventDispatcher.publish(messageType, actions.NEXT_AIM_TARGET, world.current, this.#nextAimTarget);

                    }

                    break;

                case Shift.code:

                    if (!Shift.isDown) {

                        Shift.isDown = true;
                        this.#accelerate = true;

                        // this.#logger.log('faster!');
                        eventDispatcher.publish(messageType, actions.ACCELERATE, world.current, this.#accelerate);

                    }

                    break;

                case Space.code:

                    if (!Space.isDown) {

                        Space.isDown = true;
                        this.#jump = true;

                        eventDispatcher.publish(messageType, actions.JUMP, world.current, this.#jump);

                    }

                    break;

            }
        });

        window.addEventListener('keyup', e => {

            if (!world.currentScene || world.currentScene.isScenePaused() || world.currentScene.isPdaOn) return;

            switch (e.key) {
                case A.lower:
                case A.upper:
                case 'ArrowLeft':
                    if (D.isDown) {

                        // this.#logger.log('>');
                        this.#movingRight = true;

                        eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#movingRight);

                    } else {

                        // this.#logger.log('stop <'); // stop on local x
                        this.#movingLeft = false;

                        eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#movingLeft);

                    }

                    A.isDown = false;

                    // this.logMovement();

                    break;

                case D.lower:
                case D.upper:
                case 'ArrowRight':

                    if (A.isDown) {

                        // this.#logger.log('<');
                        this.#movingLeft = true;

                        eventDispatcher.publish(messageType, actions.MOVE_LEFT, world.current, this.#movingLeft);

                    } else {

                        // this.#logger.log('stop >'); // stop on local x
                        this.#movingRight = false;

                        eventDispatcher.publish(messageType, actions.MOVE_RIGHT, world.current, this.#movingRight);

                    }

                    D.isDown = false;

                    // this.logMovement();

                    break;

                case W.lower:
                case W.upper:
                case 'ArrowUp':

                    if (S.isDown) {

                        // this.#logger.log('v');
                        this.#movingBackward = true;

                        eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#movingBackward);

                    } else {

                        // this.#logger.log('stop ^'); // stop on local z
                        this.#movingForward = false;

                        eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#movingForward);

                    }

                    W.isDown = false;

                    // this.logMovement();

                    break;

                case S.lower:
                case S.upper:
                case 'ArrowDown':

                    if (W.isDown) {

                        // this.#logger.log('^');
                        this.#movingForward = true;

                        eventDispatcher.publish(messageType, actions.MOVE_FORWARD, world.current, this.#movingForward);

                    } else {

                        // this.#logger.log('stop v'); // stop on local z
                        this.#movingBackward = false;

                        eventDispatcher.publish(messageType, actions.MOVE_BACKWARD, world.current, this.#movingBackward);

                    }

                    S.isDown = false;

                    // this.logMovement();

                    break;

                case L.lower:
                case L.upper:

                    L.isDown = false;
                    this.#melee = false;

                    // this.#logger.log('cancel melee');
                    eventDispatcher.publish(messageType, actions.MELEE, world.current, this.#melee);

                    break;

                case J.lower:
                case J.upper:

                    J.isDown = false;
                    this.#gunPointing = false;

                    // this.#logger.log('cancel gun pointing');
                    eventDispatcher.publish(messageType, actions.GUN_POINT, world.current, this.#gunPointing);

                    break;

                case K.lower:
                case K.upper:

                    K.isDown = false;
                    this.#shoot = false;

                    // this.#logger.log('cancel gun shoot');
                    eventDispatcher.publish(messageType, actions.SHOOT, world.current, this.#shoot);

                    break;

                case F.lower:
                case F.upper:

                    F.isDown = false;
                    this.#interact = false;

                    // this.#logger.log('cancel interact');
                    eventDispatcher.publish(messageType, actions.INTERACT, world.current, this.#interact);

                    break;

                case P.lower:
                case P.upper:

                    P.isDown = false;
                    this.#nextAimTarget = false;

                    // this.#logger.log('cancel nextAimTarget');
                    eventDispatcher.publish(messageType, actions.NEXT_AIM_TARGET, world.current, this.#nextAimTarget);

                    break;

                case Shift.code:

                    Shift.isDown = false;
                    this.#accelerate = false;

                    // this.#logger.log('slow down');
                    eventDispatcher.publish(messageType, actions.ACCELERATE, world.current, this.#accelerate);

                    break;

                case Space.code:

                    Space.isDown = false;
                    this.#jump = false;

                    eventDispatcher.publish(messageType, actions.JUMP, world.current, this.#jump);

                    break;

            }

        });

    }

    bindKeysToPdaControl() {

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.PDA;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const { A, D, W, S, J, K, L, Q, E, Shift } = Keyboard.KEYS;
        const world = this.attachTo;

        window.addEventListener('keydown', e => {

            if (!world.currentScene || !world.currentScene.isPdaOn) return;

            switch (e.key) {
                case A.lower:
                case A.upper:
                case 'ArrowLeft':

                    if (!A.isDown) {

                        A.isDown = true;

                        if (!D.isDown) {

                            this.#left = true;

                            eventDispatcher.publish(messageType, actions.LEFT, world.current, this.#left);

                        } else {

                            this.#right = false;

                            eventDispatcher.publish(messageType, actions.RIGHT, world.current, this.#right);

                        }

                    }

                    break;

                case D.lower:
                case D.upper:
                case 'ArrowRight':

                    if (!D.isDown) {

                        D.isDown = true;

                        if (!A.isDown) {

                            this.#right = true;

                            eventDispatcher.publish(messageType, actions.RIGHT, world.current, this.#right);

                        } else {

                            this.#left = false;

                            eventDispatcher.publish(messageType, actions.LEFT, world.current, this.#left);

                        }

                    }

                    break;

                case W.lower:
                case W.upper:
                case 'ArrowUp':

                    if (!W.isDown) {

                        W.isDown = true;

                        if (!S.isDown) {

                            this.#up = true;

                            eventDispatcher.publish(messageType, actions.UP, world.current, this.#up);

                        } else {

                            this.#down = false;

                            eventDispatcher.publish(messageType, actions.DOWN, world.current, this.#down);

                        }

                    }

                    break;

                case S.lower:
                case S.upper:
                case 'ArrowDown':

                    if (!S.isDown) {

                        S.isDown = true;

                        if (!W.isDown) {

                            this.#down = true;

                            eventDispatcher.publish(messageType, actions.DOWN, world.current, this.#down);

                        } else {

                            this.#up = false;

                            eventDispatcher.publish(messageType, actions.UP, world.current, this.#up);

                        }

                    }

                    break;

                case Q.lower:
                case Q.upper:

                    if (!Q.isDown) {

                        Q.isDown = true;

                        if (!E.isDown) {

                            this.#shiftLeft = true;

                            eventDispatcher.publish(messageType, actions.SHIFT_LEFT, world.current, this.#shiftLeft);

                        } else {

                            this.#shiftRight = false;

                            eventDispatcher.publish(messageType, actions.SHIFT_RIGHT, world.current, this.#shiftRight);

                        }

                    }

                    break;

                case E.lower:
                case E.upper:

                    if (!E.isDown) {

                        E.isDown = true;

                        if (!Q.isDown) {

                            this.#shiftRight = true;

                            eventDispatcher.publish(messageType, actions.SHIFT_RIGHT, world.current, this.#shiftRight);

                        } else {

                            this.#shiftLeft = false;

                            eventDispatcher.publish(messageType, actions.SHIFT_LEFT, world.current, this.#shiftLeft);

                        }

                    }

                    break;

                case J.lower:
                case J.upper:

                    if (!J.isDown) {

                        J.isDown = true;
                        this.#confirm = true;

                        eventDispatcher.publish(messageType, actions.CONFIRM, world.current, this.#confirm);

                    }

                    break;

                case K.lower:
                case K.upper:

                    if (!K.isDown) {

                        K.isDown = true;
                        this.#cancel = true;

                        eventDispatcher.publish(messageType, actions.CANCEL, world.current, this.#cancel);

                    }

                    break;

                case L.lower:
                case L.upper:

                    if (!L.isDown) {

                        L.isDown = true;

                    }

                    break;

                case Shift.code:

                    if (!Shift.isDown) {

                        Shift.isDown = true;
                        this.#moveItem = true;

                        eventDispatcher.publish(messageType, actions.MOVE_ITEM, world.current, this.#moveItem);

                    }

                    break;
                
            }
        });

        window.addEventListener('keyup', e => {

            if (!world.currentScene || !world.currentScene.isPdaOn) return;

            switch (e.key) {
                case A.lower:
                case A.upper:
                case 'ArrowLeft':

                    if (D.isDown) {

                        this.#right = true;

                        eventDispatcher.publish(messageType, actions.RIGHT, world.current, this.#right);

                    } else {

                        this.#left = false;

                        eventDispatcher.publish(messageType, actions.LEFT, world.current, this.#left);

                    }

                    A.isDown = false;

                    break;

                case D.lower:
                case D.upper:
                case 'ArrowRight':

                    if (A.isDown) {

                        this.#left = true;

                        eventDispatcher.publish(messageType, actions.LEFT, world.current, this.#left);

                    } else {

                        this.#right = false;

                        eventDispatcher.publish(messageType, actions.RIGHT, world.current, this.#right);

                    }

                    D.isDown = false;

                    break;

                case W.lower:
                case W.upper:
                case 'ArrowUp':

                    if (S.isDown) {

                        this.#down = true;

                        eventDispatcher.publish(messageType, actions.DOWN, world.current, this.#down);

                    } else {

                        this.#up = false;

                        eventDispatcher.publish(messageType, actions.UP, world.current, this.#up);

                    }

                    W.isDown = false;

                    break;

                case S.lower:
                case S.upper:
                case 'ArrowDown':

                    if (W.isDown) {

                        this.#up = true;

                        eventDispatcher.publish(messageType, actions.UP, world.current, this.#up);

                    } else {

                        this.#down = false;

                        eventDispatcher.publish(messageType, actions.DOWN, world.current, this.#down);

                    }

                    S.isDown = false;

                    break;

                case Q.lower:
                case Q.upper:

                    if (E.isDown) {

                        this.#shiftRight = true;

                        eventDispatcher.publish(messageType, actions.SHIFT_RIGHT, world.current, this.#shiftRight);

                    } else {

                        this.#shiftLeft = false;

                        eventDispatcher.publish(messageType, actions.SHIFT_LEFT, world.current, this.#shiftLeft);

                    }

                    Q.isDown = false;

                    break;

                case E.lower:
                case E.upper:

                    if (Q.isDown) {

                        this.#shiftLeft = true;

                        eventDispatcher.publish(messageType, actions.SHIFT_LEFT, world.current, this.#shiftLeft);

                    } else {

                        this.#shiftRight = false;

                        eventDispatcher.publish(messageType, actions.SHIFT_RIGHT, world.current, this.#shiftRight);

                    }

                    E.isDown = false;

                    break;

                case J.lower:
                case J.upper:

                    J.isDown = false;
                    this.#confirm = false;

                    eventDispatcher.publish(messageType, actions.CONFIRM, world.current, this.#confirm);

                    break;

                case K.lower:
                case K.upper:

                    K.isDown = false;
                    this.#cancel = false;

                    eventDispatcher.publish(messageType, actions.CANCEL, world.current, this.#cancel);

                    break;

                case L.lower:
                case L.upper:

                    L.isDown = false;

                    break;

                case Shift.code:

                    Shift.isDown = false;
                    this.#moveItem = false;

                    eventDispatcher.publish(messageType, actions.MOVE_ITEM, world.current, this.#moveItem);

                    break;

            }

        });

    }

    logMovement() {

        this.#logger.log(`
            left:${this.#movingLeft} 
            right:${this.#movingRight} 
            forward:${this.#movingForward} 
            backward:${this.#movingBackward}`);

    }

}

Keyboard.KEYS = {
    A: { upper: 'A', lower: 'a', isDown: false },
    D: { upper: 'D', lower: 'd', isDown: false },
    W: { upper: 'W', lower: 'w', isDown: false },
    S: { upper: 'S', lower: 's', isDown: false },
    V: { upper: 'V', lower: 'v', isDown: false },
    J: { upper: 'J', lower: 'j', isDown: false },
    K: { upper: 'K', lower: 'k', isDown: false },
    L: { upper: 'L', lower: 'l', isDown: false },
    F: { upper: 'F', lower: 'f', isDown: false },
    P: { upper: 'P', lower: 'p', isDown: false },
    I: { upper: 'I', lower: 'i', isDown: false },
    Q: { upper: 'Q', lower: 'q', isDown: false },
    E: { upper: 'E', lower: 'e', isDown: false },
    Tab: { code: 'Tab', isDown: false },
    Shift: { code: 'Shift', isDown: false },
    Space: { code: ' ', isDown: false }
};

export { Keyboard };