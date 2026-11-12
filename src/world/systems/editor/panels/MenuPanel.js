import { TONE_MAPPING, CAMERAS, WEAPONS } from '../../../components/utils/constants.js';
import { GUI_CONFIG, GUI_OPTIONS } from '../editorConfig.js';
import { Resizer } from '../../Resizer.js'
import Panel from './Panel.js';

const RESOLUTION_RATIO = { '0.5x': 0.5, '0.8x': 0.8, '1x': 1, '2x': 2 };
const SCREEN_ASPECT = { '16:9': Resizer.SIZE.WIDE, '4:3': Resizer.SIZE.NORMAL, 'Full': Resizer.SIZE.FULL };
const devicePixelRatio = window.devicePixelRatio;

export default class MenuPanel extends Panel {

    constructor(scope) {

        super(scope);

    }

    init() {

        // initialize menu panel
        this.scope.panel_menu = this.guiMaker.addGui({
            title: GUI_CONFIG.PANEL_TITLES.MENU,
            width: 220,
            styles: {
                left: '0',
                top: '70px'
            }
        });

        this.folders = this.guiMaker.folders[GUI_CONFIG.PANEL_TITLES.MENU];
        this.controllers = this.guiMaker.controllers[GUI_CONFIG.PANEL_TITLES.MENU];

        this.getLocalDomain();

        // 1. add select scene control
        this.addSelectScene();

        // 2. add actions folder and controls
        this.addActions();

        // 3. add screen settings
        this.addScreenSettings();

        // 4. add select controls
        this.addSelectControls();

        // 5. add select role
        this.addSelectRole();

        // 6. add tone mapping
        this.addToneMappingControls();

        // 7. add scene settings
        this.addSceneSettings();

        // 8. add audio settings
        this.addAudioSettings();

        // 9. add rapier controls
        this.addRapierControls();

        // 10. add pathfinding
        this.addPathfindingControls();

        // 11. add picker control
        this.addPickerControls();

        // 12. add post processor controls
        this.addPostProcessorControls();

        // 13. add cameras control
        this.addCamerasControls();

        // 14. add health controls
        this.addHealthControls();

        // 15. add player controls
        this.addPlayerControls();

        // 16. add weapon controls
        this.addWeaponControls();

        // 17. add enemy controls
        this.addEnemyControls();

        // 18. add cPlane controls
        this.addCPlaneControls();

        // 19. add cObject controls
        this.addCObjectControls();

        // 20. add air wall controls
        this.addAirWallControls();

    }

    /**
     * 1. add select scene control
     */
    addSelectScene() {

        const { $scope, $scene, controllers } = this.domain;
        $scope.ctl_selectScene = controllers.ctl_selectWorld_Scene = $scope.panel_menu
            .addFolder(GUI_CONFIG.SELECT_WORLD_CONTROL)
            .add({ Scene: $scope.setup.name }, 'Scene', $scope.setup.scenes)
            .name('Scene')
            .onChange((value) => {

                if ($scope.sceneChanged) return;

                $scope.sceneChanged = true;
                $scene.world.changeScene.call($scene.world, value);

            });

    }

    /**
     * 2. add actions folder and controls
     */
    addActions() {

        const { $scope, $scene, folders } = this.domain;
        const { actions } = $scope.setup;
        const actionObjects = {};
        for (const action of actions) {

            if (action === 'resetPlayer') {

                actionObjects[action] = $scene.resetCurrentPlayer.bind($scene);

            } else if (action === 'resetCamera') {

                actionObjects[action] = $scene.resetCamera.bind($scene, false);

            } else if (action === 'focusNext') {

                actionObjects[action] = $scene.focusNext.bind($scene, false);

            } else if (action === 'moveCamera') {

                actionObjects[action] = $scene.moveCamera.bind($scene, false);

            } else {

                actionObjects[action] = $scene[action].bind($scene);

            }

        }

        folders.folder_menuActions = $scope.panel_menu.addFolder(GUI_CONFIG.MENU_ACTIONS);
        for (const action of actions) {

            folders.folder_menuActions.add(actionObjects, action);

        }

    }

