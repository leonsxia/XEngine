import { updateSingleLightCamera } from "../components/shadowMaker";
import { WEAPONS, GUI_CONFIG, CAMERAS } from "../components/utils/constants";
import { makeDropdownGuiConfig, makeFolderGuiConfig, makeFolderSpecGuiConfig, makeFunctionGuiConfig, makeGuiPanel, makeObjectsGuiConfig, makeSceneRightGuiConfig, setupFunctionPanel } from "../components/utils/guiConfigHelper";
import { Gui } from "./Gui";
import { DEFAULT_BLOOM } from "./PostProcesser";
import { Resizer } from "./Resizer";

const CONTROL_TITLES = ['Lights Control', 'Objects Control'];
const INITIAL_RIGHT_PANEL = 'Objects Control'; // Lights Control
const RESOLUTION_RATIO = { '0.5x': 0.5, '0.8x': 0.8, '1x': 1, '2x': 2 };
const SCREEN_ASPECT = { '16:9': Resizer.SIZE.WIDE, '4:3': Resizer.SIZE.NORMAL, 'Full': Resizer.SIZE.FULL };
const devicePixelRatio = window.devicePixelRatio;

class GuiMaker {

    scene;
    setup;
    enabled = false;

    gui = null;
    guiRightLightsSpecs = {};
    guiLeftSpecs = {};
    guiLights = {};
    guiObjects = {};

    leftActions;

    bloomSetting = {
        BloomStrength : DEFAULT_BLOOM.strength,
        BloomRadius: DEFAULT_BLOOM.radius
    };

    constructor(scene) {

        this.scene = scene;
        this.setup = this.scene.setup;
        this.enabled = this.setup.enableGui;

    }

