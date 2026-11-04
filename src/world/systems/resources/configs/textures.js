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
    METAL_241: 'METAL_241',
    METAL_168: 'METAL_168',
    METAL_168_NORMAL: 'METAL_168_NORMAL',
    // brick
    BRICK_WALL_001: 'BRICK_WALL_001',
    BRICK_WALL_001_NORMAL: 'BRICK_WALL_001_NORMAL',
    BRICK_WALL_001_ARM: 'BRICK_WALL_001_ARM',
    BRICK_WALL_005: 'BRICK_WALL_005',
    BRICK_WALL_005_NORMAL: 'BRICK_WALL_005_NORMAL',
    BRICK_WALL_005_ARM: 'BRICK_WALL_005_ARM',
    DAMAGED_PLASTER: 'DAMAGED_PLASTER',
    DAMAGED_PLASTER_NORMAL: 'DAMAGED_PLASTER_NORMAL',
    DAMAGED_PLASTER_ARM: 'DAMAGED_PLASTER_ARM',
    CASTLE_BRICK_02_RED: 'CASTLE_BRICK_02_RED',
    CASTLE_BRICK_02_RED_NORMAL: 'CASTLE_BRICK_02_RED_NORMAL',
    CASTLE_BRICK_02_RED_ARM: 'CASTLE_BRICK_02_RED_ARM',
    RED_BRICK_PLASTER_PATCH_02: 'RED_BRICK_PLASTER_PATCH_02',
    RED_BRICK_PLASTER_PATCH_02_NORMAL: 'RED_BRICK_PLASTER_PATCH_02_NORMAL',
    RED_BRICK_PLASTER_PATCH_02_ARM: 'RED_BRICK_PLASTER_PATCH_02_ARM',
    WALL_BRICKS_PLASTER: 'WALL_BRICKS_PLASTER',
    WALL_BRICKS_PLASTER_NORMAL: 'WALL_BRICKS_PLASTER_NORMAL',
    WALL_BRICKS_PLASTER_ARM: 'WALL_BRICKS_PLASTER_ARM',
    PLASTER_BRICK_01: 'PLASTER_BRICK_01',
    PLASTER_BRICK_01_NORMAL: 'PLASTER_BRICK_01_NORMAL',
    PLASTER_BRICK_01_ARM: 'PLASTER_BRICK_01_ARM',
    // concrete
    WORN_MOSSY_PLASTER_WALL: 'WORN_MOSSY_PLASTER_WALL',
    WORN_MOSSY_PLASTER_WALL_NORMAL: 'WORN_MOSSY_PLASTER_WALL_NORMAL',
    WORN_MOSSY_PLASTER_WALL_ARM: 'WORN_MOSSY_PLASTER_WALL_ARM',
    // terrain
    FOREST_LEAVES_02: 'FOREST_LEAVES_02',
    FOREST_LEAVES_02_NORMAL: 'FOREST_LEAVES_02_NORMAL',
    FOREST_LEAVES_02_ARM: 'FOREST_LEAVES_02_ARM',
    FOREST_LEAVES_02_DISP: 'FOREST_LEAVES_02_DISP',
    FOREST_LEAVES_04: 'FOREST_LEAVES_04',
    FOREST_LEAVES_04_NORMAL: 'FOREST_LEAVES_04_NORMAL',
    FOREST_LEAVES_04_ARM: 'FOREST_LEAVES_04_ARM',
    FOREST_LEAVES_04_DISP: 'FOREST_LEAVES_04_DISP',
    COAST_SAND_ROCKS_01: 'COAST_SAND_ROCKS_01',
    COAST_SAND_ROCKS_01_NORMAL: 'COAST_SAND_ROCKS_01_NORMAL',
    COAST_SAND_ROCKS_01_ARM: 'COAST_SAND_ROCKS_01_ARM',
    COAST_SAND_ROCKS_01_DISP: 'COAST_SAND_ROCKS_01_DISP',
    COAST_SAND_ROCKS_02: 'COAST_SAND_ROCKS_02',
    COAST_SAND_ROCKS_02_NORMAL: 'COAST_SAND_ROCKS_02_NORMAL',
    COAST_SAND_ROCKS_02_ARM: 'COAST_SAND_ROCKS_02_ARM',
    COAST_SAND_ROCKS_02_DISP: 'COAST_SAND_ROCKS_02_DISP',
    AERIAL_ROCKS_01: 'AERIAL_ROCKS_01',
    AERIAL_ROCKS_01_NORMAL: 'AERIAL_ROCKS_01_NORMAL',
    AERIAL_ROCKS_01_ARM: 'AERIAL_ROCKS_01_ARM',
    AERIAL_ROCKS_01_DISP: 'AERIAL_ROCKS_01_DISP',
    AERIAL_GRASS_ROCK: 'AERIAL_GRASS_ROCK',
    AERIAL_GRASS_ROCK_NORMAL: 'AERIAL_GRASS_ROCK_NORMAL',
    AERIAL_GRASS_ROCK_ARM: 'AERIAL_GRASS_ROCK_ARM',
    AERIAL_GRASS_ROCK_DISP: 'AERIAL_GRASS_ROCK_DISP',
    BROWN_MUD_LEAVES_01: 'BROWN_MUD_LEAVES_01',
    BROWN_MUD_LEAVES_01_NORMAL: 'BROWN_MUD_LEAVES_01_NORMAL',
    BROWN_MUD_LEAVES_01_ARM: 'BROWN_MUD_LEAVES_01_ARM',
    BROWN_MUD_LEAVES_01_DISP: 'BROWN_MUD_LEAVES_01_DISP',
    MOSSY_ROCK: 'MOSSY_ROCK',
    MOSSY_ROCK_NORMAL: 'MOSSY_ROCK_NORMAL',
    MOSSY_ROCK_ARM: 'MOSSY_ROCK_ARM',
    MOSSY_ROCK_DISP: 'MOSSY_ROCK_DISP',
    FOREST_GROUND_01: 'FOREST_GROUND_01',
    FOREST_GROUND_01_NORMAL: 'FOREST_GROUND_01_NORMAL',
    FOREST_GROUND_01_ARM: 'FOREST_GROUND_01_ARM',
    FOREST_GROUND_01_DISP: 'FOREST_GROUND_01_DISP',
    ROCK_TRAIL: 'ROCK_TRAIL',
    ROCK_TRAIL_NORMAL: 'ROCK_TRAIL_NORMAL',
    ROCK_TRAIL_ARM: 'ROCK_TRAIL_ARM',
    ROCK_TRAIL_DISP: 'ROCK_TRAIL_DISP',
    ROCKY_TERRAIN_03: 'ROCKY_TERRAIN_03',
    ROCKY_TERRAIN_03_NORMAL: 'ROCKY_TERRAIN_03_NORMAL',
    ROCKY_TERRAIN_03_ARM: 'ROCKY_TERRAIN_03_ARM',
    ROCKY_TERRAIN_03_DISP: 'ROCKY_TERRAIN_03_DISP',
    // water
    WATER_1_M: 'WATER_1_M',
    WATER_1_M_NORMAL: 'WATER_1_M_NORMAL',
    WATER_2_M: 'WATER_2_M',
    WATER_2_M_NORMAL: 'WATER_2_M_NORMAL',
    // post-processor
    TRI_PATTERN: 'TRI_PATTERN',
    // hdr
    DIKHOLOLO_NIGHT: 'DIKHOLOLO_NIGHT'
};

