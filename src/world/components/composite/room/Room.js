import { Object3D, Group } from 'three';
import { createCollisionPlane, createCollisionOBBPlane } from '../../physics/collisionHelper';
import { green } from '../../basic/colorBase';
import { REPEAT_WRAPPING, DIRECTIONAL_LIGHT_TARGET, SPOT_LIGHT_TARGET, CAMERA_RAY_LAYER, PLAYER_CAMERA_RAY_LAYER, PLAYER_CAMERA_TRANSPARENT_LAYER, TOFU_AIM_LAYER, TOFU_FOCUS_LAYER, TOFU_RAY_LAYER, OBSTACLE_RAY_LAYER, PHYSICS_TYPES } from '../../utils/constants';
import { Logger } from '../../../systems/Logger';
import { isRapierObject } from '../../utils/objectHelper';
import { GLOBALS } from '../../../systems/globals';

const DEBUG = false;

class Room {

    name = '';

    frontWall;
    backWall;
    leftWall;
    rightWall;

    walls = [];
    floors = [];
    ceilings = [];
    tops = [];
    bottoms = [];
    topOBBs = [];
    bottomOBBs = [];
    obstacles = [];
    insideWalls = [];
    airWalls = [];
    insideGroups = [];
    slopes = [];
    slopeSideOBBWalls = [];
    slopeFaces = [];
    stairsSides = [];
    stairsStepFronts = [];
    stairsStepTops = [];
    connectors = [];
    connectorFaces = [];
    connectorSideFaces = [];
    waterCubes = [];
    cObjects = [];
    terrains = [];

    lights = [];
    directionalLightTarget = new Object3D();
    spotLightTarget = new Object3D();

    sequence = 0;

    physics;
    compounds = [];

    specs;

    #logger = new Logger(DEBUG, 'Room');