    init() {

        this.gui = new Gui();

        this.guiLeftSpecs = makeGuiPanel();

        this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
            folder: 'Select World',
            parent: 'selectWorld',
            name: 'Scene',
            value: { Scene: this.setup.name },
            params: this.setup.scenes,
            type: 'scene-dropdown',
            changeFn: this.setup.changeCallback
        }));

    }

    initGuiControl() {

        this.gui.init({ 
            attachedTo: this.scene, 
            left: this.guiLeftSpecs, 
            right_lights: this.guiRightLightsSpecs,
            initialRightPanel: INITIAL_RIGHT_PANEL
        });

    }

    resetGui() {

        this.gui.reset();
        this.gui.hide();

    }

    suspendGui() {        

        this.gui.suspend();
        this.gui.hide();

    }

    setupGuiConfig() {

        const $scene = this.scene;

        let { resolution = 1, screenSize = Resizer.SIZE.WIDE } = this.setup;
        
        if (devicePixelRatio === 1) resolution = 1;

        const rightGuiConfig = makeSceneRightGuiConfig(this.guiLights);

        Object.assign(rightGuiConfig.parents, $scene.lights);

        this.guiRightLightsSpecs = rightGuiConfig;
        
        this.setupLeftFunctionPanel();

        this.guiLeftSpecs.details.push(makeFunctionGuiConfig('Actions', 'actions'));

        {

            const folder = makeFolderGuiConfig({ folder: 'Screen', parent: 'screen', close: true });

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Ratio',
                value: { Ratio: resolution },
                params: RESOLUTION_RATIO,
                type: 'dropdown',
                changeFn: $scene.changeResolution.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Aspect',
                value: { Aspect: screenSize },
                params: SCREEN_ASPECT,
                type: 'dropdown',
                changeFn: $scene.changeScreenAspect.bind($scene)
            }));

            this.guiLeftSpecs.details.push(folder);

        }

        this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
            folder: 'Select Control',
            parent: 'selectControl',
            name: 'Control',
            value: { Control: INITIAL_RIGHT_PANEL },
            params: CONTROL_TITLES,
            type: 'control-dropdown',
            changeFn: this.gui.selectControl.bind(this.gui),
            close: true
        }));

        if ($scene.showRoleSelector) {
            const roles = [];

            for (let i = 0, il = $scene.players.length; i < il; i++) {

                const p = $scene.players[i];

                roles.push(p.name);

            }

            this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
                folder: 'Select Role',
                parent: 'selectRole',
                name: 'Role',
                value: { Role: $scene.player.name },
                params: roles,
                type: 'role-dropdown',
                changeFn: $scene.changeCharacter.bind($scene),
                close: true
            }));
        }

        if (!$scene.picker.isUnavailable) {
           
            const pickerActions = {
                'picker_actions': {
                    'enable': $scene.enablePicking.bind($scene)
                }
            }

            setupFunctionPanel(this.guiLeftSpecs, pickerActions);

            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(GUI_CONFIG.PICKER_CONTROL, GUI_CONFIG.PICKER_ACTIONS_PARENT, null, true));

        }

        if ($scene.postProcessor.ready) {

            const folder = makeFolderGuiConfig({ folder: GUI_CONFIG.POST_PROCESS_CONTROL, parent: 'postProcessing', close: true });

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'PostEffect',
                value: { PostEffect: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: $scene.enablePostEffect.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'FXAA',
                value: { FXAA: 'enable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: $scene.enableFXAA.bind($scene)
            }));

            $scene.enableFXAA('enable');

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'SSAA',
                value: { SSAA: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: $scene.enableSSAA.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'SSAASampleLevel',
                value: { SSAASampleLevel: 'Level 2: 4 Samples' },
                params: ['Level 0: 1 Sample', 'Level 2: 4 Samples', 'Level 3: 8 Samples', 'Level 4: 16 Samples', 'Level 5: 32 Samples'],
                type: 'dropdown',
                changeFn: $scene.changeSSAASampleLevel.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'SSAO',
                value: { SSAO: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: $scene.enableSSAO.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'SSAOOutput',
                value: { SSAOOutput: 'Default' },
                params: ['Default', 'SSAO Only', 'SSAO+Blur Only', 'Depth', 'Normal'],
                type: 'dropdown',
                changeFn: $scene.changeSSAOOutput.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Bloom',
                value: { Bloom: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: $scene.enableBloom.bind($scene)
            }));

            const bloomStrength = $scene.setup.postProcessing?.bloomStrength;
            this.bloomSetting.BloomStrength = bloomStrength ? bloomStrength : DEFAULT_BLOOM.strength;

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BloomStrength',
                value: this.bloomSetting,
                params: [0, 10],
                type: 'number',
                changeFn: $scene.changeBloomStrength.bind($scene)
            }));

            const bloomRadius = $scene.setup.postProcessing?.bloomRadius;
            this.bloomSetting.BloomRadius = bloomRadius ? bloomRadius : DEFAULT_BLOOM.radius;

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BloomRadius',
                value: this.bloomSetting,
                params: [0, 1],
                type: 'number',
                changeFn: $scene.changeBloomRadius.bind($scene)
            }));

            this.guiLeftSpecs.details.push(folder);

        }

        if ($scene.thirdPersonCamera) {

            const tpcActions = {
                'tpc_actions': {
                    'enable TPC': $scene.switchCamera.bind($scene, CAMERAS.THIRD_PERSON)
                }
            };

            setupFunctionPanel(this.guiLeftSpecs, tpcActions);
            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(GUI_CONFIG.CAMERA_CONTROL, GUI_CONFIG.TPC_ACTIONS_PARENT, null, true));

        }

        if ($scene.inspectorCamera) {

            const icActions = {
                'ic_actions': {
                    'enable IC': $scene.switchCamera.bind($scene, CAMERAS.INSPECTOR)
                }
            };

            setupFunctionPanel(this.guiLeftSpecs, icActions);
            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(GUI_CONFIG.CAMERA_CONTROL, GUI_CONFIG.IC_ACTIONS_PARENT, null, true));

        }

        if ($scene.player) {

            const healthActions = {
                'player_hp_actions': {
                    'Player HP': $scene.switchPlayerHealth.bind($scene)
                }
            }

            setupFunctionPanel(this.guiLeftSpecs, healthActions);
            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(GUI_CONFIG.HEALTH_CONTROL, GUI_CONFIG.PLAYER_HP_ACTIONS_PARENT, null, true));

            const folder = makeFolderGuiConfig({ folder: GUI_CONFIG.PLAYER_CONTROL, parent: 'playerControl', close: true });

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BBHelper',
                value: { BBHelper: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerBBHelper.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BB',
                value: { BB: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerBB.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BBW',
                value: { BBW: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerBBW.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BF',
                value: { BF: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerBF.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'CBox',
                value: { CBox: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerCBox.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'CBoxArrows',
                value: { CBoxArrows: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerCBoxArrows.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'PushingBox',
                value: { PushingBox: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerPushingBox.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Arrows',
                value: { Arrows: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerArrows.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Skeleton',
                value: { Skeleton: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showPlayerSkeleton.bind($scene)
            }));

            this.guiLeftSpecs.details.push(folder);

            // add weapons control
            const weaponOptionsActions = {
                'weapon_options_actions': {
                    'Pistol1': $scene.armWeapon.bind($scene, WEAPONS.PISTOL1),
                    'Glock 19': $scene.armWeapon.bind($scene, WEAPONS.GLOCK),
                    'Magnum357': $scene.armWeapon.bind($scene, WEAPONS.REVOLVER),
                    'SMG Short': $scene.armWeapon.bind($scene, WEAPONS.SMG_SHORT),
                    _inactive: ['Pistol1', 'Magnum357', 'SMG Short']
                }
            };

            const weaponActions = {
                'weapon_actions': {
                    'Reload All Weapons': $scene.reloadAllWeapons.bind($scene)
                }
            }

            setupFunctionPanel(this.guiLeftSpecs, weaponOptionsActions);
            setupFunctionPanel(this.guiLeftSpecs, weaponActions);
            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(GUI_CONFIG.WEAPON_CONTROL, GUI_CONFIG.WEAPONS_OPTIONS_PARENT, GUI_CONFIG.SELECT_WEAPONS, true));
            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(GUI_CONFIG.WEAPON_CONTROL, GUI_CONFIG.WEAPONS_ACTIONS_PARENT, GUI_CONFIG.WEAPON_ACTIONS, true));

        }

        if ($scene.enemies.length > 0) {

            const healthActions = {
                'enemy_hp_actions': {
                    'Enemy HP': $scene.switchEnemyHealth.bind($scene)
                }
            }

            setupFunctionPanel(this.guiLeftSpecs, healthActions);
            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(GUI_CONFIG.HEALTH_CONTROL, GUI_CONFIG.ENEMY_HP_ACTIONS_PARENT, null, true));

            const folder = makeFolderGuiConfig({ folder: GUI_CONFIG.ENEMY_CONTROL, parent: 'enemyControl', close: true });

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BBHelper',
                value: { BBHelper: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemyBBHelper.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BB',
                value: { BB: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemyBB.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BBW',
                value: { BBW: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemyBBW.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BF',
                value: { BF: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemyBF.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'CBox',
                value: { CBox: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemyCBox.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'CBoxArrows',
                value: { CBoxArrows: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemyCBoxArrows.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'PushingBox',
                value: { PushingBox: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemyPushingBox.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Arrows',
                value: { Arrows: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemyArrows.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Skeleton',
                value: { Skeleton: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showEnemySkeleton.bind($scene)
            }));

            this.guiLeftSpecs.details.push(folder);

        }

        if ($scene.cPlanes.length > 0) {

            const folder = makeFolderGuiConfig({ folder: 'cPlanes Control', parent: 'cPlanesControl', close: true });

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Wire',
                value: { Wire: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showWireframe.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Lines',
                value: { Lines: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showCPlaneLines.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Arrows',
                value: { Arrows: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showCPlaneArrows.bind($scene)
            }));

            this.guiLeftSpecs.details.push(folder);

        }

        if ($scene.cObjects.length > 0) {

            const folder = makeFolderGuiConfig({ folder: 'cObjects Control', parent: 'cObjectsControl', close: true });

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Visible',
                value: { Visible: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showCObjects.bind($scene)
            }));

            this.guiLeftSpecs.details.push(folder);

        }

        if ($scene.airWalls.length > 0) {

            const folder = makeFolderGuiConfig({ folder: 'Air Walls Control', parent: 'airWallsControl', close: true });

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Visible',
                value: { Visible: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: $scene.showAirWalls.bind($scene)
            }));

            this.guiLeftSpecs.details.push(folder);

        }
        
        // bind callback to light helper and shadow cam helper
        this.bindLightShadowHelperGuiCallback();

    }

    setupObjectsGuiConfig(objects) {

        const $scene = this.scene;

        const objectsConfig = makeObjectsGuiConfig(objects);

        for (let i = 0, il = objectsConfig.details.length; i < il; i++) {

            const detail = objectsConfig.details[i];

            const parent = `${detail.folder}_object_actions`;
            const objectActions = {};
            objectActions[parent] = { 'lock': $scene.lockObjects.bind($scene) };

            this.gui.addPanelParentObjects(objectActions);
            objectsConfig.details.push(makeFunctionGuiConfig(detail.folder, parent));

        }

        this.gui.addObjects(objectsConfig);

    }

    setupLeftFunctionPanel() {

        // assgin left panel parents
        setupFunctionPanel(this.guiLeftSpecs, this.leftActions);

    }

    clearObjectsPanel() {

        this.gui.removeObjects();

    }

    bindLightShadowHelperGuiCallback() {

        // bind callback to light helper and shadow cam helper
        for (let i = 0, il = this.scene.shadowLightObjects.length; i < il; i++) {

            const lightObj = this.scene.shadowLightObjects[i];

            const { specs } = this.guiRightLightsSpecs.details.find(d => d.parent === lightObj.name);

            const changeObjs = specs.filter(s => Object.prototype.hasOwnProperty.call(s, 'changeFn') && (s.type === 'light-num' || s.type === 'color' || s.type === 'groundColor' || s.type === 'angle'));

            for (let j = 0, jl = changeObjs.length; j < jl; j++) {

                const o = changeObjs[j];

                o['changeFn'] = () => {
                    
                    updateSingleLightCamera.call(this.scene, lightObj, false);

                    lightObj.updateAttachedObject?.();
                
                };

            }

        }

    }

}

export { GuiMaker };