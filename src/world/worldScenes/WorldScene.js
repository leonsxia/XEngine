import { Camera } from '../components/cameras/Camera.js';
import { ThirdPersonCamera } from '../components/cameras/ThirdPersonCamera.js';
import { InspectorCamera } from '../components/cameras/InspectorCamera.js';
import { createScene } from '../components/scene.js';
import { WorldControls } from '../systems/Controls.js';
import { Resizer } from '../systems/Resizer.js';
import { Loop } from '../systems/Loop.js';
import { PostProcessor, SSAO_OUTPUT } from '../systems/PostProcesser.js';
import { FXAA, OUTLINE, SSAO, SSAA, BLOOM, WEAPONS, GUI_CONFIG, CAMERAS, PHYSICS_TYPES } from '../components/utils/constants.js';
import { GuiMaker } from '../systems/GuiMaker.js';
import { UpdatableQueue } from '../components/updatables/UpdatableQueue.js';
import { SimplePhysics } from '../components/physics/SimplePhysics.js';
import { Combat } from '../components/updatables/Combat.js';
import { Interaction } from '../components/updatables/Interaction.js';
import { AI } from '../components/updatables/AI.js';
import { AnimeMixer } from '../components/updatables/AnimeMixer.js';
import { independence } from '../components/basic/colorBase.js';
import { InputBase } from '../systems/physicalInputs/InputBase.js';
import { pdaItemViewer } from '../systems/ItemViewer.js';
import { AudioMixer } from '../components/updatables/AudioMixer.js';
import { RapierWorld } from '../components/physics/rapier/RapierWorld.js';

// let renderTimes = 0;
const devicePixelRatio = window.devicePixelRatio;

class WorldScene {
    
    setup = {
        enableTPC: false,
        enableIC: false,
        scene: {
            backgroundColor: independence
        },
        enableGui: false,
        actions: [
            "start",
            "stop",
            "resetCamera",
            "focusNext",
            "resetPlayer",
            "resetScene",
            "saveScene",
            "loadScene"
        ]
    };
    name = 'default scene';

    thirdPersonCamera = null;
    inspectorCamera = null;
    defaultCamera;
    camera = null;
    scene = null;
    renderer = null;
    loop = null;
    resizer = null;
    controls = null;
    staticRendering = true;
    forceStaticRender = true;   // switch whether controls will render after control change.

    lights = {};
    shadowLightObjects = [];

    guiMaker;

    controlEventDispatcher;
    
    // updatable modules
    updatableQueue;

    physics = null;
    players = [];
    enemies = [];
    rooms = [];
    cPlanes = [];
    cObjects = [];
    airWalls = [];
    player;
    loadSequence = 0;
    showRoleSelector = false;

    currentRoom;
    sceneObjects = [];
    pickables = [];
    entries = [];

    combat = null;
    interaction = null;
    ai = null;
    animeMixer = null;
    audioMixer = null;
    // updatable modules
    
    postProcessor;
    triTexture;
    postProcessingEnabled = false;
    postProcessOn = false;

    picker;
    enablePick = false;
    pickedObject = null;
    objectLocked = false;

    enablePlayerHealth = false;
    enableEnemyHealth = false;

    sceneBuilder;
    sceneSetup;
    sceneSetupCopy;
    sceneSavedSetup;
    jsonFileName;

    loaded = false;
    isRunning = false;

    #paused = true;

    constructor(renderer, specs) {

        Object.assign(this.setup, specs);

        const { name, scene: { backgroundColor }, worldPicker, sceneBuilder, enableGui = false, controlEventDispatcher } = this.setup;

        this.name = name;

        this.renderer = renderer;

        this.defaultCamera = new Camera();
        this.camera = this.defaultCamera.camera;

        this.scene = createScene(backgroundColor);
        this.postProcessor = new PostProcessor(renderer, this.scene, this.camera);
        this.controlEventDispatcher = controlEventDispatcher;
        this.picker = worldPicker;
        this.sceneBuilder = sceneBuilder;
        this.controls = new WorldControls(this.camera, this.renderer.domElement);

        this.loop = new Loop(this.renderer);
        this.loop.setCallbackAfterTick(() => {

            this.render();

        });
        this.loop.addUpdatables(this.controls.defControl);
        // this.controls.defControl.listenToKeyEvents(window);

        this.resizer = new Resizer(this.camera, this.renderer, this.postProcessor);
        this.resizer.onResize = 
        (needRender = true) => {

            if (needRender && this.staticRendering && this.forceStaticRender) this.render();

        };

        this.controls.defControl.addEventListener('change', () => {

            // important!!! no need to render after scene start to update automatically
            // increase the performance fps
            if (this.staticRendering && this.forceStaticRender) this.render();

            // const pos = this.camera.position;
            // const tar = this.controls.defControl.target;
            // console.log(`camera position: x: ${pos.x}, y: ${pos.y}, z: ${pos.z}`);
            // console.log(`camera target: x: ${tar.x}, y: ${tar.y}, z: ${tar.z}`);

        });

        if (enableGui) {

            this.guiMaker = new GuiMaker(this);
            this.guiMaker.init();

            this.controls.initPanels(this.guiMaker.gui);

        }

        this.updatableQueue = new UpdatableQueue();

    }

