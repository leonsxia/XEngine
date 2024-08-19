import { MathUtils } from 'three';
import { 
    createCameraHelper, 
    createDirectialLightHelper, 
    createHemisphereLightHelper, 
    createPointLightHelper,
    createSpotLightHelper 
} from './utils/helpers.js';
import { DIRECTIONAL_LIGHT, HEMISPHERE_LIGHT, POINT_LIGHT, SPOT_LIGHT, DIRECTIONAL_LIGHT_TARGET, SPOT_LIGHT_TARGET } from './utils/constants.js';

function setupShadowLight(scene, room, ...lights) {

    const shadowLightObjects = []; // new object combine specs and light

    if (!lights || lights.length === 0) return;

    lights.filter(l => l.visible).forEach(l => {

        const { light, name, debug, shadow, shadow_debug, helper_show, shadow_cam_show, room = 'scene' } = l;

        let lightObj = { light, name, debug, shadow, shadow_debug, helper_show, shadow_cam_show, room };

        const addShadowCamHelper = () => {

            if (shadow_debug && shadow) {

                lightObj['lightShadowCamHelper'] = createCameraHelper(light.shadow.camera);

            }

        }

        switch (light.type) {

            case DIRECTIONAL_LIGHT:

                if (debug) {

                    lightObj['lightHelper'] = createDirectialLightHelper(light);
                    addShadowCamHelper();

                }

                break;

            case HEMISPHERE_LIGHT:

                if (debug) {

                    lightObj['lightHelper'] = createHemisphereLightHelper(light);

                }

                break;

            case POINT_LIGHT:

                if (debug) {

                    lightObj['lightHelper'] = createPointLightHelper(light);

                    addShadowCamHelper();

                }

                break;

            case SPOT_LIGHT:

                if (debug) {

                    lightObj['lightHelper'] = createSpotLightHelper(light);

                    addShadowCamHelper();

                }

                break;

            default: // ambient

                lightObj = { light, name, debug, shadow, room };
                
                break;

        }

        shadowLightObjects.push(lightObj);
        
    });

    shadowLightObjects.forEach(lightObj => {

        const { light } = lightObj;

        if (light.type === HEMISPHERE_LIGHT) {

            scene.add(light);

        } else if (room) {

            room.add(light);

            changeLightTargetToRoom(room, light);

        } else {

            scene.add(light);   // add light to scene

        }

        attachLightAdditionalProps(light); // add width and height to directional light for shadow setup

        if (lightObj.debug) {

            const { lightHelper, lightShadowCamHelper } = lightObj;

            if (lightHelper) scene.add(lightHelper);

            if (lightObj.shadow_debug && lightObj.shadow) {

                if (lightShadowCamHelper) scene.add(lightShadowCamHelper);

            }

            if (lightHelper) attachLightHelper(lightObj, lightHelper, lightShadowCamHelper);

        }

        if (lightObj.shadow) {

            addShadow(light);

        }

    });

    // fix when change light position or target, 
    // the shadow camera won't update at first static frame.
    updateLightCamera.call(this, shadowLightObjects);

    return shadowLightObjects;

}

function addShadow(light) {

    light.castShadow = true;
    light.shadow.mapSize.width = 1024; //2048;
    light.shadow.mapSize.height = 1024; //2048;

    switch (light.constructor.name) {

        case DIRECTIONAL_LIGHT:

            {
                const w = 76;
                const h = 76;

                light.shadow.camera.width = w;
                light.shadow.camera.height = h;
                light.shadow.camera.near = 1;
                light.shadow.camera.far = 70;
                light.shadow.bias = 0.001;
            }

            break;

        case POINT_LIGHT:

            {
                light.shadow.camera.fov = 90;
                light.shadow.camera.aspect = 1;
                light.shadow.camera.near = 0.5;
                light.shadow.camera.far = 500;
            }

            break;

        case SPOT_LIGHT:

            {
                light.shadow.radius = 4.5;
                light.shadow.camera.fov = 50;
                light.shadow.camera.aspect = 1;
                light.shadow.camera.near = 0.5;
                light.shadow.camera.far = 500;
            }

            break;

    }
}

function attachLightAdditionalProps(light) {

    switch (light.type) {

        case DIRECTIONAL_LIGHT:

            {
                const camera = light.shadow.camera;

                Object.defineProperty(camera, 'width', {
                    get() {
                        return this.right * 2;
                    },
                    set(value) {
                        this.left = value / - 2;
                        this.right = value / 2;
                    }
                });
                
                Object.defineProperty(camera, 'height', {
                    get() {
                        return this.top * 2;
                    },
                    set(value) {
                        this.bottom = value / - 2;
                        this.top = value / 2;
                    }
                });
            }

            break;

        case SPOT_LIGHT:

            {
                Object.defineProperty(light, 'angleDeg', {
                    get() {
                        return MathUtils.radToDeg(this.angle);
                    },
                    set(value) {
                        this.angle = MathUtils.degToRad(value);
                    }
                });
            }

            break;
    }
}

function attachLightHelper(lightObj, lightHelper, lightShadowCamHelper) {

    const { light, helper_show, shadow_cam_show } = lightObj;

    light['lightHelper'] = lightHelper;

    if (!helper_show) lightHelper.visible = false;

    if (lightShadowCamHelper) {

        light['lightShadowCamHelper'] = lightShadowCamHelper;

        if (!shadow_cam_show) lightShadowCamHelper.visible = false;

    }

}

function changeLightTargetToRoom(room, light) {
    
    switch (light.type) {

        case DIRECTIONAL_LIGHT:

            {
                const targetPos = light.target.position.clone();

                light.target = room.getObjectByName(DIRECTIONAL_LIGHT_TARGET);
                light.target.position.copy(targetPos);
            }

            break;
        case SPOT_LIGHT:

            {
                const targetPos = light.target.position.clone();

                light.target = room.getObjectByName(SPOT_LIGHT_TARGET);
                light.target.position.copy(targetPos);
            }

            break;
    }
}

function updateLightAndShadowCamHelper(lightObj) {

    const { light, lightHelper, lightShadowCamHelper, debug, shadow, shadow_debug } = lightObj;

    // update the light target's matrixWorld because it's needed by the helper
    if (!light.target.parent && !debug) {

        // update when debug is false, and manually change the light target
        light.target.updateMatrixWorld(); 

    }

    if (debug) lightHelper.update();

    // update the light's shadow camera's projection matrix
    light.shadow.camera.updateProjectionMatrix();

    // and now update the camera helper we're using to show the light's shadow camera
    if (debug && shadow_debug && shadow) lightShadowCamHelper.update();

}

function updateSingleLightCamera(lightObj, needRender = false) {

    switch (lightObj.light.type) {

        case DIRECTIONAL_LIGHT:

            updateLightAndShadowCamHelper(lightObj);

            break;

        case HEMISPHERE_LIGHT:

            {
                const { lightHelper, debug } = lightObj;

                if (debug) lightHelper.update();
            }

            break;

        case POINT_LIGHT:

            {
                const { light, lightHelper, lightShadowCamHelper, debug, shadow, shadow_debug } = lightObj;

                if (debug) lightHelper.update();

                light.shadow.camera.updateProjectionMatrix();

                if (debug && shadow_debug && shadow ) lightShadowCamHelper.update();
            }

            break;

        case SPOT_LIGHT:

            updateLightAndShadowCamHelper(lightObj);

            break;
    }

    if (needRender) this.render();

}

function updateLightCamera(lights) {

    lights.forEach(lightObj => {

        updateSingleLightCamera.call(this, lightObj);

    });
    
}

export { setupShadowLight, updateSingleLightCamera };