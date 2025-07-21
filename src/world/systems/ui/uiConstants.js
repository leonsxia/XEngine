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
    name: IMAGE_NAMES.ECG, src: 'assets/images/pda/ecg.svg'
}];

const PDA_MENU_NAMES = [
    'MAP',
    'INVENTORY',
    'FILES'
];

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
    KEYS,
    GAMEPAD_BUTTONS,
    ECG_STATE
};