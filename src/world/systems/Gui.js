import { GUI } from 'lil-gui';
import Stats from 'stats.js';
import { colorStr } from '../components/basic/colorBase';

const CONTROL_TITLES = ['Menu', 'Lights Control', 'Objects Control'];
const PLAYER_CONTROL = 'Player Control';
const TPC_CONTROL = 'Third Person Camera';
const IC_CONTROL = 'Inspector Camera';
const WEAPON_CONTROL = 'Weapons';
const SELECT_WEAPONS = 'Select Weapons';
const WEAPON_ACTIONS = 'Weapon Actions';
const WEAPONS_OPTIONS_PARENT = 'weapon_options_actions';
const WEAPONS_ACTIONS_PARENT = 'weapon_actions';
const INACTIVES = '_inactive';
const CLASS_INACTIVE = 'control-inactive';

class Gui {

    #guis = [];
    #stats = null;
    #objects = {};
    #attachedTo;
    #guiLoaded = false;
    #saveObj = null;
    #sceneChanged = false;
    #currentRightPanel;
    #initialRightPanel;

    _lockWeapons = true;

    constructor () {

        this.#guis.push(new GUI({ title: CONTROL_TITLES[0], width: 200 }));
        this.#guis.push(new GUI({ title: CONTROL_TITLES[1] }));
        this.#guis.push(new GUI({ title: CONTROL_TITLES[2] }));

        this.#guis.forEach(gui => gui.hide());

    }

    get stats() {

        return this.#stats;

    }

    get leftPanel() {

        return this.#guis[0];

    }

