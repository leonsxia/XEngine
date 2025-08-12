import { CONTROL_TYPES } from "../../components/utils/constants";
import { Logger } from "../Logger";
import { InputBase } from "./InputBase";

const DEBUG = false;

class Mouse extends InputBase {

    _mouseDown = false;
    _leftBtnDown = false;

    #logger = new Logger(DEBUG, 'Mouse');

    constructor(specs) {

        super(specs);

    }

    get enabled() {

        const world = this.attachTo;
        return world.currentScene && !world.currentScene.isScenePaused() && world.currentScene.isPdaOn;

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

            if (e.pageX > oldX) {

                xDirection = 'right';                

            } else if (e.pageX < oldX) {

                xDirection = 'left';                

            }

            if (e.pageY > oldY) {

                yDirection = 'down';                

            } else if (e.pageY < oldY) {

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

            oldX = e.pageX;
            oldY = e.pageY;

        });

        window.addEventListener('mousedown', (e) => {

            if (!this.enabled) return;

            this._mouseDown = true;
            this.#logger.log(`mouse is down`);

            // 0 - left button, 1 - middle button, 2 - right button
            if (e.button === 0) {

                this._leftBtnDown = true;
                this.#logger.log(`mouse left button is down`);

            }

        });

        window.addEventListener('mouseup', () => {

            if (!this.enabled) return;

            this._mouseDown = false;
            this._leftBtnDown = false;
            this.#logger.log(`mouse is up`);
            eventDispatcher.publish(messageType, actions.L_CLICK_LEFT, world.current, false);
            eventDispatcher.publish(messageType, actions.L_CLICK_RIGHT, world.current, false);
            eventDispatcher.publish(messageType, actions.L_CLICK_UP, world.current, false);
            eventDispatcher.publish(messageType, actions.L_CLICK_DOWN, world.current, false);

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