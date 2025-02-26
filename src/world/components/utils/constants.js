import { RepeatWrapping, MirroredRepeatWrapping } from 'three';

// texture
const REPEAT_WRAPPING = RepeatWrapping;
const MIRRORED_REPEAT_WRAPPING = MirroredRepeatWrapping;
const TRI_PATTERN = 'assets/textures/tri_pattern.jpg';

// light
const DIRECTIONAL_LIGHT = 'DirectionalLight';
const AMBIENT_LIGHT = 'AmbientLight';
const HEMISPHERE_LIGHT = 'HemisphereLight';
const POINT_LIGHT = 'PointLight';
const SPOT_LIGHT = 'SpotLight';

const DIRECTIONAL_LIGHT_TARGET = 'DirectionalLightTarget';
const SPOT_LIGHT_TARGET = 'SpotLightTarget';

// scene objects
const AXES = 'Axes';
const GRID = 'Grid';

// players
const TOFU = 'Tofu';
const TRAIN = 'Train';
const SOLDIER_FEMALE = 'SoldierFemale';

// weapons
const WEAPONS = {
    PISTOL1: 'PISTOL1',
    GLOCK: 'GLOCK',
    BAYONET: 'BAYONET',
    REVOLVER: 'REVOLVER',
    SMG_SHORT: 'SMG_SHORT'
};

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

// cameras
const CAMERAS = {
    INSPECTOR: 'INSPECTOR',
    THIRD_PERSON: 'THIRD_PERSON'
}

// post-processing
const OUTLINE = 'outline';
const SSAO = 'ssao';
const FXAA = 'fxaa';
const SSAA = 'ssaa';
const BLOOM = 'bloom';

// raycaster layers
const CORNOR_RAY_LAYER = 1;
const PLAYER_RAY_LAYER = 2;
const CAMERA_RAY_LAYER = 3;
const PLAYER_CAMERA_RAY_LAYER = 4;
const PLAYER_CAMERA_TRANSPARENT_LAYER = 5;

// post processing layers
const BLOOM_SCENE_LAYER = 5;

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

