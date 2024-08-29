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

// composite objects
const SCENE = 'Scene';
const ROOM = 'Room';
const INSPECTOR_ROOM = 'InspectorRoom';
const SQUARE_PILLAR = 'SquarePillar';
const LWALL = 'LWall';
const CYLINDER_PILLAR = 'CylinderPillar';
const HEX_CYLINDER_PILLAR = 'HexCylinderPillar';
const BOX_CUBE = 'BoxCube';
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

// post processing layers
const BLOOM_SCENE_LAYER = 5;

// textures
const TEXTURE_NAMES = {
    CRATE: 'CRATE',
    CRATE_NORMAL: 'CRATE_NORMAL',
    PORTRAIT_1: 'PORTRAIT_1',
    PORTRAIT_1_NORMAL: 'PORTRAIT_1_NORMAL',
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
    METAL_292_NORMAL: 'METAL_292_NORMAL'
}

const TEXTURES = [{
    name: TEXTURE_NAMES.CRATE, map: 'assets/textures/crate.png', normalMap: 'assets/textures/normals/crate.jpg'
}, {
    name: TEXTURE_NAMES.PORTRAIT_1, map: 'assets/textures/portraits/leon.jpg', normalMap: 'assets/textures/normals/leon.jpg'
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
}];

// gltfs
const GLTF_NAMES = {
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
}

const GLTFS = [{
    name: GLTF_NAMES.WOODEN_PICNIC_TABLE, src: 'inRoom/tables/wooden_picnic_table_1k/wooden_picnic_table_1k.gltf'
}, {
    name: GLTF_NAMES.WOODEN_TABLE, src: 'inRoom/tables/wooden_table_1k/wooden_table_02_1k.gltf'
}, {
    name: GLTF_NAMES.ROUND_WOODEN_TABLE, src: 'inRoom/tables/round_wooden_table_01_1k/round_wooden_table_01_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_TABLE, src: 'inRoom/tables/painted_wooden_table_1k/painted_wooden_table_1k.gltf'
}, {
    nmae: GLTF_NAMES.PAINTED_WOODEN_NIGHTSTAND, src: 'inRoom/tables/painted_wooden_nightstand_1k/painted_wooden_nightstand_1k.gltf'
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

    SCENE,
    ROOM,
    INSPECTOR_ROOM,
    SQUARE_PILLAR,
    LWALL,
    CYLINDER_PILLAR,
    HEX_CYLINDER_PILLAR,
    BOX_CUBE,
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

    OUTLINE,
    SSAO,
    FXAA,
    SSAA,
    BLOOM,

    CORNOR_RAY_LAYER,
    PLAYER_RAY_LAYER,
    CAMERA_RAY_LAYER,
    PLAYER_CAMERA_RAY_LAYER,

    BLOOM_SCENE_LAYER,

    TEXTURE_NAMES,
    TEXTURES,
    GLTF_NAMES,
    GLTFS,
    SHADER_NAMES,
    SHADERS
};