    /**
     * 3. add screen settings
     */
    addScreenSettings() {

        const { $scope, $scene, folders, controllers } = this.domain;
        let { resolution = 1, screenSize = Resizer.SIZE.WIDE } = $scope.setup;
        if (devicePixelRatio === 1) resolution = 1;

        folders.folder_screenSettings = $scope.panel_menu.addFolder(GUI_CONFIG.SCREEN_SETTINGS).close();
        controllers.ctl_screen_resolution = folders.folder_screenSettings
            .add({ Ratio: resolution }, 'Ratio', RESOLUTION_RATIO)
            .name('Ratio')
            .onChange((value) => {

                $scene.changeResolution.call($scene, value);

            });

        controllers.ctl_screen_aspect = folders.folder_screenSettings
            .add({ Aspect: screenSize }, 'Aspect', SCREEN_ASPECT)
            .name('Aspect')
            .onChange((value) => {

                $scene.changeScreenAspect.call($scene, value);

            });

    }

    /**
     * 4. add select controls
     */
    addSelectControls() {

        const { $scope, folders, controllers } = this.domain;
        folders.folder_selectControl = $scope.panel_menu.addFolder(GUI_CONFIG.SELECT_CONTROL).close();
        $scope.ctl_selectControl = controllers.ctl_select_control = folders.folder_selectControl
            .add({ Control: $scope.initialRightPanel }, 'Control')
            .options(GUI_OPTIONS.CONTROL_TITLES)
            .name('Control')
            .onChange(value => {

                $scope.selectPanel.call($scope, value);

            });

    }

    /**
     * 5. add select role
     */
    addSelectRole() {

        const { $scope, $scene, $guiMaker, folders, controllers } = this.domain;
        if ($scene.showRoleSelector) {

            const roles = $scene.players.map(p => p.name);

            folders.folder_selectRole = $scope.panel_menu.addFolder(GUI_CONFIG.SELECT_ROLE).close();
            controllers.ctl_selectRole_role = folders.folder_selectRole
                .add({ Role: $scene.player.name }, 'Role', roles)
                .listen()
                .name('Role')
                .onChange((value) => {

                    $scene.changeCharacter.call($scene, value);

                    if (!folders.folder_weapons) return;

                    const combatPlayer = $scene.player.isCombatPlayer ? $scene.player : false;
                    if (combatPlayer && combatPlayer.armedWeapon) {

                        $guiMaker.setFolderActiveController(
                            folders.folder_weapons,
                            controllers[`ctl_weapon_${combatPlayer.armedWeapon._weaponType}`]
                        );

                    } else {

                        folders.folder_weapons.controllers.forEach(ctl => {

                            $guiMaker.inactivateController(ctl, false);

                        });

                    }

                });

        }

    }

    /**
     * 6. add tone mapping
     */
    addToneMappingControls() {

        const { $scope, $scene, folders, controllers } = this.domain;
        folders.folder_toneMapping = $scope.panel_menu.addFolder(GUI_CONFIG.TONE_MAPPING).close();
        controllers.ctl_toneMapping_type = folders.folder_toneMapping
            .add($scene.renderer, 'toneMapping', TONE_MAPPING)
            .name('Type',)
            .listen()
            .onChange((value) => {

                $scene.changeToneMapping.call($scene, value);

            });

        controllers.ctl_toneMapping_exposure = folders.folder_toneMapping
            .add($scene.renderer, 'toneMappingExposure', 0, 10)
            .name('Exposure')
            .listen()
            .onChange((value) => {

                $scene.changeToneExposure.call($scene, value);

            });

    }

    /**
     * 7. add scene settings
     */
    addSceneSettings() {

        const { $scope, $scene, folders } = this.domain;

        // HDR
        if ($scope.setup.envHDR?.enabled) {

            folders.folder_scene = $scope.panel_menu.addFolder(GUI_CONFIG.SCENE).close();
            folders.folder_scene_hdr = folders.folder_scene.addFolder(GUI_CONFIG.SCENE_HDR);
            folders.folder_scene_hdr
                .add($scene.scene, 'backgroundRotationX', - 184, 180, .01)
                .listen()
                .name('HDR.rotX');
            folders.folder_scene_hdr
                .add($scene.scene, 'backgroundRotationY', - 180, 180, .01)
                .listen()
                .name('HDR.rotY');
            folders.folder_scene_hdr
                .add($scene.scene, 'backgroundRotationZ', - 180, 180, .01)
                .listen()
                .name('HDR.rotZ');
            folders.folder_scene_hdr
                .add($scene.scene, 'backgroundIntensity', 0, 5, .01)
                .listen()
                .name('HDR.intensity');

        }

    }

