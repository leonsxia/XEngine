import { createBasicLights, createPointLights, createSpotLights } from "../../components/lights.js";
import { setupShadowLight, updateSingleLightCamera } from "../../components/shadowMaker.js";
import {
    DIRECTIONAL_LIGHT, AMBIENT_LIGHT, HEMISPHERE_LIGHT, POINT_LIGHT, SPOT_LIGHT,
    AXES, GRID, 
    ROOM, INSPECTOR_ROOM, SCENE, WATER_CUBE,
} from '../../components/utils/constants.js';
import { colorStr, colorArr } from "../../components/basic/colorBase.js";
import { moveableObjectFilter, objectFilter, objectFilter2, objectFilter3, objectFilter4, objectFilter5 } from "../../components/utils/objectHelper.js";
import { ModelBuilder } from "./ModelBuilder.js";

class SceneBuilder {

    worldScene;
    modelBuilder;

    constructor() { }

    loadAssets(textures, gltfs) {

        this.modelBuilder = new ModelBuilder(textures, gltfs);

    }

    async buildScene(specs) {

        try {

            const { src } = specs;
            const worldScene = this.worldScene;

            const request = new Request(src);

            const response = await fetch(request);
            const setup = await response.json();

            worldScene.jsonFileName = src.slice(src.lastIndexOf('/') + 1);
            worldScene.sceneSetup = setup;
            worldScene.sceneSetupCopy = JSON.parse(JSON.stringify(setup));
            worldScene.sceneSavedSetup = JSON.parse(JSON.stringify(setup));

            Object.assign(worldScene.setup, setup.settings);

            const { players = [], enemies = [], lights = [], objects = [] } = setup;
            const sceneSpecs = objects.find(o => o.type === SCENE);
            const roomSpecs = objects.filter(o => o.type === ROOM || o.type === INSPECTOR_ROOM);

            const [loadedPlayers, loadedEnemies, sceneObjects, rooms] = await Promise.all(
                [
                    this.buildPlayers(players),
                    this.buildEnemies(enemies),
                    this.buildSceneObjects(sceneSpecs),
                    this.buildRooms(roomSpecs)
                ]
            );

            worldScene.players = loadedPlayers;
            worldScene.enemies = loadedEnemies;

            for (let i = 0, il = sceneObjects.length; i < il; i++) {

                const obj = sceneObjects[i];
                const { mesh, group, isPickableItem } = obj;

                if (mesh) worldScene.scene.add(mesh);
                else if (group) worldScene.scene.add(group);
                else worldScene.scene.add(obj);

                if (isPickableItem) {

                    worldScene.pickables.push(obj);

                }

                worldScene.sceneObjects.push(obj);

            }

            let basicLightGuiSpecsArr = [];
            let pointLightGuiSpecsArr = [];
            let spotLightGuiSpecsArr = [];

            if (worldScene.guiMaker) {

                worldScene.guiMaker.guiLights = { basicLightSpecsArr: basicLightGuiSpecsArr, pointLightSpecsArr: pointLightGuiSpecsArr, spotLightSpecsArr: spotLightGuiSpecsArr };

            }

            // build scene lights
            {
                this.buildLights(lights, { name: 'scene', insideGroups: sceneObjects });
            }

            for (let i = 0, il = rooms.length; i < il; i++) {

                const room = rooms[i];

                // build room lights
                this.buildLights(lights, room);

                worldScene.rooms.push(room);

                worldScene.cPlanes = worldScene.cPlanes.concat(room.walls, room.insideWalls, room.airWalls, room.floors, room.tops, room.bottoms, room.topOBBs, room.bottomOBBs, room.slopeFaces, room.stairsSides, room.stairsStepFronts, room.stairsStepTops);

                worldScene.airWalls.push(...room.airWalls);

                worldScene.cObjects.push(...room.cObjects);

                worldScene.scene.add(room.group);

            }
    
        } catch (ex) {
    
            console.log(`Scene build failed: exception\n${ex}`);
    
        }
    
    }

