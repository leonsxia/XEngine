import { Object3D, Vector3 } from 'three';
import * as Color from '../basic/colorBase.js';
import { groupHasChild } from '../utils/objectHelper.js';

const DEBUG = true;
const COR_DEF = ['leftCor', 'rightCor', 'leftBackCor', 'rightBackCor'];
const FACE_DEF = ['frontFace', 'backFace', 'leftFace', 'rightFace'];
const STAIR_OFFSET_MAX = .3;
const STAIR_OFFSET_MIN = .1;
const OBSTACLE_BLOCK_OFFSET_MAX = .1;
const OBSTACLE_BLOCK_OFFSET_MIN = .05;

class SimplePhysics {

    players = [];
    enemies = [];
    floors = [];
    ceilings = [];
    walls = [];
    obstacles = [];
    obstacleTops = [];
    obstacleBottoms = [];
    slopes = [];
    slopeSideOBBWalls = [];
    waterCubes = [];
    obstacleCollisionOBBWalls = [];
    interactiveObs = [];
    activePlayers = [];
    activeEnemies = [];

    isActive = true;

    constructor(players = [], enemies = []) {

        this.players = players;
        this.enemies = enemies;

        // bind event
        for (let i = 0, il = players.length; i < il; i++) {

            const player = players[i];
            player.onBeforeCollisionBoxChanged?.push(this.onBeforeTofuCollisionBoxChanged.bind(this));
            player.onCollisionBoxChanged?.push(this.onTofuCollisionBoxChanged.bind(this));

        }

        for (let i = 0, il = enemies.length; i < il; i++) {

            const enemy = enemies[i];
            enemy.onBeforeCollisionBoxChanged?.push(this.onBeforeTofuCollisionBoxChanged.bind(this));
            enemy.onCollisionBoxChanged?.push(this.onTofuCollisionBoxChanged.bind(this));

        }

    }

    addActivePlayers(...names) {

        names.forEach(name => {

            const find = this.players.find(p => p.name === name);

            if (find) {

                this.activePlayers.push(find);
                this.onTofuCollisionBoxChanged(find);
            }

        });

    }

    removeActivePlayers(...names) {

        names.forEach((name) => {

            const idx = this.activePlayers.findIndex(active => active.name === name);

            if (idx > -1) {
                
                const player = this.activePlayers[idx];
                this.onBeforeTofuCollisionBoxChanged(player);
                this.activePlayers.splice(find, 1);
            
            }

        });

    }

    addActiveEnemies(...names) {

        names.forEach(name => {

            const find = this.enemies.find(e => e.name === name);

            if (find) {
                
                this.activeEnemies.push(find);
                this.onTofuCollisionBoxChanged(find);
            
            }

        });

    }

    removeActiveEnemies(...names) {

        names.forEach((name) => {

            const idx = this.activeEnemies.findIndex(active => active.name === name);

            if (idx > -1) {
                
                const enemy = this.activePlayers[idx];
                this.onBeforeTofuCollisionBoxChanged(enemy);
                this.activeEnemies.splice(idx, 1);
            
            }

        });

    }

    initPhysics(room) {

        const { walls, insideWalls, airWalls, floors, ceilings, topOBBs, bottomOBBs, obstacles, slopes, slopeSideOBBWalls, waterCubes } = room;

        this.walls = walls.concat(insideWalls, airWalls);
        this.floors = floors;
        this.ceilings = ceilings;
        this.obstacleTops = topOBBs;
        this.obstacleBottoms = bottomOBBs;
        this.obstacles = obstacles;
        this.slopes = slopes;
        this.slopeSideOBBWalls = slopeSideOBBWalls;
        this.waterCubes = waterCubes;        

        this.interactiveObs = this.obstacles.filter(obs => 
                    
            obs.movable && (obs.pushable || obs.draggable) || obs.climbable
        
        );

        this.obstacleCollisionOBBWalls = this.walls.filter(w => w.isOBB).concat(...this.slopeSideOBBWalls);

        this.sortFloorTops();

    }

    onBeforeTofuCollisionBoxChanged(tofu) {        

        for (let i = 0, il = tofu.walls.length; i < il; i++) {

            const wall = tofu.walls[i];
            const idx = this.walls.findIndex(w => w === wall);
            const oidx = this.obstacleCollisionOBBWalls.findIndex(w => w === wall);

            if (idx > - 1) {

                this.walls.splice(idx, 1);

            }

            if (oidx > -1) {

                this.obstacleCollisionOBBWalls.splice(oidx, 1);

            }

        }

    }