    /**
     * 8. add audio settings
     */
    addAudioSettings() {

        const { $scope, $scene, folders, controllers } = this.domain;
        const volume = { level: 1 };
        folders.folder_audio = $scope.panel_menu.addFolder(GUI_CONFIG.AUDIO).close();
        controllers.ctl_audio_master_volume = folders.folder_audio
            .add(volume, 'level', 0, 5, .01)
            .name('Volume')
            .onChange((value) => {

                $scene.changeVolume.call($scene, value);

            });

    }

    /**
     * 9. add rapier controls
     */
    addRapierControls() {

        const { $scope, $scene, folders, controllers } = this.domain;
        if ($scene.physics?.isRapierWorld) {

            folders.folder_rapier = $scope.panel_menu.addFolder(GUI_CONFIG.RAPIER).close();
            controllers.ctl_rapier_debug = folders.folder_rapier
                .add({ Debugger: GUI_OPTIONS.SHOW_HIDE[1] }, 'Debugger', GUI_OPTIONS.SHOW_HIDE)
                .name('Debugger')
                .onChange((value) => {

                    $scene.showRapierDebugger.call($scene, value);

                });

        }

    }

    /**
     * 10. add pathfinding
     */
    addPathfindingControls() {

        const { $scope, $scene, folders, controllers } = this.domain;
        if ($scene.pathfindingEnabled) {

            const { pathfinding = {} } = $scope.setup;
            const { showNavigationMesh = false } = pathfinding;
            const showNavMeshStr = showNavigationMesh ? GUI_OPTIONS.SHOW_HIDE[0] : GUI_OPTIONS.SHOW_HIDE[1];
            folders.folder_pathfinding = $scope.panel_menu.addFolder(GUI_CONFIG.PATHFINDING_CONTROL).close();
            controllers.ctl_pathfinding_showNavMesh = folders.folder_pathfinding
                .add({ 'Navigation Mesh': showNavMeshStr }, 'Navigation Mesh', GUI_OPTIONS.SHOW_HIDE)
                .name('Navigation Mesh')
                .onChange((value) => {

                    $scene.showNavMesh.call($scene, value);

                });

            $scene.showNavMesh(showNavMeshStr);

        }

    }

    /**
     * 11. add picker control
     */
    addPickerControls() {

        const { $scope, $scene, $guiMaker, folders, controllers } = this.domain;
        if (!$scene.picker.isUnavailable) {

            const pickerActions = {
                [GUI_OPTIONS.ENABLE_DISABLE[0]]: $scene.enablePicking.bind($scene)
            };

            folders.folder_picker = $scope.panel_menu.addFolder(GUI_CONFIG.PICKER_CONTROL).close();
            controllers.ctl_picker = folders.folder_picker
                .add(pickerActions, GUI_OPTIONS.ENABLE_DISABLE[0])
                .name(GUI_OPTIONS.ENABLE_DISABLE[0])
                .onChange(() => {

                    $guiMaker.switchControllerState(controllers.ctl_picker);

                });

        }

    }

