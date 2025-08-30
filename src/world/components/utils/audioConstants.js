const SOUND_NAMES = {
    SOLDIER_FEMALE_WALK_LEFT: 'SOLDIER_FEMALE_WALK_LEFT',
    SOLDIER_FEMALE_WALK_RIGHT: 'SOLDIER_FEMALE_WALK_RIGHT',
    SOLDIER_FEMALE_RUN_LEFT: 'SOLDIER_FEMALE_RUN_LEFT',
    SOLDIER_FEMALE_RUN_RIGHT: 'SOLDIER_FEMALE_RUN_RIGHT',
    SOLDIER_FEMALE_HURT: 'SOLDIER_FEMALE_HURT',
    MALE_ZOMBIE_MOAN: 'MALE_ZOMBIE_MOAN',
    MALE_ZOMBIE_HURT: 'MALE_ZOMBIE_HURT',
    MALE_ZOMBIE_ATTACK: 'MALE_ZOMBIE_ATTACK',
    MALE_ZOMBIE_WALK_LEFT: 'MALE_ZOMBIE_WALK_LEFT',
    MALE_ZOMBIE_WALK_RIGHT: 'MALE_ZOMBIE_WALK_RIGHT',
    GUN_EMPTY: 'GUN_EMPTY',
    GLOCK_FIRE: 'GLOCK_FIRE',
    PISTOL_FIRE: 'PISTOL_FIRE',
    BRETTA_FIRE: 'BRETTA_FIRE',
    SMG_FIRE: 'SMG_FIRE',
    KNIFE_SLASH: 'KNIFE_SLASH',
    KNIFE_FLESH_HIT: 'KNIFE_FLESH_HIT',
    BULLET_FLESH_HIT: 'BULLET_FLESH_HIT',
    CLAW_ATTACK: 'CLAW_ATTACK',
    CLAW_FLESH_HIT: 'CLAW_FLESH_HIT'
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
    name: SOUND_NAMES.SOLDIER_FEMALE_HURT, src: 'characters/soldier_female/female_hurt.mp3'
}, {
    name: SOUND_NAMES.CLAW_FLESH_HIT, src: 'characters/claw_flesh_hit.mp3'
}, {
    name: SOUND_NAMES.MALE_ZOMBIE_MOAN, src: 'creatures/zombie_male/male_zombie_moan.mp3', loop: true
}, {
    name: SOUND_NAMES.MALE_ZOMBIE_HURT, src: 'creatures/zombie_male/male_zombie_hurt.mp3'
}, {
    name: SOUND_NAMES.MALE_ZOMBIE_ATTACK, src: 'creatures/zombie_male/male_zombie_attack.mp3'
}, {
    name: SOUND_NAMES.MALE_ZOMBIE_WALK_LEFT, src: 'creatures/zombie_male/male_zombie_walk_left.mp3'
}, {
    name: SOUND_NAMES.MALE_ZOMBIE_WALK_RIGHT, src: 'creatures/zombie_male/male_zombie_walk_right.mp3'
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
    name: SOUND_NAMES.KNIFE_FLESH_HIT, src: 'creatures/knife_flesh_hit.mp3'
}, {
    name: SOUND_NAMES.BULLET_FLESH_HIT, src: 'creatures/bullet_flesh_hit.mp3'
}, {
    name: SOUND_NAMES.CLAW_ATTACK, src: 'creatures/claw_attack.mp3'
}];

export {
    SOUND_NAMES,
    SOUNDS
};