// textures
const TEXTURE_NAMES = {
    CRATE: 'CRATE',
    CRATE_NORMAL: 'CRATE_NORMAL',
    // gallery
    PORTRAIT_1: 'PORTRAIT_1',
    PORTRAIT_1_NORMAL: 'PORTRAIT_1_NORMAL',
    WES_ALIEN: 'WES_ALIEN',
    WES_ALIEN_NORMAL: 'WES_ALIEN_NORMAL',
    WES_BEETHOVEN: 'WES_BEETHOVEN',
    WES_BEETHOVEN_NORMAL: 'WES_BEETHOVEN_NORMAL',
    WES_BLACK_LIGHT_BURNS_2: 'WES_BLACK_LIGHT_BURNS_2',
    WES_BLACK_LIGHT_BURNS_2_NORMAL: 'WES_BLACK_LIGHT_BURNS_2_NORMAL',
    WES_CLAW: 'WES_CLAW',
    WES_CLAW_NORMAL: 'WES_CLAW_NORMAL',
    WES_CRUEL_MELODY: 'WES_CRUEL_MELODY',
    WES_CRUEL_MELODY_NORMAL: 'WES_CRUEL_MELODY_NORMAL',
    WES_EAT_THE_DAY: 'WES_EAT_THE_DAY',
    WES_EAT_THE_DAY_NORMAL: 'WES_EAT_THE_DAY_NORMAL',
    WES_HEAD_OFF: 'WES_HEAD_OFF',
    WES_HEAD_OFF_NORMAL: 'WES_HEAD_OFF_NORMAL',
    WES_LONG_HAIR: 'WES_LONG_HAIR',
    WES_LONG_HAIR_NORMAL: 'WES_LONG_HAIR_NORMAL',
    WES_NAKED_WOMAN: 'WES_NAKED_WOMAN',
    WES_NAKED_WOMAN_NORMAL: 'WES_NAKED_WOMAN_NORMAL',
    WES_NUT: 'WES_NUT',
    WES_NUT_NORMAL: 'WES_NUT_NORMAL',
    // texture
    LIGHT_BROWN_CARPET: 'LIGHT_BROWN_CARPET',
    LIGHT_BROWN_CARPET_NORMAL: 'LIGHT_BROWN_CARPET_NORMAL',
    CONCRETE_128: 'CONCRETE_128',
    CONCRETE_128_NORMAL: 'CONCRETE_128_NORMAL',
    CONCRETE_132: 'CONCRETE_132',
    CONCRETE_132_NORMAL: 'CONCRETE_132_NORMAL',
    CONCRETE_165: 'CONCRETE_165',
    CONCRETE_165_NORMAL: 'CONCRETE_165_NORMAL',
    BRICK_159: 'BRICK_159',
    BRICK_159_NORMAL: 'BRICK_159_NORMAL',
    FABRIC_190: 'FABRIC_190',
    FABRIC_190_NORMAL: 'FABRIC_190_NORMAL',
    FABRIC_197: 'FABRIC_197',
    FABRIC_197_NORMAL: 'FABRIC_197_NORMAL',
    STONE_165: 'STONE_165',
    STONE_165_NORMAL: 'STONE_165_NORMAL',
    WOOD_156: 'WOOD_156',
    WOOD_156_NORMAL: 'WOOD_156_NORMAL',
    WOOD_186: 'WOOD_186',
    WOOD_186_NORMAL: 'WOOD_186_NORMAL',
    WOOD_227: 'WOOD_227',
    WOOD_227_NORMAL: 'WOOD_227_NORMAL',
    METAL_272: 'METAL_272',
    METAL_272_NORMAL: 'METAL_272_NORMAL',
    METAL_274: 'METAL_274',
    METAL_274_NORMAL: 'METAL_274_NORMAL',
    METAL_290: 'METAL_290',
    METAL_290_NORMAL: 'METAL_290_NORMAL',
    METAL_292: 'METAL_292',
    METAL_292_NORMAL: 'METAL_292_NORMAL',
    // water
    WATER_1_M: 'WATER_1_M',
    WATER_1_M_NORMAL: 'WATER_1_M_NORMAL',
    WATER_2_M: 'WATER_2_M',
    WATER_2_M_NORMAL: 'WATER_2_M_NORMAL'
};