    constructor(specs) {

        this.specs = specs;

        const { name, sequence = 0, width, depth, height, showArrow = false, enableWallOBBs = false } = specs;
        const { frontMap, backMap, leftMap, rightMap } = this.specs;
        const { frontNormal, backNormal, leftNormal, rightNormal } = this.specs;

        const frontSpecs = this.makePlaneConfig({ width, height, map: frontMap, normalMap: frontNormal });
        const backSpecs = this.makePlaneConfig({ width, height, map: backMap, normalMap: backNormal });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, map: leftMap, normalMap: leftNormal });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, map: rightMap, normalMap: rightNormal });

        this.name = name;
        this.group = new Group();
        this.group.isRoom = true;
        this.group.father = this;
        this.group.name = name;
        this.sequence = sequence;
        this.physics = GLOBALS.CURRENT_PHYSICS;

        const createWallFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;
        
        if (!this.ignoreWall('back')) {

            this.backWall = createWallFunction(backSpecs, `${name}_back`, [0, 0, - depth / 2], 0, true, true, showArrow);
            this.backWall.isWall = true;
            this.walls.push(this.backWall);
            this.group.add(this.backWall.mesh);
            this.bindWallEvents(this.backWall);
            this.backWall.visible = true;
            if (this.physics === PHYSICS_TYPES.RAPIER) this.backWall.setupRapierPhysics();

        }

        if (!this.ignoreWall('left')) {

            this.leftWall = createWallFunction(leftSpecs, `${name}_left`, [width / 2, 0, 0], - Math.PI / 2, true, true, showArrow);
            this.leftWall.isWall = true;
            this.walls.push(this.leftWall);
            this.group.add(this.leftWall.mesh);
            this.bindWallEvents(this.leftWall);
            this.leftWall.visible = true;
            if (this.physics === PHYSICS_TYPES.RAPIER) this.leftWall.setupRapierPhysics();

        }

        if (!this.ignoreWall('right')) {

            this.rightWall = createWallFunction(rightSpecs, `${name}_right`, [- width / 2, 0, 0], Math.PI / 2, true, true, showArrow);
            this.rightWall.isWall = true;
            this.walls.push(this.rightWall);
            this.group.add(this.rightWall.mesh);
            this.bindWallEvents(this.rightWall);
            this.rightWall.visible = true;
            if (this.physics === PHYSICS_TYPES.RAPIER) this.rightWall.setupRapierPhysics();

        }
        
        if (!this.ignoreWall('front')) {

            this.frontWall = createWallFunction(frontSpecs, `${name}_front`, [0, 0, depth / 2], Math.PI, true, true, showArrow);
            this.frontWall.isWall = true;
            this.frontWall.line?.material.color.setHex(green);
            this.walls.push(this.frontWall);
            this.group.add(this.frontWall.mesh);
            this.bindWallEvents(this.frontWall);
            this.frontWall.visible = true;
            if (this.physics === PHYSICS_TYPES.RAPIER) this.frontWall.setupRapierPhysics();

        }

        this.directionalLightTarget.name = DIRECTIONAL_LIGHT_TARGET;
        this.spotLightTarget.name = SPOT_LIGHT_TARGET;

        this.group.add(

            this.directionalLightTarget,
            this.spotLightTarget

        );

    }

    get visible() {

        return this.group.visible;

    }

    set visible(val) {

        this.group.visible = val;

    }

    async init() {
        
        const insideWallsInit = this.initObjects(this.insideWalls);
        const airWallsInit = this.initObjects(this.airWalls);
        const floorsInit = this.initObjects(this.floors);
        const ceilingsInit = this.initObjects(this.ceilings);
        const insideGroupsInit = this.initObjects(this.insideGroups);
        const terrainInit = this.initObjects(this.terrains);
        
        await Promise.all(
            this.initObjects(this.walls)
            .concat(insideWallsInit, airWallsInit, floorsInit, ceilingsInit, insideGroupsInit, terrainInit)
        );

    }

    initObjects(objects) {

        const promises = [];

        for (let i = 0, il = objects.length; i < il; i++) {

            const obj = objects[i];

            promises.push(obj.init());

        }

        return promises;

    }

    bindWallEvents(wall) {

        const type = 'visibleChanged';
        const listener = (event) => {

            this.#logger.log(`${wall.name}: ${event.message}`);
            wall.setLayers(CAMERA_RAY_LAYER);
            wall.setLayers(PLAYER_CAMERA_RAY_LAYER);
            wall.setLayers(PLAYER_CAMERA_TRANSPARENT_LAYER);
            wall.setLayers(TOFU_AIM_LAYER);
            wall.setLayers(TOFU_FOCUS_LAYER);

        };

        wall.addEventListener(type, listener);

    }

    // this is for adding additional walls from SceneBuilder
    addWalls(walls) {

        for (let i = 0, il = walls.length; i < il; i++) {

            const w = walls[i];

            this.group.add(w.mesh);

            this.walls.push(w);

            this.bindWallEvents(w);

            w.isWall = true;

            w.visible = true;

        }

    }

    addInsideWalls(walls) {

        for (let i = 0, il = walls.length; i < il; i++) {

            const w = walls[i];

            this.group.add(w.mesh);

            this.insideWalls.push(w);

            this.bindWallEvents(w);

            w.isInsideWall = true;

            w.visible = true;

        }
        
    }

    addAirWalls(walls) {

        for (let i = 0, il = walls.length; i < il; i++) {

            const w = walls[i];

            this.group.add(w.mesh);

            this.airWalls.push(w);

            this.bindWallEvents(w);

            w.isAirWall = true;

            w.visible = false;

        }
        
    }

    addFloors(floors) {

        for (let i = 0, il = floors.length; i < il; i++) {

            const f = floors[i];

            this.group.add(f.mesh);

            this.floors.push(f);

            this.bindWallEvents(f);

            f.isFloor = true;

            f.visible = true;

            // set floor collider can be checked by ray to avoid falling into ground
            f.onSyncFinished = () => {

                f.mesh.userData.physics.collider.checkByRay = true;

            }

        }

    }

    addCeilings(ceilings) {

        for (let i = 0, il = ceilings.length; i < il; i++) {

            const c = ceilings[i];

            this.group.add(c.mesh);

            this.ceilings.push(c);

            this.bindWallEvents(c);

            c.isCeiling = true;

            c.visible = true;

        }

    }

    addWaters(waters) {

        for (let i = 0, il = waters.length; i < il; i++) {

            const w = waters[i];

            if (w.isWater) {

                this.group.add(w.mesh);

                w.mesh.layers.enable(CAMERA_RAY_LAYER);

            } else if (w.isWaterCube) {

                this.group.add(w.group);

                this.waterCubes.push(w);

            }

        }

    }

    addTerrains(terrains) {

        for (let i = 0, il = terrains.length; i < il; i++) {

            const t = terrains[i];

            this.group.add(t.mesh);
            t.mesh.layers.enable(CAMERA_RAY_LAYER);
            t.mesh.layers.enable(TOFU_RAY_LAYER);
            t.mesh.layers.enable(OBSTACLE_RAY_LAYER);
            this.terrains.push(t);

        }

    }

    addGroups(groups) {

        for (let i = 0, il = groups.length; i < il; i++) {

            const g = groups[i];

            this.group.add(g.group);

            this.insideGroups.push(g);

            if (g.walls) {
                
                for (let j = 0, jl = g.walls.length; j < jl; j++) {

                    const w = g.walls[j];
                    this.insideWalls.push(w);
                    
                }
            
            }

            if (g.tops) this.tops.push(...g.tops);

            if (g.bottoms) this.bottoms.push(...g.bottoms);

            if (g.topOBBs) this.topOBBs.push(...g.topOBBs);

            if (g.bottomOBBs) this.bottomOBBs.push(...g.bottomOBBs);

            if (g.isObstacle) this.obstacles.push(g);

            if (g.isSlope) {
                
                this.slopes.push(g);
                this.slopeFaces.push(g.slope);
                this.slopeSideOBBWalls.push(...g.sideOBBWalls);
            
            };

            if (g.isRotatableLadder) {

                this.connectors.push(g);
                this.connectorFaces.push(...g.slopes);
                this.connectorSideFaces.push(...g.sideFaces);

            }

            if (g.isStairs) {

                this.stairsSides = this.stairsSides.concat(g.stepSides);
                this.stairsStepFronts.push(g.stepFront);
                this.stairsStepTops.push(g.stepTop);

            }

            if (g.cObjects) {

                for (let j = 0, jl = g.cObjects.length; j < jl; j++) {

                    const obj = g.cObjects[j];

                    this.cObjects.push(obj);

                }

            }

            if (this.physics === PHYSICS_TYPES.RAPIER && isRapierObject(g)) {

                this.compounds.push(g);

            }

        }

    }

    ignoreWall(wall) {

        const { ignoreWalls = [] } = this.specs;

        let ignore = false;

        switch (wall) {

            case 'front':
                ignore = ignoreWalls.findIndex(i => i === 0) > - 1;
                break;

            case 'back':
                ignore = ignoreWalls.findIndex(i => i === 1) > - 1;
                break;

            case 'left':
                ignore = ignoreWalls.findIndex(i => i === 2) > - 1;
                break;
            
            case 'right':
                ignore = ignoreWalls.findIndex(i => i === 3) > - 1;
                break;

        }

        return ignore;

    }

    makePlaneConfig(specs) {

        const { width, height } = specs;

        const { baseSize = height, mapRatio, lines = false } = this.specs;
        const { repeatU, repeatV, repeatModeU = REPEAT_WRAPPING, repeatModeV = REPEAT_WRAPPING } = this.specs;

        specs.lines = lines;

        if (repeatU && repeatV) {

            specs.repeatU = repeatU;
            specs.repeatV = repeatV;

        } else if (mapRatio) {

            specs.repeatU = this.specs.repeatU = width / (mapRatio * baseSize);
            specs.repeatV = this.specs.repeatV = height / baseSize;

        }

        specs.repeatModeU = repeatModeU;
        specs.repeatModeV = repeatModeV;

        return specs;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    get rotationY() {

        return this.group.rotation.y;

    }

    setRotationY(y) {

        this.group.rotation.y = y;

        return this;

    }

    setLightsVisible(lightVisible = true, helperVisible = false) {

        for (let i = 0, il = this.lights.length; i < il; i++) {

            const l = this.lights[i];

            l.visible = lightVisible;

            if (l.lightHelper) l.lightHelper.visible = helperVisible;

            if (l.lightShadowCamHelper) l.lightShadowCamHelper.visible = helperVisible;
            
        }

    }

    resetDefaultWalls() {

        const { width, depth, rotationT = undefined, repeatU = undefined, repeatV = undefined } = this.specs;
        const scale = [1, 1, 1];

        if (!this.ignoreWall('front')) {

            this.frontWall.setConfig({ rotationT, repeatU, repeatV })
                .setPosition([0, 0, depth * .5])
                .setRotationY(Math.PI)
                .setScaleFullUpdate(scale)
                .syncRapierWorld();

        }

        if (!this.ignoreWall('back')) {

            this.backWall.setConfig({ rotationT, repeatU, repeatV })
                .setPosition([0, 0, - depth * .5])
                .setRotationY(0)
                .setScaleFullUpdate(scale)
                .syncRapierWorld();

        }

        if (!this.ignoreWall('left')) {

            this.leftWall.setConfig({ rotationT, repeatU, repeatV })
                .setPosition([width * .5, 0, 0])
                .setRotationY(- Math.PI * .5)
                .setScaleFullUpdate(scale)
                .syncRapierWorld();

        }

        if (!this.ignoreWall('right')) {

            this.rightWall.setConfig({ rotationT, repeatU, repeatV })
                .setPosition([- width * .5, 0, 0])
                .setRotationY(Math.PI * .5)
                .setScaleFullUpdate(scale)
                .syncRapierWorld();

        }
    }

    updateOBBnRay() {

        // this will update all children mesh matrixWorld.
        this.group.updateMatrixWorld();

        const allWalls = this.walls.concat(...this.insideWalls, ...this.airWalls);

        for (let i = 0, il = allWalls.length; i < il; i++) {

            const w = allWalls[i];

            w.updateRay(false);

            if (w.isOBB) {

                w.updateOBB(false);

            }

        }

        for (let i = 0, il = this.slopeSideOBBWalls.length; i < il; i++) {

            const s = this.slopeSideOBBWalls[i];

            s.updateOBB(false);

        }

        for (let i = 0, il = this.floors.length; i < il; i++) {

            const f = this.floors[i];

            f.updateOBB(false);

        }

        for (let i = 0, il = this.ceilings.length; i < il; i++) {

            const c = this.ceilings[i];

            c.updateOBB?.(false);

        }

        for (let i = 0, il = this.topOBBs.length; i < il; i++) {

            const t = this.topOBBs[i];

            t.updateOBB(false);

        }

        for (let i = 0, il = this.bottomOBBs.length; i < il; i++) {

            const b = this.bottomOBBs[i];

            b.updateOBB(false);

        }

        for (let i = 0, il = this.obstacles.length; i < il; i++) {

            const obs = this.obstacles[i];

            obs.updateOBBs(false, false, false);
            obs.updateRay?.(false);

        }

        for (let i = 0, il = this.slopes.length; i < il; i++) {

            const slope = this.slopes[i];

            slope.updateOBBs(false, false, false);

        }

        for (let i = 0, il = this.waterCubes.length; i < il; i++) {

            const waterCube = this.waterCubes[i];

            waterCube.updateOBBs(false, false, false);

        }

    }

}

export { Room };