    onTofuCollisionBoxChanged(tofu) {

        for (let i = 0, il = tofu.walls.length; i < il; i++) {

            const wall = tofu.walls[i];
            const idx = this.walls.findIndex(w => w === wall);
            const oidx = this.obstacleCollisionOBBWalls.findIndex(w => w === wall);

            if (idx === - 1) {

                this.walls.push(wall);

            }

            if (oidx === -1) {

                this.obstacleCollisionOBBWalls.push(wall);

            }

        }

    }

    checkOutOfWallRangeLocal(avatar, wall, halfAvatarWidth, halfAvatarHeight) {

        let result = false;
        const paddingX = .1
        const paddingTopY = .26;
        const paddingBottomY = .1;

        const leftBorderX = - wall.width * .5 + paddingX;
        const rightBorderX = wall.width * .5 - paddingX;
        const topBorderY = wall.height * .5 - paddingTopY;
        const bottomBorderY = - wall.height * .5 + paddingBottomY;

        if (avatar.position.x < leftBorderX - halfAvatarWidth ||
            avatar.position.x > rightBorderX + halfAvatarWidth ||
            avatar.position.y > topBorderY + halfAvatarHeight ||
            avatar.position.y < bottomBorderY - halfAvatarHeight
        ) {

            result = true;

        }

        return result;

    }

    checkOutOfTriangleWallRangeLocal(avatar, wall, halfAvatarWidth, halfAvatarHeight) {

        let result = false;
        const paddingX = .1;
        const paddingTopY = .1;
        const paddingBottomY = .1;
        const { x, y } = avatar.position;
        const { width, height, geometry: { parameters: { leftHanded } } } = wall;
        const tanTheta = height / width;
        const deltaX = leftHanded ? x + width * .5 : width * .5 - x;
        const deltaY = deltaX * tanTheta;
        const offsetY = halfAvatarWidth * tanTheta;

        const leftBorderX = - width * .5 + paddingX ;
        const rightBorderX = width * .5 - paddingX;
        const topBorderY = deltaY <= height * .5 ? - height * .5 + deltaY + offsetY - paddingTopY : deltaY - height * .5 + offsetY - paddingTopY;
        const bottomBorderY = - height * .5 + paddingBottomY;

        if (x < leftBorderX - halfAvatarWidth ||
            x > rightBorderX + halfAvatarWidth ||
            y > topBorderY + halfAvatarHeight ||
            y < bottomBorderY - halfAvatarHeight
        ) {

            result = true;

        }

        return result;

    }

