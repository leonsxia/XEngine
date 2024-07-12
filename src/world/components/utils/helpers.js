import { 
    AxesHelper, GridHelper, 
    CameraHelper, 
    DirectionalLightHelper, 
    HemisphereLightHelper, 
    PointLightHelper ,
    SpotLightHelper
} from 'three';

function createAxesHelper(spcs) {
    const helper = new AxesHelper(spcs.size);
    //   helper.position.set(-5.5, 0, -5.5);
    helper.position.set(...spcs.position);

    return helper;
}

function createGridHelper(spcs) {
    const helper = new GridHelper(spcs.size, spcs.divisions);
    return helper;
}

function createCameraHelper(cam) {
    const helper = new CameraHelper(cam);
    return helper;
}

function createDirectialLightHelper(light) {
    const helper = new DirectionalLightHelper(light);
    return helper;
}

function createHemisphereLightHelper(light) {
    const helper = new HemisphereLightHelper(light);
    return helper;
}

function createPointLightHelper(light) {
    const helper = new PointLightHelper(light);
    return helper;
}

function createSpotLightHelper(light) {
    const helper = new SpotLightHelper(light);
    return helper;
}

export {
    createAxesHelper, 
    createGridHelper, 
    createCameraHelper, 
    createDirectialLightHelper,
    createHemisphereLightHelper,
    createPointLightHelper,
    createSpotLightHelper
};