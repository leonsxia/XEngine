import {
    RepeatWrapping, MirroredRepeatWrapping,
    NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping, AgXToneMapping, NeutralToneMapping
} from 'three';

// texture
const REPEAT_WRAPPING = RepeatWrapping;
const MIRRORED_REPEAT_WRAPPING = MirroredRepeatWrapping;

// geometry
const BUFFER_GEOMETRY = 'BufferGeometry';
const PLANE_GEOMETRY = 'PlaneGeometry';
const BOX_GEOMETRY = 'BoxGeometry';
const SPHERE_GEOMETRY = 'SphereGeometry';
const CYLINDER_GEOMETRY = 'CylinderGeometry';
const CAPSULE_GEOMETRY = 'CapsuleGeometry';

// light
const DIRECTIONAL_LIGHT = 'DirectionalLight';
const AMBIENT_LIGHT = 'AmbientLight';
const HEMISPHERE_LIGHT = 'HemisphereLight';
const POINT_LIGHT = 'PointLight';
const SPOT_LIGHT = 'SpotLight';
const RECT_AREA_LIGHT = 'RectAreaLight';

// tone mapping
const TONE_MAPPING = {
    NoTone: NoToneMapping,
    Linear: LinearToneMapping,
    Reinhard: ReinhardToneMapping,
    Cineon: CineonToneMapping,
    Filmic: ACESFilmicToneMapping,
    AgX: AgXToneMapping,
    Neutral: NeutralToneMapping
};

// scene objects
const AXES = 'Axes';
const GRID = 'Grid';

// players & creatures
const TOFU = 'Tofu';
const TRAIN = 'Train';
const SOLDIER_FEMALE = 'SoldierFemale';
const CREATURE_BASE = 'CreatureBase';
const ZOMBIE_MALE = 'ZombieMale';
const BLACK_WIDOW = 'BlackWidow';

// weapons
const WEAPONS = {
    NONE: 'None',
    PISTOL1: 'Pistol1',
    GLOCK: 'Glock',
    BAYONET: 'Bayonet',
    REVOLVER: 'Revolver',
    SMG_SHORT: 'SMGShort',
    ZOMBIE_CLAW: 'ZombieClaw',
    SPIDER_CLAW: 'SpiderClaw'
};

const AMMOS = {
    BAYONET: 'BayonetAmmo',
    PISTOL_9MM: '9MMAmmo',
    MAGNUM: '.375Ammo',
    SMG: 'SMGAmmo'
}

// objects
const PLANE = 'Plane';
const OBBPLANE = 'OBBPlane';
const COLLISIONPLANE = 'CollisionPlane';
const COLLISIONOBBPLANE = 'CollisionOBBPlane';
const BOX = 'Box';
const SPHERE = 'Sphere';
const CIRCLE = 'Circle';
const CYLINDER = 'Cylinder';
const TRIANGLE = 'Triangle';
const STAIRS_SIDE = 'StairsSide';
const STAIRS_FRONT = 'StairsFront';
const STAIRS_TOP = 'StairsTop';
const WATER_PLANE = 'WaterPlane';
const TERRAIN = 'Terrain';
const CAPSULE = 'Capsule';