    checkIntersection(avatar, plane, delta) {

        let intersect = false;
        let intersectCor = null;

        // set dummy object related to zero position.
        const dummyObject = avatar.dummyObject;
        const wallMesh = new Object3D();

        plane.mesh.updateWorldMatrix(true, false);
        wallMesh.applyMatrix4(plane.mesh.matrixWorld);
        wallMesh.scale.set(1, 1, 1);    // ignore wall plane scale
        wallMesh.updateMatrixWorld();

        const wallWorldMatrixInverted = wallMesh.matrixWorld.clone().invert();
        // get avatar position towards wall local space
        const dummy2WallMtx4 = avatar.group.matrixWorld.clone().premultiply(wallWorldMatrixInverted);
        const dummyMatrixInverted = dummyObject.matrix.clone().invert();
        dummyObject.applyMatrix4(dummy2WallMtx4.multiply(dummyMatrixInverted));
        
        const leftCorVec3 = avatar.leftCorVec3;
        const rightCorVec3 = avatar.rightCorVec3;
        const leftBackCorVec3 = avatar.leftBackCorVec3;
        const rightBackCorVec3 = avatar.rightBackCorVec3;

        dummyObject.localToWorld(leftCorVec3);
        dummyObject.localToWorld(rightCorVec3);
        dummyObject.localToWorld(leftBackCorVec3);
        dummyObject.localToWorld(rightBackCorVec3);

        const cornors = { leftCorVec3, rightCorVec3, leftBackCorVec3, rightBackCorVec3 };

        const halfAvatarDepth = Math.max(Math.abs(leftCorVec3.z - rightBackCorVec3.z), Math.abs(rightCorVec3.z - leftBackCorVec3.z)) * .5;
        const halfAvatarWidth = Math.max(Math.abs(leftCorVec3.x - rightBackCorVec3.x), Math.abs(rightCorVec3.x - leftBackCorVec3.x)) * .5;
        const halfAvatarHeight = avatar.height * .5;

        if (this.checkOutOfWallRangeLocal(dummyObject, plane, halfAvatarWidth, halfAvatarHeight)) {
            
            return { intersect, borderReach: false };

        }

        if (plane.isTriangle && this.checkOutOfTriangleWallRangeLocal(dummyObject, plane, halfAvatarWidth, halfAvatarHeight)) {

            return { intersect, borderReach: false};

        }

        const halfEdgeLength = plane.width / 2;

        if ((leftCorVec3.z <=0 || rightCorVec3.z <= 0 || leftBackCorVec3.z <= 0 || rightBackCorVec3.z <= 0) 
            && Math.abs(dummyObject.position.z) - halfAvatarDepth <= 0
        ) {
            
            const padding = avatar.velocity * delta + avatar.paddingCoefficient;

            if (
                (Math.abs(dummyObject.position.z - halfAvatarDepth) <=  padding) && 
                (
                    (leftCorVec3.z <= 0 && Math.abs(leftCorVec3.x) <= halfEdgeLength) ||
                    (rightCorVec3.z <= 0 && Math.abs(rightCorVec3.x) <= halfEdgeLength) ||
                    (leftBackCorVec3.z <= 0 && Math.abs(leftBackCorVec3.x) <= halfEdgeLength) ||
                    (rightBackCorVec3.z <= 0 && Math.abs(rightBackCorVec3.x) <= halfEdgeLength)
                )
            ) {

                if (leftCorVec3.z <= 0 && Math.abs(leftCorVec3.x) <= halfEdgeLength) {
                    
                    avatar.leftCorIntersects = true;
                    intersectCor = COR_DEF[0]; // left cornor

                }
                if (rightCorVec3.z <= 0 && Math.abs(rightCorVec3.x) <= halfEdgeLength) {
                    
                    avatar.rightCorIntersects = true;
                    intersectCor = COR_DEF[1]; // right cornor

                }
                if (leftBackCorVec3.z <= 0 && Math.abs(leftBackCorVec3.x) <= halfEdgeLength) {
                    
                    avatar.backLeftCorIntersects = true;
                    intersectCor = COR_DEF[2]; // left back cornor

                }
                if (rightBackCorVec3.z <= 0 && Math.abs(rightBackCorVec3.x) <= halfEdgeLength) {
                    
                    avatar.backRightCorIntersects = true;
                    intersectCor = COR_DEF[3]; // right back cornor

                }

                intersect = true;

            } else if (Math.abs(dummyObject.position.z - halfAvatarDepth) >  avatar.velocity * delta) {
                
                const leftBorderIntersects = plane.leftRay ? plane.leftRay.intersectObject(avatar.group) : [];
                const rightBorderIntersects = plane.rightRay ? plane.rightRay.intersectObject(avatar.group) : [];
                
                if (
                    rightBorderIntersects.length > 0 ||
                    leftBorderIntersects.length > 0
                ) {
                    
                    // console.log('ray intersect');
                    const leftCorIntersectFace = leftBorderIntersects.length > 0 ? leftBorderIntersects[0].object.name : null;
                    const rightCorIntersectFace = rightBorderIntersects.length > 0 ? rightBorderIntersects[0].object.name : null;
                    
                    if (leftCorIntersectFace?.includes(FACE_DEF[0]) || rightCorIntersectFace?.includes(FACE_DEF[0])) 
                        
                        avatar.frontFaceIntersects = true;

                    if (leftCorIntersectFace?.includes(FACE_DEF[1]) || rightCorIntersectFace?.includes(FACE_DEF[1])) 
                        
                        avatar.backFaceIntersects = true;

                    if (leftCorIntersectFace?.includes(FACE_DEF[2]) || rightCorIntersectFace?.includes(FACE_DEF[2])) 
                        
                        avatar.leftFaceIntersects = true;

                    if (leftCorIntersectFace?.includes(FACE_DEF[3]) || rightCorIntersectFace?.includes(FACE_DEF[3]))
                        
                        avatar.rightFaceIntersects = true;

                    intersect = true;
                    
                    return { wallMesh, intersect, borderReach: true, cornors, leftCorIntersectFace, rightCorIntersectFace, halfEdgeLength };
                }

                return { intersect, borderReach: false };
                
            }
        }

        if (intersect)  
            return { wallMesh, intersect, borderReach: false, intersectCor, cornors, halfEdgeLength };
        else
            return { intersect, borderReach: false }

    }

