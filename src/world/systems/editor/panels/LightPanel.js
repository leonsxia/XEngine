/* eslint-disable no-unused-vars */
import { GUI_CONFIG, GUI_OPTIONS } from '../editorConfig.js';
import Panel from './Panel.js';

// $scope must be set to Editor instance when called
export default class LightsPanel extends Panel {

    constructor(scope) {

        super(scope);

    }

    init() {

        // initialize menu panel
        this.scope.panel_menu = this.guiMaker.addGui({
            title: GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL,
            styles: {
                right: '250px'
            }
        });

        this.folders = this.guiMaker.folders[GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL];
        this.controllers = this.guiMaker.controllers[GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL];

    }    

};