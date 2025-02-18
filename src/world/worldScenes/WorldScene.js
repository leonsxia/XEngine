import { Camera } from '../components/cameras/Camera.js';
import { ThirdPersonCamera } from '../components/cameras/ThirdPersonCamera.js';
import { InspectorCamera } from '../components/cameras/InspectorCamera.js';
import { createScene } from '../components/scene.js';
import { WorldControls } from '../systems/Controls.js';
import { Resizer } from '../systems/Resizer.js';
import { Loop } from '../systems/Loop.js';
import { PostProcessor, SSAO_OUTPUT } from '../systems/PostProcesser.js';
import { FXAA, OUTLINE, SSAO, SSAA, BLOOM, WEAPONS } from '../components/utils/constants.js';
import { GuiMaker } from '../systems/GuiMaker.js';

let renderTimes = 0;
const devicePixelRatio = window.devicePixelRatio;

class WorldScene {
    
    setup = {};
    name = 'default scene';

    thirdPersonCamera = null;
    inspectorCamera = null;
    camera = null;
    scene = null;
    renderer = null;
    loop = null;
    resizer = null;
    controls = null;
    container = null;
    staticRendering = true;
    forceStaticRender = true;   // switch whether controls will render after control change.

    lights = {};
    shadowLightObjects = [];

    guiMaker;

    eventDispatcher;
    
    physics = null;
    players = [];
    rooms = [];
    cPlanes = [];
    cObjects = [];
    airWalls = [];
    player;
    loadSequence = 0;
    showRoleSelector = false;
    
    postProcessor;
    triTexture;
    postProcessingEnabled = false;

    picker;
    enablePick = false;
    pickedObject = null;
    objectLocked = false;

    sceneBuilder;
    sceneSetup;
    sceneSetupCopy;
    sceneSavedSetup;
    jsonFileName;

    #paused = true;

    constructor(container, renderer, specs, eventDispatcher) {

        this.setup = specs;
        this.name = specs.name;

        this.container = container;
        this.renderer = renderer;

        const { enableTPC = false, enableIC = false } = specs;
        const defaultCamera = new Camera(specs.camera);
        this.camera = defaultCamera.camera;

        if (enableTPC) {

            this.thirdPersonCamera = new ThirdPersonCamera({ defaultCamera });

        }

        if (enableIC) {

            this.inspectorCamera = new InspectorCamera({ defaultCamera });

        }
        
        this.scene = createScene(specs.scene.backgroundColor);
        this.postProcessor = new PostProcessor(renderer, this.scene, this.camera, container);
        this.loop = new Loop(this.camera, this.scene, this.renderer, this.postProcessor);
        this.eventDispatcher = eventDispatcher;

        this.picker = specs.worldPicker;
        this.sceneBuilder = specs.sceneBuilder;

        this.controls = new WorldControls(this.camera, this.renderer.domElement);

        this.loop.updatables = [this.controls.defControl];
        // this.controls.defControl.listenToKeyEvents(window);

        this.resizer = new Resizer(container, this.camera, this.renderer, this.postProcessor);

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

        if (specs.enableGui) {

            this.guiMaker = new GuiMaker(this);
            this.guiMaker.init();

            this.controls.initPanels(this.guiMaker.gui);

        }

    }

    initContainer() {

        this.controls.defControl.enabled = true;

        if (this.guiMaker?.enabled) {

            this.guiMaker.initGuiControl();

        }

    }

    initBasic() {

        const { enablePicker = false, enableShadow = false, resolution = 1 } = this.setup;

        this.renderer.shadowMap.enabled = enableShadow;

        if (enablePicker) { 
            
            this.picker.setup(this); 
        
        }

        this.sceneBuilder.worldScene = this;
        
        if (devicePixelRatio > 1) {

            // set default scene resolution
            this.resizer.changeResolution(resolution);

        }

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

        this.staticRendering = false;
        this.controls.initPreCoordinates();
        this.controls.setDamping(true, 0.1); // default damping factor 0.05
        this.loop.start(this.guiMaker.gui.stats);
        this.#paused = false;

    }

    stop() {

        this.staticRendering = true;
        this.controls.setDamping(false);
        this.loop.stop();
        this.#paused = true;

    }

    isScenePaused() {

        return this.#paused;

    }

    enablePostProcessing(enable) {

        this.postProcessingEnabled = enable;
        this.loop.enablePostProcessing(enable);

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

        renderTimes = 0;
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
        this.controls.defControl.enabled = false;

    }

    focusNext( /* forceStaticRender = true */ ) {}

