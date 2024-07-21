import { DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from "./constants";

const DEFALUT_GRID_WIDTH = 50;
const DEFAULT_GRID_HEIGHT = 25;
const DEFALUT_GRID_DEPTH = 50;
const NUMBER_STEPS = .1;

function combineGuiConfigs(...details) {
    let specs = [];
    details.forEach(detail => 
        specs = specs.concat(detail)
    );
    return specs;
}

function makeGuiPanel() {
    return {
        parents: {},
        details: []
    };
}

function makeFunctionGuiConfig(folder, parent) {
    return {
        folder,
        parent,
        specs: [{
            value: null,
            type: 'function'
        }]
    };
}

function makeDropdownGuiConfig(specs) {
    const { folder, parent, name, value, params, type, changeFn } = specs;
    return {
        folder,
        parent,
        specs: [{
            name,
            value,
            params,
            type,
            changeFn
        }]
    }
}

function makeFolderGuiConfig(specs) {
    const { folder, parent } = specs;
    return { folder, parent, specs: [] }
}

function makeFolderSpecGuiConfig(specs) {
    const { name, value, params, type, changeFn } = specs;
    return {
        name,
        value,
        params,
        type,
        changeFn
    };
}

function addDirectionalLight(light, specs) {
    // main directional light
    specs.push({
        room: light.room,
        folder: light.display,
        parent: light.name,
        specs: [{
            name: 'intensity',
            value: null,
            params: [0, 20, NUMBER_STEPS],
            type: 'number'
        }, {
            name: 'color',
            value: light.detail,
            params: [255],
            type: 'color',
            changeFn: null
        }]
    });
    if (light.debug) {
        const find = specs.find(s => s.parent === light.name).specs;
        find.push({
            name: 'x',
            prop: 'position.x',
            value: null,
            sub: 'position',
            params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, NUMBER_STEPS],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'y',
            prop: 'position.y',
            value: null,
            sub: 'position',
            params: [0, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'z',
            prop: 'position.z',
            value: null,
            sub: 'position',
            params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH, NUMBER_STEPS],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'x',
            prop: 'target.x',
            value: null,
            sub: 'target',
            subprop: 'position',
            params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, NUMBER_STEPS],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'y',
            prop: 'target.y',
            value: null,
            sub: 'target',
            subprop: 'position',
            params: [-DEFAULT_GRID_HEIGHT, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'z',
            prop: 'target.z',
            value: null,
            sub: 'target',
            subprop: 'position',
            params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH, NUMBER_STEPS],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'visible',
            prop: 'light helper',
            value: null,
            sub: 'lightHelper',
            type: 'boolean'
        });

        if (light.shadow_debug && light.shadow) {
            find.push({
                name: 'blurSamples',
                prop: 'shadow blurSamples',
                value: null,
                sub: 'shadow',
                params: [0, 20, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'radius',
                prop: 'shadow radius',
                value: null,
                sub: 'shadow',
                params: [0, 10, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'width',
                prop: 'shadow cam width',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [1, 100, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'height',
                prop: 'shadow cam height',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [1, 100, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'near',
                prop: 'shadow cam near',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [0.1, 10, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'far',
                prop: 'shadow cam far',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [10, 100, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'zoom',
                prop: 'shadow cam zoom',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [0.01, 1.5, 0.01],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'visible',
                prop: 'shadow camera',
                value: null,
                sub: 'lightShadowCamHelper',
                type: 'boolean'
            }, {
                name: 'castShadow',
                value: null,
                type: 'boolean'
            });
        }
    }
}

function addAmbientLight(light, specs) {
    // ambient light
    if (light.visible) {
        specs.push({
            room: light.room,
            folder: light.display,
            parent: light.name,
            specs: [{
                name: 'intensity',
                value: null,
                params: [0, 20, NUMBER_STEPS],
                type: 'number'
            }, {
                name: 'color',
                value: light.detail,
                params: [255],
                type: 'color'
            }]
        });
    }
}

function addHemisphereLight(light, specs) {
    // hemisphere light
    if (light.visible) {
        specs.push({
            room: light.room,
            folder: light.display,
            parent: light.name,
            specs: [{
                name: 'intensity',
                value: null,
                params: [0, 50, NUMBER_STEPS],
                type: 'number'
            }, {
                name: 'skyColor',
                value: light.detail,
                params: [255],
                type: 'color',
                changeFn: null
            }, {
                name: 'groundColor',
                value: light.detail,
                params: [255],
                type: 'groundColor',
                changeFn: null
            }]
        });

        if (light.debug) {
            const find = specs.find(s => s.parent === light.name).specs;
            find.push({
                name: 'x',
                prop: 'position.x',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'y',
                prop: 'position.y',
                value: null,
                sub: 'position',
                params: [0, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'z',
                prop: 'position.z',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'visible',
                prop: 'light helper',
                value: null,
                sub: 'lightHelper',
                type: 'boolean'
            });
        }
    }
}

function makeBasicLightGuiConfig(basicLightSpecsArr) {
    const specs = [];
    basicLightSpecsArr.filter(l => l.visible).forEach(basic => {
        switch (basic.light.type) {
            case DIRECTIONAL_LIGHT:
                addDirectionalLight(basic, specs);
                break;
            case AMBIENT_LIGHT:
                addAmbientLight(basic, specs);
                break;
            case HEMISPHERE_LIGHT:
                addHemisphereLight(basic, specs);
                break;
        }
    });

    return specs;
}

function makePointLightGuiConfig(pointLightSpecsArr) {
    const specs = [];
    pointLightSpecsArr.filter(l => l.visible).forEach(point => {
        specs.push({
            room: point.room,
            folder: point.display,
            parent: point.name,
            specs: [{
                name: 'intensity',
                value: null,
                params: [0, 100, NUMBER_STEPS],
                type: 'number'
            }, {
                name: 'power',
                value: null,
                params: [0, 1000, 1],
                type: 'number'
            }, {
                name: 'distance',
                value: null,
                params: [-0.5, 100, 0.01],
                type: 'number'
            }, {
                name: 'decay',
                value: null,
                params: [-10, 10, 0.01],
                type: 'number'
            }, {
                name: 'color',
                value: point.detail,
                params: [255],
                type: 'color',
                changeFn: null
            }]
        });
        if (point.debug) {
            const find = specs.find(s => s.parent === point.name).specs;
            find.push({
                name: 'x',
                prop: 'position.x',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'y',
                prop: 'position.y',
                value: null,
                sub: 'position',
                params: [0, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'z',
                prop: 'position.z',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'visible',
                prop: 'light helper',
                value: null,
                sub: 'lightHelper',
                type: 'boolean'
            });

            if (point.shadow_debug && point.shadow) {
                find.push({
                    name: 'blurSamples',
                    prop: 'shadow blurSamples',
                    value: null,
                    sub: 'shadow',
                    params: [0, 20, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'radius',
                    prop: 'shadow radius',
                    value: null,
                    sub: 'shadow',
                    params: [0, 10, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'fov',
                    prop: 'shadow cam fov',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [1, 100, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'aspect',
                    prop: 'shadow cam aspect',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [0.5, 2],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'near',
                    prop: 'shadow cam near',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [0.1, 10, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'far',
                    prop: 'shadow cam far',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [100, 1000, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'zoom',
                    prop: 'shadow cam zoom',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [0.01, 1.5, 0.01],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'visible',
                    prop: 'shadow camera',
                    value: null,
                    sub: 'lightShadowCamHelper',
                    type: 'boolean'
                }, {
                    name: 'castShadow',
                    value: null,
                    type: 'boolean'
                });
            }
        }
    });
    return specs;
}

function makeSpotLightGuiConfig(spotLightSpecsArr) {
    const specs = [];
    spotLightSpecsArr.filter(l => l.visible).forEach(spot => {
        specs.push({
            room: spot.room,
            folder: spot.display,
            parent: spot.name,
            specs: [{
                name: 'intensity',
                value: null,
                params: [0, 100, NUMBER_STEPS],
                type: 'number'
            }, {
                name: 'power',
                value: null,
                params: [0, 1000, 1],
                type: 'number'
            }, {
                name: 'distance',
                value: null,
                params: [-0.5, 100, 0.01],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'angleDeg',
                prop: 'angle',
                value: null,
                params: [0, 90, NUMBER_STEPS],
                type: 'angle',
                changeFn: null
            }, {
                name: 'penumbra',
                value: null,
                params: [0, 1, 0.01],
                type: 'number'
            }, {
                name: 'decay',
                value: null,
                params: [-10, 10, 0.01],
                type: 'number'
            }, {
                name: 'color',
                value: spot.detail,
                params: [255],
                type: 'color',
                changeFn: null
            }]
        });
        if (spot.debug) {
            const find = specs.find(s => s.parent === spot.name).specs;
            find.push({
                name: 'x',
                prop: 'position.x',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'y',
                prop: 'position.y',
                value: null,
                sub: 'position',
                params: [0, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'z',
                prop: 'position.z',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'x',
                prop: 'target.x',
                value: null,
                sub: 'target',
                subprop: 'position',
                params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'y',
                prop: 'target.y',
                value: null,
                sub: 'target',
                subprop: 'position',
                params: [-DEFAULT_GRID_HEIGHT, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'z',
                prop: 'target.z',
                value: null,
                sub: 'target',
                subprop: 'position',
                params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH, NUMBER_STEPS],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'visible',
                prop: 'light helper',
                value: null,
                sub: 'lightHelper',
                type: 'boolean'
            });

            if (spot.shadow_debug && spot.shadow) {
                find.push(//{
                //     name: 'fov',
                //     prop: 'shadow cam fov',
                //     value: null,
                //     sub: 'shadow',
                //     subprop: 'camera',
                //     params: [1, 150],
                //     type: 'light-num',
                //     changeFn: null
                // }, 
                {
                    name: 'blurSamples',
                    prop: 'shadow blurSamples',
                    value: null,
                    sub: 'shadow',
                    params: [0, 20, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'radius',
                    prop: 'shadow radius',
                    value: null,
                    sub: 'shadow',
                    params: [0, 10, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'aspect',
                    prop: 'shadow cam aspect',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [0.5, 2, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'near',
                    prop: 'shadow cam near',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [0.1, 10, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'far',
                    prop: 'shadow cam far',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [100, 1000, NUMBER_STEPS],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'zoom',
                    prop: 'shadow cam zoom',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [0.01, 1.5, 0.01],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'visible',
                    prop: 'shadow camera',
                    value: null,
                    sub: 'lightShadowCamHelper',
                    type: 'boolean'
                }, {
                    name: 'castShadow',
                    value: null,
                    type: 'boolean'
                });
            }
        }
    });
    return specs;
}

function makeSceneRightGuiConfig(lightSpecs) {
    const panel = makeGuiPanel();
    panel.details = combineGuiConfigs(
        makeBasicLightGuiConfig(lightSpecs.basicLightSpecsArr),
        makePointLightGuiConfig(lightSpecs.pointLightSpecsArr),
        makeSpotLightGuiConfig(lightSpecs.spotLightSpecsArr)
    );
    return panel;
}

function attachObjectsToRightGuiConfig(objectSpecsArr) {
    // todo
}


export { 
    makeGuiPanel, 
    makeFunctionGuiConfig, 
    makeDropdownGuiConfig,
    makeFolderGuiConfig,
    makeFolderSpecGuiConfig,
    makeSceneRightGuiConfig,
    attachObjectsToRightGuiConfig
 };