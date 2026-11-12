import GUI from 'lil-gui';
import Stats from 'stats.js';
import { GUI_CONFIG, GUI_OPTIONS } from './editorConfig.js';

export default class GuiMaker {

    constructor() {

        this.guis = {};
        this.folders = {};
        this.controllers = {};
        this.stats = new Stats();

        this.init();

    }

    get panels() {

        return Object.values(this.guis);

    }

    init() {

        this.addStats();

    }

    addGui(specs) {

        const { title } = specs;
        if (this.guis[title]) return this.guis[title];

        this.guis[title] = new GUI(specs);
        this.setGuiStyle(specs);

        this.folders[title] = {};
        this.controllers[title] = {};

        return this.guis[title];

    }

    bindChange(gui, callback) {

        gui.onFinishChange(event => {

            if (
                event.controller.domElement.classList.contains('lil-option')
            ) {

                callback(event);

            }

        });

        gui.onChange(event => {

            if (
                event.controller.domElement.classList.contains('lil-function') ||
                event.controller.domElement.classList.contains('lil-number') ||
                event.controller.domElement.classList.contains('lil-color') ||
                event.controller.domElement.classList.contains('lil-boolean')
            ) {

                /**
                 * step 2. gui.onChange will trigger first then controller.onChange
                 * this make sure controller callback call first
                 */
                event.controller.changeFn?.(event);
                callback(event);

            }

        });

    }

    setGuiStyle(specs) {

        const { title, styles = {} } = specs;
        const gui = this.guis[title];

        if (gui) {

            for (const property in styles) {

                gui.domElement.style.setProperty(property, styles[property]);

            }

        }

    }

    inactivateController(controller) {

        controller.domElement.classList.add(GUI_CONFIG.CLASS_INACTIVE);

    }

    activateController(controller) {

        controller.domElement.classList.remove(GUI_CONFIG.CLASS_INACTIVE);

    }

    controllerIsActive(controller) {

        return !controller.domElement.classList.contains(GUI_CONFIG.CLASS_INACTIVE);

    }

    switchControllerState(controller, changeTitle = true, options = GUI_OPTIONS.ENABLE_DISABLE) {

        if (this.controllerIsActive(controller)) {

            this.inactivateController(controller);

        } else {

            this.activateController(controller);

        }

        if (changeTitle) {

            controller.name(`${controller._name === options[0] ? options[1] : options[0]}`);

        }

    }

    setControlValue(controller, value) {

        controller.setValue(value);

    }

    findSiblings(gui, controller) {

        const siblings = gui.controllers.filter(ctl => ctl !== controller && ctl.constructor.name === controller.constructor.name);
        return siblings;

    }

    setFolderActiveController(folder, controller) {

        this.activateController(controller);
        this.findSiblings(folder, controller).forEach(ctl => this.inactivateController(ctl));

    }

    setPanelState(disabled) {

        if (this.panels.length === 0) return;

        for (const panel of this.panels) {

            for (const ctl of panel.controllersRecursive()) {

                disabled ? ctl.disable() : ctl.enable();

            }

        }

    }

    removeChildren(gui) {

        // [...gui.children].forEach(c => c.destroy());
        Array.from(gui.children).forEach(c => c.destroy());

    }

    show() {

        for (const title in this.guis) {

            const gui = this.guis[title];
            gui.show();

        }

    }

    showAt(title) {

        const gui = this.guis[title];
        if (gui) gui.show();

    }

    hide() {

        for (const title in this.guis) {

            const gui = this.guis[title];
            gui.hide();

        }

    }

    hideAt(title) {

        const gui = this.guis[title];
        if (gui) gui.hide();

    }

    addStats() {

        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);

    }

    removeStats() {

        document.body.removeChild(this.stats.dom);

    }

    suspend() {

        this.hide();
        this.removeStats();

    }

    reset() {

        for (const title in this.guis) {

            this.guis[title].reset();

        }

        this.removeStats();
        
    }

}