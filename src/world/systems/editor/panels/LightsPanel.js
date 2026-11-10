/* eslint-disable no-unused-vars */
import { GUI_CONFIG, GUI_OPTIONS } from '../editorConfig.js';
import Panel from './Panel.js';

// $scope must be set to Editor instance when called
export default class LightsPanel extends Panel {

    folders = {};

    constructor(scope) {

        super(scope);

    }

    init() {

        // initialize lights panel
        this.scope.panel_lights = this.guiMaker.addGui({
            title: GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL,
            styles: {
                right: '250px'
            }
        });

        this.folders = this.guiMaker.folders[GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL];
        this.controllers = this.guiMaker.controllers[GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL];

        this.buildPanel();

    }

    getLocalDomain() {

        const domain = super.getLocalDomain();
        domain.$lightSpecs = this.scene.guiLightSpecs;
        domain.$shadowLightObjects = this.scene.shadowLightObjects;

        return domain;

    }

    buildPanel() {

        const { $scope, $lightSpecs, $shadowLightObjects } = this.getLocalDomain();
        const rooms = [...new Set($shadowLightObjects.map(sl => sl.room))];

        for (const room of rooms) {

            $scope.panel_lights.addFolder(room);

        }

    }

};