const TEXTURES = [{
    name: TEXTURE_NAMES.CRATE, map: 'assets/textures/crate.png', normalMap: 'assets/textures/normals/crate.jpg'
}, {
    name: TEXTURE_NAMES.PORTRAIT_1, map: 'assets/textures/portraits/leon.jpg', normalMap: 'assets/textures/portraits_normal/leon.jpg'
}, {
    name: TEXTURE_NAMES.WES_ALIEN, map: 'assets/textures/wes_gallery/wes_alien.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_alien_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_BEETHOVEN, map: 'assets/textures/wes_gallery/wes_beethoven.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_beethoven_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_BLACK_LIGHT_BURNS_2, map: 'assets/textures/wes_gallery/wes_black_light_burns_2.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_black_light_burns_2_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_CLAW, map: 'assets/textures/wes_gallery/wes_claw.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_claw_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_CRUEL_MELODY, map: 'assets/textures/wes_gallery/wes_cruel_melody.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_cruel_melody_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_EAT_THE_DAY, map: 'assets/textures/wes_gallery/wes_eat_the_day.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_eat_the_day_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_HEAD_OFF, map: 'assets/textures/wes_gallery/wes_head_off.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_head_off_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_LONG_HAIR, map: 'assets/textures/wes_gallery/wes_long_hair.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_long_hair_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_NAKED_WOMAN, map: 'assets/textures/wes_gallery/wes_naked_woman.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_naked_woman_normal.jpg'
}, {
    name: TEXTURE_NAMES.WES_NUT, map: 'assets/textures/wes_gallery/wes_nut.jpg', normalMap: 'assets/textures/wes_gallery_normal/wes_nut_normal.jpg'
}, {
    name: TEXTURE_NAMES.LIGHT_BROWN_CARPET, map: 'assets/textures/carpets/Light_Brown_Carpet.jpg', normalMap: 'assets/textures/normals/Light_Brown_Carpet.jpg'
}, {
    name: TEXTURE_NAMES.CONCRETE_128, map: 'assets/textures/walls/Texturelabs_Concrete_128M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Concrete_128L.jpg'
}, {
    name: TEXTURE_NAMES.CONCRETE_132, map: 'assets/textures/walls/Texturelabs_Concrete_132M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Concrete_132L.jpg'
}, {
    name: TEXTURE_NAMES.CONCRETE_165, map: 'assets/textures/walls/Texturelabs_Concrete_165M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Concrete_165L.jpg'
}, {
    name: TEXTURE_NAMES.BRICK_159, map: 'assets/textures/walls/Texturelabs_Brick_159M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Brick_159L.jpg'
}, {
    name: TEXTURE_NAMES.FABRIC_190, map: 'assets/textures/walls/Texturelabs_Fabric_190M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Fabric_190L.jpg'
}, {
    name: TEXTURE_NAMES.FABRIC_197, map: 'assets/textures/walls/Texturelabs_Fabric_197M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Fabric_197L.jpg'
}, {
    name: TEXTURE_NAMES.STONE_165, map: 'assets/textures/walls/Texturelabs_Stone_165M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Stone_165L.jpg'
}, {
    name: TEXTURE_NAMES.WOOD_156, map: 'assets/textures/walls/Texturelabs_Wood_156M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Wood_156L.jpg'
}, {
    name: TEXTURE_NAMES.WOOD_186, map: 'assets/textures/walls/Texturelabs_Wood_186M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Wood_186L.jpg'
}, {
    name: TEXTURE_NAMES.WOOD_227, map: 'assets/textures/walls/Texturelabs_Wood_227M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Wood_227M.jpg'
}, {
    name: TEXTURE_NAMES.METAL_272, map: 'assets/textures/walls/Texturelabs_Metal_272M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Metal_272L.jpg'
}, {
    name: TEXTURE_NAMES.METAL_274, map: 'assets/textures/walls/Texturelabs_Metal_274M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Metal_274L.jpg'
}, {
    name: TEXTURE_NAMES.METAL_290, map: 'assets/textures/walls/Texturelabs_Metal_290M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Metal_290L.jpg'
}, {
    name: TEXTURE_NAMES.METAL_292, map: 'assets/textures/walls/Texturelabs_Metal_292M.jpg', normalMap: 'assets/textures/normals/Texturelabs_Metal_292L.jpg'
}, {
    name: TEXTURE_NAMES.WATER_1_M, normalMap: 'assets/textures/water/Water_1_M_Normal.jpg'
}, {
    name: TEXTURE_NAMES.WATER_2_M, normalMap: 'assets/textures/water/Water_2_M_Normal.jpg'
}];

