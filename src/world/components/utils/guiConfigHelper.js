const DEFALUT_GRID_WIDTH = 50;
const DEFAULT_GRID_HEIGHT = 25;
const DEFALUT_GRID_DEPTH = 50;

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
        folder: light.display,
        parent: light.name,
        specs: [{
            name: 'intensity',
            value: null,
            params: [0, 20],
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
            params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'y',
            prop: 'position.y',
            value: null,
            sub: 'position',
            params: [0, DEFAULT_GRID_HEIGHT],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'z',
            prop: 'position.z',
            value: null,
            sub: 'position',
            params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'x',
            prop: 'target.x',
            value: null,
            sub: 'target',
            subprop: 'position',
            params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'y',
            prop: 'target.y',
            value: null,
            sub: 'target',
            subprop: 'position',
            params: [-DEFAULT_GRID_HEIGHT, DEFAULT_GRID_HEIGHT],
            type: 'light-num',
            changeFn: null
        }, {
            name: 'z',
            prop: 'target.z',
            value: null,
            sub: 'target',
            subprop: 'position',
            params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH],
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
                params: [0, 20, 0.1],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'radius',
                prop: 'shadow radius',
                value: null,
                sub: 'shadow',
                params: [0, 10, 0.1],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'width',
                prop: 'shadow cam width',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [1, 100],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'height',
                prop: 'shadow cam height',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [1, 100],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'near',
                prop: 'shadow cam near',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [0.1, 10, 0.1],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'far',
                prop: 'shadow cam far',
                value: null,
                sub: 'shadow',
                subprop: 'camera',
                params: [10, 100, 0.1],
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
            folder: light.display,
            parent: light.name,
            specs: [{
                name: 'intensity',
                value: null,
                params: [0, 20],
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
            folder: light.display,
            parent: light.name,
            specs: [{
                name: 'intensity',
                value: null,
                params: [0, 50],
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
                params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'y',
                prop: 'position.y',
                value: null,
                sub: 'position',
                params: [0, DEFAULT_GRID_HEIGHT],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'z',
                prop: 'position.z',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH],
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
            case 'DirectionalLight':
                addDirectionalLight(basic, specs);
                break;
            case 'AmbientLight':
                addAmbientLight(basic, specs);
                break;
            case 'HemisphereLight':
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
            folder: point.display,
            parent: point.name,
            specs: [{
                name: 'intensity',
                value: null,
                params: [0, 100, 0.1],
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
                params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'y',
                prop: 'position.y',
                value: null,
                sub: 'position',
                params: [0, DEFAULT_GRID_HEIGHT],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'z',
                prop: 'position.z',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH],
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
                    params: [0, 20, 0.1],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'radius',
                    prop: 'shadow radius',
                    value: null,
                    sub: 'shadow',
                    params: [0, 10, 0.1],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'fov',
                    prop: 'shadow cam fov',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [1, 100],
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
                    params: [0.1, 10, 0.1],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'far',
                    prop: 'shadow cam far',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [100, 1000, 0.1],
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
            folder: spot.display,
            parent: spot.name,
            specs: [{
                name: 'intensity',
                value: null,
                params: [0, 100, 0.1],
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
                params: [0, 90],
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
                params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'y',
                prop: 'position.y',
                value: null,
                sub: 'position',
                params: [0, DEFAULT_GRID_HEIGHT],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'z',
                prop: 'position.z',
                value: null,
                sub: 'position',
                params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'x',
                prop: 'target.x',
                value: null,
                sub: 'target',
                subprop: 'position',
                params: [-DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'y',
                prop: 'target.y',
                value: null,
                sub: 'target',
                subprop: 'position',
                params: [-DEFAULT_GRID_HEIGHT, DEFAULT_GRID_HEIGHT],
                type: 'light-num',
                changeFn: null
            }, {
                name: 'z',
                prop: 'target.z',
                value: null,
                sub: 'target',
                subprop: 'position',
                params: [-DEFALUT_GRID_DEPTH, DEFALUT_GRID_DEPTH],
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
                    params: [0, 20, 0.1],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'radius',
                    prop: 'shadow radius',
                    value: null,
                    sub: 'shadow',
                    params: [0, 10, 0.1],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'aspect',
                    prop: 'shadow cam aspect',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [0.5, 2, 0.1],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'near',
                    prop: 'shadow cam near',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [0.1, 10, 0.1],
                    type: 'light-num',
                    changeFn: null
                }, {
                    name: 'far',
                    prop: 'shadow cam far',
                    value: null,
                    sub: 'shadow',
                    subprop: 'camera',
                    params: [100, 1000, 0.1],
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