    checkStair(avatar, top) {

        let isStair = false;
        const offset = Math.abs(top.worldPosition.y - avatar.bottomY);

        if (avatar.bottomY < top.worldPosition.y && offset <= STAIR_OFFSET_MAX && offset >= STAIR_OFFSET_MIN) {
            
            isStair = true;

        }
        
        return isStair;
        
    }

    checkBlockByTopT(avatar, top) {

        let block = false;
        const offset = Math.abs(top.worldPosition.y - avatar.bottomY);

        if (avatar.bottomY < top.worldPosition.y - avatar.lastFrameFallingDistance && offset > STAIR_OFFSET_MAX) {
            
            block = true;

        }

        return block;

    }

    checkBlockByBottomT(avatar, bottom) {

        let block = false;
        const offset = Math.abs(bottom.worldPosition.y - avatar.topY);

        if (avatar.topY > bottom.worldPosition.y && offset > .1) {
            
            block = true;

        }

        return block;

    }

    checkObstacleBlockByTop(obs, top) {

        let block = false;

        if (obs.bottomY < top.worldPosition.y - obs.lastFrameFallingDistance - OBSTACLE_BLOCK_OFFSET_MAX) {

            block = true;

        }

        return block;

    }

    checkObstacleInWallRangeT(obs, wall) {

        let inRange = false;
        const wallTopBorder = wall.worldPosition.y + wall.height * .5 - OBSTACLE_BLOCK_OFFSET_MIN;
        const wallBottomBorder = wall.worldPosition.y - wall.height * .5 + OBSTACLE_BLOCK_OFFSET_MIN;

        if (obs.bottomY < wallTopBorder && obs.topY > wallBottomBorder) {

            inRange = true;

        }

        return inRange;
        
    }

    checkWallClimbable(avatar, wall) {

        let climbable = false;
        const wallBottom = wall.worldPosition.y - wall.height * .5;
        const wallTop = wall.worldPosition.y + wall.height * .5;

        // if wall is lower than half avatar height, and not below avatar, it will be climbable
        if (avatar.bottomY >= wallBottom - avatar.height * .5 && avatar.bottomY < wallTop) {

            climbable = true;

        }

        return climbable;

    }

    sortFloorTops() {

        // from top to the bottom
        this.obstacleTops.sort((a, b) => {

            return b.worldPosition.y - a.worldPosition.y;

        });

        this.floors.sort((a, b) => {

            return b.worldPosition.y - a.worldPosition.y;

        });

        this.slopes.sort((a, b) => {

            const tar = new Vector3();

            return b.group.getWorldPosition(tar).y - a.group.getWorldPosition(tar).y;

        });

    }

    getObject2WallDistance(obj, wall) {

        const objLocalPos = wall.mesh.worldToLocal(obj.position.clone());

        return Math.abs(objLocalPos.z);

    }

    tick(delta) {
        
        if (delta > 0.077) { // lost frame when fps lower than 13fps

            return;

        }

        this.obstacleTick(delta);

        this.playerTick(delta);

        this.enemyTick(delta);

    }

