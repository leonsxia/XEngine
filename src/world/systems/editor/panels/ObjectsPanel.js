/* eslint-disable no-unused-vars */
import { GUI_CONFIG, GUI_OPTIONS } from '../editorConfig.js';
import Panel from './Panel.js';

// $scope must be set to Editor instance when called
export default class ObjectsPanel extends Panel {

    constructor(scope) {

        super(scope);

    }

    init() {

        // initialize objects panel
        this.scope.panel_objects = this.guiMaker.addGui({
            title: GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL,
            styles: {
                right: '250px'
            }
        });

        this.folders = this.guiMaker.folders[GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL];
        this.controllers = this.guiMaker.controllers[GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL];

    }

};