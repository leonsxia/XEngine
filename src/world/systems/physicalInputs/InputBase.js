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
    XBOX_CONTROLLER: 'xboxController'
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
            UP: 'goUp',
            DOWN: 'goDown',
            LEFT: 'goLeft',
            RIGHT: 'goRight',
            CONFIRM: 'confirm',
            CANCEL: 'cancel',
            SHIFT_LEFT: 'shiftLeft',
            SHIFT_RIGHT: 'shiftRight',
            MOVE_ITEM: 'moveItem'
        }
    },
    {
        CATEGORY: 'xboxController',
        TYPES: {
            CONNECTED: 'xboxControllerConnected'
        }
    }
];

export { InputBase }