    // obstacle collision check
    obstacleTick(delta) {

        // for movable obstacles falling down check
        const movableObs = this.obstacles.filter(obs => {

            if (obs.movable) {
                
                obs.hittingGround = null;   // reset hitting ground
                obs.hittingWater = null;    // reset hitting water
                obs.resetInwaterState();

            }

            return obs.movable && !obs.group.isPicked;

        });

        const movingObs = this.obstacles.filter(obs => obs.isMoving);
    
        for (let i = 0, il = movingObs.length; i < il; i++) {

            const obs = movingObs[i];

            obs.resetBlockStatus();

            for (let j = 0, jl = this.obstacleCollisionOBBWalls.length; j < jl; j++) {

                const wall = this.obstacleCollisionOBBWalls[j];

                if (!obs.walls.find(w => w === wall) && this.checkObstacleInWallRangeT(obs, wall) && obs.intersectsOBB(wall.obb)) {

                    // console.log(`${wall.name} intersets`);

                    for (let k = 0, kl = obs.boundingFaces.length; k < kl; k++) {

                        const bf = obs.boundingFaces[k];

                        if (bf.obb.intersectsOBB(wall.obb)) {

                            if (obs.testFrontFace(bf)) {

                                obs.forwardBlock = true;
                                // console.log(`forward block`);

                            } else if (obs.testBackFace(bf)) {

                                obs.backwardBlock = true;
                                // console.log(`backward block`);

                            } else if (obs.testLeftFace(bf)) {

                                obs.leftBlock = true;
                                // console.log(`left block`);

                            } else if (obs.testRightFace(bf)) {

                                obs.rightBlock = true;
                                // console.log(`right block`);

                            }

                        }

                    }

                }

            }

            obs.tickMoving(delta);
            // stop moving for next avatar checks
            obs.stopMoving();

        }

        const onWaterObs = [];
        const onTopsObs = [];
        const onSlopesObs = [];

        for (let i = 0, il = movableObs.length; i < il; i++) {

            const obs = movableObs[i];

            for (let j = 0, jl = this.waterCubes.length; j < jl; j++) {

                const waterCube = this.waterCubes[j];

                if (obs.intersectsOBB(waterCube.box.obb)) {

                    // console.log(`${obs.name} is on water of ${waterCube.name}`);

                    onWaterObs.push(obs);
                    obs.hittingWater = waterCube;

                    break;

                }

            }

            for (let j = 0, jl = this.obstacleTops.length; j < jl; j++) {

                const top = this.obstacleTops[j];

                if ((!groupHasChild(obs.group, top.mesh)) &&
                    obs.intersectsOBB(top.obb) &&
                    !this.checkObstacleBlockByTop(obs, top)
                ) {

                    onTopsObs.push(obs);
                    obs.hittingGround = top;
    
                    break;
    
                }

            }

            if (!obs.hittingGround) {

                for (let j = 0, jl = this.slopes.length; j < jl; j++) {

                    const s = this.slopes[j];

                    if (obs.intersectsOBB(s.slope.obb)) {

                        onSlopesObs.push(obs);
                        obs.hittingGround = s.slope;

                        break;

                    }

                }

            }

        }

        if (onWaterObs.length > 0) {

            for (let i = 0, il = onWaterObs.length; i < il; i++) {

                const obs = onWaterObs[i];

                obs.onWater();

            }

        }

        if (onTopsObs.length > 0) {

            for (let i = 0, il = onTopsObs.length; i < il; i++) {

                const obs = onTopsObs[i];

                obs.onGround();

            }

        }

        if (onSlopesObs.length > 0) {

            for (let i = 0, il = onSlopesObs.length; i < il; i++) {

                const obs = onSlopesObs[i];

                obs.onSlope();

            }

        }

        const fallingObs = movableObs.filter(
            obs => obs.verticalAcceleratedSpeed !== 0 &&
            !onTopsObs.find(t => t === obs) && 
            !onSlopesObs.find(s => s === obs)
        );

        // check obstacles falling on floors
        if (fallingObs.length > 0) {

            const onGroundObs = [];

            for (let i = 0, il = fallingObs.length; i < il; i++) {

                const obs = fallingObs[i];

                for (let j = 0, jl = this.floors.length; j < jl; j++) {

                    const floor = this.floors[j];

                    if (obs.intersectsOBB(floor.obb)) {

                        onGroundObs.push(obs);
                        obs.hittingGround = floor;
                        break;

                    }

                }

            }

            if (onGroundObs.length > 0) {

                for (let i = 0, il = onGroundObs.length; i < il; i++) {

                    const obs = onGroundObs[i];

                    obs.onGround();

                }

            }

            const stillFallingObs = fallingObs.filter(obs => !onGroundObs.find(f => f === obs));

            if (stillFallingObs.length > 0) {

                for (let i = 0, il = stillFallingObs.length; i < il; i++) {

                    const obs = stillFallingObs[i];
                    obs.tickFall(delta);

                }

            }

        }

    }

    playerTick(delta) {

        this.avatarTick(this.activePlayers, delta);

    }

    enemyTick(delta) {

        this.avatarTick(this.activeEnemies, delta);

    }