    async init() {

        this.initBasic();

        if (this.loaded) return;

        // first time loading
        const { src } = this.setup;

        await this.postProcessor.init();
        await this.sceneBuilder.buildScene({ src });

        // settings from json file
        const { 
            camera: { position = [0, 0, 0] }, defaultPlayer, resolution = 1,
            enableGui = false, enablePicker = false, enableShadow = false,
            enableTPC = false, enableIC = false,
            physics = PHYSICS_TYPES.SIMPLE
        } = this.setup;

        // set camera initial position and save the state
        this.defaultCamera.position = position;

        this.forceStaticRender = false;
        this.controls.defControl.update();
        this.forceStaticRender = true;

        this.controls.defControl.saveState();

        // only set pixel ratio at first time
        if (devicePixelRatio > 1) {

            // set default scene resolution
            this.resizer.changeResolution(resolution);

        }

        // renderer shadow enable
        this.renderer.shadowMap.enabled = enableShadow;

        // picker
        if (enablePicker) {

            this.picker.setup(this);

        }

        // physics
        if (physics === PHYSICS_TYPES.SIMPLE) {

            this.physics = new SimplePhysics(this.players, this.enemies);

        } else if (physics === PHYSICS_TYPES.RAPIER) {

            this.physics = new RapierWorld({
                players: this.players, enemies: this.enemies, attachTo: this
            });

        }
        this.updatableQueue.add(this.physics);

        // ai
        this.ai = new AI(this.players, this.enemies);
        this.ai.attachTo = this;
        this.updatableQueue.add(this.ai);

        // combat
        this.combat = new Combat(this.players, this.enemies);
        this.combat.attachTo = this;
        this.updatableQueue.add(this.combat);

        // interaction
        this.interaction = new Interaction(this.players);
        this.interaction.attachTo = this;
        this.interaction.delegates.changeRoom = this.changeRoom.bind(this);
        this.interaction.delegates.changeCamera = this.changeCamera.bind(this);
        this.updatableQueue.add(this.interaction);

        // anime mixer
        this.animeMixer = new AnimeMixer(this.players, this.enemies);
        this.animeMixer.attachTo = this;
        
        this.updatableQueue.add(this.animeMixer);

        // audio mixer
        this.audioMixer = new AudioMixer(this.players, this.enemies);
        this.audioMixer.attachTo = this;
        this.updatableQueue.add(this.audioMixer);
        
        this.loop.addUpdatables(this.updatableQueue);

        // initialize player
        // no need to render at this time, so the change event of control won't do the rendering.
        {

            this.changeCharacter(defaultPlayer, false);

            for (let i = 0, il = this.players.length; i < il; i++) {

                const player = this.players[i];
                if (player.isCustomizedCombatTofu) {

                    player.onBeforeCollisionBoxChanged.push(this.onBeforePlayerCBoxChanged.bind(this));
                    player.onCollisionBoxChanged.push(this.onPlayerCBoxChanged.bind(this));

                    player.pda.onVisibleChanged.push((val) => {

                        if (val) {

                            this.loop.stop();
                            this.pauseAudio();
                            this.staticRendering = true;
                            player.pda.stats = this.guiMaker.gui.stats;

                        } else {

                            this.loop.start(this.guiMaker.gui.stats);
                            this.unpauseAudio();
                            this.staticRendering = false;

                        }

                    });

                    player.pda.onInventoryItemChanged.push((item) => {

                        this.updatePickableItem(item);

                    });

                    const pickedItems = this.pickables.filter(p => p.isPicked && p.belongTo === player.name);
                    for (let j = 0, jl = pickedItems.length; j < jl; j++) {

                        const item = pickedItems[j];
                        player.addPickableItem(item);

                    }

                    if (player.name !== defaultPlayer) {

                        player.isActive = false;

                    }

                    // update player HP state
                    const { currentHP } = this.sceneSetupCopy.players.find(e => e.name === player.name);
                    if (currentHP !== undefined) {

                        player.currentHP = currentHP;

                    }

                }

            }

        }

        // initialize enemies
        {

            for (let i = 0, il = this.enemies.length; i < il; i++) {

                const enemy = this.enemies[i];

                if (enemy.isActive) {

                    enemy.onBeforeCollisionBoxChanged.push(this.onBeforeEnemyCBoxChanged.bind(this));
                    enemy.onCollisionBoxChanged.push(this.onEnemyCBoxChanged.bind(this));

                }

                for (let j = 0, jl = this.players.length; j < jl; j++) {

                    const player = this.players[j];
                    enemy.onDisposed.push(player.onTargetDisposed.bind(player));

                }

                // update enemy HP state
                const { currentHP } = this.sceneSetupCopy.enemies.find(e => e.name === enemy.name);
                if (currentHP !== undefined) {

                    enemy.currentHP = currentHP;

                }

            }

        }

        // initialize pickables
        {

            for (let i = 0, il = this.pickables.length; i < il; i++) {

                const pickableItem = this.pickables[i];
                this.subscribeEvents(pickableItem, InputBase.CONTROL_TYPES.XBOX_CONTROLLER);

            }

        }

        // initialize entries
        {

            for (let i = 0, il = this.entries.length; i < il; i++) {

                const entry = this.entries[i];
                this.subscribeEvents(entry, InputBase.CONTROL_TYPES.XBOX_CONTROLLER);

            }
        }

        // setup cameras, must after player setup complete
        if (enableTPC) {

            this.thirdPersonCamera = new ThirdPersonCamera({ defaultCamera: this.defaultCamera, attachTo: this });
            this.thirdPersonCamera.setup({ player: this.player, control: this.controls.defControl });
            this.subscribeEvents(this.thirdPersonCamera, InputBase.CONTROL_TYPES.XBOX_CONTROLLER);
            this.subscribeEvents(this.thirdPersonCamera, InputBase.CONTROL_TYPES.TPC);

        }

        if (enableIC) {

            this.inspectorCamera = new InspectorCamera({ defaultCamera: this.defaultCamera });
            this.inspectorCamera.setup({ player: this.player, control: this.controls.defControl, scene: this.scene, rooms: this.rooms });

        }        

        // role selector
        this.showRoleSelector = true;

        // post processor
        this.enablePostProcessing(false);

        // Gui setup
        if (enableGui) {

            const leftActions = { actions: {} };
            const { actions } = this.setup;

            actions.forEach(act => {

                if (act === 'resetPlayer') {

                    leftActions.actions[act] = this.resetCurrentPlayer.bind(this);

                } else if (act === 'resetCamera') {

                    leftActions.actions[act] = this.resetCamera.bind(this, false);

                } else if (act === 'focusNext') {

                    leftActions.actions[act] = this.focusNext.bind(this, false);

                } else if (act === 'moveCamera') {

                    leftActions.actions[act] = this.moveCamera.bind(this, false);

                } else {

                    leftActions.actions[act] = this[act].bind(this);

                }

            });

            this.guiMaker.leftActions = leftActions;

            this.guiMaker.setupGuiConfig();

        }

        this.showCPlaneLines(false);
        this.showCPlaneArrows(false);

        this.initContainer();

        this.loaded = true;

    }

