import { GUI } from 'lil-gui';
import Stats from 'stats.js';

const CONTROL_TITLES = ['Menu', 'Lights Control', 'Objects Control'];
const PLAYER_CONTROL = 'Player Control';

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

    constructor () {
        this.#guis.push(new GUI({ title: CONTROL_TITLES[0], width: 140}));
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
        this.initRightLights(specs.right_lights);
    }

    initLeft(specs) {
        this.#guis[0].domElement.style.setProperty('left', '0');
        this.#guis[0].domElement.style.setProperty('top', '70px');
        const eventObjs = [];
        this.addControl(this.#guis[0], specs, eventObjs);
        this.bindChange(this.#guis[0], eventObjs);
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
        })
        this.bindFunctions(this.#guis[1], specs.functions);

        this.bindChange(this.#guis[1], eventObjs);
    }

    addControl(gui, specs, eventObjs, needRoom = false) {

        const rooms = [...new Set(specs.details.map(s => s.room))];

        if (needRoom) {

            rooms.forEach(room => { if (room) gui.addFolder(room); });

        }

        specs.details.forEach(detail => {

            let folder;
            const target = detail.parent;

            if (needRoom && detail.room && rooms.length > 0) {

                folder = gui.folders.find(f => f._title === detail.room).addFolder(detail.folder)

            } else {

                folder = gui.addFolder(detail.folder);

            }

            detail.specs.forEach(spec => {
                if (spec.value || spec.changeFn) {
                    Object.defineProperty(spec, 'parent', {
                        value: target,
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
                        folder.add(parent, property).name(displayName).identifier = target;
                        break;
                    case 'number':
                    case 'light-num':
                    case 'angle':
                        folder.add(parent, property, ...spec.params).name(displayName).identifier = target;
                        break;
                    case 'dropdown':
                    case 'scene-dropdown':
                    case 'control-dropdown':
                    case 'role-dropdown':
                        folder.add(parent, property, spec.params).name(displayName).identifier = target;
                        break;
                    case 'color':
                    case 'groundColor':
                        folder.addColor(parent, property, ...spec.params).name(displayName).identifier = target;
                        break;
                    case 'function':
                        this.bindFunctions(folder, parent);
                }
            });
        });
    }

    bindFunctions(parent, functions) {
        const fnames = Object.getOwnPropertyNames(functions);
        fnames.forEach(f => {
            parent.add(functions, f);
        });
    }

    bindChange(gui, eventObjs) {
        gui.onChange(event => {
            const find = eventObjs.find(o => (o.name === event.property || o.prop === event.controller._name) && o.parent === event.controller.identifier);
            if (find) {
                const val = event.value;
                const target = this.#objects[find.parent];
                switch(find.type) {
                    case 'color':
                        target.color.setStyle(this.colorStr(...val));
                        if (find.changeFn) find.changeFn();
                        break;
                    case 'groundColor':
                        target.groundColor.setStyle(this.colorStr(...val));
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
                        find.changeFn(val, false);
                        this.#guis[0].folders.find(f => f._title === PLAYER_CONTROL)
                            .controllers.find(c => c._name === 'BBHelper')
                            .setValue('hide');
                        this.#guis[0].folders.find(f => f._title === PLAYER_CONTROL)
                            .controllers.find(c => c._name === 'BB')
                            .setValue('hide');
                        this.#guis[0].folders.find(f => f._title === PLAYER_CONTROL)
                            .controllers.find(c => c._name === 'BBW')
                            .setValue('hide');
                        this.#guis[0].folders.find(f => f._title === PLAYER_CONTROL)
                            .controllers.find(c => c._name === 'BF')
                            .setValue('hide');
                        break;
                    case 'light-num':
                    case 'angle':
                        if (find.changeFn) find.changeFn();
                        break;
                }
            }
            if (this.#attachedTo.staticRendering) this.#attachedTo.render();
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
        })
        rightCtlNames.forEach(c => {
            if (c === title) this.showAt(title);
            else this.hideAt(c);
        })
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

    colorStr(r, g, b) {
        return `rgb(${r},${g},${b})`;
    }
}

export { Gui };