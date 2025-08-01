const LABEL_BASE_SCALE = 0.01;

const IMAGE_NAMES = {
    GLOCK19: 'GLOCK19',
    PISTOL: 'PISTOL',
    REVOLVER: 'REVOLVER',
    SMG_SHORT: 'SMG_SHORT',
    BAYONET: 'BAYONET',
    PISTOL_AMMO_BOX: 'PISTOL_AMMO_BOX',
    MAGNUM_AMMO_BOX: 'MAGNUM_AMMO_BOX',
    SMG_AMMO_BOX: 'SMG_AMMO_BOX',
    FIRST_AID_KIT_SMALL: 'FIRST_AID_KIT_SMALL',
    FIRST_AID_KIT_MEDIUM: 'FIRST_AID_KIT_MEDIUM',
    FIRST_AID_KIT_LARGE: 'FIRST_AID_KIT_LARGE',    
    ECG: 'ECG'
};

const IMAGES = [{
    name: IMAGE_NAMES.GLOCK19, src: 'assets/images/item_snapshots/weapons/glock19.png'
}, {
    name: IMAGE_NAMES.PISTOL, src: 'assets/images/item_snapshots/weapons/pistol.png'
}, {
    name: IMAGE_NAMES.REVOLVER, src: 'assets/images/item_snapshots/weapons/revolver.png'
}, {
    name: IMAGE_NAMES.SMG_SHORT, src: 'assets/images/item_snapshots/weapons/smg_short.png'
}, {
    name: IMAGE_NAMES.BAYONET, src: 'assets/images/item_snapshots/weapons/bayonet.png'
}, {
    name: IMAGE_NAMES.PISTOL_AMMO_BOX, src: 'assets/images/item_snapshots/ammo/pistol_ammo_box.png'
}, {
    name: IMAGE_NAMES.MAGNUM_AMMO_BOX, src: 'assets/images/item_snapshots/ammo/magnum_ammo_box.png'
}, {
    name: IMAGE_NAMES.SMG_AMMO_BOX, src: 'assets/images/item_snapshots/ammo/smg_ammo_box.png'
}, {
    name: IMAGE_NAMES.FIRST_AID_KIT_SMALL, src: 'assets/images/item_snapshots/health/first_aid_kit_small.png'
}, {
    name: IMAGE_NAMES.FIRST_AID_KIT_MEDIUM, src: 'assets/images/item_snapshots/health/first_aid_kit_medium.png'
}, {
    name: IMAGE_NAMES.FIRST_AID_KIT_LARGE, src: 'assets/images/item_snapshots/health/first_aid_kit_large.png'
}, {
    name: IMAGE_NAMES.ECG, src: 'assets/images/pda/ecg.svg'
}];

const PDA_MENU_NAMES = [
    'MAP',
    'INVENTORY',
    'FILES'
];

const PDA_OPERATE_MENU_NAMES = {
    EQUIP: 'Equip',
    DISARM: 'Disarm',
    USE: 'Use',
    COMBINE: 'Combine',
    DISCARD: 'Discard',
    EXAMINE: 'Examine'
}

const PDA_OPERATE_MENU_LIST = {
    EQUIP: `<span><i class="fa-solid fa-gun"></i></span>${PDA_OPERATE_MENU_NAMES.EQUIP}`,
    DISARM: `<span><i class="fa-solid fa-gun"></i></span>${PDA_OPERATE_MENU_NAMES.DISARM}`,
    USE: `<span><i class="fa-solid fa-hand"></i></span>${PDA_OPERATE_MENU_NAMES.USE}`,
    EXAMINE: `<span><i class="fa-solid fa-magnifying-glass"></i></span>${PDA_OPERATE_MENU_NAMES.EXAMINE}`,
    COMBINE: `<span><i class="fa-solid fa-plus"></i></span>${PDA_OPERATE_MENU_NAMES.COMBINE}`,
    DISCARD: `<span><i class="fa-solid fa-trash-can"></i></span>${PDA_OPERATE_MENU_NAMES.DISCARD}`
}

const KEYS = {
    Q: 'Q',
    E: 'E',
    F: 'F'
};

const GAMEPAD_BUTTONS = {
    LB: 'LB',
    RB: 'RB',
    A: 'A'
};

const ECG_STATE = {
    FINE: 'fine',
    CAUTION: 'caution',
    DANGER: 'danger'
};

export {
    LABEL_BASE_SCALE,
    IMAGE_NAMES,
    IMAGES,
    PDA_MENU_NAMES,
    PDA_OPERATE_MENU_NAMES,
    PDA_OPERATE_MENU_LIST,
    KEYS,
    GAMEPAD_BUTTONS,
    ECG_STATE
};