// composite objects
const SCENE = 'Scene';
const ROOM = 'Room';
const INSPECTOR_ROOM = 'InspectorRoom';
const SQUARE_PILLAR = 'SquarePillar';
const LWALL = 'LWall';
const CYLINDER_PILLAR = 'CylinderPillar';
const HEX_CYLINDER_PILLAR = 'HexCylinderPillar';
const BOX_CUBE = 'BoxCube';
const WATER_CUBE = 'WaterCube';
const SLOPE = 'Slope';
const STAIRS = 'Stairs';
const WOODEN_PICNIC_TABLE = 'WoodenPicnicTable';
const WOODEN_SMALL_TABLE = 'WoodenSmallTable';
const ROUND_WOODEN_TABLE = 'RoundWoodenTable';
const PAINTED_WOODEN_TABLE = 'PaintedWoodenTable';
const PAINTED_WOODEN_NIGHTSTAND = 'PaintedWoodenNightstand';
const PAINTED_WOODEN_BLUE_CHAIR = 'PaintedWoodenBlueChair';
const PAINTED_WOODEN_WHITE_CHAIR = 'PaintedWoodenWhiteChair';
const PAINTED_WOODEN_STOOL = 'PaintedWoodenStool';
const SOFA_03 = 'Sofa03';
const PAINTED_WOODEN_BLUE_CABINET = 'PaintedWoodenBlueCabinet';
const SHELF_01 = 'Shelf01';
const PAINTED_WOODEN_WHITE_CABINET = 'PaintedWoodenWhiteCabinet';
const TELEVISION_01 = 'Television01';
const MODERN_CEILING_LAMP_01 = 'ModernCeilingLamp01';
const SECURITY_LIGHT = 'SecurityLight';
const FANCY_PICTURE_FRAME_01 = 'FancyPictureFrame01';
const VINTAGE_GRANDFATHER_CLOCK = 'VintageGrandfatherClock';
const BARREL_EXPLOSIVE = 'BarrelExplosive';
const BARREL_BLUE = 'BarrelBlue';
const WOODEN_DOOR_1 = 'WoodenDoor1';
const WOODEN_DOOR_2 = 'WoodenDoor2';
const WOODEN_GLASS_DOOR_1 = 'WoodenGlassDoor1';
const WOODEN_GLASS_DOOR_2 = 'WoodenGlassDoor2';
const WOODEN_GLASS_DOOR_3 = 'WoodenGlassDoor3';
const WOODEN_WHITE_DOOR_1 = 'WoodenWhiteDoor1';
const WOODEN_WHITE_DOOR_2 = 'WoodenWhiteDoor2';
const WOODEN_PINK_DOOR_1 = 'WoodenPinkDoor1';
const IRON_PLATE_GLASS_DOOR_1 = 'IronPlateGlassDoor1';
const IRON_PLATE_GLASS_DOOR_2 = 'IronPlateGlassDoor2';
const IRON_PLATE_DOOR_1 = 'IronPlateDoor1';
const OFFICE_DOOR_1 = 'OfficeDoor1';
const CLASSIC_WOODEN_DOUBLE_DOOR_1 = 'ClassicWoodenDoubleDoor1';
const CLASSIC_WOODEN_DOOR_1 = 'ClassicWoodenDoor1';
const CLASSIC_WOODEN_DOOR_2 = 'ClassicWoodenDoor2';
const CLASSIC_WOODEN_DOOR_3 = 'ClassicWoodenDoor3';
const CLASSIC_WOODEN_DOOR_4 = 'ClassicWoodenDoor4';
const CLASSIC_WOODEN_DOOR_5 = 'ClassicWoodenDoor5';
const CLASSIC_WOODEN_DOOR_6 = 'ClassicWoodenDoor6';
const DUNGEON_GATE_1 = 'DungeonGate1';
const VERTICAL_LADDER = 'VerticalLadder';
const ROTATABLE_LADDER = 'RotatableLadder';
const LADDER = 'Ladder';

// scene objects
const HAND_CRAFTED_STUDIO = 'HandCraftedStudio';
const NAV_ROOM = 'NavRoom';

// navigation meshes
const MANSION_NAV_MESH = 'MANSION_NAV_MESH';

// pickable items
const AMMUNITION = {
    PISTOL_AMMO_BOX: 'PistolAmmoBox',
    MAGNUM_AMMO_BOX: 'MagnumAmmoBox',
    SMG_AMMO_BOX: 'SMGAmmoBox'
};

const HEALTH_CATEGORY = {
    FIRST_AID_KIT: 'FirstAidKit'
};

const FIRST_AID_KIT = {
    FIRST_AID_KIT_SMALL: 'FirstAidKitSmall',
    FIRST_AID_KIT_MEDIUM: 'FirstAidKitMedium',
    FIRST_AID_KIT_LARGE: 'FirstAidKitLarge'
};

// cameras
const CAMERAS = {
    INSPECTOR: 'INSPECTOR',
    THIRD_PERSON: 'THIRD_PERSON'
};

// post-processing
const OUTLINE = 'outline';
const SSAO = 'ssao';
const FXAA = 'fxaa';
const SSAA = 'ssaa';
const BLOOM = 'bloom';

// raycaster layers
const CORNOR_RAY_LAYER = 1;
const TOFU_RAY_LAYER = 2;
const CAMERA_RAY_LAYER = 3;
const PLAYER_CAMERA_RAY_LAYER = 4;
const PLAYER_CAMERA_TRANSPARENT_LAYER = 5;
const TOFU_AIM_LAYER = 6;
const TOFU_FOCUS_LAYER = 8;

// post processing layers
const BLOOM_SCENE_LAYER = 7;

