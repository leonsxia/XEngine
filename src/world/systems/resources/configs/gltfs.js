// gltfs
const GLTF_NAMES = {
    // characters
    SOLDIER_FEMALE: 'SOLDIER_FEMALE',
    // creatures
    ZOMBIE_MALE: 'ZOMBIE_MALE',
    BLACK_WIDOW: 'BLACK_WIDOW',
    // pickable items
    GLOCK_ITEM: 'GLOCK_ITEM',
    PISTOL1_ITEM: 'PISTOL1_ITEM',
    REVOLVER_ITEM: 'REVOLVER_ITEM',
    SMG_SHORT_ITEM: 'SMG_SHORT_ITEM',
    BAYONET_ITEM: 'BAYONET_ITEM',
    PISTOL_AMMO_BOX_ITEM: 'PISTOL_AMMO_BOX_ITEM',
    MAGNUM_AMMO_BOX_ITEM: 'MAGNUM_AMMO_BOX_ITEM',
    SMG_AMMO_BOX_ITEM: 'SMG_AMMO_BOX_ITEM',
    FIRST_AID_KIT_SMALL: 'FIRST_AID_KIT_SMALL',
    FIRST_AID_KIT_MEDIUM: 'FIRST_AID_KIT_MEDIUM',
    FIRST_AID_KIT_LARGE: 'FIRST_AID_KIT_LARGE',
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
    VINTAGE_GRANDFATHER_CLOCK: 'VINTAGE_GRANDFATHER_CLOCK',
    BARREL_EXPLOSIVE: 'BARREL_EXPLOSIVE',
    BARREL_BLUE: 'BARREL_BLUE',
    // entries
    WOODEN_DOOR_1: 'WOODEN_DOOR_1',
    WOODEN_DOOR_2: 'WOODEN_DOOR_2',
    WOODEN_GLASS_DOOR_1: 'WOODEN_GLASS_DOOR_1',
    WOODEN_GLASS_DOOR_2: 'WOODEN_GLASS_DOOR_2',
    WOODEN_GLASS_DOOR_3: 'WOODEN_GLASS_DOOR_3',
    WOODEN_WHITE_DOOR_1: 'WOODEN_WHITE_DOOR_1',
    WOODEN_WHITE_DOOR_2: 'WOODEN_WHITE_DOOR_2',
    WOODEN_PINK_DOOR_1: 'WOODEN_PINK_DOOR_1',
    IRON_PLATE_GLASS_DOOR_1: 'IRON_PLATE_GLASS_DOOR_1',
    IRON_PLATE_GLASS_DOOR_2: 'IRON_PLATE_GLASS_DOOR_2',
    IRON_PLATE_DOOR_1: 'IRON_PLATE_DOOR_1',
    OFFICE_DOOR_1: 'OFFICE_DOOR_1',
    CLASSIC_WOODEN_DOUBLE_DOOR_1: 'CLASSIC_WOODEN_DOUBLE_DOOR_1',
    CLASSIC_WOODEN_DOOR_1: 'CLASSIC_WOODEN_DOOR_1',
    CLASSIC_WOODEN_DOOR_2: 'CLASSIC_WOODEN_DOOR_2',
    CLASSIC_WOODEN_DOOR_3: 'CLASSIC_WOODEN_DOOR_3',
    CLASSIC_WOODEN_DOOR_4: 'CLASSIC_WOODEN_DOOR_4',
    CLASSIC_WOODEN_DOOR_5: 'CLASSIC_WOODEN_DOOR_5',
    CLASSIC_WOODEN_DOOR_6: 'CLASSIC_WOODEN_DOOR_6',
    DUNGEON_GATE_1: 'DUNGEON_GATE_1',
    // scene objects
    HAND_CRAFTED_STUDIO: 'HAND_CRAFTED_STUDIO',
    NAV_ROOM: 'NAV_ROOM',
    // navigation meshes
    MANSION_NAV_MESH: 'MANSION_NAV_MESH'
};

