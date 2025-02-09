import { Object3D, Group } from 'three';
import { createCollisionPlane, createCollisionOBBPlane } from '../../physics/collisionHelper';
import { green } from '../../basic/colorBase';
import { REPEAT_WRAPPING, DIRECTIONAL_LIGHT_TARGET, SPOT_LIGHT_TARGET, CAMERA_RAY_LAYER } from '../../utils/constants';

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
    waterCubes = [];
    cObjects = [];

    lights = [];
    directionalLightTarget = new Object3D();
    spotLightTarget = new Object3D();
    
    specs;

    constructor(specs) {

        this.specs = specs;

        const { name, width, depth, height, showArrow = false, enableWallOBBs = false } = specs;
        const { frontMap, backMap, leftMap, rightMap } = this.specs;
        const { frontNormal, backNormal, leftNormal, rightNormal } = this.specs;

        const frontSpecs = this.makePlaneConfig({ width, height, map: frontMap, normalMap: frontNormal });
        const backSpecs = this.makePlaneConfig({ width, height, map: backMap, normalMap: backNormal });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, map: leftMap, normalMap: leftNormal });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, map: rightMap, normalMap: rightNormal });

        this.name = name;
        this.group = new Group();
        this.group.isRoom = true;
        this.group.name = name;
        this.rotationY = 0;

        const createWallFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        
        if (!this.ignoreWall('back')) {

            this.backWall = createWallFunction(backSpecs, `${name}_back`, [0, 0, - depth / 2], 0, true, true, showArrow);
            this.backWall.isWall = true;
            this.walls.push(this.backWall);
            this.group.add(this.backWall.mesh);
            this.backWall.mesh.layers.enable(CAMERA_RAY_LAYER);

        }

        if (!this.ignoreWall('left')) {

            this.leftWall = createWallFunction(leftSpecs, `${name}_left`, [width / 2, 0, 0], - Math.PI / 2, true, true, showArrow);
            this.leftWall.isWall = true;
            this.walls.push(this.leftWall);
            this.group.add(this.leftWall.mesh);
            this.leftWall.mesh.layers.enable(CAMERA_RAY_LAYER);

        }

        if (!this.ignoreWall('right')) {

            this.rightWall = createWallFunction(rightSpecs, `${name}_right`, [- width / 2, 0, 0], Math.PI / 2, true, true, showArrow);
            this.rightWall.isWall = true;
            this.walls.push(this.rightWall);
            this.group.add(this.rightWall.mesh);
            this.rightWall.mesh.layers.enable(CAMERA_RAY_LAYER);

        }
        
        if (!this.ignoreWall('front')) {

            this.frontWall = createWallFunction(frontSpecs, `${name}_front`, [0, 0, depth / 2], Math.PI, true, true, showArrow);
            this.frontWall.isWall = true;
            this.frontWall.line?.material.color.setHex(green);
            this.walls.push(this.frontWall);
            this.group.add(this.frontWall.mesh);
            this.frontWall.mesh.layers.enable(CAMERA_RAY_LAYER);

        }

        this.directionalLightTarget.name = DIRECTIONAL_LIGHT_TARGET;
        this.spotLightTarget.name = SPOT_LIGHT_TARGET;

        this.group.add(

            this.directionalLightTarget,
            this.spotLightTarget

        );

    }

    async init() {
        
        const insideWallsInit = this.initInsideWalls();
        const airWallsInit = this.initAirWalls();
        const floorsInit = this.initFloors();
        const ceilingsInit = this.initCeilings();
        const insideGroupsInit = this.initInsideGroups();
        
        await Promise.all(
            this.initWalls()
            .concat(insideWallsInit, airWallsInit, floorsInit, ceilingsInit, insideGroupsInit)
        );

    }

    initWalls() {

        const promises = [];

        this.walls.forEach(w => promises.push(w.init()));

        return promises;
        
    }

    initInsideWalls() {

        const promises = [];

        this.insideWalls.forEach(w => promises.push(w.init()));

        return promises;

    }

    initAirWalls() {

        const promises = [];

        this.airWalls.forEach(w => promises.push(w.init()));

        return promises;

    }

    initFloors() {

        const promises = [];

        this.floors.forEach(f => promises.push(f.init()));

        return promises;

    }

    initCeilings() {

        const promises = [];

        this.ceilings.forEach(c => promises.push(c.init()));

        return promises;

    }

    initInsideGroups() {

        const promises = [];

        this.insideGroups.forEach(g => promises.push(g.init()));

        return promises;

    }

    addWalls(walls) {

        walls.forEach(w => {

            this.group.add(w.mesh);

            this.walls.push(w);

            w.mesh.layers.enable(CAMERA_RAY_LAYER);

            w.isWall = true;

            w.mesh.rotationY += this.rotationY;     // update wall mesh world rotation y

        });

    }

    addInsideWalls(walls) {

        walls.forEach(w => {

            this.group.add(w.mesh);

            this.insideWalls.push(w);

            w.mesh.layers.enable(CAMERA_RAY_LAYER);

            w.isInsideWall = true;

            w.mesh.rotationY += this.rotationY;     // update wall mesh world rotation y

        });
        
    }

    addAirWalls(walls) {

        walls.forEach(w => {

            this.group.add(w.mesh);

            this.airWalls.push(w);

            w.mesh.layers.enable(CAMERA_RAY_LAYER);

            w.isAirWall = true;

            w.mesh.rotationY += this.rotationY;     // update wall mesh world rotation y

            w.visible = false;

        });
        
    }

    addFloors(floors) {

        floors.forEach(f => {

            this.group.add(f.mesh);

            this.floors.push(f);

            f.mesh.layers.enable(CAMERA_RAY_LAYER);

            f.isFloor = true;

        });

    }

    addCeilings(ceilings) {

        ceilings.forEach(c => {

            this.group.add(c.mesh);

            this.ceilings.push(c);

            c.mesh.layers.enable(CAMERA_RAY_LAYER);

            c.isCeiling = true;

        });

    }

    addWaters(waters) {

        waters.forEach(w => {

            if (w.isWater) {

                this.group.add(w.mesh);

                w.mesh.layers.enable(CAMERA_RAY_LAYER);

            } else if (w.isWaterCube) {

                this.group.add(w.group);

                this.waterCubes.push(w);

            }

        });

    }

    addGroups(groups) {

        groups.forEach(g => {

            this.group.add(g.group);

            this.insideGroups.push(g);

            if (g.walls) {
                
                g.walls.forEach(w => {

                    w.mesh.rotationY += this.rotationY;
                    this.insideWalls.push(w);
                    
                });
            
            }

            if (g.tops) this.tops = this.tops.concat(g.tops);

            if (g.bottoms) this.bottoms = this.bottoms.concat(g.bottoms);

            if (g.topOBBs) this.topOBBs = this.topOBBs.concat(g.topOBBs);

            if (g.bottomOBBs) this.bottomOBBs = this.bottomOBBs.concat(g.bottomOBBs);

            if (g.isObstacle) this.obstacles.push(g);

            if (g.isSlope) {
                
                this.slopes.push(g);
                this.slopeFaces.push(g.slope);
                this.slopeSideOBBWalls.push(...g.sideOBBWalls);
            
            };

            if (g.isStairs) {

                this.stairsSides = this.stairsSides.concat(g.stepSides);
                this.stairsStepFronts.push(g.stepFront);
                this.stairsStepTops.push(g.stepTop);

            }

            g.cObjects?.forEach(obj => this.cObjects.push(obj));

        });

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

        const { baseSize = height, mapRatio, lines = true } = this.specs;
        const { repeatU, repeatV, repeatModeU = REPEAT_WRAPPING, repeatModeV = REPEAT_WRAPPING } = this.specs;

        specs.lines = lines;

        if (repeatU && repeatV) {

            specs.repeatU = repeatU;
            specs.repeatV = repeatV;

        } else if (mapRatio) {

            specs.repeatU = width / (mapRatio * baseSize);
            specs.repeatV = height / baseSize;

        }

        specs.repeatModeU = repeatModeU;
        specs.repeatModeV = repeatModeV;

        return specs;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotationY(y) {

        const preRotY = this.rotationY;

        this.group.rotation.y = y;
        this.rotationY = y;

        this.walls.concat(this.insideWalls, this.airWalls).forEach(w => {
            
            w.mesh.rotationY = w.mesh.rotationY - preRotY + y;
        
        });

        return this;

    }

    setLightsVisible(lightVisible = true, helperVisible = false) {

        this.lights.forEach(l => {

            l.visible = lightVisible;

            if (l.lightHelper) l.lightHelper.visible = helperVisible;

            if (l.lightShadowCamHelper) l.lightShadowCamHelper.visible = helperVisible;
            
        });

    }

    resetDefaultWalls() {

        const { width, depth } = this.specs;

        if (!this.ignoreWall('front')) {

            this.frontWall.setPosition([0, 0, depth * .5])
                .setRotationY(Math.PI)
                .updateRay()
                .updateOBB?.();

        }

        if (!this.ignoreWall('back')) {

            this.backWall.setPosition([0, 0, - depth * .5])
                .setRotationY(0)
                .updateRay()
                .updateOBB?.();

        }

        if (!this.ignoreWall('left')) {

            this.leftWall.setPosition([width * .5, 0, 0])
                .setRotationY(- Math.PI * .5)
                .updateRay()
                .updateOBB?.();

        }

        if (!this.ignoreWall('right')) {

            this.rightWall.setPosition([- width * .5, 0, 0])
                .setRotationY(Math.PI * .5)
                .updateRay()
                .updateOBB?.();

        }
    }

    updateOBBnRay() {

        // this will update all children mesh matrixWorld.
        this.group.updateMatrixWorld();

        this.walls.concat(...this.insideWalls, ...this.airWalls).forEach(w => {

            w.updateRay(false);

            if (w.isOBB) {

                w.updateOBB(false);

            }

        });

        this.slopeSideOBBWalls.forEach(s => s.updateOBB(false));

        this.floors.forEach(f => f.updateOBB(false));

        this.ceilings.forEach(c => c.updateOBB?.(false));

        this.topOBBs.forEach(t => t.updateOBB(false));

        this.bottomOBBs.forEach(b => b.updateOBB(false));

        this.obstacles.forEach(obs => {

            obs.updateOBBs(false, false, false);
            obs.updateRay?.(false);

        });

        this.slopes.forEach(slope => {

            slope.updateOBBs(false, false, false);

        });

        this.waterCubes.forEach(waterCube => {

            waterCube.updateOBBs(false, false, false);

        });

    }
}

export { Room };