    /**
     * 12. add post processor controls
     */
    addPostProcessorControls() {

        const { $scope, $scene, $guiMaker, folders, controllers } = this.domain;
        if ($scene.postProcessor.ready) {

            const enable = $scene.setup.postProcessing?.enable;

            folders.folder_postProcessor = $scope.panel_menu.addFolder(GUI_CONFIG.POST_PROCESS_CONTROL).close();

            controllers.ctl_post_enable = folders.folder_postProcessor
                .add({ PostEffect: enable ? GUI_OPTIONS.ENABLE_DISABLE[0] : GUI_OPTIONS.ENABLE_DISABLE[1] }, 'PostEffect')
                .options(GUI_OPTIONS.ENABLE_DISABLE)
                .name('Post Effect')
                .listen()
                .onChange(value => {

                    $scene.enablePostEffect.call($scene, value);

                });

            // FXAA
            controllers.ctl_post_fxaa = folders.folder_postProcessor
                .add({ FXAA: GUI_OPTIONS.ENABLE_DISABLE[0] }, 'FXAA')
                .options(GUI_OPTIONS.ENABLE_DISABLE)
                .name('FXAA')
                .onChange(value => {

                    $scene.enableFXAA.call($scene, value);

                });
            $scene.enableFXAA(GUI_OPTIONS.ENABLE_DISABLE[0]);

            // SSAA
            folders.folder_postProcessor_ssaa = folders.folder_postProcessor.addFolder(GUI_CONFIG.POST_PROCESS_SSAA).close();
            controllers.ctl_post_ssaa = folders.folder_postProcessor_ssaa
                .add({
                    // the onChange callback will be fired on click, after the function executes
                    [GUI_OPTIONS.ENABLE_DISABLE[0]]: () => {
                        const value = $guiMaker.controllerIsActive(controllers.ctl_post_ssaa) ? GUI_OPTIONS.ENABLE_DISABLE[0] : GUI_OPTIONS.ENABLE_DISABLE[1];
                        $scene.enableSSAA.call($scene, value);
                    }
                }, GUI_OPTIONS.ENABLE_DISABLE[0])
                .name(GUI_OPTIONS.ENABLE_DISABLE[0])
                .onChange(() => {

                    $guiMaker.switchControllerState(controllers.ctl_post_ssaa);

                });

            controllers.ctl_post_ssaa_sample_level = folders.folder_postProcessor_ssaa
                .add({ SSAASampleLevel: 'Level 2: 4 Samples' }, 'SSAASampleLevel')
                .options(['Level 0: 1 Sample', 'Level 2: 4 Samples', 'Level 3: 8 Samples', 'Level 4: 16 Samples', 'Level 5: 32 Samples'])
                .name('Sample Level')
                .onChange(value => {

                    $scene.changeSSAASampleLevel.call($scene, value);

                });

            // SSAO
            folders.folder_postProcessor_ssao = folders.folder_postProcessor.addFolder(GUI_CONFIG.POST_PROCESS_SSAO).close();
            controllers.ctl_post_ssao = folders.folder_postProcessor_ssao
                .add({
                    // step 1. the onChange callback will be fired on click, after the function executes
                    [GUI_OPTIONS.ENABLE_DISABLE[0]]: () => {
                        const value = $guiMaker.controllerIsActive(controllers.ctl_post_ssao) ? GUI_OPTIONS.ENABLE_DISABLE[0] : GUI_OPTIONS.ENABLE_DISABLE[1];
                        $scene.enableSSAO.call($scene, value);
                    }
                }, GUI_OPTIONS.ENABLE_DISABLE[0])
                .name(GUI_OPTIONS.ENABLE_DISABLE[0])
                .onChange(() => {

                    $guiMaker.switchControllerState(controllers.ctl_post_ssao);

                });

            controllers.ctl_post_ssao_output = folders.folder_postProcessor_ssao
                .add({ SSAOOutput: 'Default' }, 'SSAOOutput')
                .options(['Default', 'SSAO Only', 'SSAO+Blur Only', 'Depth', 'Normal'])
                .name('Output')
                // step 3
                .onChange(value => {

                    $scene.changeSSAOOutput.call($scene, value);

                });

            // Bloom
            const enableBloom = $scene.setup.postProcessing?.bloomEnable;
            const bloomTitle = enableBloom ? GUI_OPTIONS.ENABLE_DISABLE[1] : GUI_OPTIONS.ENABLE_DISABLE[0];
            folders.folder_postProcessor_bloom = folders.folder_postProcessor.addFolder(GUI_CONFIG.POST_PROCESS_BLOOM).close();
            controllers.ctl_post_bloom = folders.folder_postProcessor_bloom
                .add({
                    // step 1. the onChange callback will be fired on click, after the function executes
                    [GUI_OPTIONS.ENABLE_DISABLE[0]]: () => {
                        const value = $guiMaker.controllerIsActive(controllers.ctl_post_bloom) ? GUI_OPTIONS.ENABLE_DISABLE[0] : GUI_OPTIONS.ENABLE_DISABLE[1];
                        $scene.enableBloom.call($scene, value);
                    }
                }, [GUI_OPTIONS.ENABLE_DISABLE[0]])
                .name(bloomTitle)
                // step 3
                .onChange(() => {

                    $guiMaker.switchControllerState(controllers.ctl_post_bloom);

                });
            enableBloom ? $guiMaker.inactivateController(controllers.ctl_post_bloom) : $guiMaker.activateController(controllers.ctl_post_bloom);

            const bloomStrength = $scene.setup.postProcessing?.bloomStrength;
            $scope.bloomSetting.BloomStrength = bloomStrength ?? $scope.bloomSetting.BloomStrength;
            controllers.ctl_post_bloom_strength = folders.folder_postProcessor_bloom
                .add($scope.bloomSetting, 'BloomStrength', 0, 3)
                .name('Strength');
            controllers.ctl_post_bloom_strength.changeFn = event => {

                $scene.changeBloomStrength.call($scene, event.value);

            };

            const bloomRadius = $scene.setup.postProcessing?.bloomRadius;
            $scope.bloomSetting.BloomRadius = bloomRadius ?? $scope.bloomSetting.BloomRadius;
            controllers.ctl_post_bloom_radius = folders.folder_postProcessor_bloom
                .add($scope.bloomSetting, 'BloomRadius', 0, 10)
                .name('Radius');
            controllers.ctl_post_bloom_radius.changeFn = event => {

                $scene.changeBloomRadius.call($scene, event.value);

            };

        }

    }