    /**
     * 
     * @param {Object} lights - light config from json file
     * @param {Object} room - builded room object
     * @returns 
     */
    buildLights(lights, room) {
        
        const roomName = room.name;
        const worldScene = this.worldScene;
        const roomLights = lights.find(l => l.room === roomName);

        if (!roomLights) return;

        const basicLightsSpecsArr = roomLights['basicLightSpecs']?.map(l => { l.room = roomName; return l; }) ?? [];
        const pointLightsSpecsArr = roomLights['pointLightSpecs']?.map(l => { l.room = roomName; return l; }) ?? [];
        const spotLightsSpecsArr = roomLights['spotLightSpecs']?.map(l => { l.room = roomName; return l; }) ?? [];

        // read light objects
        const _basicLights = createBasicLights(basicLightsSpecsArr);
        const _pointLights = createPointLights(pointLightsSpecsArr);
        const _spotLights = createSpotLights(spotLightsSpecsArr);

        if (worldScene.guiMaker) {

            const { guiLights } = worldScene.guiMaker;
            
            guiLights.basicLightSpecsArr = guiLights.basicLightSpecsArr.concat(basicLightsSpecsArr);
            guiLights.pointLightSpecsArr = guiLights.pointLightSpecsArr.concat(pointLightsSpecsArr);
            guiLights.spotLightSpecsArr = guiLights.spotLightSpecsArr.concat(spotLightsSpecsArr);
    
        }
        
        // worldScene.lights are used for Gui as parents, the light objects controlled by Gui controllers
        Object.assign(worldScene.lights, _basicLights);
        Object.assign(worldScene.lights, _pointLights);
        Object.assign(worldScene.lights, _spotLights);

        const roomGroup = roomName === 'scene' ? null : room.group;
        const roomLightObjects = setupShadowLight.call(worldScene,
            worldScene.scene, roomGroup, ...basicLightsSpecsArr, ...pointLightsSpecsArr, ...spotLightsSpecsArr
        );

        // shadowLightObjects are used for binding callback to light helper and shadow cam helper
        worldScene.shadowLightObjects = worldScene.shadowLightObjects.concat(roomLightObjects);

        const basicLights = basicLightsSpecsArr.filter(l => l.visible).map(l => l.light);
        const pointLights = pointLightsSpecsArr.filter(l => l.visible).map(l => l.light);
        const spotLights = spotLightsSpecsArr.filter(l => l.visible).map(l => l.light);

        if (roomName !== 'scene') {

            room.lights = basicLights.concat(pointLights, spotLights);
            room.setLightsVisible(false);

        }

        // attach lights to specific objects
        const visiblePointLightSpecsArr = pointLightsSpecsArr.filter(l => l.visible);

        for (let i = 0, il = visiblePointLightSpecsArr.length; i < il; i++) {

            const l = visiblePointLightSpecsArr[i];

            this.attachLightToObject(l, roomLightObjects, room);

        }

        const visibleSpotLightSpecsArr = spotLightsSpecsArr.filter(l => l.visible);

        for (let i = 0, il = visibleSpotLightSpecsArr.length; i < il; i++) {

            const l = visibleSpotLightSpecsArr[i];

            this.attachLightToObject(l, roomLightObjects, room);

        }

    }

    attachLightToObject(lightSpecs, roomLightObjects, room) {

        const { attachTo, attachToType, turnOn = true, alwaysOn = true, light } = lightSpecs;
        // light object to update light helper
        const lightObj = roomLightObjects.find(f => f.light === light);

        if (attachTo) {

            let find = room.insideGroups.find(f => f.name === attachTo);

            find.addLight(lightObj, attachToType);

            find.updateLightObjects();

            if (!turnOn) find.turnOffLights();

            find.alwaysOn = alwaysOn;

        }

    }
    
    async buildPlayers(playerSpecs) {

        const players = [];
        const loadPromises = [];

        for (let i = 0, il = playerSpecs.length; i < il; i++) {

            const specs = playerSpecs[i];
            const player = this.buildObject(specs);

            players.push(player);

            if (player.init) {

                loadPromises.push(player.init());

            }

        }

        await Promise.all(loadPromises);

        return players;

    }

    async buildEnemies(enemySpecs) {

        const enemies = [];
        const loadPromises = [];

        for (let i = 0, il = enemySpecs.length; i < il; i++) {

            const specs = enemySpecs[i];
            const enemy = this.buildObject(specs);

            enemies.push(enemy);

            if (enemy.init) {

                loadPromises.push(enemy.init());

            }

        }

        await Promise.all(loadPromises);

        return enemies;

    }

    async buildSceneObjects(sceneSpecs) {

        const loadPromises = [];
        const sceneObjects = [];

        for (let i = 0, il = sceneSpecs.children.length; i < il; i++) {

            const specs = sceneSpecs.children[i];
            const obj = this.buildObject(specs);

            sceneObjects.push(obj);

            if (obj.init) {

                loadPromises.push(obj.init());

            }

        }

        await Promise.all(loadPromises);

        return sceneObjects;

    }
    
