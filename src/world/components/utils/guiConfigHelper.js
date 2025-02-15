import { DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT } from './constants';

const DEFALUT_GRID_WIDTH = 50;
const DEFAULT_GRID_HEIGHT = 25;
const DEFALUT_GRID_DEPTH = 50;
const NUMBER_STEPS = .01;
const SCALE_MIN = .1;
const SCALE_MAX = 10;
const PICKED_NUMBER_STEPS = .01;
const PICKED_ANGLE_STEPS = .1;

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

function makeFunctionGuiConfig(folder, parent, subFolder, close = false, closeSub = false) {
    return {
        folder,
        subFolder,
        parent,
        close,
        closeSub,
        specs: [{
            value: null,
            type: 'function'
        }]
    };
}

function makeDropdownGuiConfig(specs) {
    const { folder, parent, name, value, params, type, changeFn, close = false } = specs;
    return {
        folder,
        parent,
        close,
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
    const { folder, parent, close = false } = specs;
    return { folder, parent, close, specs: [] }
}

function makeFolderSpecGuiConfig(specs) {
    const { name, prop = null, value, params, type, changeFn } = specs;
    return {
        name,
        prop,
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
            params: [-DEFAULT_GRID_HEIGHT, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
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
                params: [-DEFAULT_GRID_HEIGHT, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
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
                params: [0, 500, NUMBER_STEPS],
                type: 'number'
            }, {
                name: 'power',
                value: null,
                params: [0, 8000, 1],
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
                params: [-DEFAULT_GRID_HEIGHT, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
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
                    params: [1, 150, NUMBER_STEPS],
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
                params: [-DEFAULT_GRID_HEIGHT, DEFAULT_GRID_HEIGHT, NUMBER_STEPS],
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

function makeObjectsGuiConfig(objects) {

    const objectPanel = makeGuiPanel();
    
    objects.forEach(object => {


        // set parent to null, so gui will use prop to set identifier
        const folder = makeFolderGuiConfig({ folder: object.name, parent: null, close: false });

        const posChangeFn = () => {
                
            if (object.isPlayer) {
    
                object.father.updateRay?.();
                object.father.updateOBB?.();
    
            } else if (object.isGroup) {

                object.father.updateOBBs();
                object.father.updateRay?.();

                object.father.updateLightObjects?.();
    
            } else if (object.isMesh) {

                object.father.updateRay?.();
                object.father.updateOBB?.();

            }
        }

        folder.specs.push(makeFolderSpecGuiConfig({
            name: 'x',
            prop: 'position.x',
            value: object.position,
            params: [- DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, PICKED_NUMBER_STEPS],
            type: 'number',
            changeFn: posChangeFn
        }));

        folder.specs.push(makeFolderSpecGuiConfig({
            name: 'y',
            prop: 'position.y',
            value: object.position,
            params: [- DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, PICKED_NUMBER_STEPS],
            type: 'number',
            changeFn: posChangeFn
        }));

        folder.specs.push(makeFolderSpecGuiConfig({
            name: 'z',
            prop: 'position.z',
            value: object.position,
            params: [- DEFALUT_GRID_WIDTH, DEFALUT_GRID_WIDTH, PICKED_NUMBER_STEPS],
            type: 'number',
            changeFn: posChangeFn
        }));

        if (!object.isPlayer && 
            !object.father.isFloor && !object.father.isCeiling && 
            !object.father.isArea &&
            !object.father.isWater && !object.father.isWaterCube
        ) {

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'rotationYDegree',
                prop: 'rotation.y',
                value: object.father,
                params: [- 360, 360, PICKED_ANGLE_STEPS],
                type: 'object-angle',
                changeFn: (val) => {

                    if (object.isGroup) {

                        object.father.updateOBBs();

                        object.father.updateLightObjects?.();

                    } else if (object.isMesh && (object.father.isWall || object.father.isInsideWall || object.father.isAirWall)) {

                        object.father.updateRay?.();
                        object.father.updateOBB?.();

                    }

                }
            }));

        }

        if (object.father.isAirWall) {

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'scaleX',
                prop: 'scale.x',
                value: object.father,
                params: [SCALE_MIN, SCALE_MAX, PICKED_NUMBER_STEPS],
                type: 'number',
                changeFn: () => {

                    object.father.updateRay();
                    object.father.updateOBB();

                }
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'scaleY',
                prop: 'scale.y',
                value: object.father,
                params: [SCALE_MIN, SCALE_MAX, PICKED_NUMBER_STEPS],
                type: 'number',
                changeFn: () => {

                    object.father.updateRay();
                    object.father.updateOBB();

                }
            }));

        }

        if (object.father.isFloor) {

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'rotationZDegree',
                prop: 'rotation.z',
                value: object.father,
                params: [- 360, 360, PICKED_ANGLE_STEPS],
                type: 'object-angle',
                changeFn: () => {

                    object.father.updateOBB();

                }
            }));
            
        }

        if (object.father.isCeiling) {

            if (object.father.isOBB) {

                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'rotationZDegree',
                    prop: 'rotation.z',
                    value: object.father,
                    params: [- 360, 360, PICKED_ANGLE_STEPS],
                    type: 'object-angle',
                    changeFn: () => {
    
                        object.father.updateOBB();
    
                    }
                }));

            } else {

                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'rotationXDegree',
                    prop: 'rotation.x',
                    value: object.father,
                    params: [- 360, 360, PICKED_ANGLE_STEPS],
                    type: 'object-angle'
                }));
    
                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'rotationYDegree',
                    prop: 'rotation.y',
                    value: object.father,
                    params: [- 360, 360, PICKED_ANGLE_STEPS],
                    type: 'object-angle'
                }));
    
                folder.specs.push(makeFolderSpecGuiConfig({
                    name: 'rotationZDegree',
                    prop: 'rotation.z',
                    value: object.father,
                    params: [- 360, 360, PICKED_ANGLE_STEPS],
                    type: 'object-angle'
                }));

            }
        }

        if (object.father.isArea || object.father.isWater || object.father.isWaterCube ) {

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'rotationXDegree',
                prop: 'rotation.x',
                value: object.father,
                params: [- 360, 360, PICKED_ANGLE_STEPS],
                type: 'object-angle',
                changeFn: () => {

                    object.father.updateOBB?.();
                    object.father.updateOBBs?.();

                }
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'rotationYDegree',
                prop: 'rotation.y',
                value: object.father,
                params: [- 360, 360, PICKED_ANGLE_STEPS],
                type: 'object-angle',
                changeFn: () => {

                    object.father.updateOBB?.();
                    object.father.updateOBBs?.();

                }
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'rotationZDegree',
                prop: 'rotation.z',
                value: object.father,
                params: [- 360, 360, PICKED_ANGLE_STEPS],
                type: 'object-angle',
                changeFn: () => {

                    object.father.updateOBB?.();
                    object.father.updateOBBs?.();

                }
            }));
        }

        if (object.father.isWater || object.father.isWaterCube) {

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'waterColor',
                prop: 'color',
                value: object.father,
                params: [255],
                type: 'water-color',
                changeFn: (val) => {

                    object.father.waterColor = val;

                }
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'waterScale',
                prop: 'scale',
                value: object.father,
                params: [1, 10, PICKED_NUMBER_STEPS],
                type: 'number'
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'waterFlowX',
                prop: 'flowX',
                value: object.father,
                params: [-1, 1, PICKED_NUMBER_STEPS],
                type: 'number'
            }));

            folder.specs.push(makeFolderSpecGuiConfig({
                name: 'waterFlowY',
                prop: 'flowY',
                value: object.father,
                params: [-1, 1, PICKED_NUMBER_STEPS],
                type: 'number'
            }));

        }

        objectPanel.details.push(folder);

    });

    return objectPanel;
}


export { 
    makeGuiPanel, 
    makeFunctionGuiConfig, 
    makeDropdownGuiConfig,
    makeFolderGuiConfig,
    makeFolderSpecGuiConfig,
    makeSceneRightGuiConfig,
    makeObjectsGuiConfig
 };