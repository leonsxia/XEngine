class InputBase {

    eventDispatcher;
    controlTypes;
    attachTo;

    constructor(specs) {

        const { dispatcher, controlTypes, attachTo } = specs;

        this.eventDispatcher = dispatcher;
        this.controlTypes = controlTypes;
        this.attachTo = attachTo;

    }

}

InputBase.CONTROL_TYPES = {
    TANKMOVE: 'tankmove',
    PDA: 'pda'
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
            CANCEL: 'cancel'
        }
    }
];

export { InputBase }