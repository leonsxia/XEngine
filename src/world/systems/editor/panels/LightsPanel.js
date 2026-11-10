/* eslint-disable no-unused-vars */
import { GUI_CONFIG, GUI_MEASURES, GUI_OPTIONS } from '../editorConfig.js';
import { DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from '../../../components/utils/constants.js';
import { updateSingleLightCamera } from '../../../components/shadowMaker.js';
import { colorStr } from '../../../components/basic/colorBase.js';
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
            width: 280,
            styles: {
                right: '250px'
            }
        });

        this.folders = this.guiMaker.folders[GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL];
        this.controllers = this.guiMaker.controllers[GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL];

        this.getLocalDomain();

        this.buildPanel();

    }

    getLocalDomain() {

        const domain = super.getLocalDomain();
        domain.$lightSpecs = this.scene.guiLightSpecs;
        domain.$shadowLightObjects = this.scene.shadowLightObjects;

        return domain;

    }

    buildPanel() {

        const { $scope, $lightSpecs, $shadowLightObjects } = this.domain;
        const rooms = [...new Set($shadowLightObjects.map(sl => sl.room))];

        for (const room of rooms) {

            this.folders[room] = $scope.panel_lights.addFolder(room);

        }

        const { basicLightSpecsArr, pointLightSpecsArr, spotLightSpecsArr, rectAreaLightSpecsArr } = $lightSpecs;
        for (const basicLightSpecs of basicLightSpecsArr) {

            this.buildBasicLightControls(basicLightSpecs);

        }

    }

    /**
     * basic lights controls
     */
    buildBasicLightControls(lightSpecs) {

        switch(lightSpecs.light.type) {

            case DIRECTIONAL_LIGHT:

                this.buildDirectionalLightControls(lightSpecs);
                break;

            case AMBIENT_LIGHT:

                this.buildAmbientLightControls(lightSpecs);
                break;

            case HEMISPHERE_LIGHT:

                this.buildHemisphereLightControls(lightSpecs);
                break;

        }
    }

    /**
     * directional light controls
     */
    buildDirectionalLightControls(lightSpecs) {

        const { folders } = this.domain;
        const { name, room, light, detail, debug, shadow, shadow_debug } = lightSpecs;
        const room_folder = folders[room];
        const light_folder = room_folder.addFolder(detail.display ?? name);
        const postChangeFn = this.lightShadowHelperCallback(light);

        light_folder.add(light, 'intensity', 0, 20, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.addColor(detail, 'color', 255)
            .listen()
            .changeFn = event => {
                
                light.color.setStyle(colorStr(...event.value));
                postChangeFn();

            };

        if (debug) {

            const debug_folder = light_folder.addFolder('debug');
            debug_folder.add(light.position, 'x')
                .min(- GUI_MEASURES.DEFALUT_GRID_WIDTH)
                .max(GUI_MEASURES.DEFALUT_GRID_WIDTH)
                .step(GUI_MEASURES.NUMBER_STEPS)
                .name('position.x')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.position, 'y')
                .min(- GUI_MEASURES.DEFAULT_GRID_HEIGHT)
                .max(GUI_MEASURES.DEFAULT_GRID_HEIGHT)
                .step(GUI_MEASURES.NUMBER_STEPS)
                .name('position.y')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.position, 'z')
                .min(- GUI_MEASURES.DEFALUT_GRID_DEPTH)
                .max(GUI_MEASURES.DEFALUT_GRID_DEPTH)
                .step(GUI_MEASURES.NUMBER_STEPS)
                .name('position.z')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.target.position, 'x')
                .min(- GUI_MEASURES.DEFALUT_GRID_WIDTH)
                .max(GUI_MEASURES.DEFALUT_GRID_WIDTH)
                .step(GUI_MEASURES.NUMBER_STEPS)
                .name('target.x')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.target.position, 'y')
                .min(- GUI_MEASURES.DEFAULT_GRID_HEIGHT)
                .max(GUI_MEASURES.DEFAULT_GRID_HEIGHT)
                .step(GUI_MEASURES.NUMBER_STEPS)
                .name('target.y')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.target.position, 'z')
                .min(- GUI_MEASURES.DEFALUT_GRID_DEPTH)
                .max(GUI_MEASURES.DEFALUT_GRID_DEPTH)
                .step(GUI_MEASURES.NUMBER_STEPS)
                .name('target.z')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.lightHelper, 'visible')
                .name('light helper')
                .listen();

            if (shadow && shadow_debug) {

                const shadow_camera_folder = light_folder.addFolder('shadow camera');
                shadow_camera_folder.add(light.shadow, 'blurSamples', 0, 20, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow blurSamples')
                    .listen();

                shadow_camera_folder.add(light.shadow, 'radius', 0, 10, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow radius')
                    .listen();

                shadow_camera_folder.add(light.shadow, 'bias', - .01, .01, GUI_MEASURES.LIGHT_BIAS_STEPS)
                    .name('shadow bias')
                    .listen();

                shadow_camera_folder.add(light.shadow, 'normalBias', - .1, .1, GUI_MEASURES.LIGHT_BIAS_STEPS)
                    .name('shadow normalBias')
                    .listen();

                shadow_camera_folder.add(light.shadow.camera, 'width', 1, 100, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera width')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'height', 1, 100, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera height')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'near', .01, 10, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera near')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'far', 100, 1000, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera far')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'zoom', .01, 1.5, .01)
                    .name('shadow camera zoom')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.lightShadowCamHelper, 'visible')
                    .name('shadow camera helper')
                    .listen();

                shadow_camera_folder.add(light, 'castShadow')
                    .name('castShadow')
                    .listen();

            }

        }

    }

    /**
     * ambient light controls
     */
    buildAmbientLightControls(lightSpecs) {}
    
    /**
     * hemisphere light controls
     */
    buildHemisphereLightControls(lightSpecs) {}

    /**
     * point light controls
     */
    buildPointLightControls(lightSpecs) {}

    /**
     * spot light controls
     */
    buildSpotLightControls(lightSpecs) {}

    /**
     * rect area light controls
     */
    buildRectAreaLightControls(lightSpecs) {}

    /**
     * bind callback to light helper and shadow cam helper
     */
    lightShadowHelperCallback(light) {

        const { $shadowLightObjects } = this.domain;
        const lightObj = $shadowLightObjects.find(sl => sl.light === light);

        return () => {

            updateSingleLightCamera.call(null, lightObj, false);
            lightObj.updateAttachedObject?.();

        };

    }

};