    initContainer() {

        if (this.guiMaker?.enabled) {

            this.guiMaker.initGuiControl();

        }

    }

    initBasic() {

        const { enablePicker = false, enableShadow = false } = this.setup;        

        const { updatables } = this.loop;
        const tpcIdx = updatables.findIndex(f => f === this.thirdPersonCamera);
        const icIdx = updatables.findIndex(f => f === this.inspectorCamera);

        if (tpcIdx == -1 && icIdx == -1) {

            this.controls.enableDefControl();

        }

        this.sceneBuilder.worldScene = this;

        // set shadow and picker everytime load this scene, but not first time loading
        if (this.loaded) {

            this.renderer.shadowMap.enabled = enableShadow;

            if (enablePicker) {

                this.picker.setup(this);

            }

            this.initContainer();

        }

        this.isRunning = true;

    }

    get isPdaOn() {

        return this.player?.pda?.visible ? true : false;

    }

    render() {

        // console.log(++renderTimes);
        if (this.postProcessingEnabled) {

            this.postProcessor.render();

        } else {

            this.renderer.render(this.scene, this.camera);
        
        }

    }

    start() {

        this.disablePlayerPda();
        this.staticRendering = false;
        this.controls.initPreCoordinates();
        this.controls.setDamping(true, 0.1); // default damping factor 0.05
        this.loop.start(this.guiMaker.gui.stats);
        this.#paused = false;

    }

    stop() {

        this.disablePlayerPda();
        this.staticRendering = true;
        this.controls.setDamping(false);        
        this.loop.stop();
        this.#paused = true;

        this.stopAudio();

    }