    /**
     * 13. add cameras control
     */
    addCamerasControls() {

        const { $scope, $scene, $guiMaker, folders, controllers } = this.domain;
        const changeFn = (ctl) => {

            const isActive = $guiMaker.controllerIsActive(ctl);
            if (isActive) {

                $guiMaker
                    .findSiblings(folders.folder_camera, ctl)
                    .forEach(ctl => $guiMaker.activateController(ctl));

            }

            $guiMaker.switchControllerState(ctl, false);

        }

        // third person camera control
        if ($scene.thirdPersonCamera) {

            const tpcActions = {
                [GUI_OPTIONS.ENABLE_CAMERA[0]]: $scene.switchCamera.bind($scene, CAMERAS.THIRD_PERSON)
            };

            folders.folder_camera = $scope.panel_menu.addFolder(GUI_CONFIG.CAMERA_CONTROL).close();
            controllers.ctl_tpc = folders.folder_camera
                .add(tpcActions, GUI_OPTIONS.ENABLE_CAMERA[0])
                .name(GUI_OPTIONS.ENABLE_CAMERA[0])
                .onChange(() => {

                    changeFn(controllers.ctl_tpc);

                });

        }

        // inspector camera control
        if ($scene.inspectorCamera) {

            const tpcActions = {
                [GUI_OPTIONS.ENABLE_CAMERA[1]]: $scene.switchCamera.bind($scene, CAMERAS.INSPECTOR)
            };

            folders.folder_camera = folders.folder_camera ?? $scope.panel_menu.addFolder(GUI_CONFIG.CAMERA_CONTROL).close();
            controllers.ctl_ic = folders.folder_camera
                .add(tpcActions, GUI_OPTIONS.ENABLE_CAMERA[1])
                .name(GUI_OPTIONS.ENABLE_CAMERA[1])
                .onChange(() => {

                    changeFn(controllers.ctl_ic);

                });

            controllers.ctl_ic_areas = folders.folder_camera
                .add({ 'IC Areas': GUI_OPTIONS.SHOW_HIDE[1] }, 'IC Areas')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('IC Areas')
                .onChange(value => {

                    $scene.showICAreas.call($scene, value);

                });

            controllers.ctl_ic_fixed = folders.folder_camera
                .add({ 'Fixed IC': $scene.setup.ICFollowPlayer ? GUI_OPTIONS.YES_NO[1] : GUI_OPTIONS.YES_NO[0] }, 'Fixed IC')
                .options(GUI_OPTIONS.YES_NO)
                .name('Fixed IC')
                .onChange(value => {

                    $scene.switchFixedInspectorCamera.call($scene, value);

                });

        }

    }

    /**
     * 14. add health controls
     */
    addHealthControls() {

        const { $scope, $scene, $guiMaker, folders, controllers } = this.domain;
        if ($scene.player || $scene.enemies.length) {

            folders.folder_health = $scope.panel_menu.addFolder(GUI_CONFIG.HEALTH_CONTROL).close();

        }

        if ($scene.player) {

            // player health
            const healthActions = {
                [GUI_OPTIONS.HEALTH[0]]: $scene.switchPlayerHealth.bind($scene)
            };
            controllers.ctl_health_player = folders.folder_health
                .add(healthActions, GUI_OPTIONS.HEALTH[0])
                .name(GUI_OPTIONS.HEALTH[0])
                .onChange(() => {

                    $guiMaker.switchControllerState(controllers.ctl_health_player, false);

                });

        }

        if ($scene.enemies.length) {

            // enemy health
            const healthActions = {
                [GUI_OPTIONS.HEALTH[1]]: $scene.switchEnemyHealth.bind($scene)
            };
            controllers.ctl_health_enemy = folders.folder_health
                .add(healthActions, GUI_OPTIONS.HEALTH[1])
                .name(GUI_OPTIONS.HEALTH[1])
                .onChange(() => {

                    $guiMaker.switchControllerState(controllers.ctl_health_enemy, false);

                });

        }

    }