    async buildRooms(roomSpecs) {

        const loadPromises = [];
        const rooms = [];

        for (let i = 0, il = roomSpecs.length; i < il; i++) {

            const roomSpec = roomSpecs[i];
            roomSpec.physics = this.worldScene.setup.physics;

            roomSpec.updateOBBnRay = false;
            const room = this.buildObject(roomSpec);
            rooms.push(room);

            const groups = [];
            const floors = [];
            const ceilings = [];
            const walls = [];
            const insideWalls = [];
            const airWalls = [];
            const waters = [];
            const entries = [];
            const terrains = [];

            for (let j = 0, jl = roomSpec.groups.length; j < jl; j++) {

                const spec = roomSpec.groups[j];

                spec.updateOBBs = false;
                const group = this.buildObject(spec);
                groups.push(group);

                // for debug BoxCube rays and arrows
                // if (group instanceof BoxCube) {

                //     if (group.hasRays) {

                //         this.worldScene.scene.add(group.leftArrow, group.rightArrow, group.backLeftArrow, group.backRightArrow);

                //     }

                // }

                // for debug RotatableLadder boundingbox
                // if (group.isRotatableLadder) {

                //     this.worldScene.scene.add(group.boundingBoxHelper);

                // }

            }

            room.addGroups(groups);

            for (let j = 0, jl = roomSpec.floors.length; j < jl; j++) {

                const spec = roomSpec.floors[j];

                spec.updateOBB = false;
                const floor = this.buildObject(spec);
                floors.push(floor);

            }

            room.addFloors(floors);

            for (let j = 0, jl = roomSpec.ceilings.length; j < jl; j++) {

                const spec = roomSpec.ceilings[j];

                spec.updateOBB = false;
                const ceiling = this.buildObject(spec);
                ceilings.push(ceiling);

            }

            room.addCeilings(ceilings);

            if (roomSpec.waters) {

                for (let j = 0, jl = roomSpec.waters.length; j < jl; j++) {

                    const spec = roomSpec.waters[j];

                    if (spec.type === WATER_CUBE) {

                        spec.updateOBBs = false;

                    }

                    const water = this.buildObject(spec);
                    waters.push(water);

                }

                room.addWaters(waters);

            }

            for (let j = 0, jl = roomSpec.walls.length; j < jl; j++) {

                const spec = roomSpec.walls[j];

                spec.updateOBB = false;
                spec.updateRay = false;
                const wall = this.buildObject(spec);
                walls.push(wall);

            }

            room.addWalls(walls);

            for (let j = 0, jl = roomSpec.insideWalls.length; j < jl; j++) {

                const spec = roomSpec.insideWalls[j];

                spec.updateOBB = false;
                spec.updateRay = false;
                const insideWall = this.buildObject(spec);
                insideWalls.push(insideWall);

            }

            room.addInsideWalls(insideWalls);

            if (roomSpec.airWalls) {

                for (let j = 0, jl = roomSpec.airWalls.length; j < jl; j++) {

                    const spec = roomSpec.airWalls[j];

                    spec.updateOBB = false;
                    spec.updateRay = false;
                    const airWall = this.buildObject(spec);
                    airWalls.push(airWall);

                }

            }

            room.addAirWalls(airWalls);

            if (roomSpec.entries) {

                for (let j = 0, jl = roomSpec.entries.length; j < jl; j++) {

                    const spec = roomSpec.entries[j];

                    spec.updateOBBs = false;
                    const entry = this.buildObject(spec);
                    entries.push(entry);

                    // push entry to worldScene for global access
                    this.worldScene.entries.push(entry);

                }

                room.addGroups(entries);

            }

            if (roomSpec.terrains) {

                for (let j = 0, jl = roomSpec.terrains.length; j < jl; j++) {

                    const spec = roomSpec.terrains[j];
                    const terrain = this.buildObject(spec);
                    terrains.push(terrain);

                }

                room.addTerrains(terrains);

            }

            room.updateOBBnRay();
            room.updateAreasOBBBox?.(false);

            loadPromises.push(room.init());

        }

        await Promise.all(loadPromises);

        return rooms;

    }

    saveScene() {

        this.worldScene.stop();
        this.updateScene(this.worldScene.sceneSavedSetup, null, false, false, false, true);
        const savedJson = JSON.stringify(this.worldScene.sceneSavedSetup);
        const savedBlob = new Blob([savedJson], {type: 'application/json'});

        const tempLink = document.createElement('a');

        tempLink.setAttribute('href', URL.createObjectURL(savedBlob));
        tempLink.setAttribute('download', `${this.worldScene.jsonFileName}`);

        tempLink.click();

        URL.revokeObjectURL(tempLink.href);

    }

    loadScene() {

        this.worldScene.stop();

        const tempInput = document.createElement('input');

        tempInput.type = 'file';
        tempInput.setAttribute('accept', 'application/json');

        tempInput.click();

        const $this = this;

        function onChange(event) {

            const file = event.target.files[0];

            file.text().then(text => {

                const loadJson = JSON.parse(text);

                $this.updateScene($this.worldScene.sceneSetup, loadJson, false, false, true, false);

                if ($this.worldScene.staticRendering) {

                    $this.worldScene.render();

                }

            }).finally(() => {

                tempInput.removeEventListener('change', onChange);
                $this.worldScene.start();

            });

        }

        tempInput.addEventListener('change', onChange);

    }

