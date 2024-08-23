import { createAxesHelper, createGridHelper } from "../../components/utils/helpers.js";
import { createBasicLights, createPointLights, createSpotLights } from "../../components/lights.js";
import {
    Train, Tofu, Plane, OBBPlane, CollisionPlane, CollisionOBBPlane, Room, SquarePillar, LWall, CylinderPillar, HexCylinderPillar, BoxCube, Slope, Stairs,
    WoodenPicnicTable, WoodenSmallTable, RoundWoodenTable, PaintedWoodenTable, PaintedWoodenNightstand,
    PaintedWoodenBlueChair, PaintedWoodenWhiteChair, PaintedWoodenStool, Sofa03,
    PaintedWoodenBlueCabinet, Shelf01, PaintedWoodenWhiteCabinet,
    Television01
} from '../../components/Models.js';
import { setupShadowLight } from "../../components/shadowMaker.js";
import {
    DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT, POINT_LIGHT, SPOT_LIGHT,
    AXES, GRID, TRAIN, TOFU,
    PLANE, OBBPLANE, COLLISIONPLANE, COLLISIONOBBPLANE,
    ROOM, SQUARE_PILLAR, LWALL, CYLINDER_PILLAR, HEX_CYLINDER_PILLAR, BOX_CUBE, SLOPE, STAIRS,
    WOODEN_PICNIC_TABLE, WOODEN_SMALL_TABLE, ROUND_WOODEN_TABLE, PAINTED_WOODEN_TABLE, PAINTED_WOODEN_NIGHTSTAND,
    PAINTED_WOODEN_BLUE_CHAIR, PAINTED_WOODEN_WHITE_CHAIR, PAINTED_WOODEN_STOOL, SOFA_03,
    PAINTED_WOODEN_BLUE_CABINET, SHELF_01, PAINTED_WOODEN_WHITE_CABINET,
    TELEVISION_01,
    TEXTURE_NAMES, GLTF_NAMES
} from '../../components/utils/constants.js';
import { updateSingleLightCamera } from "../../components/shadowMaker.js";

class SceneBuilder {

    textures;
    gltfs;
    worldScene;
    setup;
    setupCopy;
    savedSetup;
    jsonFileName;

    constructor() {}

    loadAssets(_textures, _gltfs) {

        this.textures = _textures;
        this.gltfs = _gltfs;
    
    }
    