    init(specs) {

        this.show();

        this.#initialRightPanel = this.#currentRightPanel = specs.initialRightPanel;
        this.showIntialRight(this.#initialRightPanel);

        this.#stats = new Stats();
        this.#stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.#stats.dom);

        if (this.#guiLoaded) return;

        this.#guiLoaded = true;

        Object.assign(Object.assign(this.#objects, specs.left.parents), specs.right_lights.parents);

        this.#attachedTo = specs.attachedTo;

        this.initLeft(specs.left);
        this.initRight();
        this.initRightLights(specs.right_lights);

    }

    initLeft(specs) {
        
        this.#guis[0].domElement.style.setProperty('left', '0');
        this.#guis[0].domElement.style.setProperty('top', '70px');

        const eventObjs = [];

        this.addControl(this.#guis[0], specs, eventObjs);
        this.bindChange(this.#guis[0], eventObjs);

    }

    initRight() {

        this.#guis[1].domElement.style.setProperty('right', '0');
        this.#guis[2].domElement.style.setProperty('right', '0');

    }

    initRightLights(specs) {

        const eventObjs = [];

        this.addControl(this.#guis[1], specs, eventObjs, true);

        specs.functions = {};

        Object.defineProperty(specs.functions, 'save', {
            value: () => {
                this.#saveObj = this.#guis[1].save();
                console.log('save successful!');
            },
            writable: true
        });

        Object.defineProperty(specs.functions, 'load', {
            value: () => {
                if (!this.#saveObj) return;
                this.#guis[1].load(this.#saveObj);
                console.log('load succesful!');
            },
            writable: true
        });

        Object.defineProperty(specs.functions, 'reset', {
            value: () => {
                this.#guis[1].reset();
                console.log('reset successful!');
            },
            writable: true
        });

        this.bindFunctions(this.#guis[1], specs.functions);

        this.bindChange(this.#guis[1], eventObjs);

    }

    addObjects(specs) {

        const eventObjs = [];

        this.addControl(this.#guis[2], specs, eventObjs);

        specs.functions = {};

        Object.defineProperty(specs.functions, 'reset', {
            value: () => {
                this.#guis[2].reset();
                console.log('reset object successful!');
            },
            writable: true
        });

        this.bindFunctions(this.#guis[2], specs.functions);

        this.bindChange(this.#guis[2], eventObjs);

    }

    addControl(gui, specs, eventObjs, needRoom = false) {

        const rooms = [...new Set(specs.details.map(s => s.room))];

        if (needRoom) {

            rooms.forEach(room => { if (room) gui.addFolder(room); });

        }

        specs.details.forEach(detail => {

            let folder;
            const target = detail.parent;

            if (detail.subFolder) {

                let findParentFolder = gui.folders.find(f => f._title === detail.folder);
                if (!findParentFolder) {

                    findParentFolder = gui.addFolder(detail.folder);

                }

                folder = findParentFolder.addFolder(detail.subFolder);

                if (detail.close) {

                    findParentFolder.close();

                }

            } else if (needRoom && detail.room && rooms.length > 0) {

                folder = gui.folders.find(f => f._title === detail.room).addFolder(detail.folder)

            } else {

                folder = gui.folders.find(f => f._title === detail.folder);

                if (!folder) {

                    folder = gui.addFolder(detail.folder);

                }

            }

            detail.specs.forEach(spec => {

                if (spec.value || spec.changeFn || spec.type === 'function') {

                    Object.defineProperty(spec, 'parent', {
                        value: target ?? spec.prop, // if target not exists, will use prop for identifier/parent check in object panel.
                        writable: false
                    });

                    eventObjs.push(spec);
                    
                };

                const parent = !spec.value ?
                    spec.sub ? 
                    spec.subprop ? this.#objects[target][spec.sub][spec.subprop] : this.#objects[target][spec.sub] : this.#objects[target] :
                    spec.value;

                const property = spec.name;

                const displayName = spec.prop ?? spec.name;

                switch(spec.type) {
                    case 'boolean':

                        folder.add(parent, property).listen().name(displayName).identifier = target;

                        break;

                    case 'number':
                    case 'object-angle':

                        folder.add(parent, property, ...spec.params).listen().name(displayName).identifier = target ?? displayName;

                        break;
                        
                    case 'water-color':

                        folder.addColor(parent, property, ...spec.params).listen().name(displayName).identifier = target ?? displayName;

                        break;

                    case 'light-num':
                    case 'angle':

                        folder.add(parent, property, ...spec.params).listen().name(displayName).identifier = target;

                        break;

                    case 'dropdown':
                    case 'scene-dropdown':
                    case 'control-dropdown':
                    case 'role-dropdown':
                    case 'camera-dropdown':

                        folder.add(parent, property, spec.params).listen().name(displayName).identifier = target;

                        break;

                    case 'color':
                    case 'groundColor':

                        folder.addColor(parent, property, ...spec.params).listen().name(displayName).identifier = target;

                        break;

                    case 'function':

                        this.bindFunctions(folder, parent).identifier = target;

                        break;
                }

            });

            if ((!detail.subFolder && detail.close) || detail.closeSub) {

                folder.close();

            }
        });
    }

    bindFunctions(parent, functions) {

        const fnames = Object.getOwnPropertyNames(functions);

        fnames.forEach(f => {

            if (f !== INACTIVES) parent.add(functions, f);

        });

        parent.controllers.forEach(ctl => {
            
            this.bindControllerProperties(ctl);

            if (functions[INACTIVES]?.find(item => item === ctl._name)) {

                ctl.domElement.classList.add(CLASS_INACTIVE);

            }
        
        });

        return parent;

    }

    bindChange(gui, eventObjs) {

        gui.onChange(event => {

            const find = eventObjs.find(o => 
                (
                    o.name === event.property || 
                    o.prop === event.controller._name 
                ) && o.parent === event.controller.identifier || 
                o.type === 'function' && o.parent === event.controller.parent.identifier);

            if (find) {

                const val = event.value;
                const target = this.#objects[find.parent];

                switch(find.type) {
                    case 'color':

                        target.color.setStyle(colorStr(...val));

                        if (find.changeFn) find.changeFn();

                        break;

                    case 'groundColor':

                        target.groundColor.setStyle(colorStr(...val));

                        if (find.changeFn) find.changeFn();

                        break;

                    case 'scene-dropdown':

                        if (this.#sceneChanged) return;

                        this.#sceneChanged = true;

                        find.changeFn(val);

                        break;

                    case 'control-dropdown':
                        // if (this.#sceneChanged) return;
                    case 'dropdown':

                        find.changeFn(val);

                        break;

                    case 'role-dropdown':

                        const gui = this.#guis[0];

                        find.changeFn(val, false);

                        this.findController(gui, PLAYER_CONTROL, 'BBHelper').setValue('hide');
          
                        this.findController(gui, PLAYER_CONTROL, 'BB').setValue('hide');

                        this.findController(gui, PLAYER_CONTROL, 'BBW').setValue('hide');

                        this.findController(gui, PLAYER_CONTROL, 'BF').setValue('hide');

                        this.findController(gui, PLAYER_CONTROL, 'PushingBox').setValue('hide');

                        this.findController(gui, PLAYER_CONTROL, 'Arrows').setValue('hide');

                        this.findController(gui, PLAYER_CONTROL, 'Skeleton').setValue('hide');

                        break;

                    case 'camera-dropdown':

                        if (val === 'enable') {
                            
                            if (find.parent === 'inspectorCamera') {

                                this.findController(this.#guis[0], TPC_CONTROL, 'TPC').setValue('disable');

                            } else if (find.parent === 'thirdPersonCamera') {

                                this.findController(this.#guis[0], IC_CONTROL, 'InsCam').setValue('disable');

                            }
                        }

                        find.changeFn(val);

                        break;

                    case 'number':
                    case 'object-angle':
                    case 'water-color':

                        if (find.changeFn) find.changeFn(val);

                        break;

                    case 'light-num':
                    case 'angle':

                        if (find.changeFn) find.changeFn();

                        break;

                    case 'function':

                        if (!this._lockWeapons && find.parent === WEAPONS_OPTIONS_PARENT) {

                            const isActive = !event.controller.domElement.classList.contains(CLASS_INACTIVE);

                            if (isActive) {

                                event.controller.setInactive();

                            } else {

                                event.controller.setActive();
                                this.findOtherControllers(this.#guis[0], SELECT_WEAPONS, event.controller._name)
                                    .forEach(ctl => ctl.setInactive());

                            }

                        }

                        if (find.parent.search(/_object_actions/) >= 0) {

                            const isActive = !event.controller.domElement.classList.contains(CLASS_INACTIVE);
                            const ctl = event.controller;

                            if (isActive) {

                                ctl.setInactive();

                            } else {

                                ctl.setActive();                                

                            }

                            if (ctl._name.search(/(L|l)ock/) >= 0) {

                                ctl.name(`${ctl._name === 'Lock' ? 'Unl' : 'L'}ock`);

                            }

                        }

                        break;

                }
            }

            if (this.#attachedTo.staticRendering && !this.#sceneChanged && find?.type !== 'scene-dropdown') 
                this.#attachedTo.render();

        });

    }

    show() {

        this.#guis.forEach(gui => gui.show());

    }

    showAt(title) {

        const find = this.#guis.find(g => g._title === title);

        if (find) find.show();

    }

    showIntialRight(title) {

        const rightCtlNames = [];

        CONTROL_TITLES.forEach(c => {

            if (c !== 'Menu') rightCtlNames.push(c);

        });

        rightCtlNames.forEach(c => {

            if (c === title) this.showAt(title);

            else this.hideAt(c);

        });

    }

    hide() {

        this.#guis.forEach(gui => gui.hide());

    }

    hideAt(title) {

        const find = this.#guis.find(g => g._title === title);

        if (find) find.hide();

    }

    reset() {

        this.#guis.forEach(gui => gui.reset());

        this.#sceneChanged = false;

        document.body.removeChild(this.#stats.dom);

    }

    selectControl(title) {

        this.hideAt(this.#currentRightPanel);

        this.showAt(title);

        this.#currentRightPanel = title;

    }

    removeObjects() {

        const length = this.#guis[2].children.length;

        for (let i = 0; i < length; i++) {

            this.#guis[2].children[0].destroy();

        }

    }

    findController(gui, folder, controller) {

        const ctl = gui.folders
            .find(f => f._title === folder).controllers
            .find(c => c._name === controller);

        return ctl;
        
    }

    findOtherControllers(gui, folder, controller) {

        const ctls = gui.foldersRecursive()
            .find(f => f._title === folder).controllers
            .filter (c => c._name !== controller);

        return ctls;

    }

    bindControllerProperties(controller) {

        controller.setInactive = () => {

            controller.domElement.classList.add(CLASS_INACTIVE);

        };

        controller.setActive = () => {

            controller.domElement.classList.remove(CLASS_INACTIVE);

        };

    }

    addPanelParentObjects(object) {

        Object.assign(this.#objects, object);

    }
    
}

export { 
    Gui, 
    PLAYER_CONTROL, 
    WEAPON_CONTROL, SELECT_WEAPONS, WEAPON_ACTIONS, WEAPONS_ACTIONS_PARENT, WEAPONS_OPTIONS_PARENT,
    TPC_CONTROL, IC_CONTROL
};