// gltfs
const GLTF_NAMES = {
    // characters
    SOLDIER_FEMALE: 'SOLDIER_FEMALE',
    // tables
    WOODEN_PICNIC_TABLE: 'WOODEN_PICNIC_TABLE',
    WOODEN_TABLE: 'WOODEN_TABLE',
    ROUND_WOODEN_TABLE: 'ROUND_WOODEN_TABLE',
    PAINTED_WOODEN_TABLE: 'PAINTED_WOODEN_TABLE',
    PAINTED_WOODEN_NIGHTSTAND: 'PAINTED_WOODEN_NIGHTSTAND',
    // seats
    PAINTED_WOODEN_BLUE_CHAIR: 'PAINTED_WOODEN_BLUE_CHAIR',
    PAINTED_WOODEN_WHITE_CHAIR: 'PAINTED_WOODEN_WHITE_CHAIR',
    PAINTED_WOODEN_STOOL: 'PAINTED_WOODEN_STOOL',
    SOFA_03: 'SOFA_03',
    // shelves
    PAINTED_WOODEN_BLUE_CABINET: 'PAINTED_WOODEN_BLUE_CABINET',
    SHELF_01: 'SHELF_01',
    PAINTED_WOODEN_WHITE_CABINET: 'PAINTED_WOODEN_WHITE_CABINET',
    // electronics
    TELEVISION_01: 'TELEVISION_01',
    // lighting
    MODERN_CEILING_LAMP_01: 'MODERN_CEILING_LAMP_01',
    SECURITY_LIGHT: 'SECURITY_LIGHT',
    // decorative
    FANCY_PICTURE_FRAME_01: 'FANCY_PICTURE_FRAME_01',
    VINTAGE_GRANDFATHER_CLOCK: 'VINTAGE_GRANDFATHER_CLOCK'
};

const GLTFS = [{
    name: GLTF_NAMES.SOLDIER_FEMALE, src: 'characters/soldier_female.glb'
}, {
    name: GLTF_NAMES.WOODEN_PICNIC_TABLE, src: 'inRoom/tables/wooden_picnic_table_1k/wooden_picnic_table_1k.gltf'
}, {
    name: GLTF_NAMES.WOODEN_TABLE, src: 'inRoom/tables/wooden_table_1k/wooden_table_02_1k.gltf'
}, {
    name: GLTF_NAMES.ROUND_WOODEN_TABLE, src: 'inRoom/tables/round_wooden_table_01_1k/round_wooden_table_01_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_TABLE, src: 'inRoom/tables/painted_wooden_table_1k/painted_wooden_table_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_NIGHTSTAND, src: 'inRoom/tables/painted_wooden_nightstand_1k/painted_wooden_nightstand_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_BLUE_CHAIR, src: 'inRoom/seats/painted_wooden_chair_02_1k/painted_wooden_chair_02_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_WHITE_CHAIR, src: 'inRoom/seats/painted_wooden_chair_01_1k/painted_wooden_chair_01_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_STOOL, src: 'inRoom/seats/painted_wooden_stool_1k/painted_wooden_stool_1k.gltf'
}, {
    name: GLTF_NAMES.SOFA_03, src: 'inRoom/seats/sofa_03_1k/sofa_03_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_BLUE_CABINET, src: 'inRoom/shelves/painted_wooden_cabinet_02_1k/painted_wooden_cabinet_02_1k.gltf'
}, {
    name: GLTF_NAMES.SHELF_01, src: 'inRoom/shelves/Shelf_01_1k/Shelf_01_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_WHITE_CABINET, src: 'inRoom/shelves/painted_wooden_cabinet_1k/painted_wooden_cabinet_1k.gltf'
}, {
    name: GLTF_NAMES.TELEVISION_01, src: 'inRoom/electronics/Television_01_1k/Television_01_1k.gltf'
}, {
    name: GLTF_NAMES.MODERN_CEILING_LAMP_01, src: 'inRoom/lighting/modern_ceiling_lamp_01_1k/modern_ceiling_lamp_01_1k.gltf'
}, {
    name: GLTF_NAMES.SECURITY_LIGHT, src: 'inRoom/lighting/security_light_1k/security_light_1k.gltf'
}, {
    name: GLTF_NAMES.FANCY_PICTURE_FRAME_01, src: 'inRoom/decorative/fancy_picture_frame_01_1k/fancy_picture_frame_01_1k.gltf'
}, {
    name: GLTF_NAMES.VINTAGE_GRANDFATHER_CLOCK, src: 'inRoom/decorative/vintage_grandfather_clock_01_1k/vintage_grandfather_clock_01_1k.gltf'
}];

