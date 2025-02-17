import { updateSingleLightCamera } from "../components/shadowMaker";
import { WEAPONS } from "../components/utils/constants";
import { makeDropdownGuiConfig, makeFolderGuiConfig, makeFolderSpecGuiConfig, makeFunctionGuiConfig, makeGuiPanel, makeObjectsGuiConfig, makeSceneRightGuiConfig } from "../components/utils/guiConfigHelper";
import { Gui, IC_CONTROL, PLAYER_CONTROL, SELECT_WEAPONS, WEAPONS_OPTIONS_PARENT, TPC_CONTROL, WEAPON_CONTROL, WEAPONS_ACTIONS_PARENT, WEAPON_ACTIONS } from "./Gui";
import { DEFAULT_BLOOM } from "./PostProcesser";

const CONTROL_TITLES = ['Lights Control', 'Objects Control'];
const INITIAL_RIGHT_PANEL = 'Objects Control'; // Lights Control
const RESOLUTION_RATIO = { '0.5x': 0.5, '0.8x': 0.8, '1x': 1, '2x': 2 };
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
            name: 'scene',
            value: { scene: this.setup.name },
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

    setupGuiConfig() {

        const $scene = this.scene;

        let { resolution = 1 } = this.setup;
        
        if (devicePixelRatio === 1) resolution = 1;

        const rightGuiConfig = makeSceneRightGuiConfig(this.guiLights);

        Object.assign(rightGuiConfig.parents, $scene.lights);

        this.guiRightLightsSpecs = rightGuiConfig;
        
        this.setupLeftFunctionPanel();

        this.guiLeftSpecs.details.push(makeFunctionGuiConfig('Actions', 'actions'));
        this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
            folder: 'Change Resolution',
            parent: 'changeResolution',
            name: 'Ratio',
            value: { Ratio: resolution },
            params: RESOLUTION_RATIO,
            type: 'dropdown',
            changeFn: $scene.changeResolution.bind($scene),
            close: true
        }));

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
            $scene.players.forEach(p => roles.push(p.name));
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

        if ($scene.postProcessor) {

            const folder = makeFolderGuiConfig({ folder: 'Post Processing', parent: 'postProcessing', close: true });

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'PostEffect',
                value: { PostEffect: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: $scene.enablePostEffect.bind($scene)
            }));

            if (!$scene.picker.isUnavailable) {

                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'Picker',
                    value: { Picker: 'disable' },
                    params: ['enable', 'disable'],
                    type: 'dropdown',
                    changeFn: $scene.enablePicking.bind($scene)
                }));

            }

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'FXAA',
                value: { FXAA: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: $scene.enableFXAA.bind($scene)
            }));

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

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BloomStrength',
                value: { BloomStrength: DEFAULT_BLOOM.strength },
                params: [0, 10],
                type: 'number',
                changeFn: $scene.changeBloomStrength.bind($scene)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BloomRadius',
                value: { BloomRadius: DEFAULT_BLOOM.radius },
                params: [0, 1],
                type: 'number',
                changeFn: $scene.changeBloomRadius.bind($scene)
            }));

            this.guiLeftSpecs.details.push(folder);

        }

        if ($scene.thirdPersonCamera) {

            this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
                folder: TPC_CONTROL,
                parent: 'thirdPersonCamera',
                name: 'TPC',
                value: { TPC: 'disable' },
                params: ['enable', 'disable'],
                type: 'camera-dropdown',
                changeFn: $scene.enableTPC.bind($scene),
                close: true
            }));

        }

        if ($scene.inspectorCamera) {

            this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
                folder: IC_CONTROL,
                parent: 'inspectorCamera',
                name: 'InsCam',
                value: { InsCam: 'disable' },
                params: ['enable', 'disable'],
                type: 'camera-dropdown',
                changeFn: $scene.enableIC.bind($scene),
                close: true
            }));

        }

        if ($scene.player) {

            const folder = makeFolderGuiConfig({ folder: PLAYER_CONTROL, parent: 'playerControl', close: true });

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

            if ($scene.player.showPushingBox) {

                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'PushingBox',
                    value: { PushingBox: 'hide' },
                    params: ['show', 'hide'],
                    type: 'dropdown',
                    changeFn: $scene.showPlayerPushingBox.bind($scene)
                }));

            } 

            if ($scene.player.showArrows) {

                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'Arrows',
                    value: { Arrows: 'hide' },
                    params: ['show', 'hide'],
                    type: 'dropdown',
                    changeFn: $scene.showPlayerArrows.bind($scene)
                }));

            }

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

            this.setupFunctionPanel(this.guiLeftSpecs, weaponOptionsActions);
            this.setupFunctionPanel(this.guiLeftSpecs, weaponActions);
            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(WEAPON_CONTROL, WEAPONS_OPTIONS_PARENT, SELECT_WEAPONS, true));
            this.guiLeftSpecs.details.push(makeFunctionGuiConfig(WEAPON_CONTROL, WEAPONS_ACTIONS_PARENT, WEAPON_ACTIONS, true));

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

        const objectsConfig = makeObjectsGuiConfig(objects);

        this.gui.addObjects(objectsConfig);

    }

    setupLeftFunctionPanel() {

        // assgin left panel parents
        this.setupFunctionPanel(this.guiLeftSpecs, this.leftActions);

    }

    setupFunctionPanel(panelSpecs, functions) {

        Object.assign(panelSpecs.parents, functions);

    }

    clearObjectsPanel() {

        this.gui.removeObjects();

    }

    bindLightShadowHelperGuiCallback() {

        // bind callback to light helper and shadow cam helper
        this.scene.shadowLightObjects.forEach(lightObj => {

            const { specs } = this.guiRightLightsSpecs.details.find(d => d.parent === lightObj.name);

            const changeObjs = specs.filter(s => s.hasOwnProperty('changeFn') && (s.type === 'light-num' || s.type === 'color' || s.type === 'groundColor' || s.type === 'angle'));

            changeObjs.forEach(o => {

                o['changeFn'] = () => {
                    
                    updateSingleLightCamera.bind(this.scene, lightObj, false);

                    lightObj.updateAttachedObject?.();
                
                };

            });

        });

    }

}

export { GuiMaker };