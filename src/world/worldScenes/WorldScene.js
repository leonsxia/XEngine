import { ThirdPersonCamera } from '../components/cameras/ThirdPersonCamera.js';
import { createScene } from '../components/scene.js';
import { WorldControls } from '../systems/Controls.js';
import { updateSingleLightCamera } from '../components/shadowMaker.js';
import { makeGuiPanel, makeDropdownGuiConfig, makeFunctionGuiConfig, makeSceneRightGuiConfig, makeFolderGuiConfig, makeFolderSpecGuiConfig, makeObjectsGuiConfig } from '../components/utils/guiConfigHelper.js';
import { Resizer } from '../systems/Resizer.js';
import { Loop } from '../systems/Loop.js';
import { Gui } from '../systems/Gui.js';
import { PostProcessor, SSAO_OUTPUT } from '../systems/PostProcesser.js';
import { FXAA, OUTLINE, SSAO, SSAA } from '../components/utils/constants.js';

const CONTROL_TITLES = ['Lights Control', 'Objects Control'];
const INITIAL_RIGHT_PANEL = 'Objects Control'; // Lights Control
const RESOLUTION_RATIO = {'0.5x': 0.5, '0.8x': 0.8, '1x': 1, '2x': 2};
let renderTimes = 0;

class WorldScene {
    
    setup = {};
    name = 'default scene';

    cameraObj = null;
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

    gui = null;
    guiRightLightsSpecs = {};
    guiLeftSpecs = {};
    guiLights = {};
    guiObjects = {};

    eventDispatcher;
    
    physics = null;
    players = [];
    rooms = [];
    cPlanes = [];
    cBoxes = [];
    player;
    loadSequence = 0;
    showRoleSelector = false;

    textures;
    gltfs;
    
    postProcessor;
    triTexture;
    postProcessingEnabled = false;

    picker;
    enablePick = false;
    pickedObject = null;