    resetScene() {

        this.worldScene.disablePlayerPda();
        this.updateScene(this.worldScene.sceneSetup, this.worldScene.sceneSetupCopy, true, true, true);

    }

    updateScene(_setup, _targetSetup, needResetPlayers = false, needResetEnemies = false, needResetPickables = false, updateSetupOnly = false) {

        const { players = [], enemies = [], lights, objects } = _setup;
        const sceneSpecs = objects.find(o => o.type === SCENE);
        const roomSpecs = objects.filter(o => o.type === ROOM || o.type === INSPECTOR_ROOM);

        for (let i = 0, il = players.length; i < il; i++) {

            const p = players[i];

            const _targetPlayerSetup = updateSetupOnly ? null : _targetSetup.players.find (f => f.type === p.type && f.name === p.name);

            this.updatePlayer(p, _targetPlayerSetup, updateSetupOnly);            

        }

        if (needResetPlayers) this.worldScene.resetCharacter();

        for (let i = 0, il = enemies.length; i < il; i++) {

            const e = enemies[i];

            const _targetEnemySetup = updateSetupOnly ? null : _targetSetup.enemies.find(f => f.type === e.type && f.name === e.name);

            this.updateEnemies(e, _targetEnemySetup, updateSetupOnly);

        }

        if (needResetEnemies) this.worldScene.resetEnemies();

        for (let i = 0, il = lights.length; i < il; i++) {

            const room = lights[i];

            const basicLightsSpecsArr = room['basicLightSpecs']?.filter(l => l.visible).map(l => { l.room = room.room; return l; }) ?? [];
            const pointLightsSpecsArr = room['pointLightSpecs']?.filter(l => l.visible).map(l => { l.room = room.room; return l; }) ?? [];
            const spotLightsSpecsArr = room['spotLightSpecs']?.filter(l => l.visible).map(l => { l.room = room.room; return l; }) ?? [];

            for (let j = 0, jl = basicLightsSpecsArr.length; j < jl; j++) {

                const l = basicLightsSpecsArr[j];
                const _targetLightSetup = updateSetupOnly ? null : _targetSetup.lights.find(f => f.room === room.room)['basicLightSpecs'].find(f => f.type === l.type && f.name === l.name);
                this.updateLight(l, _targetLightSetup, updateSetupOnly);

            }

            for (let j = 0, jl = pointLightsSpecsArr.length; j < jl; j++) {

                const l = pointLightsSpecsArr[j];
                const _targetLightSetup = updateSetupOnly ? null : _targetSetup.lights.find(f => f.room === room.room)['pointLightSpecs'].find(f => f.type === l.type && f.name === l.name);
                this.updateLight(l, _targetLightSetup, updateSetupOnly);

            }

            for (let j = 0, jl = spotLightsSpecsArr.length; j < jl; j++) {

                const l = spotLightsSpecsArr[j];
                const _targetLightSetup = updateSetupOnly ? null : _targetSetup.lights.find(f => f.room === room.room)['spotLightSpecs'].find(f => f.type === l.type && f.name === l.name);
                this.updateLight(l, _targetLightSetup, updateSetupOnly);
                
            }

        }

        // clear picked object first
        this.worldScene.clearPickedObject();

        for (let i = 0, il = sceneSpecs.children.length; i < il; i++) {

            const o = sceneSpecs.children[i];

            if (o.type !== AXES && o.type !== GRID) {

                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.type === SCENE).children.find(f => f.type === o.type && f.name === o.name);
                this.updateObject(o, _target, updateSetupOnly);

            }

        }

        if (needResetPickables) {
            
            this.worldScene.updatePickables();
            this.worldScene.updatePlayerInventoryItems();
        
        }

        for (let i = 0, il = roomSpecs.length; i < il; i++) {

            const room = roomSpecs[i];

            this.worldScene.rooms.find(r => r.name === room.name).resetDefaultWalls();

            if (room.type === INSPECTOR_ROOM) {
                
                for (let j = 0, jl = room.areas.length; j < jl; j++) {

                    const area = room.areas[j];
                    const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).areas.find(f => f.name === area.name);
                    this.updateObject(area, _target, updateSetupOnly);
                    
                }

            }

