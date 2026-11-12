import GuiMaker from './GuiMaker.js';
import MenuPanel from './panels/MenuPanel.js';
import LightsPanel from './panels/LightsPanel.js';
import ObjectsPanel from './panels/ObjectsPanel.js';
import { DEFAULT_BLOOM } from '../PostProcessor.js';
import { GUI_CONFIG } from './editorConfig.js';

export default class Editor {

    sceneChanged = false;

    bloomSetting = {
        BloomStrength : DEFAULT_BLOOM.strength,
        BloomRadius: DEFAULT_BLOOM.radius
    };

    lockWeapons = true;

    initialRightPanel = GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL;
    currentRightPanel = this.initialRightPanel;
    
    rightPanels = [
        GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL,
        GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL
    ];

    panels = {};

    constructor(scene) {

        this.scene = scene;
        this.setup = this.scene.setup;
        this.enabled = this.setup.enableGui;
        this.guiMaker = new GuiMaker();

        this.init();

    }

    init() {

        // initialize left main menu panel
        this.panels[GUI_CONFIG.PANEL_TITLES.MENU] = new MenuPanel(this);

        // initialize right lights control panel
        this.panels[GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL] = new LightsPanel(this);

        // initialize right objects control panel
        this.panels[GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL] = new ObjectsPanel(this);

        // bind controls change events
        this.bindChangeEvents();

        // show inital right panel which is Objects Control
        this.showInitialRightPanel();
        
    }

    bindChangeEvents() {

        const callbackAfterChange = (event) => {

            if (this.scene.staticRendering && !this.sceneChanged && event.property !== 'Scene') {

                this.scene.render();

            }

        };

        for (const gui of this.guiMaker.panels) {

            this.guiMaker.bindChange(gui, callbackAfterChange);

        }

    }

    showInitialRightPanel() {

        for (const title of this.rightPanels) {

            if (title === this.initialRightPanel) this.guiMaker.showAt(title);
            else this.guiMaker.hideAt(title);

        }

    }

    addObjectsToPanel(objects) {

        this.panels[GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL].buildPanel(objects);

    }

    /**
     * clear Objects Control panel when needed
     */
    clearObjectsPanel() {

        this.guiMaker.removeChildren(this.panel_objects);
        // clear temple folder in ObjectsPanel
        this.panels[GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL].folder = null;

    }

    /**
     * used by select control
     */
    selectPanel(title) {

        this.guiMaker.hideAt(this.currentRightPanel);
        this.guiMaker.showAt(title);
        this.currentRightPanel = title;

    }

    /**
     * recover guis when needed, e.g. mouse moved
     */
    recover() {

        this.guiMaker.showAt(GUI_CONFIG.PANEL_TITLES.MENU);
        this.guiMaker.showAt(this.currentRightPanel);

    }

    /**
     * called when changing scene, current scene selector is reset
     * all guis are hidden
     */
    suspend() {

        this.ctl_selectScene.reset();
        this.ctl_selectControl.reset();
        this.sceneChanged = false;
        // remove stats and hide all guis
        this.guiMaker.suspend();

    }

    /**
     * called when reset scene, deprecated
     */
    reset() {

        this.guiMaker.reset();

    }

    /**
     * called when scene is awakened in initBasic
     * all guis are recovered
     */
    alive() {

        this.recover();
        this.guiMaker.addStats();

    }

}