    avatarTick(avatars = [], delta) {

        const activeAvatars = avatars.filter(a => !a.group.isPicked);

        for (let i = 0, il = activeAvatars.length; i < il; i++) {

            const avatar = activeAvatars[i];

            if (!avatar.isActive) continue;

            // console.log(`is in air: ${avatar.isInAir}`);

            if (DEBUG && avatar._showBBHelper) {

                avatar?.setBoundingBoxHelperColor(Color.BBW);

            }

            if (DEBUG && avatar._showBBW) {

                avatar?.setBoundingBoxWireColor(Color.BBW);

            }

            if (DEBUG && avatar._showBF) {

                avatar?.resetBFColor();

            }

            avatar.resetIntersectStatus();

            const collisionedWalls = [];

            const wallsInScope = this.walls.filter(w => {

                // get in scope walls and get rid of walls inside itself
                return this.getObject2WallDistance(avatar, w) <= avatar.detectScopeMin &&
                    w.father?.father !== avatar

            });

            avatar.resetWorldDeltaV3();

            let avatarTicked = true;

            if (!avatar.locked) {

                avatar.tick(delta);

            }

            avatar.locked = false;

            for (let i = 0, il = wallsInScope.length; i < il; i++) {

                const wall = wallsInScope[i];
                const checkResult = this.checkIntersection(avatar, wall, delta);

                if (checkResult.intersect) {

                    if (DEBUG && avatar._showBBHelper) {

                        avatar?.setBoundingBoxHelperColor(Color.intersect);

                    }

                    if (DEBUG && avatar._showBBW) {

                        avatar?.setBoundingBoxWireColor(Color.intersect);

                    }

                    wall.checkResult = checkResult;
                    collisionedWalls.push(wall);

                    if (checkResult.borderReach) avatar.locked = true;

                }

            }

            if (DEBUG && avatar._showBF) {

                if (avatar.frontFaceIntersects) avatar.setBFColor(Color.intersect, FACE_DEF[0])
                if (avatar.backFaceIntersects) avatar.setBFColor(Color.intersect, FACE_DEF[1])
                if (avatar.leftFaceIntersects) avatar.setBFColor(Color.intersect, FACE_DEF[2])
                if (avatar.rightFaceIntersects) avatar.setBFColor(Color.intersect, FACE_DEF[3])

            }
            
            if (collisionedWalls.length > 0) {

                if (avatar.isForwardBlock || avatar.isBackwardBlock) avatar.locked = true;

                avatar.intersectNum = collisionedWalls.length;
                
                for (let i = 0, il = collisionedWalls.length; i < il; i++) {

                    const wall = collisionedWalls[i];

                    avatar.tickWithWall(delta, wall, avatarTicked);

                }

                avatar.applyPositionAdjustment();

            }

            avatar.resetCollisionInfo();

            // console.log(`avatar world deltaV3:${avatar._worldDeltaV3.x}, ${avatar._worldDeltaV3.y}, ${avatar._worldDeltaV3.z}`);

            // for avatar falling down check
            const collisionTops = [];

            for (let i = 0; i < this.obstacleTops.length; i++) {

                const top = this.obstacleTops[i];

                if (avatar.obb.intersectsOBB(top.obb) && !this.checkBlockByTopT(avatar, top)) {

                    collisionTops.push(top);

                    break;

                }

            }

            // for avatar hitting bottoms check
            const collisionBottoms = [];

            for (let i = 0, il = this.obstacleBottoms.length; i < il; i++) {

                const bottom = this.obstacleBottoms[i];

                if (avatar.obb.intersectsOBB(bottom.obb) && !this.checkBlockByBottomT(avatar, bottom)) {

                    // console.log(`avatar hitting bottom: ${bottom.name}`);
                    collisionBottoms.push(bottom);

                    break;

                }

            }

            if (collisionBottoms.length === 0) {

                for (let i = 0, il = this.ceilings.length; i < il; i++) {

                    const ceiling = this.ceilings[i];

                    if (ceiling.isOBB && avatar.obb.intersectsOBB(ceiling.obb) && !this.checkBlockByBottomT(avatar, ceiling)) {

                        // console.log(`avatar hitting ceiling: ${ceiling.name}`);
                        collisionBottoms.push(ceiling);

                        break;

                    }
                }

            }

            // check slope collision
            const collisionSlopes = [];

            for (let i = 0, il = this.slopes.length; i < il; i++) {

                const s = this.slopes[i];

                // check if avatar is on slope, and slow it down
                const avatarIntersectSlopeBox = avatar.obb.intersectsOBB(s.box.obb);
                const avatarIntersectSlope = avatar.obb.intersectsOBB(s.slope.obb);

                if (!avatarIntersectSlopeBox && (avatar.intersectSlope === s || !avatar.intersectSlope)) {

                    avatar.setSlopeIntersection?.();

                } else if (avatar.isInAir && avatarIntersectSlope) {

                    avatar.setSlopeIntersection?.(s);

                } else if (avatarIntersectSlope && (avatar.obb.intersectsOBB(s.topBoxBuffer.obb) || avatar.obb.intersectsOBB(s.bottomBoxBuffer.obb))) {

                    avatar.setSlopeIntersection?.(s);

                }

                if (avatarIntersectSlope) {

                    collisionSlopes.push(s.slope.mesh);

                    break;

                }

            }

            if (collisionBottoms.length > 0) {

                avatar.tickOnHittingBottom(collisionBottoms[0]);

            } else if (collisionTops.length > 0 && collisionSlopes.length === 0) {

                avatar.onGround(collisionTops[0]);

            } else if (collisionSlopes.length > 0) {

                avatar.tickOnSlope(collisionSlopes[0]);

            } else {

                avatar.isInAir = true;
                // console.log(`is in air`);

            }

            if (collisionTops.length === 0 && avatar.isInAir) {

                const collisionFloors = [];

                for (let i = 0, il = this.floors.length; i < il; i++) {

                    const floor = this.floors[i];

                    if (!avatar.isClimbingUp && !this.checkBlockByTopT(avatar, floor)) {

                        if (avatar.obb.intersectsOBB(floor.obb)) {

                            collisionFloors.push(floor);

                            break;

                        }
                    }
                }

                if (collisionFloors.length === 0) {

                    avatar.tickFall(delta);

                } else {

                    avatar.onGround(collisionFloors[0]);

                }
            }
            
            // check avatar push or climb an obstacle
            if (avatar.pushingObb) {

                const climbWalls = [];

                for (let i = 0, il = this.interactiveObs.length; i < il; i++) {

                    const obs = this.interactiveObs[i];

                    if (obs.movable && (obs.pushable || obs.draggable)) {

                        avatar.stopPushing();
                        // obs.stopMoving();

                        if (obs.triggers) {

                            for (let j = 0, jl = obs.triggers.length; j < jl; j++) {

                                const tri = obs.triggers[j];

                                if (avatar.pushingObb.intersectsOBB(tri.obb) && !avatar.isClimbingUp && avatar.isMovingForward) {
                                    // console.log(`${tri.name} is pushed`);

                                    avatar.startPushing();

                                    if (obs.testFrontTrigger(tri)) {

                                        // console.log(`front trigger is pushed`);
                                        obs.movingBackward(true);

                                    } else if (obs.testBackTrigger(tri)) {

                                        // console.log(`back trigger is pushed`);
                                        obs.movingForward(true);

                                    } else if (obs.testLeftTrigger(tri)) {

                                        // console.log(`left trigger is pushed`);
                                        obs.movingRight(true);

                                    } else if (obs.testRightTrigger(tri)) {

                                        // console.log(`right trigger is pushed`);
                                        obs.movingLeft(true);

                                    }

                                }

                            }

                        }

                    }

                    if (obs.climbable && !avatar.isClimbingUp) {

                        for (let k = 0, kl = obs.walls.length; k < kl; k++) {

                            const w = obs.walls[k];

                            if (w.isOBB) {

                                if (avatar.pushingObb.intersectsOBB(w.obb) && this.checkWallClimbable(avatar, w)) {
                                    
                                    // console.log(`${w.name} is climbed`);
                                    climbWalls.push(w);

                                }

                            }

                        }

                    }

                }

                if (climbWalls.length === 1) {

                    const wall = climbWalls[0];

                    // console.log(`${climbWalls[0].name} is climbed`);
                    avatar.tickClimb(delta, wall);

                } else if (avatar.isClimbingUp) {

                    avatar.tickClimb(delta);

                }

            }
            
        }

    }

}

export { SimplePhysics, COR_DEF, FACE_DEF };