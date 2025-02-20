import { GUI } from 'lil-gui';
import Stats from 'stats.js';
import { colorStr } from '../components/basic/colorBase';
import { GUI_CONFIG } from '../components/utils/constants';

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

        this.#guis.push(new GUI({ title: GUI_CONFIG.CONTROL_TITLES.MENU, width: 200 }));
        this.#guis.push(new GUI({ title: GUI_CONFIG.CONTROL_TITLES.LIGHT_CONTROL }));
        this.#guis.push(new GUI({ title: GUI_CONFIG.CONTROL_TITLES.OBJECTS_CONTROL }));

        this.#guis.forEach(gui => gui.hide());

    }

    get stats() {

        return this.#stats;

    }

    get panels() {

        return this.#guis;

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

            if (f !== GUI_CONFIG.INACTIVES) parent.add(functions, f);

        });

        parent.controllers.forEach(ctl => {
            
            this.bindControllerProperties(ctl);

            if (functions[GUI_CONFIG.INACTIVES]?.find(item => item === ctl._name)) {

                ctl.domElement.classList.add(GUI_CONFIG.CLASS_INACTIVE);

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

                        const gui = this.findGui(GUI_CONFIG.CONTROL_TITLES.MENU);

                        find.changeFn(val, false);

                        this.findController(gui, GUI_CONFIG.PLAYER_CONTROL, 'BBHelper').setValue('hide');
          
                        this.findController(gui, GUI_CONFIG.PLAYER_CONTROL, 'BB').setValue('hide');

                        this.findController(gui, GUI_CONFIG.PLAYER_CONTROL, 'BBW').setValue('hide');

                        this.findController(gui, GUI_CONFIG.PLAYER_CONTROL, 'BF').setValue('hide');

                        this.findController(gui, GUI_CONFIG.PLAYER_CONTROL, 'PushingBox').setValue('hide');

                        this.findController(gui, GUI_CONFIG.PLAYER_CONTROL, 'Arrows').setValue('hide');

                        this.findController(gui, GUI_CONFIG.PLAYER_CONTROL, 'Skeleton').setValue('hide');

                        break;

                    case 'camera-dropdown':

                        if (val === 'enable') {
                            
                            if (find.parent === 'inspectorCamera') {

                                this.findController(this.#guis[0], GUI_CONFIG.TPC_CONTROL, 'TPC').setValue('disable');

                            } else if (find.parent === 'thirdPersonCamera') {

                                this.findController(this.#guis[0], GUI_CONFIG.IC_CONTROL, 'InsCam').setValue('disable');

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

                        const ctl = event.controller;
                        const isActive = this.controlIsActive(ctl);

                        if (!this._lockWeapons && find.parent === GUI_CONFIG.WEAPONS_OPTIONS_PARENT) {

                            if (isActive) {

                                ctl.setInactive();

                            } else {

                                ctl.setActive();
                                this.findOtherControllers(this.findGui(GUI_CONFIG.CONTROL_TITLES.MENU), GUI_CONFIG.SELECT_WEAPONS, event.controller._name)
                                    .forEach(ctl => ctl.setInactive());

                            }

                        } else if (find.parent.search(/_object_actions/) >= 0) {

                            if (ctl._name.search(/(L|l)ock/) >= 0) {

                                if (isActive) {

                                    ctl.setInactive();

                                } else {

                                    ctl.setActive();

                                }

                                ctl.name(`${ctl._name === 'lock' ? 'unl' : 'l'}ock`);

                            }

                        } else if (find.parent === GUI_CONFIG.PICKER_ACTIONS_PARENT) {

                            if (isActive) {

                                ctl.setInactive();

                            } else {

                                ctl.setActive();

                            }

                            ctl.name(`${ctl._name === 'enable' ? 'disable' : 'enable'}`);

                        } else if (find.parent.search(/tpc_actions|ic_actions/) >= 0) {

                            if (isActive) {

                                ctl.setInactive();
                                this.findOtherControllers(this.findGui(GUI_CONFIG.CONTROL_TITLES.MENU), GUI_CONFIG.CAMERA_CONTROL, event.controller._name)
                                    .forEach(ctl => ctl.setActive());

                            } else {

                                ctl.setActive();
                                
                            }
                            
                        }

                        break;

                }
            }

            if (this.#attachedTo.staticRendering && !this.#sceneChanged && find?.type !== 'scene-dropdown') 
                this.#attachedTo.render();

        });

    }

    controlIsActive(control) {

        return !control.domElement.classList.contains(GUI_CONFIG.CLASS_INACTIVE);

    }

    findGui(title) {

        return this.#guis.find(g => g._title === title);

    }

    setControlValue(gui, control, action, value) {

        const ctl = this.findController(this.findGui(gui), control, action)
        
        ctl?.setValue(value);

    }

    switchFunctionControl(gui, control, val, counterVal) {

        const ctl = this.findController(this.findGui(gui), control, val);

        if (!ctl) return;

        const isActive = this.controlIsActive(ctl);

        if (isActive) {

            ctl.setInactive();

        } else {

            ctl.setActive();

        }

        ctl.name(counterVal);

    }

    show() {

        this.#guis.forEach(gui => gui.show());

    }

    showAt(title) {

        const find = this.findGui(title);

        if (find) find.show();

    }

    showIntialRight(title) {

        const rightCtlNames = [];

        for (let gui in GUI_CONFIG.CONTROL_TITLES) {

            const ctl = GUI_CONFIG.CONTROL_TITLES[gui];
            if (ctl !== GUI_CONFIG.CONTROL_TITLES.MENU) {

                rightCtlNames.push(ctl);

            }

        }

        rightCtlNames.forEach(c => {

            if (c === title) this.showAt(title);

            else this.hideAt(c);

        });

    }

    hide() {

        this.#guis.forEach(gui => gui.hide());

    }

    hideAt(title) {

        const find = this.findGui(title);

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

        const objCtl = this.findGui(GUI_CONFIG.CONTROL_TITLES.OBJECTS_CONTROL)
        const length = objCtl.children.length;

        for (let i = 0; i < length; i++) {

            objCtl.children[0].destroy();

        }

    }

    findController(gui, folder, controller) {

        let ctl = null;
        
        if (folder) {

            ctl = gui.foldersRecursive()
                .find(f => f._title === folder).controllers
                .find(c => c._name === controller);

        } else {

            ctl = gui.controllersRecursive().find(c => c._name === controller);

        }

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

            controller.domElement.classList.add(GUI_CONFIG.CLASS_INACTIVE);

        };

        controller.setActive = () => {

            controller.domElement.classList.remove(GUI_CONFIG.CLASS_INACTIVE);

        };

    }

    addPanelParentObjects(object) {

        Object.assign(this.#objects, object);

    }

    setPanelState(disabled) {

        if (this.panels.length === 0) return;

        const ctlAction = (ctl) => {

            if (disabled) {

                ctl.disable();

            } else {

                ctl.enable();
            }

        }

        this.panels.forEach(panel => {

            panel.controllersRecursive().forEach((ctl) => {

                ctlAction(ctl);

            });

            panel.foldersRecursive().forEach(folder => {

                folder.controllers.forEach(ctl => {

                    ctlAction(ctl);

                });

            });

        });

    }
    
}

export { Gui };