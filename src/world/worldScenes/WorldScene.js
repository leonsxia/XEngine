import { createCamera } from '../components/camera.js';
import { createScene } from '../components/scene.js';
import { WorldControls } from '../systems/Controls.js';
import { updateSingleLightCamera } from '../components/shadowMaker.js';
import { makeGuiPanel, makeDropdownGuiConfig, makeFunctionGuiConfig, makeSceneRightGuiConfig, makeFolderGuiConfig, makeFolderSpecGuiConfig } from '../components/utils/guiConfigHelper.js';
import { Resizer } from '../systems/Resizer.js';
import { Loop } from '../systems/Loop.js';
import { Gui } from '../systems/Gui.js';

const CONTROL_TITLES = ['Lights Control', 'Objects Control'];
const INITIAL_RIGHT_PANEL = 'Lights Control';
const RESOLUTION_RATIO = {'0.5x': 0.5, '0.8x': 0.8, '1x': 1, '2x': 2};

class WorldScene {
    setup = {};
    name = 'default scene';
    camera = null;
    scene = null;
    renderer = null;
    loop = null;
    #resizer = null;
    controls = null;
    container = null;
    staticRendering = true;
    lights = {};
    gui = null;
    guiRightLightsSpecs = {};
    guiLeftSpecs = {};
    guiLights = {};
    guiObjects = {};
    eventDispatcher;
    shadowLightObjects = [];
    physics = null;
    players = [];
    rooms = [];
    cPlanes = [];
    player;
    loadSequence = 0;
    showRoleSelector = false;

    constructor(container, renderer, specs, eventDispatcher) {
        this.setup = specs;
        this.name = specs.name;
        this.renderer = renderer;
        this.camera = createCamera(specs.camera);
        this.scene = createScene(specs.scene.backgroundColor);
        this.loop = new Loop(this.camera, this.scene, this.renderer);
        this.container = container;
        this.eventDispatcher = eventDispatcher;

        this.controls = new WorldControls(this.camera, this.renderer.domElement);

        // this.controls.defControl.listenToKeyEvents(window);

        this.#resizer = new Resizer(container, this.camera, this.renderer);
        this.#resizer.onResize = 
        () => {
            this.render();
        };

        this.controls.defControl.addEventListener('change', () => {
            // important!!! no need to render after scene start to update automatically
            // increase the performance fps
            if (this.staticRendering) this.render();    
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
        this.container.append(this.renderer.domElement);
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
        this.renderer.render(this.scene, this.camera);
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

    update() {
        this.scene.children.forEach((object) => {
            object.rotation.y += 0.0025;
        })
        this.render();
        window.requestAnimationFrame(this.update.bind(this));
    }

    moveCamera() {
        const moveDist = 5;
        if (this.staticRendering) {
            this.controls.moveCameraStatic(moveDist);
        } else {
            this.controls.moveCamera(moveDist);
        }
    }

    resetCamera() {
        this.controls.resetCamera();
    }

    focusNext() {}

    focusNextProcess(setup) {
        const { allTargets, allCameraPos, allPlayerPos } = setup;

        this.loadSequence = ++this.loadSequence % allTargets.length;

        if (this.player) {
            this.player.setPosition(allPlayerPos[this.loadSequence]);
            this.player.updateBoundingBoxHelper();
        }

        if (this.staticRendering) {
            this.controls.defControl.target.copy(allTargets[this.loadSequence]);
            this.camera.position.copy(allCameraPos[this.loadSequence]);
            this.controls.defControl.update();
        } else {
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
        
        this.controls.defControl.update();
    }

    reset() {
        this.stop();
        this.renderer.shadowMap.enabled = false;
        this.controls.resetCamera();
        this.controls.defControl.enabled = false;
        this.loadSequence = -1;
        this.focusNext();
        if (this.gui) {
            this.gui.reset();
            this.gui.hide();
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
            changeFn: this.changeResolution.bind(this)
        }));
        this.guiLeftSpecs.details.push(makeDropdownGuiConfig({
            folder: 'Select Control',
            parent: 'selectControl',
            name: 'control',
            value: { control: INITIAL_RIGHT_PANEL },
            params: CONTROL_TITLES,
            type: 'control-dropdown',
            changeFn: this.gui.selectControl.bind(this.gui)
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
                changeFn: this.changeCharacter.bind(this)
            }));
        }

        if (this.players.length > 0) {
            const folder = makeFolderGuiConfig({folder: 'Player Control', parent: 'playerControl'});
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
            this.guiLeftSpecs.details.push(folder);
        }

        if (this.cPlanes.length > 0) {
            const folder = makeFolderGuiConfig({folder: 'cPlanes Control', parent: 'cPlanesControl'});
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
            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'BBHelper',
                value: { BBHelper: 'hide' },
                params: ['show', 'hide'],
                type: 'dropdown',
                changeFn: this.showCPlaneBBHelper.bind(this)
            }));
            this.guiLeftSpecs.details.push(folder);
        }
        
        // bind callback to light helper and shadow cam helper
        this.bindLightShadowHelperGuiCallback();
    }

    setupObjectsGuiConfig() {}
    
    changeResolution (ratio) {
        this.#resizer.changeResolution(ratio);
    }

    changeCharacter(name) {
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
                this.unsubscribeEvents(this.player, this.setup.moveType);
                if (oldPlayerBoxHelper) this.scene.remove(oldPlayerBoxHelper);
            }
            this.player = find;
            this.focusNext(--this.loadSequence);
            this.physics.addActivePlayers(name);
            this.scene.add(this.player.group);
            this.subscribeEvents(this.player, this.setup.moveType);
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
        if (show === 'show') this.player.showBB(true);
        else this.player.showBB(false);
        return this;
    }

    showPlayerBBW(show) {
        if (!this.player || !this.player.boundingBoxWireMesh) return;
        if (show === 'show') this.player.showBBW(true);
        else this.player.showBBW(false);
        return this;
    }

    showPlayerBF(show) {
        if (!this.player) return;
        if (show === 'show') this.player.showBF(show);
        else this.player.showBF(false);
        return this;
    }

    showCPlaneLines(show) {
        const s = show === 'show' ? true : false;
        this.cPlanes.forEach(cp => {
            cp.line.visible = s;
        });
    }

    showCPlaneArrows(show) {
        const s = show === 'show' ? true : false;
        this.cPlanes.forEach(cp => {
            if (cp.leftArrow) cp.leftArrow.visible = s;
            if (cp.rightArrow) cp.rightArrow.visible = s;
        });
    }

    showCPlaneBBHelper(show) {
        const s = show === 'show' ? true : false;
        this.cPlanes.forEach(cp => {
            if (cp.boundingBoxHelper) cp.boundingBoxHelper.visible = s;
        });
    }

    bindLightShadowHelperGuiCallback() {
        // bind callback to light helper and shadow cam helper
        this.shadowLightObjects.forEach(lightObj => {
            const { specs } = this.guiRightLightsSpecs.details.find(d => d.parent === lightObj.name);
            const changeObjs = specs.filter(s => s.hasOwnProperty('changeFn') && (s.type === 'light-num' || s.type === 'color' || s.type === 'groundColor' || s.type === 'angle'));
            changeObjs.forEach(o => {
                o['changeFn'] = updateSingleLightCamera.bind(this, lightObj, true);
            })
        });
    }
}

export { WorldScene };