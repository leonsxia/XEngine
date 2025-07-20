const LABEL_BASE_SCALE = 0.01;

const IMAGE_URLS = {
    GLOCK19: 'assets/images/item_snapshots/weapons/glock19.png',
    PISTOL: 'assets/images/item_snapshots/weapons/pistol.png',
    REVOLVER: 'assets/images/item_snapshots/weapons/revolver.png',
    SMG_SHORT: 'assets/images/item_snapshots/weapons/smg_short.png',
    BAYONET: 'assets/images/item_snapshots/weapons/bayonet.png',
    PISTOL_AMMO_BOX: 'assets/images/item_snapshots/ammo/pistol_ammo_box.png',
    MAGNUM_AMMO_BOX: 'assets/images/item_snapshots/ammo/magnum_ammo_box.png',
    SMG_AMMO_BOX: 'assets/images/item_snapshots/ammo/smg_ammo_box.png',
    ECG: 'assets/images/pda/ecg.svg'
}

const PDA_MENU_NAMES = [
    'MAP',
    'INVENTORY',
    'FILES'
]

const KEYS = {
    Q: 'Q',
    E: 'E',
    F: 'F'
}

const GAMEPAD_BUTTONS = {
    LB: 'LB',
    RB: 'RB',
    A: 'A'
}

const ECG_STATE = {
    FINE: 'fine',
    CAUTION: 'caution',
    DANGER: 'danger'
}

export {
    LABEL_BASE_SCALE,
    IMAGE_URLS,
    PDA_MENU_NAMES,
    KEYS,
    GAMEPAD_BUTTONS,
    ECG_STATE
}