// obstacle layers
const OBSTACLE_RAY_LAYER = 10;
const FRONT_TRIGGER_LAYER = 11;
const BACK_TRIGGER_LAYER = 12;
const LEFT_TRIGGER_LAYER = 13;
const RIGHT_TRIGGER_LAYER = 14;
const FRONT_FACE_LAYER = 15;
const BACK_FACE_LAYER = 16;
const LEFT_FACE_LAYER = 17;
const RIGHT_FACE_LAYER = 18;

// animation clips
const SOLDIER_FEMALE_CLIPS = {
    DEATH: { nick: 'death', name: 'CharacterArmature|Death', idx: 0, enable: true, loopOnce: true },
    GUN_SHOOT: { nick: 'gun_shoot', name: 'CharacterArmature|Gun_Shoot', idx: 1, enable: false },
    HIT_RECEIVE: { nick: 'hit_receive', name: 'CharacterArmature|HitRecieve', idx: 2, enable: true, loopOnce: true },
    HIT_RECEIVE_2: { nick: 'hit_receive_2', name: 'CharacterArmature|HitRecieve_2', idx: 3, enable: true, loopOnce: true },
    IDLE: { nick: 'idle', name: 'CharacterArmature|Idle', idx: 4, enable: true, isDefault: true },
    IDLE_GUN: { nick: 'idle_gun', name: 'CharacterArmature|Idle_Gun', idx: 5, enable: true },
    IDLE_GUN_POINTING: { nick: 'idle_gun_pointing', name: 'CharacterArmature|Idle_Gun_Pointing', idx: 6, enable: true },
    IDLE_GUN_SHOOT: { nick: 'idle_gun_shoot', name: 'CharacterArmature|Idle_Gun_Shoot', idx: 7, enable: true },
    IDLE_NEUTRAL: { nick: 'idle_neutral', name: 'CharacterArmature|Idle_Neutral', idx: 8, enable: false },
    IDLE_SWORD: { nick: 'idle_sword', name: 'CharacterArmature|Idle_Sword', idx: 9, enable: false },
    INTERACT: { nick: 'interact', name: 'CharacterArmature|Interact', idx: 10, enable: true, loopOnce: true },
    KICK_LEFT: { nick: 'kick_left', name: 'CharacterArmature|Kick_Left', idx: 11, enable: false },
    KICK_RIGHT: { nick: 'kick_right', name: 'CharacterArmature|Kick_Right', idx: 12, enable: false },
    PUNCH_LEFT: { nick: 'punch_left', name: 'CharacterArmature|Punch_Left', idx: 13, enable: false },
    PUNCH_RIGHT: { nick: 'punch_right', name: 'CharacterArmature|Punch_Right', idx: 14, enable: true },
    ROLL: { nick: 'roll', name: 'CharacterArmature|Roll', idx: 15, enable: false },
    RUN: { nick: 'run', name: 'CharacterArmature|Run', idx: 16, startImmediately: false, enable: true },
    RUN_BACK: { nick: 'run_back', name: 'CharacterArmature|Run_Back', idx: 17, enable: true },
    RUN_LEFT: { nick: 'run_left', name: 'CharacterArmature|Run_Left', idx: 18, enable: false },
    RUN_RIGHT: { nick: 'run_right', name: 'CharacterArmature|Run_Right', idx: 19, enable: false },
    RUN_SHOOT: { nick: 'run_shoot', name: 'CharacterArmature|Run_Shoot', idx: 20, enable: false },
    SWORD_SLASH: { nick: 'sword_slash', name: 'CharacterArmature|Sword_Slash', idx: 21, enable: true },
    WALK: { nick: 'walk', name: 'CharacterArmature|Walk', idx: 22, startImmediately: false, enable: true },
    WAVE: { nick: 'wave', name: 'CharacterArmature|Wave', idx: 23, enable: false }
};

const ZOMBIE_MALE_CLIPS = {
    DEATH: { nick: 'death', name: 'Armature|Die', idx: 0, enable: true, loopOnce: true },
    DEATH2: { nick: 'death2', name: 'Armature|Die2', idx: 1, enable: true, loopOnce: true },
    HIT_RECEIVE: { nick: 'hit_receive', name: 'Armature|Hit_reaction', idx: 2, enable: true, loopOnce: true },
    IDLE: { nick: 'idle', name: 'Armature|Idle', idx: 3, enable: true, isDefault: true },
    WALK: { nick: 'walk', name: 'Armature|Walk', idx: 4, startImmediately: false, enable: true },
    WALK2: { nick: 'walk2', name: 'Armature|Walk2', idx: 5, startImmediately: false, enable: true },
    WLAK3: { nick: 'walk3', name: 'Armature|Running_Crawl', idx: 6, startImmediately: false, enable: true },
    CRAWL: { nick: 'crawl', name: 'Armature|Crawl', idx: 7, startImmediately: false, enable: true },
    ATTACK: { nick: 'attack', name: 'Armature|Attack', idx: 8, enable: true, loopOnce: true },
    ATTACK_GROUND: {nick: 'attack_ground', name: 'Armature|Bite_ground', idx: 9, enable: true, loopOnce: true}
};