    focusNextProcess(forceStaticRender = true) {

        const { allTargets, allCameraPos, allPlayerPos } = this.setup;

        this.loadSequence = ++this.loadSequence % allTargets.length;

        if (this.player) {

            this.player.setPosition(allPlayerPos[this.loadSequence]);

            this.player.updateOBB();

            if (this.player.hasRays) {

                this.player.updateRay();

            }

            this.player.setSlopeIntersection?.();

            this.player.resetFallingState?.();
            
        }

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

    subscribeEvents(obj, moveType) {

        this.eventDispatcher.getActionTypes(moveType).forEach(action => {

            const callback = obj[action];

            if (callback) {

                const subscriber = {
                    subscriber: obj,
                    scene: this.name,
                    callback: callback
                }

                this.eventDispatcher.subscribe(moveType, action, subscriber);

            }

        });

    }

    unsubscribeEvents(obj, moveType) {

        this.eventDispatcher.getActionTypes(moveType).forEach(action => {

            const callback = obj[action];

            if (callback) {

                const subscriber = {
                    subscriber: obj,
                    scene: this.name,
                    callback: callback
                }

                this.eventDispatcher.unsubscribe(moveType, action, subscriber);

            }

        });
        
    }
    
    changeResolution (ratio) {

        this.resizer.changeResolution(ratio);

    }

    changeCharacter(name, forceStaticRender = true) {

        let firstLoad = true;

        // player should have boundingBox and boundingBoxHelper.
        const find = this.players.find(p => p.name === name);
        const oldPlayerBoxHelper = this.player ? this.scene.getObjectByName(this.player.boundingBoxHelper.name) : null;

        if (find) {

            if (this.player) {

                firstLoad = false;

                // remove old player.
                const cmdHide = 'hide';
                this.showPlayerBBHelper(cmdHide)
                    .showPlayerBB(cmdHide)
                    .showPlayerBBW(cmdHide)
                    .showPlayerBF(cmdHide)
                    .showPlayerPushingBox(cmdHide)
                    .showPlayerArrows(cmdHide)
                    .showPlayerSkeleton(cmdHide);

                this.physics.removeActivePlayers(this.player.name);

                this.scene.remove(this.player.group);

                if (this.player.hasRays) {

                    this.scene.remove(this.player.leftArrow);
                    this.scene.remove(this.player.rightArrow);
                    this.scene.remove(this.player.backLeftArrow);
                    this.scene.remove(this.player.backRightArrow);

                }

                if (this.player?.gltf?.skeleton) {

                    this.scene.remove(this.player.gltf.skeleton);
    
                }

                this.unsubscribeEvents(this.player, this.setup.moveType);

                if (oldPlayerBoxHelper) this.scene.remove(oldPlayerBoxHelper);

            }

            this.player = find;

            --this.loadSequence;
            this.focusNext(forceStaticRender);

            this.physics.addActivePlayers(name);

            this.scene.add(this.player.group);

            if (!firstLoad) {

                this.thirdPersonCamera?.changePlayer(this.player);
                this.inspectorCamera?.changePlayer(this.player);
                
            }

            if (this.player.hasRays) {

                this.scene.add(this.player.leftArrow);
                this.scene.add(this.player.rightArrow);
                this.scene.add(this.player.backLeftArrow);
                this.scene.add(this.player.backRightArrow);

            }

            if (this.player?.gltf?.skeleton) {

                this.scene.add(this.player.gltf.skeleton);

            }

            this.subscribeEvents(this.player, this.setup.moveType);

        }
    }

    resetCharacterPosition() {
        
        if (this.player) {

            const { allPlayerPos } = this.setup;

            this.player.setPosition(allPlayerPos[this.loadSequence]);

            this.player.resetFallingState?.();

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

    showPlayerBBHelper(show) {

        if (!this.player || !this.player.boundingBoxHelper) return this;

        const find = this.scene.getObjectByName(this.player.boundingBoxHelper.name);

        const s = show === 'show' ? true : false;

        if (show === 'show') {

            if (!find) {

                this.scene.add(this.player.boundingBoxHelper);
                if (this.player.hasOwnProperty('_showBBHelper')) this.player._showBBHelper = s;

            }

        } else {

            if (find) {

                this.scene.remove(this.player.boundingBoxHelper);
                if (this.player.hasOwnProperty('_showBBHelper')) this.player._showBBHelper = s;

            }

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

    showPlayerPushingBox(show) {

        if (!this.player || !this.player.showPushingBox) return this;

        const s = show === 'show' ? true : false;

        this.player.showPushingBox(s);

        return this;

    }

    showPlayerArrows(show) {

        if (!this.player || !this.player.showArrows) return this;

        const s = show === 'show' ? true : false;

        this.player.showArrows(s);

        return this;

    }

    showPlayerSkeleton(show) {

        if (!this.player.showSkeleton) return this;

        const s = show === 'show' ? true : false;

        this.player.showSkeleton(s);

        return this;

    }

    armWeapon(name) {

        if (!this.player.isCombatPlayer) {
            
            this.guiMaker.gui._lockWeapons = true;
            // console.log(`weapons locked: ${this.guiMaker.gui._lockWeapons}`);
            return;
        
        }

        this.guiMaker.gui._lockWeapons = false;
        // console.log(`weapons locked: ${this.guiMaker.gui._lockWeapons}`);

        switch(name) {

            case WEAPONS.PISTOL1:

                {
                    const weapon = this.player.weapons[WEAPONS.PISTOL1];

                    if (!this.player.armedWeapon || this.player.armedWeapon !== weapon) {

                        this.player.armWeapon(weapon);

                    } else {

                        this.player.armWeapon(null);

                    }
                }

                break;

            case WEAPONS.GLOCK:

                {
                    const weapon = this.player.weapons[WEAPONS.GLOCK];

                    if (!this.player.armedWeapon || this.player.armedWeapon !== weapon) {

                        this.player.armWeapon(weapon);

                    } else {

                        this.player.armWeapon(null);

                    }
                }

                break;

            case WEAPONS.REVOLVER:

                {
                    const weapon = this.player.weapons[WEAPONS.REVOLVER];

                    if (!this.player.armedWeapon || this.player.armedWeapon !== weapon) {

                        this.player.armWeapon(weapon);

                    } else {

                        this.player.armWeapon(null);

                    }
                }

                break;
            
            case WEAPONS.SMG_SHORT:

                {
                    const weapon = this.player.weapons[WEAPONS.SMG_SHORT];

                    if (!this.player.armedWeapon || this.player.armedWeapon !== weapon) {

                        this.player.armWeapon(weapon);

                    } else {

                        this.player.armWeapon(null);

                    }
                }

                break;

        }

    }

    reloadAllWeapons() {

        if (!this.player.isCombatPlayer) return;

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

        if (!e) {

            this.postProcessor.clearOutlineObjects();
            this.guiMaker.clearObjectsPanel();
        
        }

        this.objectLocked = false;

    }

    enablePicking(enable) {

        const e = enable === 'enable' ? true : false;

        this.enablePick = e;    // for picker click event
        this.objectLocked = false;

        this.setEffect(OUTLINE, { enabled: e });

        if (!e) {
            
            this.postProcessor.clearOutlineObjects();
            this.guiMaker.clearObjectsPanel();

        }

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

        this.setEffect(BLOOM, { enabled: e });

    }

    changeBloomStrength(val) {

        this.setEffect(BLOOM, { strength: val });

    }

    changeBloomRadius(val) {

        this.setEffect(BLOOM, { radius: val });

    }

    enableTPC(enable) {

        const e = enable === 'enable' ? true : false;
        const { updatables } = this.loop;

        if (e) {

            const idx = updatables.findIndex(f => f === this.controls.defControl);
            updatables.splice(idx, 1);
            updatables.push(this.thirdPersonCamera);
            // this.scene.add(...this.thirdPersonCamera.rayArrows);

            this.controls.enableDefControl(false);

            this.thirdPersonCamera.setPositionFromPlayer();

        } else {

            const idx = updatables.findIndex(f => f === this.thirdPersonCamera);
            updatables.splice(idx, 1);
            updatables.push(this.controls.defControl);
            // this.scene.remove(...this.thirdPersonCamera.rayArrows);

            this.controls.enableDefControl();
            
            this.thirdPersonCamera.resetInterectObjects();

        }

    }

    enableIC(enable) {

        const e = enable === 'enable' ? true : false;
        const { updatables } = this.loop;

        if (e) {

            const idx = updatables.findIndex(f => f === this.controls.defControl);
            updatables.splice(idx, 1);
            updatables.push(this.inspectorCamera);

            this.controls.enableDefControl(false);

        } else {

            const idx = updatables.findIndex(f => f === this.inspectorCamera);
            updatables.splice(idx, 1);
            updatables.push(this.controls.defControl);

            this.controls.enableDefControl();

        }

    }

    showAirWalls(show) {

        const s = show === 'show' ? true : false;

        this.airWalls.forEach(w => {

            w.mesh.visible = s;

        });

    }

    showCObjects(show) {

        const s = show === 'show' ? true : false;

        this.cObjects.forEach(obj => {

            obj.setVisible(s);

        });

    }

    lockObjects() {

        this.objectLocked = !this.objectLocked;
        
    }

}

export { WorldScene };