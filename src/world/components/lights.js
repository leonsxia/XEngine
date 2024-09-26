import { DirectionalLight, PointLight, AmbientLight, HemisphereLight, SpotLight, Color } from 'three';
import { DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from './utils/constants';
import { colorStr } from './basic/colorBase';

function createBasicLights(basicLightSpecsArr) {

    const lights = {};

    basicLightSpecsArr.filter(l => l.visible).forEach(spec => {

        switch (spec.type) {

            case DIRECTIONAL_LIGHT:

                {
                    const { name } = spec;

                    spec.light = lights[name] = createDirectionalLight(spec);
                }

                break;

            case AMBIENT_LIGHT:

                {
                    const { name, detail: { color, intensity } } = spec;

                    spec.light = lights[name] = new AmbientLight(new Color(colorStr(...color)), intensity);
                }

                break;

            case HEMISPHERE_LIGHT:

                {
                    const { name } = spec;

                    spec.light = lights[name] = createHemisphereLight(spec);
                }
                
                break;
        }
    });

    return lights;

}

function createPointLights(pointLightSpecsArr) {

    const pointLights = {};

    pointLightSpecsArr.filter(l => l.visible).forEach(point => {

        const { name } = point;

        point.light = pointLights[name] = new createPointLight(point);

    });

    return pointLights;

}

function createSpotLights(spotLihgtSpecsArr) {

    const spotLights = {};

    spotLihgtSpecsArr.filter(l => l.visible).forEach(spot => {

        const { name } = spot;

        spot.light = spotLights[name] = new createSpotLight(spot);

    });

    return spotLights;

}

function createDirectionalLight(lightSpecs) {

    const { detail: { color, intensity, position, target } } = lightSpecs;

    const light = new DirectionalLight(new Color(colorStr(...color)), intensity);

    light.position.set(...position);

    light.target.position.set(...target);

    // no need to update target.updateMatrixWorld(), 
    // the matrixWorld will update in render after its parent added to scene if light is in other object3D,
    // or it will updated in shadowMaker.js at setup stage.

    return light;

}

function createHemisphereLight(lightSpecs) {

    const { detail: { groundColor, skyColor, intensity, position } } = lightSpecs;

    const light = new HemisphereLight(new Color(colorStr(...skyColor)), new Color(colorStr(...groundColor)), intensity);

    light.position.set(...position);

    return light;

}

function createPointLight(lightSpecs) {

    const { detail: { color, position, intensity, distance = 0, decay = 2, shadowRadius = 5 } } = lightSpecs;

    const light = new PointLight(new Color(colorStr(...color)), intensity, distance, decay);

    light.shadow.radius = shadowRadius;

    light.position.set(...position);

    return light;

}

function createSpotLight(lightSpecs) {

    const { detail: { color, position, target, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2, map }} = lightSpecs;

    const light = new SpotLight(new Color(colorStr(...color)), intensity, distance, angle, penumbra, decay);

    light.position.set(...position);

    light.target.position.set(...target);

    if (map) light.map = map;
    
    return light;

}

export { 
    createBasicLights, 
    createPointLights, 
    createSpotLights,
    createDirectionalLight,
    createHemisphereLight,
    createPointLight,
    createSpotLight
};