    async buildScene(specs) {
    
        try {
    
            const { src } = specs;
            const worldScene = this.worldScene;
    
            const request = new Request(src);
    
            const response = await fetch(request);
            const setup = await response.json();
    
            this.jsonFileName = src.slice(src.lastIndexOf('/') + 1);
            this.setup = setup;
            this.setupCopy = JSON.parse(JSON.stringify(setup));
            this.savedSetup = JSON.parse(JSON.stringify(setup));
    
            const { players, lights, objects } = setup;
            const sceneSpecs = objects.find(o => o.room === 'scene');
            const roomSpecs = objects.filter(o => o.type === ROOM);
    
            worldScene.players = this.buildPlayers(players);
    
            const [sceneObjects, rooms] = await Promise.all(
                [
                    this.buildSceneObjects(sceneSpecs),
                    this.buildRooms(roomSpecs)
                ]
            );
    
            sceneObjects.forEach(obj => {
    
                const { mesh, group } = obj;
    
                if (mesh) worldScene.scene.add(mesh);
                else if (group) worldScene.scene.add(group);
                else worldScene.scene.add(obj);
    
            });
    
            let basicLightGuiSpecsArr = [];
            let pointLightGuiSpecsArr = [];
            let spotLightGuiSpecsArr = [];
    
            rooms.forEach(room => {
    
                const roomLights = lights.find(l => l.room === room.name);
                const basicLightsSpecsArr = roomLights['basicLightSpecs'].map(l => { l.room = room.name; return l; });
                const pointLightsSpecsArr = roomLights['pointLightSpecs'].map(l => { l.room = room.name; return l; });
                const spotLightsSpecsArr = roomLights['spotLightSpecs'].map(l => { l.room = room.name; return l; });
    
                const _basicLights = createBasicLights(basicLightsSpecsArr);
                const _pointLights = createPointLights(pointLightsSpecsArr);
                const _spotLights = createSpotLights(spotLightsSpecsArr);
    
                basicLightGuiSpecsArr = basicLightGuiSpecsArr.concat(basicLightsSpecsArr);
                pointLightGuiSpecsArr = pointLightGuiSpecsArr.concat(pointLightsSpecsArr);
                spotLightGuiSpecsArr = spotLightGuiSpecsArr.concat(spotLightsSpecsArr);
    
                Object.assign(worldScene.lights, _basicLights);
                Object.assign(worldScene.lights, _pointLights);
                Object.assign(worldScene.lights, _spotLights);
    
                const roomLightObjects = setupShadowLight.call(worldScene,
                    worldScene.scene, room.group, ...basicLightsSpecsArr, ...pointLightsSpecsArr, ...spotLightsSpecsArr
                );
    
                worldScene.shadowLightObjects = worldScene.shadowLightObjects.concat(roomLightObjects);
    
                const basicLights = basicLightsSpecsArr.filter(l => l.visible).map(l => l.light);
                const pointLights = pointLightsSpecsArr.filter(l => l.visible).map(l => l.light);
                const spotLights = spotLightsSpecsArr.filter(l => l.visible).map(l => l.light);
    
                room.lights = basicLights.concat(pointLights, spotLights);
    
                room.setLightsVisible(false);
    
                worldScene.rooms.push(room);
    
                worldScene.cPlanes = worldScene.cPlanes.concat(room.walls, room.insideWalls, room.floors, room.tops, room.bottoms, room.topOBBs, room.bottomOBBs, room.slopeFaces, room.stairsSides, room.stairsStepFronts, room.stairsStepTops);
    
                worldScene.scene.add(room.group);
    
            });
    
            worldScene.guiLights = { basicLightSpecsArr: basicLightGuiSpecsArr, pointLightSpecsArr: pointLightGuiSpecsArr, spotLightSpecsArr: spotLightGuiSpecsArr }
    
        } catch (ex) {
    
            console.log(`Scene build failed: exception\n${ex}`);
    
        }
    
    }
    
    buildPlayers(playerSpecs) {
    
        const players = [];
    
        playerSpecs.forEach(specs => {
    
            players.push(this.buildObject(specs));
    
        });
    
        return players;
    
    }
    
    async buildSceneObjects(sceneSpecs) {
    
        const loadPromises = [];
        const sceneObjects = [];
    
        sceneSpecs.children.forEach(specs => {
    
            sceneObjects.push(this.buildObject(specs));
    
        });
    
        sceneObjects.forEach(obj => {
    
            if (obj.init) {
                
                loadPromises.push(obj.init());
    
            }
    
        });
    
        await Promise.all(loadPromises);
    
        return sceneObjects;
    
    }
    