const TEXTURE_ROOT = 'assets/textures';
const TEXTURE_WALL_ROOT = `${TEXTURE_ROOT}/walls`;
const TEXTURE_TERRAIN_ROOT = `${TEXTURE_ROOT}/terrain`;
const TEXTURE_NORMALS_ROOT = `${TEXTURE_ROOT}/normals`;
const TEXTURE_ARM_ROOT = `${TEXTURE_ROOT}/arm`;
const TEXTURE_DISP_ROOT = `${TEXTURE_ROOT}/disp`;
const TEXTURE_TERRAIN_SUB = `/terrain`;
const TEXTURE_BRICK_SUB = `/brick`;
const TEXTURE_CONCRETE_SUB = `/concrete`;

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
    name: TEXTURE_NAMES.CONCRETE_128, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Concrete_128M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Concrete_128L.jpg`
}, {
    name: TEXTURE_NAMES.CONCRETE_132, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Concrete_132M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Concrete_132L.jpg`
}, {
    name: TEXTURE_NAMES.CONCRETE_165, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Concrete_165M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Concrete_165L.jpg`
}, {
    name: TEXTURE_NAMES.BRICK_159, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Brick_159M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Brick_159L.jpg`
}, {
    name: TEXTURE_NAMES.FABRIC_190, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Fabric_190M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Fabric_190L.jpg`
}, {
    name: TEXTURE_NAMES.FABRIC_197, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Fabric_197M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Fabric_197L.jpg`
}, {
    name: TEXTURE_NAMES.STONE_165, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Stone_165M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Stone_165L.jpg`
}, {
    name: TEXTURE_NAMES.WOOD_156, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Wood_156M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Wood_156L.jpg`
}, {
    name: TEXTURE_NAMES.WOOD_186, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Wood_186M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Wood_186L.jpg`
}, {
    name: TEXTURE_NAMES.WOOD_227, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Wood_227M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Wood_227L.jpg`
}, {
    name: TEXTURE_NAMES.METAL_272, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Metal_272M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Metal_272L.jpg`
}, {
    name: TEXTURE_NAMES.METAL_274, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Metal_274M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Metal_274L.jpg`
}, {
    name: TEXTURE_NAMES.METAL_290, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Metal_290M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Metal_290L.jpg`
}, {
    name: TEXTURE_NAMES.METAL_292, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Metal_292M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Metal_292L.jpg`
}, {
    name: TEXTURE_NAMES.METAL_241, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Metal_241L.jpg`
}, {
    name: TEXTURE_NAMES.METAL_168, map: `${TEXTURE_WALL_ROOT}/Texturelabs_Metal_168M.jpg`, normalMap: `${TEXTURE_NORMALS_ROOT}/Texturelabs_Metal_168L.jpg`
}, {
    name: TEXTURE_NAMES.BRICK_WALL_001, 
    map: `${TEXTURE_WALL_ROOT}${TEXTURE_BRICK_SUB}/brick_wall_001_diffuse_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_BRICK_SUB}/brick_wall_001_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_BRICK_SUB}/brick_wall_001_arm_2k.jpg`
}, {
    name: TEXTURE_NAMES.BRICK_WALL_005, 
    map: `${TEXTURE_WALL_ROOT}${TEXTURE_BRICK_SUB}/brick_wall_005_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_BRICK_SUB}/brick_wall_005_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_BRICK_SUB}/brick_wall_005_arm_2k.jpg`
}, {
    name: TEXTURE_NAMES.DAMAGED_PLASTER, 
    map: `${TEXTURE_WALL_ROOT}${TEXTURE_BRICK_SUB}/damaged_plaster_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_BRICK_SUB}/damaged_plaster_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_BRICK_SUB}/damaged_plaster_arm_2k.jpg`
}, {
    name: TEXTURE_NAMES.CASTLE_BRICK_02_RED, 
    map: `${TEXTURE_WALL_ROOT}${TEXTURE_BRICK_SUB}/castle_brick_02_red_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_BRICK_SUB}/castle_brick_02_red_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_BRICK_SUB}/castle_brick_02_red_arm_2k.jpg`
}, {
    name: TEXTURE_NAMES.RED_BRICK_PLASTER_PATCH_02, 
    map: `${TEXTURE_WALL_ROOT}${TEXTURE_BRICK_SUB}/red_brick_plaster_patch_02_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_BRICK_SUB}/red_brick_plaster_patch_02_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_BRICK_SUB}/red_brick_plaster_patch_02_arm_2k.jpg`
}, {
    name: TEXTURE_NAMES.WALL_BRICKS_PLASTER, 
    map: `${TEXTURE_WALL_ROOT}${TEXTURE_BRICK_SUB}/wall_bricks_plaster_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_BRICK_SUB}/wall_bricks_plaster_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_BRICK_SUB}/wall_bricks_plaster_arm_2k.jpg`
}, {
    name: TEXTURE_NAMES.PLASTER_BRICK_01,
    map: `${TEXTURE_WALL_ROOT}${TEXTURE_BRICK_SUB}/plaster_brick_01_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_BRICK_SUB}/plaster_brick_01_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_BRICK_SUB}/plaster_brick_01_arm_2k.jpg`
}, {
    name: TEXTURE_NAMES.WORN_MOSSY_PLASTER_WALL, 
    map: `${TEXTURE_WALL_ROOT}${TEXTURE_CONCRETE_SUB}/worn_mossy_plasterwall_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_CONCRETE_SUB}/worn_mossy_plasterwall_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_CONCRETE_SUB}/worn_mossy_plasterwall_arm_2k.jpg`
}, {
    name: TEXTURE_NAMES.FOREST_LEAVES_02, 
    map: `${TEXTURE_TERRAIN_ROOT}/forest_leaves_02_diffuse_4k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/forest_leaves_02_nor_gl_4k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/forest_leaves_02_arm_4k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/forest_leaves_02_disp_2k.png`
}, {
    name: TEXTURE_NAMES.FOREST_LEAVES_04, 
    map: `${TEXTURE_TERRAIN_ROOT}/forest_leaves_04_diff_4k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/forest_leaves_04_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/forest_leaves_04_arm_4k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/forest_leaves_04_disp_2k.png`
}, {
    name: TEXTURE_NAMES.COAST_SAND_ROCKS_01, 
    map: `${TEXTURE_TERRAIN_ROOT}/coast_land_rocks_01_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/coast_land_rocks_01_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/coast_land_rocks_01_arm_2k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/coast_land_rocks_01_disp_2k.png`
}, {
    name: TEXTURE_NAMES.COAST_SAND_ROCKS_02, 
    map: `${TEXTURE_TERRAIN_ROOT}/coast_sand_rocks_02_diff_4k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/coast_sand_rocks_02_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/coast_sand_rocks_02_arm_2k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/coast_sand_rocks_02_disp_2k.png`
}, {
    name: TEXTURE_NAMES.AERIAL_ROCKS_01, 
    map: `${TEXTURE_TERRAIN_ROOT}/aerial_rocks_01_diff_4k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/aerial_rocks_01_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/aerial_rocks_01_arm_4k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/aerial_rocks_01_disp_2k.png`
}, {
    name: TEXTURE_NAMES.AERIAL_GRASS_ROCK, 
    map: `${TEXTURE_TERRAIN_ROOT}/aerial_grass_rock_diff_4k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/aerial_grass_rock_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/aerial_grass_rock_arm_4k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/aerial_grass_rock_disp_2k.png`
}, {
    name: TEXTURE_NAMES.BROWN_MUD_LEAVES_01, 
    map: `${TEXTURE_TERRAIN_ROOT}/brown_mud_leaves_01_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/brown_mud_leaves_01_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/brown_mud_leaves_01_arm_2k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/brown_mud_leaves_01_disp_2k.png`
}, {
    name: TEXTURE_NAMES.MOSSY_ROCK, 
    map: `${TEXTURE_TERRAIN_ROOT}/mossy_rock_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/mossy_rock_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/mossy_rock_arm_2k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/mossy_rock_disp_2k.png`
}, {
    name: TEXTURE_NAMES.FOREST_GROUND_01, 
    map: `${TEXTURE_TERRAIN_ROOT}/forrest_ground_01_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/forrest_ground_01_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/forrest_ground_01_arm_4k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/forrest_ground_01_disp_2k.png`
}, {
    name: TEXTURE_NAMES.ROCK_TRAIL, 
    map: `${TEXTURE_TERRAIN_ROOT}/rocky_trail_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/rocky_trail_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/rocky_trail_arm_2k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/rocky_trail_disp_2k.png`
}, {
    name: TEXTURE_NAMES.ROCKY_TERRAIN_03, 
    map: `${TEXTURE_TERRAIN_ROOT}/rocky_terrain_03_diff_2k.jpg`, 
    normalMap: `${TEXTURE_NORMALS_ROOT}${TEXTURE_TERRAIN_SUB}/rocky_terrain_03_nor_gl_2k.jpg`,
    armMap: `${TEXTURE_ARM_ROOT}${TEXTURE_TERRAIN_SUB}/rocky_terrain_03_arm_2k.jpg`,
    dispMap: `${TEXTURE_DISP_ROOT}${TEXTURE_TERRAIN_SUB}/rocky_terrain_03_disp_2k.png`
}, {
    name: TEXTURE_NAMES.WATER_1_M, normalMap: `${TEXTURE_ROOT}/water/Water_1_M_Normal.jpg`
}, {
    name: TEXTURE_NAMES.WATER_2_M, normalMap: `${TEXTURE_ROOT}/water/Water_2_M_Normal.jpg`
}, {
    name: TEXTURE_NAMES.TRI_PATTERN, map: `${TEXTURE_ROOT}/tri_pattern.jpg`
}];

const HDR_TEXTURES = [{
    name: TEXTURE_NAMES.DIKHOLOLO_NIGHT, map: 'assets/textures/hdr/dikhololo_night_4k.hdr'
}];

export { TEXTURE_NAMES,TEXTURES, HDR_TEXTURES };