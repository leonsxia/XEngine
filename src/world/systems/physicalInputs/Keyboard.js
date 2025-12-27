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
    #btnUp = false;
    #btnDown = false;
    #btnLeft = false;
    #btnRight = false;
    #btnA = false;
    #btnB = false;
    #btnLB = false;
    #btnRB = false;
    #btnX = false;
    #btnLT = false;
    #btnRT = false;

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

            const tpc = world.currentScene.thirdPersonCamera;

            switch (e.key) {

                case I.lower:
                case I.upper:

                    if (!I.isDown) {

                        I.isDown = true;
                        this.#inventory = true;

                        // this.#logger.log('pda');
                        eventDispatcher.publish(messageType, actions.INVENTORY_INFO, world.current, this.#inventory);

                        if (tpc?.enabled) {

                            if (world.currentScene.isPdaOn) {

                                tpc.disablePointerLock();

                            } else {

                                tpc.enablePointerLock();
                                setTimeout(()=> {
                                    
                                    tpc.enablePointerLock();
                                
                                }, 1000);
                                

                            }

                        }

                    }

                    break;

                case Tab.code:

                    if (!Tab.isDown) {

                        Tab.isDown = true;
                        this.#pda = true;

                        // this.#logger.log('tab');
                        eventDispatcher.publish(messageType, actions.PDA_INFO, world.current, true);

                        if (tpc?.enabled) {

                            if (world.currentScene.isPdaOn) {

                                tpc.disablePointerLock();

                            } else {

                                tpc.enablePointerLock();
                                setTimeout(()=> {
                                    
                                    tpc.enablePointerLock();
                                
                                }, 1000);

                            }

                        }

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
        const { A, D, W, S, J, K, L, Q, E, Z, C, Shift } = Keyboard.KEYS;
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

                            this.#btnLeft = true;

                            eventDispatcher.publish(messageType, actions.BTN_LEFT, world.current, this.#btnLeft);

                        } else {

                            this.#btnRight = false;

                            eventDispatcher.publish(messageType, actions.BTN_RIGHT, world.current, this.#btnRight);

                        }

                    }

                    break;

                case D.lower:
                case D.upper:
                case 'ArrowRight':

                    if (!D.isDown) {

                        D.isDown = true;

                        if (!A.isDown) {

                            this.#btnRight = true;

                            eventDispatcher.publish(messageType, actions.BTN_RIGHT, world.current, this.#btnRight);

                        } else {

                            this.#btnLeft = false;

                            eventDispatcher.publish(messageType, actions.BTN_LEFT, world.current, this.#btnLeft);

                        }

                    }

                    break;

                case W.lower:
                case W.upper:
                case 'ArrowUp':

                    if (!W.isDown) {

                        W.isDown = true;

                        if (!S.isDown) {

                            this.#btnUp = true;

                            eventDispatcher.publish(messageType, actions.BTN_UP, world.current, this.#btnUp);

                        } else {

                            this.#btnDown = false;

                            eventDispatcher.publish(messageType, actions.BTN_DOWN, world.current, this.#btnDown);

                        }

                    }

                    break;

                case S.lower:
                case S.upper:
                case 'ArrowDown':

                    if (!S.isDown) {

                        S.isDown = true;

                        if (!W.isDown) {

                            this.#btnDown = true;

                            eventDispatcher.publish(messageType, actions.BTN_DOWN, world.current, this.#btnDown);

                        } else {

                            this.#btnUp = false;

                            eventDispatcher.publish(messageType, actions.BTN_UP, world.current, this.#btnUp);

                        }

                    }

                    break;

                case Q.lower:
                case Q.upper:

                    if (!Q.isDown) {

                        Q.isDown = true;
                        this.#btnLB = true;
                        eventDispatcher.publish(messageType, actions.BTN_LB, world.current, this.#btnLB);

                    }

                    break;

                case E.lower:
                case E.upper:

                    if (!E.isDown) {

                        E.isDown = true;
                        this.#btnRB = true;
                        eventDispatcher.publish(messageType, actions.BTN_RB, world.current, this.#btnRB);

                    }

                    break;

                case Z.lower:
                case Z.upper:

                    if (!Z.isDown) {

                        Z.isDown = true;
                        this.#btnLT = true;
                        eventDispatcher.publish(messageType, actions.BTN_LT, world.current, this.#btnLT);

                    }

                    break;

                case C.lower:
                case C.upper:

                    if (!C.isDown) {

                        C.isDown = true;
                        this.#btnRT = true;
                        eventDispatcher.publish(messageType, actions.BTN_RT, world.current, this.#btnRT);

                    }

                    break;

                case J.lower:
                case J.upper:

                    if (!J.isDown) {

                        J.isDown = true;
                        this.#btnA = true;

                        eventDispatcher.publish(messageType, actions.BTN_A, world.current, this.#btnA);

                    }

                    break;

                case K.lower:
                case K.upper:

                    if (!K.isDown) {

                        K.isDown = true;
                        this.#btnB = true;

                        eventDispatcher.publish(messageType, actions.BTN_B, world.current, this.#btnB);

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
                        this.#btnX = true;

                        eventDispatcher.publish(messageType, actions.BTN_X, world.current, this.#btnX);

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

                        this.#btnRight = true;

                        eventDispatcher.publish(messageType, actions.BTN_RIGHT, world.current, this.#btnRight);

                    } else {

                        this.#btnLeft = false;

                        eventDispatcher.publish(messageType, actions.BTN_LEFT, world.current, this.#btnLeft);

                    }

                    A.isDown = false;

                    break;

                case D.lower:
                case D.upper:
                case 'ArrowRight':

                    if (A.isDown) {

                        this.#btnLeft = true;

                        eventDispatcher.publish(messageType, actions.BTN_LEFT, world.current, this.#btnLeft);

                    } else {

                        this.#btnRight = false;

                        eventDispatcher.publish(messageType, actions.BTN_RIGHT, world.current, this.#btnRight);

                    }

                    D.isDown = false;

                    break;

                case W.lower:
                case W.upper:
                case 'ArrowUp':

                    if (S.isDown) {

                        this.#btnDown = true;

                        eventDispatcher.publish(messageType, actions.BTN_DOWN, world.current, this.#btnDown);

                    } else {

                        this.#btnUp = false;

                        eventDispatcher.publish(messageType, actions.BTN_UP, world.current, this.#btnUp);

                    }

                    W.isDown = false;

                    break;

                case S.lower:
                case S.upper:
                case 'ArrowDown':

                    if (W.isDown) {

                        this.#btnUp = true;

                        eventDispatcher.publish(messageType, actions.BTN_UP, world.current, this.#btnUp);

                    } else {

                        this.#btnDown = false;

                        eventDispatcher.publish(messageType, actions.BTN_DOWN, world.current, this.#btnDown);

                    }

                    S.isDown = false;

                    break;

                case Q.lower:
                case Q.upper:

                    Q.isDown = false;
                    this.#btnLB = false;
                    eventDispatcher.publish(messageType, actions.BTN_LB, world.current, this.#btnLB);

                    break;

                case E.lower:
                case E.upper:

                    E.isDown = false;
                    this.#btnRB = false;
                    eventDispatcher.publish(messageType, actions.BTN_RB, world.current, this.#btnRB);

                    break;

                case Z.lower:
                case Z.upper:

                    Z.isDown = false;
                    this.#btnLT = false;
                    eventDispatcher.publish(messageType, actions.BTN_LT, world.current, this.#btnLT);

                    break;

                case C.lower:
                case C.upper:

                    C.isDown = false;
                    this.#btnRT = false;
                    eventDispatcher.publish(messageType, actions.BTN_RT, world.current, this.#btnRT);

                    break;

                case J.lower:
                case J.upper:

                    J.isDown = false;
                    this.#btnA = false;
                    eventDispatcher.publish(messageType, actions.BTN_A, world.current, this.#btnA);

                    break;

                case K.lower:
                case K.upper:

                    K.isDown = false;
                    this.#btnB = false;
                    eventDispatcher.publish(messageType, actions.BTN_B, world.current, this.#btnB);

                    break;

                case L.lower:
                case L.upper:

                    L.isDown = false;

                    break;

                case Shift.code:

                    Shift.isDown = false;
                    this.#btnX = false;

                    eventDispatcher.publish(messageType, actions.BTN_X, world.current, this.#btnX);

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
    Z: { upper: 'Z', lower: 'z', isDown: false },
    C: { upper: 'C', lower: 'c', isDown: false },
    Tab: { code: 'Tab', isDown: false },
    Shift: { code: 'Shift', isDown: false },
    Space: { code: ' ', isDown: false }
};

export { Keyboard };