    async buildRooms(roomSpecs) {
    
        const loadPromises = [];
        const rooms = []
    
        roomSpecs.forEach(roomSpec => {
    
            roomSpec.updateOBBnRay = false;
            const room = this.buildObject(roomSpec);
            rooms.push(room);
    
            const groups = [];
            const floors = [];
            const ceilings = [];
            const walls = [];
            const insideWalls = [];
    
            roomSpec.groups.forEach(spec => {
    
                spec.updateOBBs = false;
                const group = this.buildObject(spec);
                groups.push(group);
    
            });
            room.addGroups(groups);
    
            roomSpec.floors.forEach(spec => {
    
                spec.updateOBB = false;
                const floor = this.buildObject(spec);
                floors.push(floor);
    
            });
            room.addFloors(floors);

            roomSpec.ceilings.forEach(spec => {

                spec.updateOBB = false;
                const ceiling = this.buildObject(spec);
                ceilings.push(ceiling);

            });
            room.addCeilings(ceilings);
    
            roomSpec.walls.forEach(spec => {
    
                spec.updateOBB = false;
                spec.updateRay = false;
                const wall = this.buildObject(spec);
                walls.push(wall);
    
            });
            room.addWalls(walls);
    
            roomSpec.insideWalls.forEach(spec => {
    
                spec.updateOBB = false;
                spec.updateRay = false;
                const insideWall = this.buildObject(spec);
                insideWalls.push(insideWall);
    
            });
            room.addInsideWalls(insideWalls);
    
            room.updateOBBnRay();
    
            loadPromises.push(room.init());
    
        });
    
        await Promise.all(loadPromises);
    
        return rooms;
    
    }

    saveScene() {

        this.updateScene(this.savedSetup, null, false, true);
        const savedJson = JSON.stringify(this.savedSetup);
        const savedBlob = new Blob([savedJson], {type: 'application/json'});

        const tempLink = document.createElement('a');

        tempLink.setAttribute('href', URL.createObjectURL(savedBlob));
        tempLink.setAttribute('download', `${this.jsonFileName}`);

        tempLink.click();

        URL.revokeObjectURL(tempLink.href);

    }

    loadScene() {

        const tempInput = document.createElement('input');

        tempInput.type = 'file';
        tempInput.setAttribute('accept', 'application/json');

        tempInput.click();

        tempInput.addEventListener('change', event => {

            const file = event.target.files[0];

            file.text().then(text => {

                const loadJson = JSON.parse(text);
                
                this.updateScene(this.setup, loadJson, false, false);

                if (this.worldScene.staticRendering) 
                    this.worldScene.render();

            });

        });
    }

    resetScene() {

        this.updateScene(this.setup, this.setupCopy, true);

    }

    updateScene(_setup, _targetSetup, needResetPlayers = false, updateSetupOnly = false) {

        const { players, lights, objects } = _setup;
        const sceneSpecs = objects.find(o => o.room === 'scene');
        const roomSpecs = objects.filter(o => o.type === ROOM);

        players.forEach(p => {

            const _targetPlayerSetup = updateSetupOnly ? null : _targetSetup.players.find (f => f.type === p.type && f.name === p.name);

            this.updatePlayer(p, _targetPlayerSetup, updateSetupOnly);

            if (needResetPlayers) this.worldScene.resetCharacterPosition();

        });

        lights.forEach(room => {

            const basicLightsSpecsArr = room['basicLightSpecs'].filter(l => l.visible).map(l => { l.room = room.room; return l; });
            const pointLightsSpecsArr = room['pointLightSpecs'].filter(l => l.visible).map(l => { l.room = room.room; return l; });
            const spotLightsSpecsArr = room['spotLightSpecs'].filter(l => l.visible).map(l => { l.room = room.room; return l; });

            basicLightsSpecsArr.forEach(l => {

                const _targetLightSetup = updateSetupOnly ? null : _targetSetup.lights.find(f => f.room === room.room)['basicLightSpecs'].find(f => f.type === l.type && f.name === l.name);
                this.updateLight(l, _targetLightSetup, updateSetupOnly);

            });

            pointLightsSpecsArr.forEach(l => {

                const _targetLightSetup = updateSetupOnly ? null : _targetSetup.lights.find(f => f.room === room.room)['pointLightSpecs'].find(f => f.type === l.type && f.name === l.name);
                this.updateLight(l, _targetLightSetup, updateSetupOnly);

            });

            spotLightsSpecsArr.forEach(l => {

                const _targetLightSetup = updateSetupOnly ? null : _targetSetup.lights.find(f => f.room === room.room)['spotLightSpecs'].find(f => f => f.type === l.type && f.name === l.name);
                this.updateLight(l, _targetLightSetup, updateSetupOnly);
                
            });
        });

        sceneSpecs.children.forEach(o => {

            if (o.type !== AXES && o.type !== GRID) {

                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.room === 'scene').children.find(f => f.type === o.type && f.name === o.name);
                this.updateObject(o, _target, updateSetupOnly);

            }
        });