    constructor(container, renderer, specs, eventDispatcher) {

        this.setup = specs;
        this.name = specs.name;

        this.container = container;
        this.renderer = renderer;
        this.cameraObj = new ThirdPersonCamera(specs.camera);
        this.camera = this.cameraObj.camera;
        
        this.scene = createScene(specs.scene.backgroundColor);
        this.postProcessor = new PostProcessor(renderer, this.scene, this.camera, container);
        this.loop = new Loop(this.camera, this.scene, this.renderer, this.postProcessor);
        this.eventDispatcher = eventDispatcher;

        this.picker = specs.worldPicker;

        this.controls = new WorldControls(this.camera, this.renderer.domElement);

        this.loop.updatables = [this.controls.defControl];
        // this.controls.defControl.listenToKeyEvents(window);

        this.resizer = new Resizer(container, this.camera, this.renderer, this.postProcessor);

        this.resizer.onResize = 
        () => {

            if (this.staticRendering && this.forceStaticRender) this.render();

        };

        this.controls.defControl.addEventListener('change', () => {

            // important!!! no need to render after scene start to update automatically
            // increase the performance fps
            if (this.staticRendering && this.forceStaticRender) this.render();

        });

        if (specs.enableGui) {

            this.gui = new Gui();

            this.controls.initPanels(this.gui);

            this.guiLeftSpecs = makeGuiPanel();

            this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
                folder: 'Select World',
                parent: 'selectWorld',
                name: 'scene',
                value: { scene: specs.name },
                params: specs.scenes,
                type: 'scene-dropdown',
                changeFn: specs.changeCallback
            }));

        }

    }

    initContainer() {

        this.controls.defControl.enabled = true;

        if (this.gui) {

            this.initGUIControl();

        }

    }

    initGUIControl() {

        this.gui.init({ 
            attachedTo: this, 
            left: this.guiLeftSpecs, 
            right_lights: this.guiRightLightsSpecs,
            initialRightPanel: INITIAL_RIGHT_PANEL
        });

    }

    render() {

        // console.log(++renderTimes);
        if (this.postProcessingEnabled) {

            this.postProcessor.composer.render();

        } else {

            this.renderer.render(this.scene, this.camera);
        
        }

    }

    start() {

        this.staticRendering = false;
        this.controls.initPreCoordinates();
        this.controls.defControl.enableDamping = true;
        this.controls.defControl.dampingFactor = 0.1; // default 0.05
        this.loop.start(this.gui.stats);

    }

    stop() {

        this.staticRendering = true;
        this.controls.defControl.enableDamping = false;
        this.loop.stop();

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

        this.controls.defControl.enabled = false;

        this.loadSequence = -1;

        // no need to render at this time too.
        this.focusNext(false);

        // clear picker object
        this.pickedObject = null;
        this.picker.reset();
        this.postProcessor.clearOutlineObjects();

        if (this.gui) {

            this.gui.reset();
            this.gui.hide();

        }
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

        this.eventDispatcher.actions.forEach(action => {

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

        this.eventDispatcher.actions.forEach(action => {

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

    setupGuiConfig() {

        const rightGuiConfig = makeSceneRightGuiConfig(this.guiLights);

        Object.assign(rightGuiConfig.parents, this.lights);

        this.guiRightLightsSpecs = rightGuiConfig;
        
        this.setupLeftFunctionPanle();

        this.guiLeftSpecs.details.push(makeFunctionGuiConfig('Actions', 'actions'));
        this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
            folder: 'Change Resolution',
            parent: 'changeResolution',
            name: 'ratio',
            value: { ratio: 1 },
            params: RESOLUTION_RATIO,
            type: 'dropdown',
            changeFn: this.changeResolution.bind(this),
            close: true
        }));

        this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
            folder: 'Select Control',
            parent: 'selectControl',
            name: 'control',
            value: { control: INITIAL_RIGHT_PANEL },
            params: CONTROL_TITLES,
            type: 'control-dropdown',
            changeFn: this.gui.selectControl.bind(this.gui),
            close: true
        }));

        if (this.showRoleSelector) {
            const roles = [];
            this.players.forEach(p => roles.push(p.name));
            this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
                folder: 'Select Role',
                parent: 'selectRole',
                name: 'role',
                value: { role: this.player.name },
                params: roles,
                type: 'role-dropdown',
                changeFn: this.changeCharacter.bind(this),
                close: true
            }));
        }

        if (this.postProcessor) {

            const folder = makeFolderGuiConfig({folder: 'Post Processing', parent: 'postProcessing', close: true});

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'PostEffect',
                value: { PostEffect: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: this.enablePostEffect.bind(this)
            }));

            if (!this.picker.isUnavailable) {

                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'Picker',
                    value: { Picker: 'disable' },
                    params: ['enable', 'disable'],
                    type: 'dropdown',
                    changeFn: this.enablePicking.bind(this)
                }));

            }

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'FXAA',
                value: { FXAA: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: this.enableFXAA.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'SSAA',
                value: { SSAA: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: this.enableSSAA.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'SSAASampleLevel',
                value: { SSAASampleLevel: 'Level 2: 4 Samples' },
                params: ['Level 0: 1 Sample', 'Level 2: 4 Samples', 'Level 3: 8 Samples', 'Level 4: 16 Samples', 'Level 5: 32 Samples'],
                type: 'dropdown',
                changeFn: this.changeSSAASampleLevel.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'SSAO',
                value: { SSAO: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: this.enableSSAO.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'SSAOOutput',
                value: { SSAOOutput: 'Default' },
                params: ['Default', 'SSAO Only', 'SSAO+Blur Only', 'Depth', 'Normal'],
                type: 'dropdown',
                changeFn: this.changeSSAOOutput.bind(this)
            }));

            this.guiLeftSpecs.details.push(folder);

        }

        if (this.player) {

            this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
                folder: 'Third Person Camera',
                parent: 'thirdPersonCamera',
                name: 'TPC',
                value: { TPC: 'disable' },
                params: ['enable', 'disable'],
                type: 'dropdown',
                changeFn: this.enableTPC.bind(this),
                close: true
            }));

            const folder = makeFolderGuiConfig({folder: 'Player Control', parent: 'playerControl', close: true});

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BBHelper',
                value: { BBHelper: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: this.showPlayerBBHelper.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BB',
                value: { BB: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: this.showPlayerBB.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BBW',
                value: { BBW: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: this.showPlayerBBW.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BF',
                value: { BF: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: this.showPlayerBF.bind(this)
            }));

            if (this.player.showPushingBox) {

                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'PushingBox',
                    value: { PushingBox: 'hide' },
                    params: ['show', 'hide'],
                    type: 'dropdown',
                    changeFn: this.showPlayerPushingBox.bind(this)
                }));

            } 

            if (this.player.showArrows) {

                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'Arrows',
                    value: { Arrows: 'hide' },
                    params: ['show', 'hide'],
                    type: 'dropdown',
                    changeFn: this.showPlayerArrows.bind(this)
                }));

            }

            this.guiLeftSpecs.details.push(folder);

        }

        if (this.cPlanes.length > 0) {

            const folder = makeFolderGuiConfig({folder: 'cPlanes Control', parent: 'cPlanesControl', close: true});

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'Wire',
                value: { Wire: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: this.showWireframe.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'lines',
                value: { lines: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: this.showCPlaneLines.bind(this)
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'arrows',
                value: { arrows: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: this.showCPlaneArrows.bind(this)
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

    clearObjectsPanel() {

        this.gui.removeObjects();

    }
    
    changeResolution (ratio) {

        this.resizer.changeResolution(ratio);

    }

    changeCharacter(name, forceStaticRender = true) {

        // player should have boundingBox and boundingBoxHelper.
        const find = this.players.find(p => p.name === name);
        const oldPlayerBoxHelper = this.player ? this.scene.getObjectByName(this.player.boundingBoxHelper.name) : null;

        if (find) {

            if (this.player) {

                // remove old player.
                this.showPlayerBBHelper(false)
                    .showPlayerBB(false)
                    .showPlayerBBW(false)
                    .showPlayerBF(false);

                this.physics.removeActivePlayers(this.player.name);

                this.scene.remove(this.player.group);

                if (this.player.hasRays) {

                    this.scene.remove(this.player.leftArrow);
                    this.scene.remove(this.player.rightArrow);
                    this.scene.remove(this.player.backLeftArrow);
                    this.scene.remove(this.player.backRightArrow);

                }

                this.unsubscribeEvents(this.player, this.setup.moveType);

                if (oldPlayerBoxHelper) this.scene.remove(oldPlayerBoxHelper);

            }

            this.player = find;

            --this.loadSequence;
            this.focusNext(forceStaticRender);

            this.physics.addActivePlayers(name);

            this.scene.add(this.player.group);

            this.cameraObj.player = find;

            if (this.player.hasRays) {

                this.scene.add(this.player.leftArrow);
                this.scene.add(this.player.rightArrow);
                this.scene.add(this.player.backLeftArrow);
                this.scene.add(this.player.backRightArrow);

            }

            this.subscribeEvents(this.player, this.setup.moveType);

        }
    }

    resetCharacterPosition() {
        
        if (this.player) {

            const { allPlayerPos } = this.setup;

            this.player.setPosition(allPlayerPos[this.loadSequence]);

        }

    }

    showPlayerBBHelper(show) {

        if (!this.player || !this.player.boundingBoxHelper) return;

        const find = this.scene.getObjectByName(this.player.boundingBoxHelper.name);

        if (show === 'show') {

            if (!find) this.scene.add(this.player.boundingBoxHelper);

        } else {

            if (find) this.scene.remove(this.player.boundingBoxHelper);

        }

        return this;

    }

    showPlayerBB(show) {

        if (!this.player || !this.player.boundingBoxMesh) return;

        const s = show === 'show' ? true : false;

        this.player.showBB(s);

        return this;

    }

    showPlayerBBW(show) {

        if (!this.player || !this.player.boundingBoxWireMesh) return;

        const s = show === 'show' ? true : false;

        this.player.showBBW(s);

        return this;

    }

    showPlayerBF(show) {

        if (!this.player) return;

        const s = show === 'show' ? true : false;

        this.player.showBF(s);

        return this;

    }

    showPlayerPushingBox(show) {

        if (!this.player || !this.player.showPushingBox) return;

        const s = show === 'show' ? true : false;

        this.player.showPushingBox(s);

        return this;

    }

    showPlayerArrows(show) {

        if (!this.player || !this.player.showArrows) return;

        const s = show === 'show' ? true : false;

        this.player.showArrows(s);

        return this;

    }

    showWireframe(show) {

        const s = show === 'show' ? true : false;

        this.cPlanes.forEach(cp => {

            cp.setWireframe(s);

        });

        this.cBoxes.forEach(cb => {

            cb.setWireframe(s);

        });

    }

    showCPlaneLines(show) {

        const s = show === 'show' ? true : false;

        this.cPlanes.forEach(cp => {

            if (cp.line) cp.line.visible = s;

        });

        this.cBoxes.forEach(cb => {

            if (cb.line) cb.line.visible = s;

        });

    }

    showCPlaneArrows(show) {

        const s = show === 'show' ? true : false;

        this.cPlanes.forEach(cp => {

            if (cp.leftArrow) cp.leftArrow.visible = s;
            if (cp.rightArrow) cp.rightArrow.visible = s;

        });

    }

    enablePostEffect(enable) {

        const e = enable === 'enable' ? true : false;

        this.enablePostProcessing(e);

        if (!e) {

            this.postProcessor.clearOutlineObjects();
            this.clearObjectsPanel();
        
        }

    }

    enablePicking(enable) {

        const e = enable === 'enable' ? true : false;

        this.enablePick = e;    // for picker click event

        this.setEffect(OUTLINE, { enabled: e });

        if (!e) {
            
            this.postProcessor.clearOutlineObjects();
            this.clearObjectsPanel();

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

    enableTPC(enable) {

        const e = enable === 'enable' ? true : false;
        const { updatables } = this.loop;

        if (e) {

            const idx = updatables.findIndex(f => f === this.controls.defControl);
            updatables.splice(idx, 1);
            updatables.push(this.cameraObj);
            this.scene.add(...this.cameraObj.rayArrows);

            this.cameraObj.setPositionFromPlayer();

        } else {

            const idx = updatables.findIndex(f => f === this.cameraObj);
            updatables.splice(idx, 1);
            updatables.push(this.controls.defControl);
            this.scene.remove(...this.cameraObj.rayArrows);

        }

    }

    bindLightShadowHelperGuiCallback() {

        // bind callback to light helper and shadow cam helper
        this.shadowLightObjects.forEach(lightObj => {

            const { specs } = this.guiRightLightsSpecs.details.find(d => d.parent === lightObj.name);

            const changeObjs = specs.filter(s => s.hasOwnProperty('changeFn') && (s.type === 'light-num' || s.type === 'color' || s.type === 'groundColor' || s.type === 'angle'));

            changeObjs.forEach(o => {

                o['changeFn'] = updateSingleLightCamera.bind(this, lightObj, false);

            });

        });
    }
}

export { WorldScene };