    stopAudio() {

        this.player?.DAW?.stopAll();

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            enemy.DAW?.stopAll();

        }

    }

    pauseAudio() {

        this.player?.DAW?.pauseAll();

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            enemy.DAW?.pauseAll();

        }

    }

    unpauseAudio() {

        this.player?.DAW?.unpauseAll();

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            enemy.DAW?.unpauseAll();

        }

    }

    isScenePaused() {

        return this.#paused;

    }

    enablePostProcessing(enable) {

        this.postProcessingEnabled = enable;

    }

    setEffect(type, specs) {

        this.postProcessor.setEffectPass(type, specs);
        
    }

    moveCamera(forceStaticRender = true) {

        const moveDist = 5;

        if (this.staticRendering) {

            if (!forceStaticRender) this.forceStaticRender = false;
            this.controls.moveCameraStatic(moveDist);
            if (!forceStaticRender) this.forceStaticRender = true;

        } else if (this.loop.updatables.find(f => f === this.controls.defControl)) {

            this.controls.moveCamera(moveDist);

        }

    }

    resetCamera(forceStaticRender = true) {

        if (!forceStaticRender) this.forceStaticRender = false;
        this.controls.resetCamera();
        if (!forceStaticRender) this.forceStaticRender = true;

    }

    reset() {

        // renderTimes = 0;
        this.disablePlayerPda();
        this.stop();

        this.renderer.shadowMap.enabled = false;

        // no need to render at this time.
        this.resetCamera(false);

        this.loadSequence = -1;

        // no need to render at this time too.
        this.focusNext(false);

        // clear picker object
        this.pickedObject = null;
        this.picker.reset();
        this.postProcessor.clearOutlineObjects();

        if (this.guiMaker?.enabled) {

            this.guiMaker.resetGui();

        }

        // must disable default orbit control after gui reest, 
        // the gui will disable all cameras which will enable default camera again
        this.controls.enableDefControl(false);

    }

    suspend() {

        this.disablePlayerPda();
        this.stop();

        this.renderer.shadowMap.enabled = false;

        // clear picker object
        if (this.enablePick) {

            this.pickedObject = null;            
            this.enablePicking();
            this.guiMaker.gui.switchFunctionControl(GUI_CONFIG.CONTROL_TITLES.MENU, GUI_CONFIG.PICKER_CONTROL, 'disable', 'enable');

        }

        this.picker.reset();

        if (this.guiMaker?.enabled) {

            this.guiMaker.suspendGui();

        }

        // must disable current scene default control, otherwise it will jump backward to last scene
        this.controls.enableDefControl(false);

        this.isRunning = false;

    }

    changeRoom(roomSequence) {

        const { allPlayerPos } = this.setup;
        const targetRoom = this.rooms.find(r => r.sequence === roomSequence);

        this.loadSequence = roomSequence;

        if (!targetRoom) return;

        this.currentRoom = targetRoom;
        this.physics.initPhysics(this.currentRoom);
        this.updatePickables();

        for (let i = 0, il = this.rooms.length; i < il; i++) {

            const room = this.rooms[i];

            if (i === roomSequence) {

                room.setLightsVisible(true);
                room.visible = true;

            } else {

                room.setLightsVisible(false);
                room.visible = false;

            }

        }

        if (this.player) {

            this.player.updateRoomInfo?.(this.currentRoom);
            this.player.setPosition(allPlayerPos[roomSequence], true);
            this.player.clearInSightTargets();
            this.player.isActive = true;    // for temporary update, it will be reset after next step
            this.physics.addActivePlayers(this.player.name);

        }

        this.thirdPersonCamera?.updateObjectsNeedChecked();

        this.updateEnemies();

    }

    changeCamera(roomSequence) {

        const { allTargets, allCameraPos } = this.setup;
        this.controls.defControl.target.copy(allTargets[roomSequence]);
        this.camera.position.copy(allCameraPos[roomSequence]);
        this.controls.defControl.update();

    }

    focusNext(forceStaticRender = true) {

        this.focusNextProcess(forceStaticRender);

        this.changeRoom(this.loadSequence);

    }

    focusNextProcess(forceStaticRender = true) {

        const { allTargets, allCameraPos } = this.setup;

        this.loadSequence = ++this.loadSequence % allTargets.length;        

        if (this.staticRendering) {

            this.controls.defControl.target.copy(allTargets[this.loadSequence]);
            this.camera.position.copy(allCameraPos[this.loadSequence]);

            if (!forceStaticRender) this.forceStaticRender = false;
            this.controls.defControl.update();
            if (!forceStaticRender) this.forceStaticRender = true;

        } else if (this.loop.updatables.find(f => f === this.controls.defControl)) {

            const tar = this.controls.defControl.target;
            const pos = this.camera.position;
            const preTar = { x: tar.x, y: tar.y, z: tar.z };
            const preCam = { x: pos.x, y: pos.y, z: pos.z };

            if (this.loadSequence === 0) { // move to first position

                this.controls.focusNext(
                    preTar, allTargets[0],
                    preCam, allCameraPos[0]
                );

            } else { // move to next position

                this.controls.focusNext(
                    preTar, allTargets[this.loadSequence],
                    preCam, allCameraPos[this.loadSequence]
                );

            }
        }

    }

    dispose() {
        // this.#renderer.dispose();
        // this.#renderer.forceContextLoss();
    }

    subscribeEvents(obj, controlType) {

        const actionTypes = this.controlEventDispatcher.getActionTypes(controlType);

        for (let i = 0, il = actionTypes.length; i < il; i++) {

            const action = actionTypes[i];

            const callback = obj[action];

            if (callback) {

                const subscriber = {
                    subscriber: obj,
                    scene: this.name,
                    callback: callback
                }

                this.controlEventDispatcher.subscribe(controlType, action, subscriber);

            }

        }

    }

    unsubscribeEvents(obj, controlType) {

        const actionTypes = this.controlEventDispatcher.getActionTypes(controlType);

        for (let i = 0, il = actionTypes.length; i < il; i++) {

            const action = actionTypes[i];

            const callback = obj[action];

            if (callback) {

                const subscriber = {
                    subscriber: obj,
                    scene: this.name,
                    callback: callback
                }

                this.controlEventDispatcher.unsubscribe(controlType, action, subscriber);

            }

        }
        
    }
    
    changeResolution(ratio) {

        this.resizer.changeResolution(ratio);
        pdaItemViewer._resizer.changeResolution(ratio);

    }

    changeScreenAspect(size) {

        this.resizer.changeScreenAspect(size);
        pdaItemViewer._resizer.changeScreenAspect(size);

    }

    changeCharacter(name, forceStaticRender = true) {

        let firstLoad = true;

        // player should have boundingBox and boundingBoxHelper.
        const find = this.players.find(p => p.name === name);

        if (find) {

            if (this.player) {

                firstLoad = false;

                this.player.isActive = false;

                // remove old player.
                const cmdHide = 'hide';
                this.showPlayerBBHelper(cmdHide)
                    .showPlayerBB(cmdHide)
                    .showPlayerBBW(cmdHide)
                    .showPlayerBF(cmdHide)
                    .showPlayerCBox(cmdHide)
                    .showPlayerCBoxArrows(cmdHide)
                    .showPlayerPushingBox(cmdHide)
                    .showPlayerArrows(cmdHide)
                    .showPlayerSkeleton(cmdHide)

                this.physics.removeActivePlayers(this.player.name);

                this.scene.remove(this.player.group);

                this.player.resetAnimation?.();
                this.player.DAW?.stopAll();

                this.unsubscribeEvents(this.player, this.setup.moveType);
                this.unsubscribeEvents(this.player, InputBase.CONTROL_TYPES.MOUSE);

                this.disablePlayerPda();
                if (this.player.pda) {
                    
                    this.unsubscribeEvents(this.player.pda, InputBase.CONTROL_TYPES.PDA);
                    this.unsubscribeEvents(this.player.pda, InputBase.CONTROL_TYPES.XBOX_CONTROLLER);
                    this.unsubscribeEvents(this.player.pda, InputBase.CONTROL_TYPES.MOUSE);

                }

                const oldPlayerBoxHelper = this.scene.getObjectByName(this.player.boundingBoxHelper.name);
                if (oldPlayerBoxHelper) this.scene.remove(oldPlayerBoxHelper);

            }

            this.player = find;

            this.player.isActive = !this.player.dead;
            this.player.showHealth(this.enablePlayerHealth);

            --this.loadSequence;
            this.focusNext(forceStaticRender);

            this.physics.addActivePlayers(name);

            this.scene.add(this.player.group);

            if (!firstLoad) {

                this.thirdPersonCamera?.changePlayer(this.player);
                this.inspectorCamera?.changePlayer(this.player);
                
            }

            this.subscribeEvents(this.player, this.setup.moveType);
            this.subscribeEvents(this.player, InputBase.CONTROL_TYPES.MOUSE);
            if (this.player.pda) {

                this.subscribeEvents(this.player.pda, InputBase.CONTROL_TYPES.PDA);
                this.subscribeEvents(this.player.pda, InputBase.CONTROL_TYPES.XBOX_CONTROLLER);
                this.subscribeEvents(this.player.pda, InputBase.CONTROL_TYPES.MOUSE);

            }

        }

    }

    updateEnemies() {

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            const oldBoxHelper = this.scene.getObjectByName(enemy.boundingBoxHelper.name);
            if (enemy.currentRoom === this.currentRoom.name) {

                // temporary update, it will be reset after next step
                enemy.isActive = true;
                this.physics.addActiveEnemies(enemy.name);
                this.scene.add(enemy.group);

                if (enemy._showBBHelper) {

                    this.scene.add(enemy.boundingBoxHelper);

                }

            } else {

                this.physics.removeActiveEnemies(enemy.name);
                this.scene.remove(enemy.group);
                enemy.isActive = false;
                enemy.clearInSightTargets();
                enemy.DAW.stopAll();

                if (oldBoxHelper) this.scene.remove(oldBoxHelper);

            }

        }

    }

    resetCurrentPlayer() {

        if (this.player) {
            
            this.resetCharacter();
            this.player.resetHealth();

        }

    }

    resetCharacter() {
        
        if (this.player) {

            const { allPlayerPos } = this.setup;
            this.player.setPosition(allPlayerPos[this.loadSequence], true);
            // this.player.resetFallingState?.();
            // this.player.resetHealth();
            // this.player.resetAnimation?.();
            this.player.clearInSightTargets();
            this.player.reloadAllWeapons?.();
            this.player.setAllBoundingBoxLayers(true);
            this.player.DAW?.stopAll();

        }

    }

    resetEnemies() {

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            enemy.resetFallingState();
            // enemy.resetHealth();
            // enemy.resetAnimation();
            enemy.clearInSightTargets();
            enemy.setAllBoundingBoxLayers(true);
            enemy.DAW?.stopAll();
        }

    }

    disablePlayerPda() {

        if (this.player?.pda?.visible) this.player.pda.visible = false;

    }

    updatePlayerInventoryItems() {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];
            if (player.isCombatPlayer) {

                player.pda.inventory.clearSlots();
                for (let j = 0, jl = this.pickables.length; j < jl; j++) {

                    const item = this.pickables[j];
                    if (item.isPicked && item.belongTo === player.name) {

                        player.addPickableItem(item);

                    }

                }

            }

        }

    }

    updatePickableItem(item) {

        this.physics.setScenePickables(item);
        this.setPickableItemVisible(item);

    }

    updatePickables() {

        for (let i = 0, il = this.pickables.length; i < il; i++) {

            const item = this.pickables[i];
            this.updatePickableItem(item);

        }

    }

    setPickableItemVisible(item) {

        if (!item.available || item.currentRoom !== this.currentRoom.name || item.isPicked) {

            item.setModelVisible(false);

        } else {

            item.setModelVisible(true);

        }

    }

    resetScene() {

        this.sceneBuilder.resetScene();

    }

    saveScene() {

        this.sceneBuilder.saveScene();

    }

    loadScene() {

        this.sceneBuilder.loadScene();

    }

    switchPlayerHealth() {

        this.enablePlayerHealth = !this.enablePlayerHealth;
        this.player.showHealth(this.enablePlayerHealth);        

    }

    switchEnemyHealth() {

        this.enableEnemyHealth = !this.enableEnemyHealth;
        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            if (enemy.disposed) continue;
            enemy.showHealth(this.enableEnemyHealth);

        }

    }

    showPlayerBBHelper(show) {

        if (!this.player || !this.player.boundingBoxHelper) return this;

        const s = show === 'show' ? true : false;

        if (s) {

            this.scene.add(this.player.boundingBoxHelper);
            if (Object.prototype.hasOwnProperty.call(this.player, '_showBBHelper')) this.player._showBBHelper = s;


        } else {

            this.scene.remove(this.player.boundingBoxHelper);
            if (Object.prototype.hasOwnProperty.call(this.player, '_showBBHelper')) this.player._showBBHelper = s;

        }

        return this;

    }

    showPlayerBB(show) {

        if (!this.player || !this.player.boundingBoxMesh) return this;

        const s = show === 'show' ? true : false;

        this.player.showBB(s);

        return this;

    }

    showPlayerBBW(show) {

        if (!this.player || !this.player.boundingBoxWireMesh) return this;

        const s = show === 'show' ? true : false;

        this.player.showBBW(s);

        return this;

    }

    showPlayerBF(show) {

        if (!this.player) return this;

        const s = show === 'show' ? true : false;

        this.player.showBF(s);

        return this;

    }

    showPlayerCBox(show) {

        if (!this.player) return this;

        const s = show === 'show' ? true : false;

        this.player.showCollisionBox(s);

        return this;

    }

    onBeforePlayerCBoxChanged(player) {

        if (!player._showCBoxArrows) return;

        for (let i = 0, il = player.walls.length; i < il; i++) {

            const wall = player.walls[i];
            this.scene.remove(wall.leftArrow);
            this.scene.remove(wall.rightArrow);

        }

    }

    onPlayerCBoxChanged(player) {

        if (!player._showCBoxArrows) return;

        for (let i = 0, il = player.walls.length; i < il; i++) {

            const wall = player.walls[i];
            this.scene.add(wall.leftArrow);
            this.scene.add(wall.rightArrow);

        }

    }

    showPlayerCBoxArrows(show) {

        if (!this.player || !this.player.isCustomizedCombatTofu) return this;

        const s = show === 'show' ? true : false;
        
        if (s) {

            this.player.showCollisionBoxArrows(s);
            this.onPlayerCBoxChanged(this.player);

        } else {

            this.onBeforePlayerCBoxChanged(this.player);
            this.player.showCollisionBoxArrows(s);

        }

        return this;

    }

    showPlayerPushingBox(show) {

        if (!this.player || !this.player.showPushingBox) return this;

        const s = show === 'show' ? true : false;

        this.player.showPushingBox(s);

        return this;

    }

    showPlayerArrows(show) {

        if (!this.player || !this.player.hasRays) return this;

        const s = show === 'show' ? true : false;

        if (s) {

            this.scene.add(this.player.leftArrow);
            this.scene.add(this.player.rightArrow);
            this.scene.add(this.player.backLeftArrow);
            this.scene.add(this.player.backRightArrow);
            this.scene.add(this.player.centerArrow);
            this.scene.add(this.player.aimArrow);

        } else {

            this.scene.remove(this.player.leftArrow);
            this.scene.remove(this.player.rightArrow);
            this.scene.remove(this.player.backLeftArrow);
            this.scene.remove(this.player.backRightArrow);
            this.scene.remove(this.player.centerArrow);
            this.scene.remove(this.player.aimArrow);

        }

        return this;

    }

    showPlayerSkeleton(show) {

        if (!this.player.gltf?.skeleton) return this;

        const s = show === 'show' ? true : false;

        if (s) {

            this.scene.add(this.player.gltf.skeleton);

        } else {

            this.scene.remove(this.player.gltf.skeleton);

        }

        this.player.showSkeleton(s);

        return this;

    }

    showEnemyBBHelper(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed) continue;

            if (s) {

                this.scene.add(enemy.boundingBoxHelper);                

            } else {

                this.scene.remove(enemy.boundingBoxHelper);

            }

            enemy._showBBHelper = s;

        }

        return this;

    }

    showEnemyBB(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed) continue;

            enemy.showBB(s);

        }

        return this;

    }

    showEnemyBBW(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed) continue;

            enemy.showBBW(s);

        }

        return this;

    }

    showEnemyBF(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed) continue;

            enemy.showBF(s);

        }

        return this;

    }

    showEnemyCBox(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed) continue;

            enemy.showCollisionBox(s);

        }

        return this;

    }

    onBeforeEnemyCBoxChanged(enemy) {

        if (!enemy._showCBoxArrows) return;

        for (let i = 0, il = enemy.walls.length; i < il; i++) {

            const wall = enemy.walls[i];
            this.scene.remove(wall.leftArrow);
            this.scene.remove(wall.rightArrow)

        }

    }

    onEnemyCBoxChanged(enemy) {            

        if (!enemy._showCBoxArrows) return;

        enemy.updateWalls();

        for (let i = 0, il = enemy.walls.length; i < il; i++) {

            const wall = enemy.walls[i];
            this.scene.add(wall.leftArrow);
            this.scene.add(wall.rightArrow);

        }

    }    

    showEnemyCBoxArrows(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed) continue;
            
            if (s) {

                enemy.showCollisionBoxArrows(s);
                this.onEnemyCBoxChanged(enemy);

            } else {

                this.onBeforeEnemyCBoxChanged(enemy);
                enemy.showCollisionBoxArrows(s);

            }

        }

        return this;

    }

    showEnemyPushingBox(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed) continue;

            enemy.showPushingBox(s);

        }

        return this;

    }

    showEnemyArrows(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed) continue;

            if (s) {

                this.scene.add(enemy.leftArrow);
                this.scene.add(enemy.rightArrow);
                this.scene.add(enemy.backLeftArrow);
                this.scene.add(enemy.backRightArrow);
                this.scene.add(enemy.centerArrow);
                this.scene.add(enemy.focusArrow);

            } else {

                this.scene.remove(enemy.leftArrow);
                this.scene.remove(enemy.rightArrow);
                this.scene.remove(enemy.backLeftArrow);
                this.scene.remove(enemy.backRightArrow);
                this.scene.remove(enemy.centerArrow);
                this.scene.remove(enemy.focusArrow);

            }

        }

        return this;

    }

    showEnemySkeleton(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.disposed || !enemy.gltf?.skeleton) continue;

            if (s) {

                this.scene.add(enemy.gltf.skeleton);

            } else {

                this.scene.remove(enemy.gltf.skeleton);

            }

            enemy.showSkeleton(s);

        }

        return this;

    }

    armWeapon(name) {

        if (!this.player.isCombatPlayer || this.player.attacking) {
            
            this.guiMaker.gui._lockWeapons = true;
            // console.log(`weapons locked: ${this.guiMaker.gui._lockWeapons}`);
            return;
        
        }

        this.guiMaker.gui._lockWeapons = false;
        // console.log(`weapons locked: ${this.guiMaker.gui._lockWeapons}`);

        switch(name) {

            case WEAPONS.PISTOL1:

                {
                    const weapon = this.player.weapons.find(w => w.weaponType === WEAPONS.PISTOL1);

                    if (!this.player.armedWeapon || this.player.armedWeapon !== weapon) {

                        this.player.armWeapon(weapon);

                    } else {

                        this.player.armWeapon(null);

                    }
                }

                break;

            case WEAPONS.GLOCK:

                {
                    const weapon = this.player.weapons.find(w => w.weaponType === WEAPONS.GLOCK);

                    if (!this.player.armedWeapon || this.player.armedWeapon !== weapon) {

                        this.player.armWeapon(weapon);

                    } else {

                        this.player.armWeapon(null);

                    }
                }

                break;

            case WEAPONS.REVOLVER:

                {
                    const weapon = this.player.weapons.find(w => w.weaponType === WEAPONS.REVOLVER);

                    if (!this.player.armedWeapon || this.player.armedWeapon !== weapon) {

                        this.player.armWeapon(weapon);

                    } else {

                        this.player.armWeapon(null);

                    }

                }

                break;
            
            case WEAPONS.SMG_SHORT:

                {
                    const weapon = this.player.weapons.find(w => w.weaponType === WEAPONS.SMG_SHORT);

                    if (!this.player.armedWeapon || this.player.armedWeapon !== weapon) {

                        this.player.armWeapon(weapon);

                    } else {

                        this.player.armWeapon(null);

                    }

                }

                break;    

        }

        if (this.pickedObject?.isWeapon) {
            
            this.guiMaker.clearObjectsPanel();
            this.objectLocked = false;
        
        };

    }

    reloadAllWeapons() {

        if (!this.player.isCombatPlayer || this.player.attacking) {
            
            this.guiMaker.gui._lockWeapons = true;

            return;

        }

        this.guiMaker.gui._lockWeapons = false;

        this.player.reloadAllWeapons();
        
    }

    showWireframe(show) {

        const s = show === 'show' ? true : false;

        this.cPlanes.forEach(cp => {

            cp.setWireframe(s);

        });

    }

    showCPlaneLines(show) {

        const s = show === 'show' ? true : false;

        this.cPlanes.forEach(cp => {

            if (cp.line) cp.line.visible = s;

        });

    }

    showCPlaneArrows(show) {

        const s = show === 'show' ? true : false;

        this.cPlanes.forEach(cp => {

            if (cp.leftArrow) {

                cp.leftArrow.visible = s;
                if (s) this.scene.add(cp.leftArrow);
                else this.scene.remove(cp.leftArrow);
            
            }
            
            if (cp.rightArrow) {
                
                cp.rightArrow.visible = s;
                if (s) this.scene.add(cp.rightArrow);
                else this.scene.remove(cp.rightArrow);
            
            }

        });

    }

    enablePostEffect(enable) {

        const e = enable === 'enable' ? true : false;

        this.enablePostProcessing(e);

        this.postProcessOn = e;

        if (!e) {

            this.postProcessor.clearOutlineObjects();
            this.guiMaker.clearObjectsPanel();
        
        }

        this.objectLocked = false;

        if (this.enablePick && !this.postProcessOn) {

            this.guiMaker.gui.switchFunctionControl(GUI_CONFIG.CONTROL_TITLES.MENU, GUI_CONFIG.PICKER_CONTROL, 'disable', 'enable');
            this.enablePick = false;

        }

    }

    enablePicking() {

        this.enablePick = !this.enablePick;    // for picker click event
        this.objectLocked = false;

        this.setEffect(OUTLINE, { enabled: this.enablePick });

        const triggerPostProcess = (val) => {

            const postProcState = this.postProcessOn;

            this.guiMaker.gui.setControlValue(GUI_CONFIG.CONTROL_TITLES.MENU, GUI_CONFIG.POST_PROCESS_CONTROL, 'PostEffect', val);

            this.postProcessOn = postProcState;

        }

        if (this.enablePick) {

            if (!this.postProcessOn) {

                this.enablePostProcessing(true);

            }

            triggerPostProcess('enable');

        } else {
            
            this.postProcessor.clearOutlineObjects();
            this.guiMaker.clearObjectsPanel();

            if (!this.postProcessOn) {

                this.enablePostProcessing(false);  
                triggerPostProcess('disable');              

            }            

        }

    }

    clearPickedObject() {

        this.pickedObject = null;
        this.postProcessor.clearOutlineObjects();
        this.guiMaker.clearObjectsPanel();

    }

    enableFXAA(enable) {

        const e = enable === 'enable' ? true : false;

        this.setEffect(FXAA, { enabled: e });

    }

    enableSSAA(enable) {

        const e = enable === 'enable' ? true : false;

        this.setEffect(SSAA, { enabled: e });

    }

    changeSSAASampleLevel(name) {

        let sampleLevel;

        switch (name) {

            case 'Level 0: 1 Sample':
                sampleLevel = 0;
                break;
            case 'Level 1: 2 Samples':
                sampleLevel = 1;
                break;
            case 'Level 2: 4 Samples':
                sampleLevel = 2;
                break;
            case 'Level 3: 8 Samples':
                sampleLevel = 3;
                break;
            case 'Level 4: 16 Samples':
                sampleLevel = 4;
                break;
            case 'Level 5: 32 Samples':
                sampleLevel = 5;
                break;

        }

        this.setEffect(SSAA, { sampleLevel });

    }

    enableSSAO(enable) {

        const e = enable === 'enable' ? true : false;

        this.setEffect(SSAO, { enabled: e });

    }

    changeSSAOOutput(name) {

        let output;

        switch (name) {

            case 'SSAO Only':
                output = SSAO_OUTPUT.SSAOOnly;
                break;

            case 'SSAO+Blur Only':
                output = SSAO_OUTPUT.SSAOBlur;
                break;

            case 'Depth':
                output = SSAO_OUTPUT.Depth;
                break;

            case 'Normal':
                output = SSAO_OUTPUT.Normal;
                break;

            default:
                output = SSAO_OUTPUT.Default;
                break;

        }

        this.setEffect(SSAO, { output });

    }

    enableBloom(enable) {

        const e = enable === 'enable' ? true : false;

        this.setEffect(BLOOM, {
            enabled: e, 
            strength: this.guiMaker.bloomSetting.BloomStrength, 
            radius: this.guiMaker.bloomSetting.BloomRadius
        });

    }

    changeBloomStrength(val) {

        this.setEffect(BLOOM, { strength: val });

    }

    changeBloomRadius(val) {

        this.setEffect(BLOOM, { radius: val });

    }

    switchCamera(type) {

        const { updatables } = this.loop;
        const tpcIdx = updatables.findIndex(f => f === this.thirdPersonCamera);
        const icIdx = updatables.findIndex(f => f === this.inspectorCamera);

        switch (type) {

            case CAMERAS.THIRD_PERSON:

                {
                    if (icIdx > -1) {

                        this.enableIC(false);

                    }

                    if (tpcIdx === -1) {

                        this.enableTPC(true);

                    } else {

                        this.enableTPC(false);

                    }
                }
                break;

            case CAMERAS.INSPECTOR:
                
                {
                    if (tpcIdx > -1) {

                        this.enableTPC(false);
        
                    }

                    if (icIdx === -1) {

                        this.enableIC(true);
        
                    } else {

                        this.enableIC(false);

                    }
                }
                break;

        }

    }

    enableTPC(e) {

        const { updatables } = this.loop;
        const tpcIdx = updatables.findIndex(f => f === this.thirdPersonCamera);

        if (e) {

            if (tpcIdx === -1) {

                const idx = updatables.findIndex(f => f === this.controls.defControl);
                updatables.splice(idx, 1);
                updatables.push(this.thirdPersonCamera);
                // this.scene.add(...this.thirdPersonCamera.rayArrows);

                this.controls.enableDefControl(false);

                this.thirdPersonCamera.setPositionFromPlayer();

            }

        } else if (tpcIdx > -1) {

            updatables.splice(tpcIdx, 1);
            updatables.push(this.controls.defControl);
            // this.scene.remove(...this.thirdPersonCamera.rayArrows);

            this.controls.enableDefControl();

            this.thirdPersonCamera.resetInterectObjects();

        }

        this.thirdPersonCamera.enabled = e;

    }

    enableIC(e) {

        const { updatables } = this.loop;
        const icIdx = updatables.findIndex(f => f === this.inspectorCamera);

        if (e) {

            if (icIdx === -1) {

                const idx = updatables.findIndex(f => f === this.controls.defControl);
                updatables.splice(idx, 1);
                updatables.push(this.inspectorCamera);

                this.controls.enableDefControl(false);

            }
            
        } else if (icIdx > -1) {

            const idx = updatables.findIndex(f => f === this.inspectorCamera);
            updatables.splice(idx, 1);
            updatables.push(this.controls.defControl);

            this.controls.enableDefControl();

        }

    }

    showAirWalls(show) {

        const s = show === 'show' ? true : false;

        this.airWalls.forEach(w => {

            w.visible = s;

        });

    }

    showCObjects(show) {

        const s = show === 'show' ? true : false;

        this.cObjects.forEach(obj => {

            const father = obj.father?.isObstacleBase ? obj.father : obj.father?.father;

            obj.setVisible(s);

            if (father) {

                father.setModelVisible(!s);

            }

        });

    }

    showICAreas(show) {

        const s = show === 'show' ? true : false;

        for (let i = 0, il = this.rooms.length; i < il; i++) {

            const room = this.rooms[i];

            if (!room.isInspectorRoom) continue;

            for (let j = 0, jl = room.areas.length; j < jl; j++) {

                const { box } = room.areas[j];
                box.visible = s;

            }

        }

    }

    changeVolume(level) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];
            player.DAW?.changeMasterLevel(level);

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            enemy.DAW?.changeMasterLevel(level);

        }

    }

    showRapierDebugger(show) {

        const s = show === 'show' ? true : false;
        this.physics.showDebugger(s);

    }

    lockObjects() {

        this.objectLocked = !this.objectLocked;
        
    }

}

export { WorldScene };