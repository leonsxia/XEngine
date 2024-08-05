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
    tops = [];
    bottoms = [];
    topOBBs = [];
    bottomOBBs = [];
    obstacles = [];
    insideWalls = [];
    insideGroups = [];
    slopes = [];
    slopeFaces = [];
    stairsSides = [];
    stairsStepFronts = [];
    stairsStepTops = [];

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
        const floorsInit = this.initFloors();
        const insideGroupsInit = this.initInsideGroups();
        
        await Promise.all(
            this.initWalls()
            .concat(insideWallsInit)
            .concat(floorsInit)
            .concat(insideGroupsInit)
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

    initFloors() {

        const promises = [];

        this.floors.forEach(f => promises.push(f.init()));

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

        });

    }

    addInsideWalls(walls) {

        walls.forEach(w => {

            this.group.add(w.mesh);

            this.insideWalls.push(w);

            w.mesh.layers.enable(CAMERA_RAY_LAYER);

            w.isInsideWall = true;

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

    addGroups(groups) {

        groups.forEach(g => {

            this.group.add(g.group);

            this.insideGroups.push(g);

            if (g.walls) this.insideWalls = this.insideWalls.concat(g.walls);

            if (g.tops) this.tops = this.tops.concat(g.tops);

            if (g.bottoms) this.bottoms = this.bottoms.concat(g.bottoms);

            if (g.topOBBs) this.topOBBs = this.topOBBs.concat(g.topOBBs);

            if (g.bottomOBBs) this.bottomOBBs = this.bottomOBBs.concat(g.bottomOBBs);

            if (g.isObstacle) this.obstacles.push(g);

            if (g.isSlope) {
                
                this.slopes.push(g);
                this.slopeFaces.push(g.slope);
            
            };

            if (g.isStairs) {

                this.stairsSides = this.stairsSides.concat(g.stepSides);
                this.stairsStepFronts.push(g.stepFront);
                this.stairsStepTops.push(g.stepTop);

            }

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

        this.group.rotation.y = y;

        this.walls.concat(this.insideWalls).forEach(w => w.mesh.rotationY += y);

        return this;

    }

    setLightsVisible(lightVisible = true, helperVisible = false) {

        this.lights.forEach(l => {

            l.visible = lightVisible;

            if (l.lightHelper) l.lightHelper.visible = helperVisible;

            if (l.lightShadowCamHelper) l.lightShadowCamHelper.visible = helperVisible;
            
        });

    }

    updateOBBnRay() {

        // this will update all children mesh matrixWorld.
        this.group.updateMatrixWorld();

        this.walls.concat(this.insideWalls).forEach(w => {

            w.updateRay(false);

            if (w.isOBB) {

                w.updateOBB(false);

            }

        });

        this.floors.forEach(f => f.updateOBB(false));

        this.topOBBs.forEach(t => t.updateOBB(false));

        this.bottomOBBs.forEach(b => b.updateOBB(false));

        this.obstacles.forEach(obs => {

            obs.updateOBBs(false, false, false);

        });

        this.slopes.forEach(slope => {

            slope.updateOBBs(false, false, false);

        })

    }
}

export { Room };