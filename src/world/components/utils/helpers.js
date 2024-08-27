import { 
    AxesHelper, GridHelper, 
    CameraHelper, 
    DirectionalLightHelper, 
    HemisphereLightHelper, 
    PointLightHelper ,
    SpotLightHelper
} from 'three';

function createAxesHelper(spcs) {

    const { size = 1, position = [0, 0, 0] } = spcs;
    const helper = new AxesHelper(size);

    helper.position.set(...position);

    return helper;
}

function createGridHelper(spcs) {

    const { size = 1, divisions = 1, position = [0, 0, 0] } = spcs;
    const helper = new GridHelper(size, divisions);

    helper.position.set(...position);

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