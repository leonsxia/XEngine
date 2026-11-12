import { GUI_CONFIG, GUI_MEASURES } from '../editorConfig.js';
import { DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from '../../../components/utils/constants.js';
import { updateSingleLightCamera } from '../../../components/shadowMaker.js';
import { colorStr } from '../../../components/basic/colorBase.js';
import { Logger } from '../../Logger.js';
import Panel from './Panel.js';

const DEBUG = true;
// $scope must be set to Editor instance when called
export default class LightsPanel extends Panel {

    folders = {};
    savedObject = null;

    logger = new Logger(DEBUG, 'GUI-LightsPanel');

    constructor(scope) {

        super(scope);

    }

    init() {

        // initialize lights panel
        this.scope.panel_lights = this.guiMaker.addGui({
            title: GUI_CONFIG.PANEL_TITLES.LIGHT_CONTROL,
            width: 280,
            styles: {
                right: '0'
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
        const { 
            basicLightSpecsArr = [],
            pointLightSpecsArr = [],
            spotLightSpecsArr = [],
            rectAreaLightSpecsArr = []
        } = $lightSpecs;

        for (const room of rooms) {

            this.folders[room] = $scope.panel_lights.addFolder(room);

            if (
                basicLightSpecsArr.filter(specs => 
                    specs.visible && (!specs.room && room === 'scene') || specs.room === room).length
                ) {

                this.folders[`${room}_basic_lights`] = this.folders[room].addFolder('Basic Lights');

            }

            if (
                pointLightSpecsArr.filter(specs => 
                    specs.visible && (!specs.room && room === 'scene') || specs.room === room).length
                ) {

                this.folders[`${room}_point_lights`] = this.folders[room].addFolder('Point Lights');

            }

            if (
                spotLightSpecsArr.filter(specs => 
                    specs.visible && (!specs.room && room === 'scene') || specs.room === room).length
                ) {

                this.folders[`${room}_spot_lights`] = this.folders[room].addFolder('Spot Lights');

            }

            if (
                rectAreaLightSpecsArr.filter(specs => 
                    specs.visible && (!specs.room && room === 'scene') || specs.room === room).length
                ) {

                this.folders[`${room}_rect_area_lights`] = this.folders[room].addFolder('Rect Area Lights');

            }

        }
        
        for (const basicLightSpecs of basicLightSpecsArr) {

            if (!basicLightSpecs.visible) continue;
            this.buildBasicLightControls(basicLightSpecs);

        }

        for (const pointLightSpecs of pointLightSpecsArr) {

            if (!pointLightSpecs.visible) continue;
            this.buildPointLightControls(pointLightSpecs);

        }

        for (const spotLightSpecs of spotLightSpecsArr) {

            if (!spotLightSpecs.visible) continue;
            this.buildSpotLightControls(spotLightSpecs);

        }

        for (const rectAreaLightSpecs of rectAreaLightSpecsArr) {

            if (!rectAreaLightSpecs.visible) continue;
            this.buildRectAreaLightControls(rectAreaLightSpecs);

        }

        this.buildGlobalControls();

    }

    /**
     * basic lights controls
     */
    buildBasicLightControls(lightSpecs) {

        switch (lightSpecs.light.type) {

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
        const { name, display, room = 'scene', light, detail, debug, shadow, shadow_debug } = lightSpecs;
        const room_folder = folders[`${room}_basic_lights`];
        const light_folder = room_folder.addFolder(display ?? name);
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

            const debug_folder = light_folder.addFolder('debug').close();
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

                const shadow_camera_folder = light_folder.addFolder('shadow camera').close();
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

                shadow_camera_folder.add(light.shadow.camera, 'far', 0, 1000, GUI_MEASURES.NUMBER_STEPS)
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
    buildAmbientLightControls(lightSpecs) {

        const { folders } = this.domain;
        const { name, display, room = 'scene', light, detail } = lightSpecs;
        const room_folder = folders[`${room}_basic_lights`];
        const light_folder = room_folder.addFolder(display ?? name);

        light_folder.add(light, 'intensity', 0, 20, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.addColor(detail, 'color', 255)
            .listen()
            .changeFn = event => {

                light.color.setStyle(colorStr(...event.value));

            };

    }

    /**
     * hemisphere light controls
     */
    buildHemisphereLightControls(lightSpecs) {

        const { folders } = this.domain;
        const { name, display, room = 'scene', light, detail, debug } = lightSpecs;
        const room_folder = folders[`${room}_basic_lights`];
        const light_folder = room_folder.addFolder(display ?? name);
        const postChangeFn = this.lightShadowHelperCallback(light);

        light_folder.add(light, 'intensity', 0, 50, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.addColor(detail, 'skyColor', 255)
            .listen()
            .changeFn = event => {

                light.color.setStyle(colorStr(...event.value));
                postChangeFn();

            };

        light_folder.addColor(detail, 'groundColor', 255)
            .listen()
            .changeFn = event => {

                light.color.setStyle(colorStr(...event.value));
                postChangeFn();

            };

        if (debug) {

            const debug_folder = light_folder.addFolder('debug').close();
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

            debug_folder.add(light.lightHelper, 'visible')
                .name('light helper')
                .listen();

        }

    }

    /**
     * point light controls
     */
    buildPointLightControls(lightSpecs) {

        const { folders } = this.domain;
        const { name, display, room = 'scene', light, detail, debug, shadow, shadow_debug } = lightSpecs;
        const room_folder = folders[`${room}_point_lights`];
        const light_folder = room_folder.addFolder(display ?? name);
        const postChangeFn = this.lightShadowHelperCallback(light);

        light_folder.add(light, 'intensity', 0, 500, GUI_MEASURES.NUMBER_STEPS)
            .listen();
        
        light_folder.add(light, 'power', 0, 8000, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.add(light, 'distance', - .5, 100, GUI_MEASURES.NUMBER_STEPS)
            .listen()
            .changeFn = postChangeFn;

        light_folder.add(light, 'decay', - 10, 10, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.addColor(detail, 'color', 255)
            .listen()
            .changeFn = event => {

                light.color.setStyle(colorStr(...event.value));
                postChangeFn();

            };

        if (debug) {

            const debug_folder = light_folder.addFolder('debug').close();
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

            debug_folder.add(light.scale, 'x', .01, 10, GUI_MEASURES.NUMBER_STEPS)
                .name('scale.x')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.scale, 'y', .01, 10, GUI_MEASURES.NUMBER_STEPS)
                .name('scale.y')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.scale, 'z', .01, 10, GUI_MEASURES.NUMBER_STEPS)
                .name('scale.z')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.lightHelper, 'visible')
                .name('light helper')
                .listen();

            if (shadow && shadow_debug) {

                const shadow_camera_folder = light_folder.addFolder('shadow camera').close();
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

                shadow_camera_folder.add(light.shadow.camera, 'fov', 1, 150, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera fov')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'aspect', .5, 2, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera aspect')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'near', .01, 10, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera near')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'far', 0, 1000, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera far')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'zoom', .01, 1.5, GUI_MEASURES.NUMBER_STEPS)
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
     * spot light controls
     */
    buildSpotLightControls(lightSpecs) {

        const { folders } = this.domain;
        const { name, display, room = 'scene', light, detail, debug, shadow, shadow_debug } = lightSpecs;
        const room_folder = folders[`${room}_spot_lights`];
        const light_folder = room_folder.addFolder(display ?? name);
        const postChangeFn = this.lightShadowHelperCallback(light);

        light_folder.add(light, 'intensity', 0, 500, GUI_MEASURES.NUMBER_STEPS)
            .listen();
        
        light_folder.add(light, 'power', 0, 2000, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.add(light, 'distance', - .5, 100, GUI_MEASURES.NUMBER_STEPS)
            .listen()
            .changeFn = postChangeFn;

        light_folder.add(light, 'angleDeg', 0, 90, GUI_MEASURES.NUMBER_STEPS)
            .listen()
            .changeFn = postChangeFn;

        light_folder.add(light, 'penumbra', 0, 1, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.add(light, 'decay', - 10, 10, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.addColor(detail, 'color', 255)
            .listen()
            .changeFn = event => {

                light.color.setStyle(colorStr(...event.value));
                postChangeFn();

            };

        if (debug) {

            const debug_folder = light_folder.addFolder('debug').close();
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

                const shadow_camera_folder = light_folder.addFolder('shadow camera').close();
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

                // changed by angle
                // shadow_camera_folder.add(light.shadow.camera, 'fov', 1, 150, GUI_MEASURES.NUMBER_STEPS)
                //     .name('shadow camera fov')
                //     .listen()
                //     .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'aspect', .5, 2, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera aspect')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'near', .01, 10, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera near')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'far', 0, 1000, GUI_MEASURES.NUMBER_STEPS)
                    .name('shadow camera far')
                    .listen()
                    .changeFn = postChangeFn;

                shadow_camera_folder.add(light.shadow.camera, 'zoom', .01, 1.5, GUI_MEASURES.NUMBER_STEPS)
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
     * rect area light controls
     */
    buildRectAreaLightControls(lightSpecs) {

        const { folders } = this.domain;
        const { name, display, room = 'scene', light, detail, debug } = lightSpecs;
        const room_folder = folders[`${room}_rect_area_lights`];
        const light_folder = room_folder.addFolder(display ?? name);
        const postChangeFn = this.lightShadowHelperCallback(light);

        light_folder.add(light, 'intensity', 0, 20, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.add(light, 'power', 0, 2000, GUI_MEASURES.NUMBER_STEPS)
            .listen();

        light_folder.add(light, 'width', 0, 5, .001)
            .listen()
            .changeFn = postChangeFn;

        light_folder.add(light, 'height', 0, 5, .001)
            .listen()
            .changeFn = postChangeFn;

        light_folder.addColor(detail, 'color', 255)
            .listen()
            .changeFn = event => {

                light.color.setStyle(colorStr(...event.value));
                postChangeFn();

            };

        if (debug) {

            const debug_folder = light_folder.addFolder('debug').close();
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

            debug_folder.add(light.rotation, 'x')
                .min(- GUI_MEASURES.MAX_RADIUS)
                .max(GUI_MEASURES.MAX_RADIUS)
                .step(GUI_MEASURES.RADIUS_STEPS)
                .name('rotation.x')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.rotation, 'y')
                .min(- GUI_MEASURES.MAX_RADIUS)
                .max(GUI_MEASURES.MAX_RADIUS)
                .step(GUI_MEASURES.RADIUS_STEPS)
                .name('rotation.y')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.rotation, 'z')
                .min(- GUI_MEASURES.MAX_RADIUS)
                .max(GUI_MEASURES.MAX_RADIUS)
                .step(GUI_MEASURES.RADIUS_STEPS)
                .name('rotation.z')
                .listen()
                .changeFn = postChangeFn;

            debug_folder.add(light.lightHelper, 'visible')
                .name('light helper')
                .listen();

        }

    }

    /**
     * global controls
     */
    buildGlobalControls() {

        const { $scope } = this.domain;
        $scope.panel_lights.add({
            'save': () => {

                this.savedObject = $scope.panel_lights.save();
                this.logger.log('save successfully!');

            }
        }, 'save');

        $scope.panel_lights.add({
            'load': () => {

                if (!this.savedObject) return;

                $scope.panel_lights.load(this.savedObject);
                this.logger.log('load successfully!');

            }
        }, 'load');

        $scope.panel_lights.add({
            'reset': () => {

                $scope.panel_lights.reset();
                this.logger.log('reset successfully!');

            }
        }, 'reset');

    }

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