    /**
     * 15. add player controls
     */
    addPlayerControls() {

        const { $scope, $scene, folders, controllers } = this.domain;
        if ($scene.player) {

            // player controls folder
            folders.folder_player = $scope.panel_menu.addFolder(GUI_CONFIG.PLAYER_CONTROL).close();

            /**
             * custom helpers
             */
            {
                folders.folder_player_custom_helpers = folders.folder_player.addFolder(GUI_CONFIG.CUSTOM_HELPERS).close();
                controllers.ctl_player_bbhelper = folders.folder_player_custom_helpers
                    .add({ BBHelper: GUI_OPTIONS.SHOW_HIDE[1] }, 'BBHelper')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Bounding-box Helper')
                    .onChange(value => {

                        $scene.showPlayerBBHelper.call($scene, value);

                    });

                controllers.ctl_player_bb = folders.folder_player_custom_helpers
                    .add({ BB: GUI_OPTIONS.SHOW_HIDE[1] }, 'BB')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Bounding-box')
                    .onChange(value => {

                        $scene.showPlayerBB.call($scene, value);

                    });

                controllers.ctl_player_bbw = folders.folder_player_custom_helpers
                    .add({ BBW: GUI_OPTIONS.SHOW_HIDE[1] }, 'BBW')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Bounding-box Wire')
                    .onChange(value => {

                        $scene.showPlayerBBW.call($scene, value);

                    });

                controllers.ctl_player_bf = folders.folder_player_custom_helpers
                    .add({ BF: GUI_OPTIONS.SHOW_HIDE[1] }, 'BF')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Bounding-faces')
                    .onChange(value => {

                        $scene.showPlayerBF.call($scene, value);

                    });

                controllers.ctl_player_cbox = folders.folder_player_custom_helpers
                    .add({ CBox: GUI_OPTIONS.SHOW_HIDE[1] }, 'CBox')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Collision-box')
                    .onChange(value => {

                        $scene.showPlayerCBox.call($scene, value);

                    });

                controllers.ctl_player_cbox_arrows = folders.folder_player_custom_helpers
                    .add({ CBoxArrows: GUI_OPTIONS.SHOW_HIDE[1] }, 'CBoxArrows')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Collision-box Arrows')
                    .onChange(value => {

                        $scene.showPlayerCBoxArrows.call($scene, value);

                    });

                controllers.ctl_player_pushing_box = folders.folder_player_custom_helpers
                    .add({ PushingBox: GUI_OPTIONS.SHOW_HIDE[1] }, 'PushingBox')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Pushing-box')
                    .onChange(value => {

                        $scene.showPlayerPushingBox.call($scene, value);

                    });

                controllers.ctl_player_raycaster_arrows = folders.folder_player_custom_helpers
                    .add({ Arrows: GUI_OPTIONS.SHOW_HIDE[1] }, 'Arrows')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Raycaster Arrows')
                    .onChange(value => {

                        $scene.showPlayerArrows.call($scene, value);

                    });
            }

            controllers.ctl_player_navigation_arrow = folders.folder_player
                .add({ NavigationArrow: GUI_OPTIONS.SHOW_HIDE[1] }, 'NavigationArrow')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Navigation Arrow')
                .onChange(value => {

                    $scene.showPlayerNavigationArrow.call($scene, value);

                });

            controllers.ctl_player_skeleton = folders.folder_player
                .add({ Skeleton: GUI_OPTIONS.SHOW_HIDE[1] }, 'Skeleton')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Skeleton')
                .onChange(value => {

                    $scene.showPlayerSkeleton.call($scene, value);

                });

        }

    }

