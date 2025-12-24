class InputBase {

    eventDispatcher;
    controlTypes;
    attachTo;

    _triggered = false;

    constructor(specs) {

        const { dispatcher, controlTypes, attachTo } = specs;

        this.eventDispatcher = dispatcher;
        this.controlTypes = controlTypes;
        this.attachTo = attachTo;

    }

    get triggered() {

        return this._triggered;

    }

    set triggered(val) {

        this._triggered = val;

    }

    disconnectXboxController() {

        const messageType = InputBase.CONTROL_TYPES.XBOX_CONTROLLER;
        this.eventDispatcher.publish(
            messageType, 
            InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES.CONNECTED, 
            this.attachTo.current, 
            false
        );

    }

    connectXboxController() {

        const messageType = InputBase.CONTROL_TYPES.XBOX_CONTROLLER;
        this.eventDispatcher.publish(
            messageType, 
            InputBase.CONTROL_ACTIONS.find(f => f.CATEGORY === messageType).TYPES.CONNECTED, 
            this.attachTo.current, 
            true
        );

    }

}

InputBase.CONTROL_TYPES = {
    TANKMOVE: 'tankmove',
    PDA: 'pda',
    XBOX_CONTROLLER: 'xboxController',
    MOUSE: 'mouse',
    TPC: 'tpc'
};

InputBase.CONTROL_ACTIONS = [
    {
        CATEGORY: 'tankmove',
        TYPES: {
            MOVE_LEFT: 'movingLeft',
            MOVE_RIGHT: 'movingRight',
            MOVE_FORWARD: 'movingForward',
            MOVE_BACKWARD: 'movingBackward',
            ACCELERATE: 'accelerate',
            JUMP: 'jump',
            MELEE: 'melee',
            INTERACT: 'interact',
            GUN_POINT: 'gunPoint',
            SHOOT: 'shoot',
            NEXT_AIM_TARGET: 'nextAimTarget',
            PDA_INFO: 'pdaInfo',
            INVENTORY_INFO: 'inventoryInfo'
        }
    },
    {
        CATEGORY: 'pda',
        TYPES: {
            BTN_UP: 'btnUp',
            BTN_DOWN: 'btnDown',
            BTN_LEFT: 'btnLeft',
            BTN_RIGHT: 'btnRight',
            LSTICK_UP: 'lstickUp',
            LSTICK_DOWN: 'lstickDown',
            LSTICK_LEFT: 'lstickLeft',
            LSTICK_RIGHT: 'lstickRight',
            RSTICK_UP: 'rstickUp',
            RSTICK_DOWN: 'rstickDown',
            RSTICK_LEFT: 'rstickLeft',
            RSTICK_RIGHT: 'rstickRight',
            BTN_A: 'btnA',
            BTN_B: 'btnB',
            BTN_LB: 'btnLB',
            BTN_RB: 'btnRB',
            BTN_X: 'btnX',
            BTN_LT: 'btnLT',
            BTN_RT: 'btnRT'
        }
    },
    {
        CATEGORY: 'xboxController',
        TYPES: {
            CONNECTED: 'xboxControllerConnected'
        }
    },
    {
        CATEGORY: 'mouse',
        TYPES: {
            L_CLICK_LEFT: 'lclickLeft',
            L_CLICK_RIGHT: 'lclickRight',
            L_CLICK_UP: 'lclickUp',
            L_CLICK_DOWN: 'lclickDown',
            L_BTN: 'lbtn',
            SCROLL_UP: 'scrollUp',
            SCROLL_DOWN: 'scrollDown'
        }
    },
    {
        CATEGORY: 'tpc',
        TYPES: {
            RSTICK_UP: 'rstickUp',
            RSTICK_DOWN: 'rstickDown',
            RSTICK_LEFT: 'rstickLeft',
            RSTICK_RIGHT: 'rstickRight',
        }
    }
];

export { InputBase }