const GLTFS = [{
    name: GLTF_NAMES.SOLDIER_FEMALE, src: 'characters/soldier_female.glb'
}, {
    name: GLTF_NAMES.ZOMBIE_MALE, src: 'creatures/zombie_male.glb'
}, {
    name: GLTF_NAMES.BLACK_WIDOW, src: 'creatures/black_widow.glb'
}, {
    name: GLTF_NAMES.WOODEN_PICNIC_TABLE, src: 'in_room/tables/wooden_picnic_table_1k/wooden_picnic_table_1k.gltf'
}, {
    name: GLTF_NAMES.WOODEN_TABLE, src: 'in_room/tables/wooden_table_1k/wooden_table_02_1k.gltf'
}, {
    name: GLTF_NAMES.ROUND_WOODEN_TABLE, src: 'in_room/tables/round_wooden_table_01_1k/round_wooden_table_01_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_TABLE, src: 'in_room/tables/painted_wooden_table_1k/painted_wooden_table_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_NIGHTSTAND, src: 'in_room/tables/painted_wooden_nightstand_1k/painted_wooden_nightstand_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_BLUE_CHAIR, src: 'in_room/seats/painted_wooden_chair_02_1k/painted_wooden_chair_02_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_WHITE_CHAIR, src: 'in_room/seats/painted_wooden_chair_01_1k/painted_wooden_chair_01_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_STOOL, src: 'in_room/seats/painted_wooden_stool_1k/painted_wooden_stool_1k.gltf'
}, {
    name: GLTF_NAMES.SOFA_03, src: 'in_room/seats/sofa_03_1k/sofa_03_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_BLUE_CABINET, src: 'in_room/shelves/painted_wooden_cabinet_02_1k/painted_wooden_cabinet_02_1k.gltf'
}, {
    name: GLTF_NAMES.SHELF_01, src: 'in_room/shelves/Shelf_01_1k/Shelf_01_1k.gltf'
}, {
    name: GLTF_NAMES.PAINTED_WOODEN_WHITE_CABINET, src: 'in_room/shelves/painted_wooden_cabinet_1k/painted_wooden_cabinet_1k.gltf'
}, {
    name: GLTF_NAMES.TELEVISION_01, src: 'in_room/electronics/Television_01_1k/Television_01_1k.gltf'
}, {
    name: GLTF_NAMES.MODERN_CEILING_LAMP_01, src: 'in_room/lighting/modern_ceiling_lamp_01_1k/modern_ceiling_lamp_01_1k.gltf'
}, {
    name: GLTF_NAMES.SECURITY_LIGHT, src: 'in_room/lighting/security_light_1k/security_light_1k.gltf'
}, {
    name: GLTF_NAMES.FANCY_PICTURE_FRAME_01, src: 'in_room/decorative/fancy_picture_frame_01_1k/fancy_picture_frame_01_1k.gltf'
}, {
    name: GLTF_NAMES.VINTAGE_GRANDFATHER_CLOCK, src: 'in_room/decorative/vintage_grandfather_clock_01_1k/vintage_grandfather_clock_01_1k.gltf'
}, {
    name: GLTF_NAMES.BARREL_EXPLOSIVE, src: 'in_room/decorative/barrel_01_2k/Barrel_01_2k.gltf'
}, {
    name: GLTF_NAMES.BARREL_BLUE, src: 'in_room/decorative/barrel_03_2k/barrel_03_2k.gltf'
}, {
    name: GLTF_NAMES.BAYONET_ITEM, src: 'weapons/bayonet.glb'
}, {
    name: GLTF_NAMES.PISTOL1_ITEM, src: 'weapons/pistol.glb'
}, {
    name: GLTF_NAMES.GLOCK_ITEM, src: 'weapons/glock19.glb'
}, {
    name: GLTF_NAMES.REVOLVER_ITEM, src: 'weapons/revolver.glb'
}, {
    name: GLTF_NAMES.SMG_SHORT_ITEM, src: 'weapons/smg1.glb'
}, {
    name: GLTF_NAMES.PISTOL_AMMO_BOX_ITEM, src: 'pickable_items/ammunition/pistol_ammo_box.glb'
}, {
    name: GLTF_NAMES.MAGNUM_AMMO_BOX_ITEM, src: 'pickable_items/ammunition/magnum_ammo_box.glb'
}, {
    name: GLTF_NAMES.SMG_AMMO_BOX_ITEM, src: 'pickable_items/ammunition/smg_ammo_box.glb'
}, {
    name: GLTF_NAMES.FIRST_AID_KIT_SMALL, src: 'pickable_items/health/first_aid_kit_small.glb'
}, {
    name: GLTF_NAMES.FIRST_AID_KIT_MEDIUM, src: 'pickable_items/health/first_aid_kit_medium.glb'
}, {
    name: GLTF_NAMES.FIRST_AID_KIT_LARGE, src: 'pickable_items/health/first_aid_kit_large.glb'
}, {
    name: GLTF_NAMES.WOODEN_DOOR_1, src: 'in_room/entries/wooden_door_1.glb'
}, {
    name: GLTF_NAMES.WOODEN_DOOR_2, src: 'in_room/entries/wooden_door_2.glb'
}, {
    name: GLTF_NAMES.WOODEN_GLASS_DOOR_1, src: 'in_room/entries/wooden_glass_door_1.glb'
}, {
    name: GLTF_NAMES.WOODEN_GLASS_DOOR_2, src: 'in_room/entries/wooden_glass_door_2.glb'
}, {
    name: GLTF_NAMES.WOODEN_GLASS_DOOR_3, src: 'in_room/entries/wooden_glass_door_3.glb'
}, {
    name: GLTF_NAMES.WOODEN_WHITE_DOOR_1, src: 'in_room/entries/wooden_white_door_1.glb'
}, {
    name: GLTF_NAMES.WOODEN_WHITE_DOOR_2, src: 'in_room/entries/wooden_white_door_2.glb'
}, {
    name: GLTF_NAMES.WOODEN_PINK_DOOR_1, src: 'in_room/entries/wooden_pink_door_1.glb'
}, {
    name: GLTF_NAMES.IRON_PLATE_GLASS_DOOR_1, src: 'in_room/entries/iron_plate_glass_door_1.glb'
}, {
    name: GLTF_NAMES.IRON_PLATE_GLASS_DOOR_2, src: 'in_room/entries/iron_plate_glass_door_2.glb'
}, {
    name: GLTF_NAMES.IRON_PLATE_DOOR_1, src: 'in_room/entries/iron_plate_door_1.glb'
}, {
    name: GLTF_NAMES.CLASSIC_WOODEN_DOUBLE_DOOR_1, src: 'in_room/entries/classic_wooden_double_door_1.glb'
}, {
    name: GLTF_NAMES.CLASSIC_WOODEN_DOOR_1, src: 'in_room/entries/classic_wooden_door_1.glb'
}, {
    name: GLTF_NAMES.CLASSIC_WOODEN_DOOR_2, src: 'in_room/entries/classic_wooden_door_2.glb'
}, {
    name: GLTF_NAMES.CLASSIC_WOODEN_DOOR_3, src: 'in_room/entries/classic_wooden_door_3.glb'
}, {
    name: GLTF_NAMES.CLASSIC_WOODEN_DOOR_4, src: 'in_room/entries/classic_wooden_door_4.glb'
}, {
    name: GLTF_NAMES.CLASSIC_WOODEN_DOOR_5, src: 'in_room/entries/classic_wooden_door_5.glb'
}, {
    name: GLTF_NAMES.CLASSIC_WOODEN_DOOR_6, src: 'in_room/entries/classic_wooden_door_6.glb'
}, {
    name: GLTF_NAMES.DUNGEON_GATE_1, src: 'in_room/entries/dungeon_gate_1.glb'
}, {
    name: GLTF_NAMES.HAND_CRAFTED_STUDIO, src: 'scene_objects/rooms/hand_crafted_studio_1-2k_compact/hand_crafted_studio.glb'
}, {
    name: GLTF_NAMES.NAV_ROOM, src: 'scene_objects/rooms/nav_room/nav_room.glb'
}, {
    name: GLTF_NAMES.MANSION_NAV_MESH, src: 'scene_objects/nav_meshes/mansion/mansion_nav_mesh.glb'
}];

export { GLTF_NAMES, GLTFS };