const BLACK_WIDOW_CLIPS = {
    ATTACK: { nick: 'attack', name: 'SpiderArmature|Spider_Attack', idx: 0, enable: true, loopOnce: true },
    DEATH: { nick: 'death', name: 'SpiderArmature|Spider_Death', idx: 1, enable: true, loopOnce: true },
    IDLE: { nick: 'idle', name: 'SpiderArmature|Spider_Idle', idx: 2, enable: true, isDefault: true },
    HIT_RECEIVE: { nick: 'hit_receive', name: 'SpiderArmature|Spider_Jump', idx: 3, enable: true, loopOnce: true },
    WALK: { nick: 'walk', name: 'SpiderArmature|Spider_Walk', idx: 4, startImmediately: false, enable: true },
};

const GLOCK_CLIPS = {
    SHOOT: { nick: 'shoot', name: 'glock_19|Shoot', idx: 0, enable: true, isDefault: true, startImmediately: false, weight: 0, loopOnce: true }
};

// Gui
const GUI_CONFIG = {
    CONTROL_TITLES : {
        MENU: 'Menu', 
        LIGHT_CONTROL: 'Lights Control', 
        OBJECTS_CONTROL: 'Objects Control'
    },
    SELECT_WORLD_CONTROL: 'Select World',
    RIGHT_PANEL_SELECTOR_CONTROL: "Select Control",
    PLAYER_CONTROL: 'Player Control',
    ENEMY_CONTROL: 'Enemy Control',
    POST_PROCESS_CONTROL: 'Post Processing',
    TPC_CONTROL: 'Third Person Camera',
    IC_CONTROL: 'Inspector Camera',
    CAMERA_CONTROL: 'Cameras',
    RAPIER_PHYSICS_CONTROL: 'Rapier Physics',
    SCENE_CONTROL: 'Scene',
    PATHFINDING_CONTROL: 'Pathfinding',
    PICKER_CONTROL: 'Picker',
    HEALTH_CONTROL: 'Health',
    WEAPON_CONTROL: 'Weapons',
    SELECT_WEAPONS: 'Select Weapons',
    WEAPON_ACTIONS: 'Weapon Actions',
    WEAPONS_OPTIONS_PARENT: 'weapon_options_actions',
    WEAPONS_ACTIONS_PARENT: 'weapon_actions',
    PICKER_ACTIONS_PARENT: 'picker_actions',
    TPC_ACTIONS_PARENT: 'tpc_actions',
    IC_ACTIONS_PARENT: 'ic_actions',
    IC_AREAS_PARENT: 'ic_areas',
    PLAYER_HP_ACTIONS_PARENT: 'player_hp_actions',
    ENEMY_HP_ACTIONS_PARENT: 'enemy_hp_actions',
    INACTIVES: '_inactive',
    CLASS_INACTIVE: 'control-inactive'
};

// controls
const CONTROL_TYPES = {
    KEYBOARD: 'keyboard',
    XBOX: 'xbox',
    MOUSE: 'mouse'
};

// physics
const PHYSICS_TYPES = {
    RAPIER: 'rapier',
    SIMPLE: 'simple'
}

const RIGID_BODY_TYPES = {
    DYNAMIC: 'dynamic',
    FIXED: 'fixed',
    KENEMATIC_POSITION_BASED: 'kinematicPositionBased'
};

