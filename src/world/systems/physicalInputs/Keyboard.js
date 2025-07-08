import { Logger } from "../Logger";
import { InputBase } from "./InputBase";

const DEBUG = false;

class Keyboard extends InputBase {

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

    #logger = new Logger(DEBUG, 'Keyboard');

    constructor(specs) {

        super(specs);

    }

    bindAllMoves() {

        if (this.controlTypes.includes(InputBase.CONTROL_TYPES.TANKMOVE)) {

            this.bindKeysToTankMove();

        }

    }

    bindKeysToTankMove() {

        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.TANKMOVE;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const { A, D, W, S, J, K, L, P, F, I, Tab, Shift, Space } = Keyboard.KEYS;
        const world = this.attachTo;

        window.addEventListener('keydown', e => {

            if (!world.currentScene || world.currentScene.isScenePaused()) return;

            e.preventDefault(); // prevent default browser behavior for keys

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
                
                case I.lower:
                case I.upper:

                    I.isDown = false;
                    this.#inventory = false;

                    // this.#logger.log('cancel pda');
                    eventDispatcher.publish(messageType, actions.INVENTORY_INFO, world.current, this.#inventory);

                    break;

                case Tab.code:

                    Tab.isDown = false;
                    this.#pda = false;

                    // this.#logger.log('cancel tab');
                    eventDispatcher.publish(messageType, actions.PDA_INFO, world.current, this.#pda);

                    break;

            }

        });

    }

    bindKeysToOtherMove() {

        window.addEventListener('keydown', e => {

            switch (e.key) {
                case 'a':
                case 'A':
                case 'ArrowLeft':

                    this.#logger.log('other left');
                    break;

                case 'd':
                case 'D':
                case 'ArrowRight':

                    this.#logger.log('other right');
                    break;

                case 'w':
                case 'W':
                case 'ArrowUp':

                    this.#logger.log('other up');
                    break;

                case 's':
                case 'S':
                case 'ArrowDown':

                    this.#logger.log('other down');
                    break;

                case 'Shift':

                    break;

                case ' ':

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
    Tab: { code: 'Tab', isDown: false },
    Shift: { code: 'Shift', isDown: false },
    Space: { code: ' ', isDown: false }
};

export { Keyboard };