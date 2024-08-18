import { createAxesHelper, createGridHelper } from "../components/utils/helpers";
import { createBasicLights, createPointLights, createSpotLights } from "../components/lights";
import {
    Train, Tofu, Plane, OBBPlane, CollisionPlane, CollisionOBBPlane, Room, SquarePillar, LWall, CylinderPillar, HexCylinderPillar, BoxCube, Slope, Stairs,
    WoodenPicnicTable, WoodenSmallTable, RoundWoodenTable, PaintedWoodenTable, PaintedWoodenNightstand
} from '../components/Models.js';
import { setupShadowLight } from "../components/shadowMaker";
import {
    AXES, GRID, TRAIN, TOFU,
    PLANE, OBBPLANE, COLLISIONPLANE, COLLISIONOBBPLANE,
    ROOM, SQUARE_PILLAR, LWALL, CYLINDER_PILLAR, HEX_CYLINDER_PILLAR, BOX_CUBE, SLOPE, STAIRS,
    WOODEN_PICNIC_TABLE, WOODEN_SMALL_TABLE, ROUND_WOODEN_TABLE, PAINTED_WOODEN_TABLE, PAINTED_WOODEN_NIGHTSTAND,
    TEXTURE_NAMES, GLTF_NAMES
} from '../components/utils/constants.js';

let textures;
let gltfs;

function loadAssets(_textures, _gltfs) {

    textures = _textures;
    gltfs = _gltfs;

}

async function buildScene(specs) {

    try {

        const { src, worldScene } = specs;

        const request = new Request(src);

        const response = await fetch(request);
        const setup = await response.json();

        const { players, lights, objects } = setup;
        const sceneSpecs = objects.find(o => o.room === 'scene');
        const roomSpecs = objects.filter(o => o.type === ROOM);

        worldScene.players = buildPlayers(players);

        const [sceneObjects, rooms] = await Promise.all(
            [
                buildSceneObjects(sceneSpecs),
                buildRooms(roomSpecs)
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
            const pointLightsSpecsArr = roomLights['pointLightSpecs'].map(l => { l.room = room.name; return l; });;
            const spotLightsSpecsArr = roomLights['spotLightSpecs'].map(l => { l.room = room.name; return l; });;

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
            room.walls.concat(room.insideWalls).forEach(w => worldScene.scene.add(...w.arrows));

        });

        worldScene.guiLights = { basicLightSpecsArr: basicLightGuiSpecsArr, pointLightSpecsArr: pointLightGuiSpecsArr, spotLightSpecsArr: spotLightGuiSpecsArr }

    } catch (ex) {

        console.log(`Scene build failed: exception\n${ex}`);

    }

}

function buildPlayers(playerSpecs) {

    const players = [];

    playerSpecs.forEach(specs => {

        players.push(buildObject(specs));

    });

    return players;

}

async function buildSceneObjects(sceneSpecs) {

    const loadPromises = [];
    const sceneObjects = [];

    sceneSpecs.children.forEach(specs => {

        sceneObjects.push(buildObject(specs));

    });

    sceneObjects.forEach(obj => {

        if (obj.init) {
            
            loadPromises.push(obj.init());

        }

    });

    await Promise.all(loadPromises);

    return sceneObjects;

}

async function buildRooms(roomSpecs) {

    const loadPromises = [];
    const rooms = []

    roomSpecs.forEach(roomSpec => {

        roomSpec.updateOBBnRay = false;
        const room = buildObject(roomSpec);
        rooms.push(room);

        const groups = [];
        const floors = [];
        const walls = [];
        const insideWalls = [];

        roomSpec.groups.forEach(spec => {

            spec.updateOBBs = false;
            const group = buildObject(spec);
            groups.push(group);

        });
        room.addGroups(groups);

        roomSpec.floors.forEach(spec => {

            spec.updateOBB = false;
            const floor = buildObject(spec);
            floors.push(floor);

        });
        room.addFloors(floors);

        roomSpec.walls.forEach(spec => {

            spec.updateOBB = false;
            spec.updateRay = false;
            const wall = buildObject(spec);
            walls.push(wall);

        });
        room.addWalls(walls);

        roomSpec.insideWalls.forEach(spec => {

            spec.updateOBB = false;
            spec.updateRay = false;
            const insideWall = buildObject(spec);
            insideWalls.push(insideWall);

        });
        room.addInsideWalls(insideWalls);

        room.updateOBBnRay();

        loadPromises.push(room.init());

    });

    await Promise.all(loadPromises);

    return rooms;

}

function buildObject(specs) {

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
                setupObjectTextures(maps, specs);

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
                setupObjectTextures(maps, specs);

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
                const { position = [0, 0, 0], rotation = [0, 0, 0], receiveShadow = false, castShadow = false, updateRay = true } = specs;
                const { map, normalMap } = specs;

                const maps = [{ map }, { normalMap }];
                setupObjectTextures(maps, specs);

                object = new CollisionPlane(specs);
                object.setRotation(rotation)
                    .setPosition(position)
                    .receiveShadow(receiveShadow)
                    .castShadow(castShadow);

                if (updateRay) object.updateRay();
            }

            break;
        case COLLISIONOBBPLANE:
            {
                const { position = [0, 0, 0], rotation = [0, 0, 0], receiveShadow = false, castShadow = false, updateOBB = true, updateRay = true } = specs;
                const { map, normalMap } = specs;

                const maps = [{ map }, { normalMap }];
                setupObjectTextures(maps, specs);

                object = new CollisionOBBPlane(specs);
                object.setRotation(rotation)
                    .setPosition(position)
                    .receiveShadow(receiveShadow)
                    .castShadow(castShadow);

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

                setupObjectTextures(maps, specs);

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

                setupObjectTextures(maps, specs);

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

                setupObjectTextures(maps, specs);

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

                setupObjectTextures(maps, specs);

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

                setupObjectTextures(maps, specs);

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

                setupObjectTextures(maps, specs);

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

                setupObjectTextures(maps, specs);

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

                setupObjectTextures(maps, specs);

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

                setupObjectGLTF({ src }, specs);

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

                setupObjectGLTF({ src }, specs);

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

                setupObjectGLTF({ src }, specs);

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

                setupObjectGLTF({ src }, specs);

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

                setupObjectGLTF({ src }, specs);

                object = new PaintedWoodenNightstand(specs);
                object.setPosition(position)
                    .setRotationY(rotationY)

                if (updateOBBs) object.updateOBBs();
            }

            break;
    }

    return object;

}

function setupObjectTextures(_textures, specs) {

    _textures.forEach(t => {

        for (const map in t) {
            
            if (t[map] && TEXTURE_NAMES[t[map]]) {

                specs[map] = textures[t[map]];

            }
        }

    });

}

function setupObjectGLTF(_gltfSrc, specs) {

    for (const src in _gltfSrc) {

        if (_gltfSrc[src] && GLTF_NAMES[_gltfSrc[src]]) {

            specs[src] = gltfs[_gltfSrc[src]];

        }
    }

}

export { loadAssets, buildScene };