    /**
     * 16. add weapons controls
     */
    addWeaponControls() {

        const { $scope, $scene, $guiMaker, folders, controllers } = this.domain;
        if ($scene.player) {

            const combatPlayer = $scene.players.find(p => p.isCombatPlayer);

            if (!combatPlayer) return;

            folders.folder_weapons = $scope.panel_menu.addFolder(GUI_CONFIG.WEAPON_CONTROL).close();
            folders.folder_weapons_select = folders.folder_weapons.addFolder(GUI_CONFIG.SELECT_WEAPONS);
            folders.folder_weapons_actions = folders.folder_weapons.addFolder(GUI_CONFIG.WEAPON_ACTIONS);

            // select weapons
            {
                const weaponActions = {
                    [GUI_OPTIONS.WEAPONS[0]]: $scene.armWeapon.bind($scene, WEAPONS.PISTOL1),
                    [GUI_OPTIONS.WEAPONS[1]]: $scene.armWeapon.bind($scene, WEAPONS.GLOCK),
                    [GUI_OPTIONS.WEAPONS[2]]: $scene.armWeapon.bind($scene, WEAPONS.REVOLVER),
                    [GUI_OPTIONS.WEAPONS[3]]: $scene.armWeapon.bind($scene, WEAPONS.SMG_SHORT),
                };

                const weaponMapping = {
                    [GUI_OPTIONS.WEAPONS[0]]: WEAPONS.PISTOL1,
                    [GUI_OPTIONS.WEAPONS[1]]: WEAPONS.GLOCK,
                    [GUI_OPTIONS.WEAPONS[2]]: WEAPONS.REVOLVER,
                    [GUI_OPTIONS.WEAPONS[3]]: WEAPONS.SMG_SHORT
                }

                for (const weapon in weaponActions) {

                    const controller = controllers[`ctl_weapon_${weaponMapping[weapon]}`] = folders.folder_weapons_select
                        .add(weaponActions, weapon)
                        .onChange(() => {

                            if (!$scope.lockWeapons) {

                                if ($guiMaker.controllerIsActive(controller)) {

                                    $guiMaker.switchControllerState(controller, false);

                                } else {

                                    $guiMaker.setFolderActiveController(folders.folder_weapons_select, controller);

                                }

                            }

                        });

                    $guiMaker.inactivateController(controller);

                }

                if (combatPlayer.armedWeapon) {

                    $guiMaker.setFolderActiveController(
                        folders.folder_weapons_select,
                        controllers[`ctl_weapon_${combatPlayer.armedWeapon._weaponType}`]
                    );

                }
            }

            // weapon actions
            {
                const weaponActions = {
                    [GUI_OPTIONS.WEAPON_ACTIONS[0]]: $scene.reloadAllWeapons.bind($scene)
                };

                controllers.ctl_weapon_reloadAll = folders.folder_weapons_actions
                    .add(weaponActions, GUI_OPTIONS.WEAPON_ACTIONS[0]);
            }

        }

    }

    /**
     * 17. add enemy controls
     */
    addEnemyControls() {

        const { $scope, $scene, folders, controllers } = this.domain;
        if ($scene.enemies.length > 0) {

            // enemy controls folder
            folders.folder_enemy = $scope.panel_menu.addFolder(GUI_CONFIG.ENEMY_CONTROL).close();

            /**
             * custom helpers
             */
            {
                folders.folder_enemy_custom_helpers = folders.folder_enemy.addFolder(GUI_CONFIG.CUSTOM_HELPERS).close();
                controllers.ctl_enemy_bbhelper = folders.folder_enemy_custom_helpers
                    .add({ BBHelper: GUI_OPTIONS.SHOW_HIDE[1] }, 'BBHelper')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Bounding-box Helper')
                    .onChange(value => {

                        $scene.showEnemyBBHelper.call($scene, value);

                    });

                controllers.ctl_enemy_bb = folders.folder_enemy_custom_helpers
                    .add({ BB: GUI_OPTIONS.SHOW_HIDE[1] }, 'BB')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Bounding-box')
                    .onChange(value => {

                        $scene.showEnemyBB.call($scene, value);

                    });

                controllers.ctl_enemy_bbw = folders.folder_enemy_custom_helpers
                    .add({ BBW: GUI_OPTIONS.SHOW_HIDE[1] }, 'BBW')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Bounding-box Wire')
                    .onChange(value => {

                        $scene.showEnemyBBW.call($scene, value);

                    });

                controllers.ctl_enemy_bf = folders.folder_enemy_custom_helpers
                    .add({ BF: GUI_OPTIONS.SHOW_HIDE[1] }, 'BF')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Bounding-faces')
                    .onChange(value => {

                        $scene.showEnemyBF.call($scene, value);

                    });

                controllers.ctl_enemy_cbox = folders.folder_enemy_custom_helpers
                    .add({ CBox: GUI_OPTIONS.SHOW_HIDE[1] }, 'CBox')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Collision-box')
                    .onChange(value => {

                        $scene.showEnemyCBox.call($scene, value);

                    });

                controllers.ctl_enemy_cbox_arrows = folders.folder_enemy_custom_helpers
                    .add({ CBoxArrows: GUI_OPTIONS.SHOW_HIDE[1] }, 'CBoxArrows')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Collision-box Arrows')
                    .onChange(value => {

                        $scene.showEnemyCBoxArrows.call($scene, value);

                    });

                controllers.ctl_enemy_pushing_box = folders.folder_enemy_custom_helpers
                    .add({ PushingBox: GUI_OPTIONS.SHOW_HIDE[1] }, 'PushingBox')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Pushing-box')
                    .onChange(value => {

                        $scene.showEnemyPushingBox.call($scene, value);

                    });

                controllers.ctl_enemy_raycaster_arrows = folders.folder_enemy_custom_helpers
                    .add({ Arrows: GUI_OPTIONS.SHOW_HIDE[1] }, 'Arrows')
                    .options(GUI_OPTIONS.SHOW_HIDE)
                    .name('Raycaster Arrows')
                    .onChange(value => {

                        $scene.showEnemyArrows.call($scene, value);

                    });
            }

            controllers.ctl_enemy_navigation_arrow = folders.folder_enemy
                .add({ NavigationArrow: GUI_OPTIONS.SHOW_HIDE[1] }, 'NavigationArrow')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Navigation Arrow')
                .onChange(value => {

                    $scene.showEnemyNavigationArrow.call($scene, value);

                });

            controllers.ctl_enemy_pathHelper = folders.folder_enemy
                .add({ pathHelper: GUI_OPTIONS.SHOW_HIDE[1] }, 'pathHelper')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Path Helper')
                .onChange(value => {

                    $scene.showEnemyPathHelper.call($scene, value);

                });

            controllers.ctl_enemy_skeleton = folders.folder_enemy
                .add({ Skeleton: GUI_OPTIONS.SHOW_HIDE[1] }, 'Skeleton')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Skeleton')
                .onChange(value => {

                    $scene.showEnemySkeleton.call($scene, value);

                });
        }

    }

