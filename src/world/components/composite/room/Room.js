import { Object3D, Group } from 'three';
import { createCollisionPlane, createCollisionOBBPlane } from '../../physics/collisionHelper';
import { green } from '../../basic/colorBase';
import { REPEAT, DIRECTIONAL_LIGHT_TARGET, SPOT_LIGHT_TARGET } from '../../utils/constants';

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
        this.group.name = name;

        const createWallFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.backWall = createWallFunction(backSpecs, `${name}_back`, [0, 0, - depth / 2], 0, true, true, showArrow);
        this.leftWall = createWallFunction(leftSpecs, `${name}_left`, [- width / 2, 0, 0], Math.PI / 2, true, true, showArrow);
        this.rightWall = createWallFunction(rightSpecs, `${name}_right`, [width / 2, 0, 0], - Math.PI / 2, true, true, showArrow);
        
        this.frontWall = createWallFunction(frontSpecs, `${name}_front`, [0, 0, depth / 2], Math.PI, true, true, showArrow);
        this.frontWall.line?.material.color.setHex(green);

        this.walls = [this.frontWall, this.backWall, this.leftWall, this.rightWall];

        this.directionalLightTarget.name = DIRECTIONAL_LIGHT_TARGET;
        this.spotLightTarget.name = SPOT_LIGHT_TARGET;

        this.group.add(

            this.frontWall.mesh,
            this.backWall.mesh,
            this.leftWall.mesh,
            this.rightWall.mesh,

            this.directionalLightTarget,
            this.spotLightTarget

        );

    }

    async init() {
        
        const insideWallsInit = this.initInsideWalls();
        const floorsInit = this.initFloors();
        const insideGroupsInit = this.initInsideGroups();
        
        await Promise.all([
            this.frontWall.init(),
            this.backWall.init(),
            this.leftWall.init(),
            this.rightWall.init()
        ]
            .concat(insideWallsInit)
            .concat(floorsInit)
            .concat(insideGroupsInit)
        );

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

            this.insideWalls.push(w);

        });

    }

    addFloors(floors) {

        floors.forEach(f => {

            this.group.add(f.mesh);

            this.floors.push(f);

        });

    }

    addGroups(groups) {

        groups.forEach(g => {

            this.group.add(g.group);

            this.insideGroups.push(g);

            this.walls = this.walls.concat(g.walls);

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

    makePlaneConfig(specs) {

        const { width, height } = specs;

        const { baseSize = height, mapRatio, lines = true } = this.specs;

        specs.lines = lines;

        if (mapRatio) {

            specs.repeatU = width / (mapRatio * baseSize);
            specs.repeatV = height / baseSize;

        }

        specs.repeatModeU = REPEAT;
        specs.repeatModeV = REPEAT;

        return specs;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotationY(y) {

        this.group.rotation.y = y;

        this.walls.forEach(w => w.mesh.rotationY += y);

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

        this.walls.forEach(w => {

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