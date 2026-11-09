const GUI_OPTIONS = {
    SHOW_HIDE: ['show', 'hide'],
    ENABLE_DISABLE: ['enable', 'disable'],
    ENABLE_CAMERA: ['enable TPC', 'enable IC'],
    YES_NO: ['yes', 'no'],
    HEALTH: ['Player HP', 'Enemy HP'],
    WEAPONS: ['Pistol1', 'Glock 19', 'Magnum357', 'SMG Short'],
    WEAPON_ACTIONS: ['Reload All Weapons'],
    CONTROL_TITLES: ['Lights Control', 'Objects Control']
};

const GUI_STRINGS = {
    enable: GUI_OPTIONS.ENABLE_DISABLE[0],
    disable: GUI_OPTIONS.ENABLE_DISABLE[1],
    show: GUI_OPTIONS.SHOW_HIDE[0],
    hide: GUI_OPTIONS.SHOW_HIDE[1],
    yes: GUI_OPTIONS.YES_NO[0],
    no: GUI_OPTIONS.YES_NO[1]
};

const GUI_MEASURES = {
    DEFALUT_GRID_WIDTH: 50,
    DEFAULT_GRID_HEIGHT: 25,
    DEFALUT_GRID_DEPTH: 50,
    NUMBER_STEPS: .01,
    SCALE_MIN: .1,
    SCALE_MAX: 10,
    WATER_SCALE_MAX: 30,
    PICKED_NUMBER_STEPS: .01,
    PICKED_ANGLE_STEPS: .1,
    PICKED_WEAPON_NUMBER_STEPS: .001,
    LIGHT_BIAS_STEPS: .00001,
    MAX_ANGLE: 180,
    MAX_RADIUS: Math.PI * .5,
    RADIUS_STEPS: .0001
};

// Gui
const GUI_CONFIG = {
    CONTROL_TITLES : {
        MENU: 'Menu', 
        LIGHT_CONTROL: 'Lights Control', 
        OBJECTS_CONTROL: 'Objects Control'
    },
    PANEL_TITLES : {
        MENU: 'Menu', 
        LIGHT_CONTROL: 'Lights Control', 
        OBJECTS_CONTROL: 'Objects Control'
    },
    SELECT_WORLD_CONTROL: 'Select World',
    MENU_ACTIONS: 'Actions',
    SCREEN_SETTINGS: 'Screen Settings',
    SELECT_CONTROL: "Select Control",
    SELECT_ROLE: 'Select Role',
    TONE_MAPPING: 'Tone Mapping',
    SCENE: 'Scene',
    SCENE_HDR: 'HDR',
    AUDIO: 'Audio',
    RAPIER: 'Rapier Physics',
    PLAYER_CONTROL: 'Player Control',
    ENEMY_CONTROL: 'Enemy Control',
    CUSTOM_HELPERS: 'Custom Helpers',
    POST_PROCESS_CONTROL: 'Post Processing',
    POST_PROCESS_SSAA: 'SSAA',
    POST_PROCESS_SSAO: 'SSAO',
    POST_PROCESS_BLOOM: 'BLOOM',
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
    C_PLANES: 'cPlanes Control',
    C_OBJECTS: 'cObjects Control',
    AIR_WALLS: 'Air Walls Control',
    CLASS_INACTIVE: 'control-inactive'
};

export { GUI_OPTIONS, GUI_CONFIG, GUI_STRINGS, GUI_MEASURES };