import { CONTROL_TYPES } from "../../components/utils/constants";
import { Logger } from "../Logger";
import { InputBase } from "./InputBase";

const DEBUG = false;

class Mouse extends InputBase {

    _mouseDown = false;
    _leftBtnDown = false;
    _middleBtnDown = false;
    _rightBtnDown = false;

    #logger = new Logger(DEBUG, 'Mouse');

    constructor(specs) {

        super(specs);

    }

    get enabled() {

        const currentScene = this.attachTo.currentScene;
        return currentScene && !currentScene.isScenePaused() && 
            (currentScene.isPdaOn || currentScene.thirdPersonCamera?.enabled);

    }

    bindAllEvents() {

        this.bindMouseEvent();
        this.bindTouchEvent();

    }

    bindMouseEvent() {

        let oldX = 0;
        let oldY = 0;
        const eventDispatcher = this.eventDispatcher;
        const messageType = InputBase.CONTROL_TYPES.MOUSE;
        const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
        const world = this.attachTo;

        let mouseStopTimer;
        window.addEventListener('mousemove', (e) => {

            this.attachTo.switchInput(CONTROL_TYPES.MOUSE);

            if (!this.enabled) return;

            clearTimeout(mouseStopTimer);

            // Set a new timer to detect when the mousemove stops
            mouseStopTimer = setTimeout(() => {

                // This code will execute if no new 'mousemove' events occur for delay time
                this.#logger.log('mouse move activity has stopped!');
                eventDispatcher.publish(messageType, actions.L_CLICK_LEFT, world.current, false);
                eventDispatcher.publish(messageType, actions.L_CLICK_RIGHT, world.current, false);
                eventDispatcher.publish(messageType, actions.L_CLICK_UP, world.current, false);
                eventDispatcher.publish(messageType, actions.L_CLICK_DOWN, world.current, false);

            }, 50);

            let xDirection = '';
            let yDirection = '';
            const { width, height } = world.sceneClientSize;
            const blind = .01;

            if (e.pageX > oldX + width * blind) {

                xDirection = 'right';

            } else if (e.pageX < oldX - width * blind) {

                xDirection = 'left';

            }

            if (e.pageY > oldY + height * blind) {

                yDirection = 'down';

            } else if (e.pageY < oldY - height * blind) {

                yDirection = 'up';

            }

            if (this._mouseDown && this._leftBtnDown) {

                this.#logger.log(`mouse moving: X: ${xDirection}, Y: ${yDirection}`);
                switch (xDirection) {

                    case 'right':

                        eventDispatcher.publish(messageType, actions.L_CLICK_LEFT, world.current, false);
                        eventDispatcher.publish(messageType, actions.L_CLICK_RIGHT, world.current, true);
                        break;

                    case 'left':

                        eventDispatcher.publish(messageType, actions.L_CLICK_RIGHT, world.current, false);
                        eventDispatcher.publish(messageType, actions.L_CLICK_LEFT, world.current, true);
                        break;

                }

                switch (yDirection) {

                    case 'down':

                        eventDispatcher.publish(messageType, actions.L_CLICK_UP, world.current, false);
                        eventDispatcher.publish(messageType, actions.L_CLICK_DOWN, world.current, true);
                        break;

                    case 'up':

                        eventDispatcher.publish(messageType, actions.L_CLICK_DOWN, world.current, false);
                        eventDispatcher.publish(messageType, actions.L_CLICK_UP, world.current, true);
                        break;

                }

            }

            oldX = xDirection ? e.pageX : oldX;
            oldY = yDirection ? e.pageY : oldY;

        });

        window.addEventListener('mousedown', (e) => {

            if (!this.enabled) return;

            const eventDispatcher = this.eventDispatcher;
            const messageType = InputBase.CONTROL_TYPES.MOUSE;
            const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
            const world = this.attachTo;

            this._mouseDown = true;
            this.#logger.log(`mouse is down`);

            // 0 - left button, 1 - middle button, 2 - right button
            if (e.button === 0) {

                this._leftBtnDown = true;
                this.#logger.log(`mouse left button is down`);
                eventDispatcher.publish(messageType, actions.L_BTN, world.current, true);
                eventDispatcher.publish(messageType, actions.SHOOT, world.current, true);

            }

            if (e.button === 1) {

                this._middleBtnDown = true;
                this.#logger.log(`mouse middle button is down`);
                eventDispatcher.publish(messageType, actions.MELEE, world.current, true);

            }

            if (e.button === 2) {

                this._middleBtnDown = true;
                this.#logger.log(`mouse right button is down`);
                eventDispatcher.publish(messageType, actions.GUN_POINT, world.current, true);

            }

        });

        window.addEventListener('mouseup', (e) => {

            e.preventDefault();

            if (!this.enabled) return;

            const eventDispatcher = this.eventDispatcher;
            const messageType = InputBase.CONTROL_TYPES.MOUSE;
            const actions = InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES;
            const world = this.attachTo;

            if (e.button === 0) {
                
                this._leftBtnDown = false;
                this.#logger.log(`mouse left button is up`);
                eventDispatcher.publish(messageType, actions.L_CLICK_LEFT, world.current, false);
                eventDispatcher.publish(messageType, actions.L_CLICK_RIGHT, world.current, false);
                eventDispatcher.publish(messageType, actions.L_CLICK_UP, world.current, false);
                eventDispatcher.publish(messageType, actions.L_CLICK_DOWN, world.current, false);
                eventDispatcher.publish(messageType, actions.L_BTN, world.current, false);
                eventDispatcher.publish(messageType, actions.SHOOT, world.current, false);

            }

            if (e.button === 1) {

                this._middleBtnDown = false;
                this.#logger.log(`mouse middle button is up`);
                eventDispatcher.publish(messageType, actions.MELEE, world.current, false);

            }

            if (e.button === 2) {

                this._rightBtnDown = false;
                this.#logger.log(`mouse right button is up`);
                eventDispatcher.publish(messageType, actions.GUN_POINT, world.current, false);

            }

            if (!this._leftBtnDown && !this._rightBtnDown && !this._middleBtnDown) {

                this._mouseDown = false;                

            }

        });

        let wheelStopTimer;
        window.addEventListener('wheel', (e) => {

            if (!this.enabled) return;

            clearTimeout(wheelStopTimer);

            // Set a new timer to detect when the wheel stops
            wheelStopTimer = setTimeout(() => {

                // This code will execute if no new 'wheel' events occur for delay time
                this.#logger.log('wheel activity has stopped!');
                eventDispatcher.publish(messageType, actions.SCROLL_UP, world.current, false);
                eventDispatcher.publish(messageType, actions.SCROLL_DOWN, world.current, false);

            }, 50);

            if (e.deltaY > 0) {

                this.#logger.log('scrolled down');
                eventDispatcher.publish(messageType, actions.SCROLL_UP, world.current, false);
                eventDispatcher.publish(messageType, actions.SCROLL_DOWN, world.current, true);

            } else {

                this.#logger.log('scrolled up');
                eventDispatcher.publish(messageType, actions.SCROLL_DOWN, world.current, false);
                eventDispatcher.publish(messageType, actions.SCROLL_UP, world.current, true);

            }

        });

    }

    bindTouchEvent() {

        window.addEventListener('touchstart', () => {

            this.attachTo.switchInput(CONTROL_TYPES.MOUSE);

        });

    }

}

export { Mouse };