    /**
     * 18. add cPlane controls
     */
    addCPlaneControls() {

        const { $scope, $scene, folders, controllers } = this.domain;
        if ($scene.cPlanes.length) {

            folders.folder_cPlanes = $scope.panel_menu.addFolder(GUI_CONFIG.C_PLANES).close();

            controllers.ctl_cPlanes_wire = folders.folder_cPlanes
                .add({ Wire: GUI_OPTIONS.SHOW_HIDE[1] }, 'Wire')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Wire')
                .onChange(value => {

                    $scene.showWireframe.call($scene, value);

                });

            controllers.ctl_cPlanes_lines = folders.folder_cPlanes
                .add({ Lines: GUI_OPTIONS.SHOW_HIDE[1] }, 'Lines')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Lines')
                .onChange(value => {

                    $scene.showCPlaneLines.call($scene, value);

                });

            controllers.ctl_cPlanes_arrows = folders.folder_cPlanes
                .add({ Arrows: GUI_OPTIONS.SHOW_HIDE[1] }, 'Arrows')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Arrows')
                .onChange(value => {

                    $scene.showCPlaneArrows.call($scene, value);

                });

        }

    }

    /**
     * 19. add cObject controls
     */
    addCObjectControls() {

        const { $scope, $scene, folders, controllers } = this.domain;
        if ($scene.cObjects.length) {

            folders.folder_cObjects = $scope.panel_menu.addFolder(GUI_CONFIG.C_OBJECTS).close();

            controllers.ctl_cObjects_visible = folders.folder_cObjects
                .add({ Visible: GUI_OPTIONS.SHOW_HIDE[1] }, 'Visible')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Visible')
                .onChange(value => {

                    $scene.showCObjects.call($scene, value);

                });

        }

    }

    /**
     * 20. add air wall controls
     */
    addAirWallControls() {

        const { $scope, $scene, folders, controllers } = this.domain;
        if ($scene.airWalls.length) {

            folders.folder_airwall = $scope.panel_menu.addFolder(GUI_CONFIG.AIR_WALLS).close();

            controllers.ctl_airwall_visible = folders.folder_airwall
                .add({ Visible: GUI_OPTIONS.SHOW_HIDE[1] }, 'Visible')
                .options(GUI_OPTIONS.SHOW_HIDE)
                .name('Visible')
                .onChange(value => {

                    $scene.showAirWalls.call($scene, value);

                });

        }

    }

};