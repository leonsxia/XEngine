const SOUND_NAMES = {
    SOLDIER_FEMALE_WALK_LEFT: 'SOLDIER_FEMALE_WALK_LEFT',
    SOLDIER_FEMALE_WALK_RIGHT: 'SOLDIER_FEMALE_WALK_RIGHT',
    SOLDIER_FEMALE_RUN_LEFT: 'SOLDIER_FEMALE_RUN_LEFT',
    SOLDIER_FEMALE_RUN_RIGHT: 'SOLDIER_FEMALE_RUN_RIGHT',
    GUN_EMPTY: 'GUN_EMPTY',
    GLOCK_FIRE: 'GLOCK_FIRE',
    PISTOL_FIRE: 'PISTOL_FIRE',
    BRETTA_FIRE: 'BRETTA_FIRE',
    SMG_FIRE: 'SMG_FIRE',
    KNIFE_SLASH: 'KNIFE_SLASH',
    KNIFE_FLESH_HIT: 'KNIFE_FLESH_HIT'
};

const SOUNDS = [{
    name: SOUND_NAMES.SOLDIER_FEMALE_WALK_LEFT, src: 'characters/soldier_female/walk_left.mp3'
}, {
    name: SOUND_NAMES.SOLDIER_FEMALE_WALK_RIGHT, src: 'characters/soldier_female/walk_right.mp3'
}, {
    name: SOUND_NAMES.SOLDIER_FEMALE_RUN_LEFT, src: 'characters/soldier_female/run_left.mp3'
}, {
    name: SOUND_NAMES.SOLDIER_FEMALE_RUN_RIGHT, src: 'characters/soldier_female/run_right.mp3'
}, {
    name: SOUND_NAMES.GUN_EMPTY, src: 'weapons/gun_empty.mp3'
}, {
    name: SOUND_NAMES.GLOCK_FIRE, src: 'weapons/glock_fire.mp3'
}, {
    name: SOUND_NAMES.PISTOL_FIRE, src: 'weapons/pistol_fire.mp3'
}, {
    name: SOUND_NAMES.BRETTA_FIRE, src: 'weapons/bretta_fire.mp3'
}, {
    name: SOUND_NAMES.SMG_FIRE, src: 'weapons/smg_fire.mp3'
}, {
    name: SOUND_NAMES.KNIFE_SLASH, src: 'weapons/knife_slash.mp3'
}, {
    name: SOUND_NAMES.KNIFE_FLESH_HIT, src: 'weapons/knife_flesh_hit.mp3'
}];

export {
    SOUND_NAMES,
    SOUNDS
};