const SHADER_NAMES = {
    BLOOM_VERTEX: 'BLOOM_VERTEX',
    BLOOM_FRAGMENT: 'BLOOM_FRAGMENT'
};

const SHADERS = [{
    name: SHADER_NAMES.BLOOM_VERTEX, src: 'assets/shaders/bloom_vertexshader.shader'
}, {
    name: SHADER_NAMES.BLOOM_FRAGMENT, src: 'assets/shaders/bloom_fragmentshader.shader'
}];

// animation clips
const SOLDIER_FEMALE_CLIPS = {
    DEATH: { nick: 'death', name: 'CharacterArmature|Death', idx: 0, enable: true, loopOnce: true },
    GUN_SHOOT: { nick: 'gun_shoot', name: 'CharacterArmature|Gun_Shoot', idx: 1, enable: false },
    HIT_RECEIVE: { nick: 'hit_receive', name: 'CharacterArmature|HitRecieve', idx: 2, enable: true, loopOnce: true },
    HIT_RECEIVE_2: { nick: 'hit_receive_2', name: 'CharacterArmature|HitRecieve_2', idx: 3, enable: false },
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

const GLOCK_CLIPS = {
    SHOOT: { nick: 'shoot', name: 'glock_19|Shoot', idx: 0, enable: true, isDefault: true, startImmediately: false, weight: 0, loopOnce: true }
}

// Gui
const GUI_CONFIG = {
    CONTROL_TITLES : {
        MENU: 'Menu', 
        LIGHT_CONTROL: 'Lights Control', 
        OBJECTS_CONTROL: 'Objects Control'
    },
    PLAYER_CONTROL: 'Player Control',
    POST_PROCESS_CONTROL: 'Post Processing',
    TPC_CONTROL: 'Third Person Camera',
    IC_CONTROL: 'Inspector Camera',
    CAMERA_CONTROL: 'Cameras',
    PICKER_CONTROL: 'Picker',
    WEAPON_CONTROL: 'Weapons',
    SELECT_WEAPONS: 'Select Weapons',
    WEAPON_ACTIONS: 'Weapon Actions',
    WEAPONS_OPTIONS_PARENT: 'weapon_options_actions',
    WEAPONS_ACTIONS_PARENT: 'weapon_actions',
    PICKER_ACTIONS_PARENT: 'picker_actions',
    TPC_ACTIONS_PARENT: 'tpc_actions',
    IC_ACTIONS_PARENT: 'ic_actions',
    INACTIVES: '_inactive',
    CLASS_INACTIVE: 'control-inactive'
}

export { 
    REPEAT_WRAPPING,
    MIRRORED_REPEAT_WRAPPING,
    TRI_PATTERN,

    DIRECTIONAL_LIGHT,
    AMBIENT_LIGHT,
    HEMISPHERE_LIGHT,
    POINT_LIGHT,
    SPOT_LIGHT,
    DIRECTIONAL_LIGHT_TARGET,
    SPOT_LIGHT_TARGET,

    AXES,
    GRID,

    TOFU,
    TRAIN,
    SOLDIER_FEMALE,

    WEAPONS,

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

    CAMERAS,

    OUTLINE,
    SSAO,
    FXAA,
    SSAA,
    BLOOM,

    CORNOR_RAY_LAYER,
    PLAYER_RAY_LAYER,
    CAMERA_RAY_LAYER,
    PLAYER_CAMERA_RAY_LAYER,
    PLAYER_CAMERA_TRANSPARENT_LAYER,

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

    TEXTURE_NAMES,
    TEXTURES,
    GLTF_NAMES,
    GLTFS,
    SHADER_NAMES,
    SHADERS,

    SOLDIER_FEMALE_CLIPS,
    GLOCK_CLIPS,

    GUI_CONFIG
};