            for (let j = 0, jl = room.groups.length; j < jl; j++) {

                const group = room.groups[j];
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).groups.find(f => f.type === group.type && f.name === group.name);
                this.updateObject(group, _target, updateSetupOnly);

            }

            for (let j = 0, jl = room.floors.length; j < jl; j++) {

                const floor = room.floors[j];
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).floors.find(f => f.type === floor.type && f.name === floor.name);
                this.updateObject(floor, _target, updateSetupOnly);

            }

            for (let j = 0, jl = room.ceilings.length; j < jl; j++) {

                const ceiling = room.ceilings[j];
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).ceilings.find(f => f.type === ceiling.type && f.name === ceiling.name);
                this.updateObject(ceiling, _target, updateSetupOnly);

            }

            for (let j = 0, jl = room.walls.length; j < jl; j++) {

                const wall = room.walls[j];
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).walls.find(f => f.type === wall.type && f.name === wall.name);
                this.updateObject(wall, _target, updateSetupOnly);

            }

            for (let j = 0, jl = room.insideWalls.length; j < jl; j++) {

                const inwall = room.insideWalls[j];
                const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).insideWalls.find(f => f.type === inwall.type && f.name === inwall.name);
                this.updateObject(inwall, _target, updateSetupOnly);

            }

            if (room.airWalls) {

                for (let j = 0, jl = room.airWalls.length; j < jl; j++) {

                    const airwall = room.airWalls[j];
                    const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).airWalls.find(f => f.type === airwall.type && f.name === airwall.name);
                    this.updateObject(airwall, _target, updateSetupOnly);

                }

            }

            if (room.waters) {

                for (let j = 0, jl = room.waters.length; j < jl; j++) {

                    const water = room.waters[j];
                    const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).waters.find(f => f.type === water.type && f.name === water.name);
                    this.updateObject(water, _target, updateSetupOnly);

                }

            }

            if (room.entries) {

                for (let j = 0, jl = room.entries.length; j < jl; j++) {

                    const entry = room.entries[j];
                    const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).entries.find(f => f.type === entry.type && f.name === entry.name);
                    this.updateObject(entry, _target, updateSetupOnly);

                }

            }

            if (room.terrains) {

                for (let j = 0, jl = room.terrains.length; j < jl; j++) {

                    const terrain = room.terrains[j];
                    const _target = updateSetupOnly ? null : _targetSetup.objects.find(r => r.name === room.name).terrains.find(f => f.type === terrain.type && f.name === terrain.name);
                    this.updateObject(terrain, _target, updateSetupOnly);

                }

            }

        }

    }

    updatePlayer(_origin, _target, updateSetupOnly = false) {

        const { name } = _origin;
        const findPlayer = this.worldScene.players.find(p => p.name === name && !p.disposed);

        if (!findPlayer) return;

        if (updateSetupOnly) {

            _origin.position = this.positionArr(findPlayer.position);
            _origin.rotation = this.rotationArr(findPlayer.rotation);
            _origin.currentHP = findPlayer.currentHP;

        } else {

            const { position, rotation = this.rotationArr(findPlayer.rotation), currentHP } = _target;

            findPlayer.setPosition(position)
                .setRotation(rotation)
                .updateOBB()
                .updateRay?.()
                .updateWalls?.()
                .syncRapierWorld?.();
            
            if (currentHP !== undefined) findPlayer.currentHP = currentHP;

        }

    }

    updateEnemies(_origin, _target, updateSetupOnly = false) {

        const { name } = _origin;
        const findEnemy = this.worldScene.enemies.find(e => e.name === name && !e.disposed);
        
        if (!findEnemy) return;

        if (updateSetupOnly) {

            _origin.position = this.positionArr(findEnemy.position);
            _origin.rotation = this.rotationArr(findEnemy.rotation);
            _origin.currentHP = findEnemy.currentHP;

        } else {

            const { position, rotation = this.rotationArr(findEnemy.rotation), currentHP } = _target;

            findEnemy.setPosition(position)
                .setRotation(rotation)
                .updateOBB()
                .updateRay?.()
                .updateWalls?.()
                .syncRapierWorld?.();

            if (currentHP !== undefined) {
                
                findEnemy.currentHP = currentHP;
            
            } else {

                findEnemy.resetHealth();                

            }

        }

    }

    updateLight(_origin, _target, updateSetupOnly = false) {

        const { name, room } = _origin;
        const findLightObj = this.worldScene.shadowLightObjects.find(l => l.room === room && l.name === name);
        const light = findLightObj.light;

        switch (light.type) {

            case DIRECTIONAL_LIGHT:
                {

                    if (updateSetupOnly) {

                        _origin.detail.color = colorArr(light.color);
                        _origin.detail.intensity = light.intensity;
                        _origin.detail.position = this.positionArr(light.position);
                        _origin.detail.target = this.positionArr(light.target.position);

                    } else {

                        const { intensity = 1, position = [0, 0, 0], target = [0, 0, 0] } = _target.detail;
                        const { color = [255, 255, 255] } = _target.detail;

                        _origin.detail.color = new Array(...color);
                        _origin.detail.intensity = intensity;
                        _origin.detail.position = new Array(...position);
                        _origin.detail.target = new Array(...target);

                        light.color.setStyle(colorStr(...color));
                        light.intensity = intensity;
                        light.position.set(...position);
                        light.target.position.set(...target);

                    }
                }

                break;
            case AMBIENT_LIGHT:
                {

                    if (updateSetupOnly) {

                        _origin.detail.color = colorArr(light.color);
                        _origin.detail.intensity = light.intensity;

                    } else {

                        const { intensity = 1 } = _target.detail;
                        const { color = [255, 255, 255] } = _target.detail;

                        _origin.detail.color = new Array(...color);
                        _origin.detail.intensity = intensity;

                        light.color.setStyle(colorStr(...color));
                        light.intensity = intensity;

                    }

                }

                break;
            case HEMISPHERE_LIGHT:
                {

                    if (updateSetupOnly) {

                        _origin.detail.skyColor = colorArr(light.color);
                        _origin.detail.groundColor = colorArr(light.groundColor);
                        _origin.detail.intensity = light.intensity;
                        _origin.detail.position = this.positionArr(light.position);

                    } else {

                        const { intensity = 1, position = [0, 0, 0] } = _target.detail;
                        const { skyColor = [255, 255, 255], groundColor = [255, 255, 255] } = _target.detail;

                        _origin.detail.skyColor = new Array(...skyColor);
                        _origin.detail.groundColor = new Array(...groundColor);
                        _origin.detail.intensity = intensity;
                        _origin.detail.position = new Array(...position);

                        light.color.setStyle(colorStr(...skyColor));
                        light.groundColor.setStyle(colorStr(...groundColor));
                        light.intensity = intensity;
                        light.position.set(...position);

                    }
                }

                break;
            case POINT_LIGHT:
                {

                    if (updateSetupOnly) {

                        const { attachTo, attachToType } = _origin;

                        _origin.detail.color = colorArr(light.color);
                        _origin.detail.intensity = light.intensity;
                        _origin.detail.distance = light.distance;
                        _origin.detail.decay = light.decay;
                        _origin.detail.shadowCameraAspect = light.shadow.camera.aspect;

                        if (attachTo) {

                            const pos = light.parent.father.getLightPosition(light, attachToType);

                            _origin.detail.position = this.positionArr(pos);

                        } else {

                            _origin.detail.position = this.positionArr(light.position);

                        }

                    } else {

                        const { intensity = 1, distance = 0, decay = 2, shadowCameraAspect = 1, position = [0, 0, 0] } = _target.detail;
                        const { color = [255, 255, 255] } = _target.detail;
                        const { attachTo, attachToType, turnOn = true } = _origin;

                        _origin.detail.color = new Array(...color);
                        _origin.detail.intensity = intensity;
                        _origin.detail.distance = distance;
                        _origin.detail.decay = decay;
                        _origin.detail.shadowCameraAspect = shadowCameraAspect;
                        _origin.detail.position = new Array(...position);

                        light.color.setStyle(colorStr(...color));
                        light.intensity = turnOn || (this.worldScene.postProcessor.bloomMixedPass?.enabled) ? intensity : 0;
                        light.distance = distance;
                        light.decay = decay;
                        light.shadow.camera.aspect = shadowCameraAspect;

                        if (attachTo) {

                            light.parent.father.setLightPosition(light, position, attachToType);

                        } else {

                            light.position.set(...position);

                        }

                    }
                }

                break;
            case SPOT_LIGHT:
                {

                    if (updateSetupOnly) {

                        const { attachTo, attachToType } = _origin;

                        _origin.detail.color = colorArr(light.color);
                        _origin.detail.intensity = light.intensity;
                        _origin.detail.distance = light.distance;
                        _origin.detail.angle = light.angle;
                        _origin.detail.penumbra = light.penumbra;
                        _origin.detail.decay = light.decay;

                        if (attachTo) {

                            const pos_tar = light.parent.father.getLightPositionNTarget(light, attachToType);

                            _origin.detail.position = this.positionArr(pos_tar.position);
                            _origin.detail.target = this.positionArr(pos_tar.target);

                        } else {

                            _origin.detail.position = this.positionArr(light.position);
                            _origin.detail.target = this.positionArr(light.target.position);

                        }

                    } else {

                        const { intensity = 1, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2, position = [0, 0, 0], target = [0, 0, 0] } = _target.detail;
                        const { color = [255, 255, 255] } = _target.detail;
                        const { attachTo, attachToType, turnOn = true } = _origin;

                        _origin.detail.color = new Array(...color);
                        _origin.detail.intensity = intensity;
                        _origin.detail.distance = distance;
                        _origin.detail.angle = angle;
                        _origin.detail.penumbra = penumbra;
                        _origin.detail.decay = decay;
                        _origin.detail.position = new Array(...position);
                        _origin.detail.target = new Array(...target);

                        light.color.setStyle(colorStr(...color));
                        light.intensity = turnOn || (this.worldScene.postProcessor.bloomMixedPass?.enabled) ? intensity : 0;
                        light.distance = distance;
                        light.angle = angle;
                        light.penumbra = penumbra;
                        light.decay = decay;

                        if (attachTo) {
                            
                            light.parent.father.setLightPositionNTarget(light, position, target, attachToType);
                            
                        }  else {

                            light.position.set(...position);
                            light.target.position.set(...target);

                        }

                    }
                }

                break;
        }

        if (!updateSetupOnly) {

            const needRender = this.worldScene.staticRendering;
            updateSingleLightCamera.call(this.worldScene, findLightObj, needRender);

            findLightObj.updateAttachedObject?.();

        }

    }

    updateObject(_origin, _target, updateSetupOnly = false) {

        const { name } = _origin;
        const objects = this.worldScene.scene.children.filter(o => o.isGroup || o.isMesh);
        let find = objects.find(f => f.name === name);

        if (!find) {

            const rooms = objects.filter(o => o.isRoom);

            if (rooms?.length) {

                for (let i = 0, il = rooms.length; i < il; i++) {

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

                _origin.position = this.positionArr(find.position);

            } else {

                const { position = [0, 0, 0] } = _target;

                find.position.set(...position);

            }

            if (find.isGroup) {

                if (find.father.isWaterCube) {

                    if (updateSetupOnly) {

                        _origin.scale = new Array(...find.father.scale);
                        _origin.rotation = this.rotationArr(find.rotation);
                        _origin.color = new Array(...find.father.waterColor);
                        _origin.waterScale = find.father.waterScale;
                        _origin.flowX = find.father.waterFlowX;
                        _origin.flowY = find.father.waterFlowY;

                    } else {

                        const { rotation = [0, 0, 0], scale = [1, 1, 1], color = [255, 255, 255], waterScale = 1, flowX = 1, flowY = 0 } = _target;
                        
                        find.father.setRotation(rotation);
                        find.father.waterColor = color;
                        find.father.waterScale = waterScale;
                        find.father.waterFlowX = flowX;
                        find.father.waterFlowY = flowY;
                        find.father.scale = scale;

                    }

                } else if (find.father.isRotatableLadder) {

                    if (updateSetupOnly) {

                        _origin.scale = new Array(...find.father.scale);
                        _origin.rotationY = find.father.rotationY;
                        _origin.rotationX = find.father.rotationX;

                    } else {

                        const { scale = [1, 1, 1], rotationY = 0, rotationX = 0 } = _target;

                        find.father.setRotationY(rotationY)
                            .rotateOnLocalAxisX(rotationX);
                        find.father.scale = scale; // this will do final update

                    }
                } else {

                    if (updateSetupOnly) {

                        _origin.rotationY = find.father.rotationY;

                    } else {

                        const { rotationY = 0 } = _target;

                        find.father.setRotationY(rotationY);
                        find.father.updateOBBs();

                    }

                    if (objectFilter3(find.father)) {

                        if (updateSetupOnly) {

                            _origin.thicknessS = find.father.thicknessS;
                            _origin.thicknessT = find.father.thicknessT;

                        } else {

                            const { thicknessS = 0.5, thicknessT = 0.5 } = _target;

                            // this will not call update, LWall scale update will call update below
                            find.father.thicknessS = thicknessS;
                            find.father.thicknessT = thicknessT;

                        }

                    }

                    if (objectFilter(find.father)) {

                        if (updateSetupOnly) {

                            _origin.scale = new Array(...find.father.scale);

                        } else {

                            const { scale = [1, 1, 1] } = _target;

                            find.father.scale = scale;

                        }

                    } else if (objectFilter2(find.father)) {

                        if (updateSetupOnly) {

                            _origin.scale = new Array(...find.father.scale);

                        } else {

                            const { scale = [1, 1] } = _target;

                            find.father.scale = scale;

                        }

                    }

                    if (find.father.isPickableItem) {

                        if (updateSetupOnly) {

                            _origin.currentRoom = find.father.currentRoom;
                            _origin.isPicked = find.father.isPicked;
                            _origin.belongTo = find.father.belongTo;
                            _origin.occupiedSlotIdx = find.father.occupiedSlotIdx;

                            if (find.father.ammo) {

                                _origin.ammo ? _origin.ammo.count = find.father.ammo.count : _origin.ammo = { count: find.father.ammo.count };
                                _origin.ammo.damage = find.father.ammo.damage;
                                _origin.ammo.offset0 = find.father.ammo.offset0;
                                _origin.ammo.offset1 = find.father.ammo.offset1;

                            }

                            if (find.father.isHealingItem) {

                                _origin.count = find.father.count;
                                _origin.itemType = find.father.itemType;

                            }

                        } else {

                            const { currentRoom = '', isPicked = false, belongTo, occupiedSlotIdx = -1 } = _target;
                            find.father.currentRoom = currentRoom;
                            find.father.isPicked = isPicked;
                            find.father.belongTo = belongTo;
                            find.father.occupiedSlotIdx = occupiedSlotIdx;

                            const _ammoSpecs = _target.ammo ?? _origin.ammo;
                            if (_ammoSpecs) {

                                const { count, damage, offset0, offset1 } = _ammoSpecs;                                
                                find.father.ammo.count = count ?? find.father.ammo.count;
                                find.father.ammo.damage = damage ?? find.father.ammo.damage;
                                find.father.ammo.offset0 = offset0 ?? find.father.ammo.offset0;
                                find.father.ammo.offset1 = offset1 ?? find.father.ammo.offset1;

                            }

                            if (find.father.isHealingItem) {

                                const { itemType, count = 1 } = _target;
                                find.father.switchItem(itemType);
                                find.father.count = count;

                            }

                        }

                    }

                }

                if (moveableObjectFilter(find.father) && find.father.movable) {

                    find.father.resetFallingState();
                    find.father.resetInwaterAnimeState();

                }

            } else if (find.isMesh) {

                if (find.father.isFloor || find.father.isCeiling || find.father.isTerrain) {

                    if (updateSetupOnly) {

                        _origin.rotation = this.rotationArr(find.rotation);

                    } else {

                        const { rotation = [0, 0, 0] } = _target;
                        find.father.setRotation(rotation);
                        find.father.syncRapierWorld();

                    }
                        
                } else if (find.father.isCollision) {
                    
                    if (updateSetupOnly) {

                        _origin.rotationY = find.father.rotationY;

                    } else {

                        const { rotationY = 0 } = _target;

                        find.father.setRotationY(rotationY);

                    }

                } else if (find.father.isWater) {

                    if (updateSetupOnly) {

                        _origin.scale = this.scaleArr(find.scale);
                        _origin.rotation = this.rotationArr(find.rotation);
                        _origin.color = new Array(...find.father.waterColor);
                        _origin.waterScale = find.father.waterScale;
                        _origin.flowX = find.father.waterFlowX;
                        _origin.flowY = find.father.waterFlowY;

                    } else {

                        const { scale = [1, 1, 1], rotation = [0, 0, 0], color = [255, 255, 255], waterScale = 1, flowX = 1, flowY = 0 } = _target;

                        find.father.setScale(scale)
                            .setRotation(rotation);
                        find.father.waterColor = color;
                        find.father.waterScale = waterScale;
                        find.father.waterFlowX = flowX;
                        find.father.waterFlowY = flowY;

                    }

                } else {

                    if (updateSetupOnly) {

                        _origin.rotation = this.rotationArr(find.rotation);

                    } else {

                        const { rotation = [0, 0, 0] } = _target;

                        find.father.setRotation(rotation);
                        find.father.updateOBB?.();

                    }

                }

                if (objectFilter4(find.father)) {

                    if (updateSetupOnly) {

                        _origin.scale = this.scaleArr(find.father.scale);
                        _origin.rotationT = find.father.specs.rotationT;
                        _origin.repeatU = find.father.specs.repeatU;
                        _origin.repeatV = find.father.specs.repeatV;

                    } else {

                        const { scale = [1, 1, 1], rotationT = undefined, repeatU = undefined, repeatV = undefined } = _target;

                        find.father.setConfig({ rotationT, repeatU, repeatV })
                            .setScaleFullUpdate(scale);

                    }

                }

                if (objectFilter5(find.father)) {

                    if (updateSetupOnly) {

                        _origin.roughness = find.father.roughness;
                        _origin.metalness = find.father.metalness;

                    } else {

                        const { roughness = 1, metalness = 0 } = _target;
                        find.father.roughness = roughness;
                        find.father.metalness = metalness;

                    }

                }

            }

            if (!updateSetupOnly) {

                find.father.updateLightObjects?.();

            }
        }
    }
    
    buildObject(specs) {
    
        const object = this.modelBuilder.callCreateFunction(specs);

        return object;
    
    }

    positionArr(objPosition) {

        return [objPosition.x, objPosition.y, objPosition.z];

    }

    rotationArr(objRotation) {

        return [objRotation.x, objRotation.y, objRotation.z];

    }

    scaleArr(objScale) {

        return [objScale.x, objScale.y, objScale.z];

    }

}

export { SceneBuilder };