        roomSpecs.forEach(room => {

            this.worldScene.rooms.find(r => r.name === room.room).resetDefaultWalls();

            room.groups.forEach(group => {
                
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.room === room.room).groups.find(f => f.type === group.type && f.name === group.name);
                this.updateObject(group, _target, updateSetupOnly);
            
            });
            room.floors.forEach(floor => {
                
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.room === room.room).floors.find(f => f.type === floor.type && f.name === floor.name);
                this.updateObject(floor, _target, updateSetupOnly);

            });

            room.ceilings.forEach(ceiling => {
                
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.room === room.room).ceilings.find(f => f.type === ceiling.type && f.name === ceiling.name);
                this.updateObject(ceiling, _target, updateSetupOnly);
            
            });

            room.walls.forEach(wall => {
                
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.room === room.room).walls.find(f => f.type === wall.type && f.name === wall.name);
                this.updateObject(wall, _target, updateSetupOnly);
            
            });


            room.insideWalls.forEach(inwall => {
                
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.room === room.room).insideWalls.find(f => f.type === inwall.type && f.name === inwall.name);
                this.updateObject(inwall, _target, updateSetupOnly);
            
            });

        });

    }

    updatePlayer(_origin, _target, updateSetupOnly = false) {

        const { name } = _origin;
        const findPlayer = this.worldScene.players.find(p => p.name === name);

        if (updateSetupOnly) {

            _origin.position = new Array(...this.positionArr(findPlayer.position));

        } else {

            const { position } = _target;

            findPlayer.setPosition(position);
            _origin.position = new Array(...position);

        }

    }

    updateLight(_origin, _target, updateSetupOnly = false) {

        const { name, room } = _origin;
        const findLight = this.worldScene.shadowLightObjects.find(l => l.room === room && l.name === name);
        const light = findLight.light;

        switch (light.type) {

            case DIRECTIONAL_LIGHT:
                {

                    if (updateSetupOnly) {

                        _origin.detail.color = new Array(...this.colorArr(light.color));
                        _origin.detail.intensity = light.intensity;
                        _origin.detail.position = new Array(...this.positionArr(light.position));
                        _origin.detail.target = new Array(...this.positionArr(light.target.position));

                    } else {

                        const { intensity = 1, position = [0, 0, 0], target = [0, 0, 0] } = _target.detail;
                        const { color = [255, 255, 255] } = _target.detail;

                        _origin.detail.color = new Array(...color);
                        _origin.detail.intensity = intensity;
                        _origin.detail.position = new Array(...position);
                        _origin.detail.target = new Array(...target);

                        light.color.setStyle(this.colorStr(...color));
                        light.intensity = intensity;
                        light.position.set(...position);
                        light.target.position.set(...target);

                    }
                }

                break;
            case AMBIENT_LIGHT:
                {

                    if (updateSetupOnly) {

                        _origin.detail.color = new Array(...this.colorArr(light.color));
                        _origin.detail.intensity = light.intensity;

                    } else {

                        const { intensity = 1 } = _target.detail;
                        const { color = [255, 255, 255] } = _target.detail;

                        _origin.detail.color = new Array(...color);
                        _origin.detail.intensity = intensity;

                        light.color.setStyle(this.colorStr(...color));
                        light.intensity = intensity;

                    }

                }

                break;
            case HEMISPHERE_LIGHT:
                {

                    if (updateSetupOnly) {

                        _origin.detail.skyColor = new Array(...this.colorArr(light.color));
                        _origin.detail.groundColor = new Array(...this.colorArr(light.groundColor));
                        _origin.detail.intensity = light.intensity;
                        _origin.detail.position = new Array(...this.positionArr(light.position));

                    } else {

                        const { intensity = 1, position = [0, 0, 0] } = _target.detail;
                        const { skyColor = [255, 255, 255], groundColor = [255, 255, 255] } = _target.detail;

                        _origin.detail.skyColor = new Array(...skyColor);
                        _origin.detail.groundColor = new Array(...groundColor);
                        _origin.detail.intensity = intensity;
                        _origin.detail.position = new Array(...position);

                        light.color.setStyle(this.colorStr(...skyColor));
                        light.groundColor.setStyle(this.colorStr(...groundColor));
                        light.intensity = intensity;
                        light.position.set(...position);

                    }
                }

                break;
            case POINT_LIGHT:
                {

                    if (updateSetupOnly) {

                        _origin.detail.color = new Array(...this.colorArr(light.color));
                        _origin.detail.intensity = light.intensity;
                        _origin.detail.distance = light.distance;
                        _origin.detail.decay = light.decay;
                        _origin.detail.position = new Array(...this.positionArr(light.position));

                    } else {

                        const { intensity = 1, distance = 0, decay = 2, position = [0, 0, 0] } = _target.detail;
                        const { color = [255, 255, 255] } = _target.detail;

                        _origin.detail.color = new Array(...color);
                        _origin.detail.intensity = intensity;
                        _origin.detail.distance = distance;
                        _origin.detail.decay = decay;
                        _origin.detail.position = new Array(...position);

                        light.color.setStyle(this.colorStr(...color));
                        light.intensity = intensity;
                        light.distance = distance;
                        light.decay = decay;
                        light.position.set(...position);

                    }
                }

                break;
            case SPOT_LIGHT:
                {

                    if (updateSetupOnly) {

                        _origin.detail.color = new Array(...this.colorArr(light.color));
                        _origin.detail.intensity = light.intensity;
                        _origin.detail.distance = light.distance;
                        _origin.detail.angle = light.angle;
                        _origin.detail.penumbra = light.penumbra;
                        _origin.detail.decay = light.decay;
                        _origin.detail.position = new Array(...this.positionArr(light.position));
                        _origin.detail.target = new Array(...this.positionArr(light.target.position));

                    } else {

                        const { intensity = 1, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2, position = [0, 0, 0], target = [0, 0, 0] } = _target.detail;
                        const { color = [255, 255, 255] } = _target.detail;

                        _origin.detail.color = new Array(...color);
                        _origin.detail.intensity = intensity;
                        _origin.detail.distance = distance;
                        _origin.detail.angle = angle;
                        _origin.detail.penumbra = penumbra;
                        _origin.detail.decay = decay;
                        _origin.detail.position = new Array(...position);
                        _origin.detail.target = new Array(...target);

                        light.color.setStyle(this.colorStr(...color));
                        light.intensity = intensity;
                        light.distance = distance;
                        light.angle = angle;
                        light.penumbra = penumbra;
                        light.decay = decay;
                        light.position.set(...position);
                        light.target.position.set(...target);

                    }
                }

                break;
        }

        if (!updateSetupOnly) {

            updateSingleLightCamera.call(this.worldScene, findLight, false);

        }

    }

    updateObject(_origin, _target, updateSetupOnly = false) {

        const { name } = _origin;
        const objects = this.worldScene.scene.children.filter(o => o.isGroup || o.isMesh);
        let find = objects.find(f => f.name === name);

        if (!find) {

            const rooms = objects.filter(o => o.isRoom);

            if (rooms?.length) {

                for (let i = 0; i < rooms.length; i++) {

                    const roomFind = rooms[i].children.filter(o => o.isGroup || o.isMesh).find(f => f.name === name);

                    if (roomFind) {

                        find = roomFind;
                        break;

                    }
                }
            }
        }

        if (find) {

            if (updateSetupOnly) {

                _origin.position = new Array(...this.positionArr(find.position));

            } else {

                const { position = [0, 0, 0] } = _target;

                find.position.set(...position);

            }

            if (!find.father.isFloor && !find.father.isCeiling) {

                if (find.isGroup) {

                    if (updateSetupOnly) {

                        _origin.rotationY = find.father.rotationY;

                    } else {

                        const { rotationY = 0 } = _target;

                        find.father.setRotationY(rotationY);
                        find.father.updateOBBs();

                    }

                } else if (find.isMesh) {

                    if (find.father.isCollision) {

                        if (updateSetupOnly) {

                            _origin.rotationY = find.father.rotationY;

                        } else {

                            const { rotationY = 0 } = _target;

                            find.father.setRotationY(rotationY);
                            find.father.updateRay();
                            find.father.updateOBB?.();
                        
                        }

                    } else {

                        if (updateSetupOnly) {

                            _origin.rotation = new Array(...this.rotationArr(find.rotation));

                        } else {

                            const { rotation = [0, 0, 0] } = _target;

                            find.father.setRotation(rotation);
                            find.father.updateOBB?.();

                        }
                        
                    }
                }
                
            }

            if (find.father.isFloor || find.father.isCeiling) {

                if (updateSetupOnly) {

                    _origin.rotation = new Array(...this.rotationArr(find.rotation));

                } else {

                    const { rotation = [0, 0, 0] } = _target;

                    find.father.setRotation(rotation);
                    find.father.updateOBB();

                }

            }
        }
    }
    
    buildObject(specs) {
    
        let object;
        const { type } = specs;
    
        switch (type) {
    
            case TOFU:
                {
                    const { name, position = [0, 0, 0], scale = [1, 1, 1], receiveShadow = false, castShadow = false } = specs;
    
                    object = new Tofu(name);
                    object.setPosition(position)
                        .setScale(scale)
                        .receiveShadow(receiveShadow)
                        .castShadow(castShadow)
                        .updateOBB()
                        .updateRay();
                }
                
                break;
            case TRAIN:
                {
                    const { name, position = [0, 0, 0], scale = [1, 1, 1], receiveShadow = false, castShadow = false } = specs;
    
                    object = new Train(name);
                    object.setPosition(position)
                        .setScale(scale)
                        .receiveShadow(receiveShadow)
                        .castShadow(castShadow)
                        .updateOBB();
                }
    
                break;
            case AXES:
                {
                    object = createAxesHelper(specs);
                }
    
                break;
            case GRID:
                {
                    object = createGridHelper(specs);
                }
    
                break;
            case PLANE:
                {
                    const { position = [0, 0, 0], rotation = [0, 0, 0], receiveShadow = false, castShadow = false } = specs;
                    const { map, normalMap } = specs;
    
                    const maps = [{ map }, { normalMap }];
                    this.setupObjectTextures(maps, specs);
    
                    object = new Plane(specs);
                    object.setRotation(rotation)
                        .setPosition(position)
                        .receiveShadow(receiveShadow)
                        .castShadow(castShadow);
                }
    
                break;
            case OBBPLANE:
                {
                    const { position = [0, 0, 0], rotation = [0, 0, 0], receiveShadow = false, castShadow = false, updateOBB = true } = specs;
                    const { map, normalMap } = specs;
    
                    const maps = [{ map }, { normalMap }];
                    this.setupObjectTextures(maps, specs);
    
                    object = new OBBPlane(specs);
                    object.setRotation(rotation)
                        .setPosition(position)
                        .receiveShadow(receiveShadow)
                        .castShadow(castShadow);
    
                    if (updateOBB) object.updateOBB();
                }
    
                break;
            case COLLISIONPLANE:
                {
                    const { position = [0, 0, 0], rotationY = 0, receiveShadow = false, castShadow = false, updateRay = true } = specs;
                    const { map, normalMap } = specs;
    
                    const maps = [{ map }, { normalMap }];
                    this.setupObjectTextures(maps, specs);
    
                    object = new CollisionPlane(specs);
                    object.setRotationY(rotationY)
                        .setPosition(position)
                        .receiveShadow(receiveShadow)
                        .castShadow(castShadow)
                        .createRay();
    
                    if (updateRay) object.updateRay();
                }
    
                break;
            case COLLISIONOBBPLANE:
                {
                    const { position = [0, 0, 0], rotationY = 0, receiveShadow = false, castShadow = false, updateOBB = true, updateRay = true } = specs;
                    const { map, normalMap } = specs;
    
                    const maps = [{ map }, { normalMap }];
                    this.setupObjectTextures(maps, specs);
    
                    object = new CollisionOBBPlane(specs);
                    object.setRotationY(rotationY)
                        .setPosition(position)
                        .receiveShadow(receiveShadow)
                        .castShadow(castShadow)
                        .createRay();
    
                    if (updateOBB) object.updateOBB();
                    if (updateRay) object.updateRay();
                }
    
                break;
            case ROOM:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBnRay = true } = specs;
                    const { frontMap, backMap, leftMap, rightMap } = specs;
                    const { frontNormal, backNormal, leftNormal, rightNormal } = specs;
    
                    const maps = [{ frontMap }, { backMap }, { leftMap }, { rightMap }, { frontNormal }, { backNormal }, { leftNormal }, { rightNormal }];
    
                    this.setupObjectTextures(maps, specs);
    
                    object = new Room(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
                    
                    if (updateOBBnRay) object.updateOBBnRay();
                }
    
                break;
            case SQUARE_PILLAR:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;
                    const { frontNormal, backNormal, leftNormal, rightNormal, topNormal, bottomNormal } = specs;
    
                    const maps = [{ frontMap }, { backMap }, { leftMap }, { rightMap }, { topMap }, { bottomMap }, { frontNormal }, { backNormal }, { leftNormal }, { rightNormal }, { topNormal }, { bottomNormal }];
    
                    this.setupObjectTextures(maps, specs);
    
                    object = new SquarePillar(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
                    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case LWALL:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { outTMap, outSMap, inTMap, inSMap, sideTMap, sideSMap, topMap, bottomMap } = specs;
                    const { outTNormal, outSNormal, inTNormal, inSNormal, sideTNormal, sideSNormal, topNormal, bottomNormal } = specs;
    
                    const maps = [{ outTMap }, { outSMap }, { inTMap }, { inSMap }, { sideTMap }, { sideSMap }, { topMap }, { bottomMap }, { outTNormal }, { outSNormal }, { inTNormal }, { inSNormal }, { sideTNormal }, { sideSNormal }, { topNormal }, { bottomNormal }];
    
                    this.setupObjectTextures(maps, specs);
    
                    object = new LWall(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case CYLINDER_PILLAR:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { map, topMap, bottomMap, normalMap, topNormal, bottomNormal } = specs;
    
                    const maps = [{ map }, { topMap }, { bottomMap }, { normalMap }, { topNormal }, { bottomNormal }];
    
                    this.setupObjectTextures(maps, specs);
    
                    object = new CylinderPillar(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case SLOPE:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { backMap, leftMap, rightMap, slopeMap, bottomMap } = specs;
                    const { backNormal, leftNormal, rightNormal, slopeNormal, bottomNormal } = specs;
    
                    const maps = [{ backMap }, { leftMap }, { rightMap }, { slopeMap }, { bottomMap }, { backNormal }, { leftNormal }, { rightNormal }, { slopeNormal }, { bottomNormal }];
    
                    this.setupObjectTextures(maps, specs);
    
                    object = new Slope(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case STAIRS:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { frontMap, topMap, sideMap, backMap, bottomMap } = specs;
                    const { frontNormal, topNormal, sideNormal, backNormal, bottomNormal } = specs;
    
                    const maps = [{ frontMap }, { topMap }, { sideMap }, { backMap }, { bottomMap }, { frontNormal }, { topNormal }, { sideNormal }, { backNormal }, { bottomNormal }];
    
                    this.setupObjectTextures(maps, specs);
    
                    object = new Stairs(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case HEX_CYLINDER_PILLAR:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { map, normalMap, topMap, topNormal, bottomMap, bottomNormal } = specs;
    
                    const maps = [{ map }, { normalMap }, { topMap }, { topNormal }, { bottomMap }, { bottomNormal }];
    
                    this.setupObjectTextures(maps, specs);
    
                    object = new HexCylinderPillar(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case BOX_CUBE:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { map, frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;
                    const { normalMap, frontNormal, backNormal, leftNormal, rightNormal, topNormal, bottomNormal } = specs;
    
                    const maps = [{ map }, { frontMap }, { backMap }, { leftMap }, { rightMap }, { topMap }, { bottomMap }, { normalMap }, { frontNormal }, { backNormal }, { leftNormal }, { rightNormal }, { topNormal }, { bottomNormal }];
    
                    this.setupObjectTextures(maps, specs);
    
                    object = new BoxCube(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case WOODEN_PICNIC_TABLE:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new WoodenPicnicTable(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY);
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case WOODEN_SMALL_TABLE:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new WoodenSmallTable(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case ROUND_WOODEN_TABLE:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new RoundWoodenTable(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case PAINTED_WOODEN_TABLE:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new PaintedWoodenTable(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case PAINTED_WOODEN_NIGHTSTAND:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new PaintedWoodenNightstand(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }
    
                break;
            case PAINTED_WOODEN_BLUE_CHAIR:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new PaintedWoodenBlueChair(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }

                break;
            case PAINTED_WOODEN_WHITE_CHAIR:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new PaintedWoodenWhiteChair(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }

                break;
            case PAINTED_WOODEN_STOOL:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new PaintedWoodenStool(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }

                break;
            case SOFA_03:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new Sofa03(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }

                break;
            case PAINTED_WOODEN_BLUE_CABINET:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new PaintedWoodenBlueCabinet(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }

                break;
            case SHELF_01:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new Shelf01(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }

                break;
            case PAINTED_WOODEN_WHITE_CABINET:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new PaintedWoodenWhiteCabinet(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }

                break;
            case TELEVISION_01:
                {
                    const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
                    const { src } = specs;
    
                    this.setupObjectGLTF({ src }, specs);
    
                    object = new Television01(specs);
                    object.setPosition(position)
                        .setRotationY(rotationY)
    
                    if (updateOBBs) object.updateOBBs();
                }

                break;
        }
    
        return object;
    
    }
    
    setupObjectTextures(_textures, specs) {
    
        _textures.forEach(t => {
    
            for (const map in t) {
                
                if (t[map] && TEXTURE_NAMES[t[map]]) {
    
                    specs[map] = this.textures[t[map]];
    
                }
            }
    
        });
    
    }
    
    setupObjectGLTF(_gltfSrc, specs) {
    
        for (const src in _gltfSrc) {
    
            if (_gltfSrc[src] && GLTF_NAMES[_gltfSrc[src]]) {
    
                specs[src] = this.gltfs[_gltfSrc[src]];
    
            }
        }
    
    }

    colorStr(r, g, b) {

        return `rgb(${r},${g},${b})`;

    }

    colorArr(objColor) {

        const color = objColor.clone().convertLinearToSRGB();
        return [Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255)];

    }

    positionArr(objPosition) {

        return [objPosition.x, objPosition.y, objPosition.z];

    }

    rotationArr(objRotation) {

        return [objRotation.x, objRotation.y, objRotation.z];

    }

}

export { SceneBuilder };