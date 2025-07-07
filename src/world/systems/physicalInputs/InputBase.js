class InputBase {

    eventDispatcher;
    controlType;
    attachTo;

    constructor(specs) {

        const { dispatcher, controlType, attachTo } = specs;

        this.eventDispatcher = dispatcher;
        this.controlType = controlType;
        this.attachTo = attachTo;

    }

}

InputBase.MOVEMENT_TYPE = {
    TANKMOVE: 'tankmove'
};

InputBase.MOVE_ACTIONS = [
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
    }
];

export { InputBase }