export { 
    REPEAT_WRAPPING,
    MIRRORED_REPEAT_WRAPPING,

    BUFFER_GEOMETRY,
    PLANE_GEOMETRY,
    BOX_GEOMETRY,
    SPHERE_GEOMETRY,
    CYLINDER_GEOMETRY,
    CAPSULE_GEOMETRY,

    DIRECTIONAL_LIGHT,
    AMBIENT_LIGHT,
    HEMISPHERE_LIGHT,
    POINT_LIGHT,
    SPOT_LIGHT,
    RECT_AREA_LIGHT,

    TONE_MAPPING,

    AXES,
    GRID,

    TOFU,
    TRAIN,
    SOLDIER_FEMALE,
    CREATURE_BASE,
    ZOMBIE_MALE,
    BLACK_WIDOW,

    WEAPONS,
    AMMOS,
    AMMUNITION,
    HEALTH_CATEGORY,
    FIRST_AID_KIT,

    PLANE,
    OBBPLANE,
    COLLISIONPLANE,
    COLLISIONOBBPLANE,
    BOX,
    SPHERE,
    CIRCLE,
    CYLINDER,
    TRIANGLE,
    STAIRS_SIDE,
    STAIRS_FRONT,
    STAIRS_TOP,
    WATER_PLANE,
    TERRAIN,
    CAPSULE,

    SCENE,
    ROOM,
    INSPECTOR_ROOM,
    SQUARE_PILLAR,
    LWALL,
    CYLINDER_PILLAR,
    HEX_CYLINDER_PILLAR,
    BOX_CUBE,
    WATER_CUBE,
    SLOPE,
    STAIRS,
    WOODEN_PICNIC_TABLE,
    WOODEN_SMALL_TABLE,
    ROUND_WOODEN_TABLE,
    PAINTED_WOODEN_TABLE,
    PAINTED_WOODEN_NIGHTSTAND,
    PAINTED_WOODEN_BLUE_CHAIR,
    PAINTED_WOODEN_WHITE_CHAIR,
    PAINTED_WOODEN_STOOL,
    SOFA_03,
    PAINTED_WOODEN_BLUE_CABINET,
    SHELF_01,
    PAINTED_WOODEN_WHITE_CABINET,
    TELEVISION_01,
    MODERN_CEILING_LAMP_01,
    SECURITY_LIGHT,
    FANCY_PICTURE_FRAME_01,
    VINTAGE_GRANDFATHER_CLOCK,
    BARREL_EXPLOSIVE,
    BARREL_BLUE,
    WOODEN_DOOR_1,
    WOODEN_DOOR_2,
    WOODEN_GLASS_DOOR_1,
    WOODEN_GLASS_DOOR_2,
    WOODEN_GLASS_DOOR_3,
    WOODEN_WHITE_DOOR_1,
    WOODEN_WHITE_DOOR_2,
    WOODEN_PINK_DOOR_1,
    IRON_PLATE_GLASS_DOOR_1,
    IRON_PLATE_GLASS_DOOR_2,
    IRON_PLATE_DOOR_1,
    OFFICE_DOOR_1,
    CLASSIC_WOODEN_DOUBLE_DOOR_1,
    CLASSIC_WOODEN_DOOR_1,
    CLASSIC_WOODEN_DOOR_2,
    CLASSIC_WOODEN_DOOR_3,
    CLASSIC_WOODEN_DOOR_4,
    CLASSIC_WOODEN_DOOR_5,
    CLASSIC_WOODEN_DOOR_6,
    DUNGEON_GATE_1,
    VERTICAL_LADDER,
    ROTATABLE_LADDER,
    LADDER,

    HAND_CRAFTED_STUDIO,
    NAV_ROOM,

    MANSION_NAV_MESH,

    CAMERAS,

    OUTLINE,
    SSAO,
    FXAA,
    SSAA,
    BLOOM,

    CORNOR_RAY_LAYER,
    TOFU_RAY_LAYER,
    CAMERA_RAY_LAYER,
    PLAYER_CAMERA_RAY_LAYER,
    PLAYER_CAMERA_TRANSPARENT_LAYER,
    TOFU_AIM_LAYER,
    TOFU_FOCUS_LAYER,

    BLOOM_SCENE_LAYER,

    OBSTACLE_RAY_LAYER,
    FRONT_TRIGGER_LAYER,
    BACK_TRIGGER_LAYER,
    LEFT_TRIGGER_LAYER,
    RIGHT_TRIGGER_LAYER,
    FRONT_FACE_LAYER,
    BACK_FACE_LAYER,
    LEFT_FACE_LAYER,
    RIGHT_FACE_LAYER,

    SOLDIER_FEMALE_CLIPS,
    ZOMBIE_MALE_CLIPS,
    BLACK_WIDOW_CLIPS,
    GLOCK_CLIPS,

    GUI_CONFIG,

    CONTROL_TYPES,

    PHYSICS_TYPES,
    RIGID_BODY_TYPES
};