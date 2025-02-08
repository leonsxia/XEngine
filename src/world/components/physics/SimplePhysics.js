import { Object3D, Vector3 } from 'three';
import * as Color from '../basic/colorBase.js';
import { groupHasChild } from '../utils/objectHelper.js';

const DEBUG = true;
const COR_DEF = ['leftCor', 'rightCor', 'leftBackCor', 'rightBackCor'];
const FACE_DEF = ['frontFace', 'backFace', 'leftFace', 'rightFace'];
const STAIR_OFFSET_MAX = .3;
const STAIR_OFFSET_MIN = .1;
const OBSTACLE_BLOCK_OFFSET_MAX = .2;
const OBSTACLE_BLOCK_OFFSET_MIN = .05;

class SimplePhysics {

    players = [];
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

    constructor(players, floors = [], walls = [], obstacles = []) {

        this.players = players;
        this.walls = walls;
        this.floors = floors;
        this.obstacles = obstacles;

    }

    addActivePlayers(...names) {

        names.forEach(name => {

            const find = this.players.find(p => p.name === name);

            if (find) this.activePlayers.push(find);

        });

    }

    removeActivePlayers(...names) {

        names.forEach((name) => {

            const idx = this.activePlayers.findIndex(active => active.name === name);

            if (idx > -1) this.activePlayers.splice(find, 1);

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
        this.obstacleCollisionOBBWalls = this.walls.filter(w => w.isOBB).concat(...this.slopeSideOBBWalls);

        this.interactiveObs = this.obstacles.filter(obs => 
                    
            obs.movable && (obs.pushable || obs.draggable) || obs.climbable
        
        );

        this.sortFloorTops();

    }

    checkOutOfWallRangeLocal(player, wall, halfPlayerWidth, halfPlayerHeight) {

        let result = false;
        const paddingX = .1
        const paddingTopY = .26;
        const paddingBottomY = .1;

        const leftBorderX = - wall.width * .5 + paddingX;
        const rightBorderX = wall.width * .5 - paddingX;
        const topBorderY = wall.height * .5 - paddingTopY;
        const bottomBorderY = - wall.height * .5 + paddingBottomY;

        if (player.position.x < leftBorderX - halfPlayerWidth ||
            player.position.x > rightBorderX + halfPlayerWidth ||
            player.position.y > topBorderY + halfPlayerHeight ||
            player.position.y < bottomBorderY - halfPlayerHeight
        ) {

            result = true;

        }

        return result;

    }

    checkOutOfTriangleWallRangeLocal(player, wall, halfPlayerWidth, halfPlayerHeight) {

        let result = false;
        const paddingX = .1;
        const paddingTopY = .1;
        const paddingBottomY = .1;
        const { x, y } = player.position;
        const { width, height, geometry: { parameters: { leftHanded } } } = wall;
        const tanTheta = height / width;
        const deltaX = leftHanded ? x + width * .5 : width * .5 - x;
        const deltaY = deltaX * tanTheta;
        const offsetY = halfPlayerWidth * tanTheta;

        const leftBorderX = - width * .5 + paddingX ;
        const rightBorderX = width * .5 - paddingX;
        const topBorderY = deltaY <= height * .5 ? - height * .5 + deltaY + offsetY - paddingTopY : deltaY - height * .5 + offsetY - paddingTopY;
        const bottomBorderY = - height * .5 + paddingBottomY;

        if (x < leftBorderX - halfPlayerWidth ||
            x > rightBorderX + halfPlayerWidth ||
            y > topBorderY + halfPlayerHeight ||
            y < bottomBorderY - halfPlayerHeight
        ) {

            result = true;

        }

        return result;

    }

    checkIntersection(player, plane, delta) {

        let intersect = false;
        let intersectCor = null;

        // set dummy object related to zero position.
        const dummyObject = player.dummyObject;
        const wallMesh = new Object3D();

        plane.mesh.updateWorldMatrix(true, false);
        wallMesh.applyMatrix4(plane.mesh.matrixWorld);
        wallMesh.updateMatrixWorld();

        const wallWorldMatrixInverted = wallMesh.matrixWorld.clone().invert();
        // get player position towards wall local space
        const dummy2WallMtx4 = player.group.matrixWorld.clone().premultiply(wallWorldMatrixInverted);
        const dummyMatrixInverted = dummyObject.matrix.clone().invert();
        dummyObject.applyMatrix4(dummy2WallMtx4.multiply(dummyMatrixInverted));
        
        const leftCorVec3 = player.leftCorVec3;
        const rightCorVec3 = player.rightCorVec3;
        const leftBackCorVec3 = player.leftBackCorVec3;
        const rightBackCorVec3 = player.rightBackCorVec3;

        dummyObject.localToWorld(leftCorVec3);
        dummyObject.localToWorld(rightCorVec3);
        dummyObject.localToWorld(leftBackCorVec3);
        dummyObject.localToWorld(rightBackCorVec3);

        const cornors = { leftCorVec3, rightCorVec3, leftBackCorVec3, rightBackCorVec3 };

        const halfPlayerDepth = Math.max(Math.abs(leftCorVec3.z - rightBackCorVec3.z), Math.abs(rightCorVec3.z - leftBackCorVec3.z)) * .5;
        const halfPlayerWidth = Math.max(Math.abs(leftCorVec3.x - rightBackCorVec3.x), Math.abs(rightCorVec3.x - leftBackCorVec3.x)) * .5;
        const halfPlayerHeight = player.height * .5;

        if (this.checkOutOfWallRangeLocal(dummyObject, plane, halfPlayerWidth, halfPlayerHeight)) {
            
            return { intersect, borderReach: false };

        }

        if (plane.isTriangle && this.checkOutOfTriangleWallRangeLocal(dummyObject, plane, halfPlayerWidth, halfPlayerHeight)) {

            return { intersect, borderReach: false};

        }

        if ((leftCorVec3.z <=0 || rightCorVec3.z <= 0 || leftBackCorVec3.z <= 0 || rightBackCorVec3.z <= 0) 
            && Math.abs(dummyObject.position.z) - halfPlayerDepth <= 0
        ) {
            
            const halfEdgeLength = plane.width / 2;
            const padding = player.velocity * delta + player.paddingCoefficient;

            if (
                (Math.abs(dummyObject.position.z - halfPlayerDepth) <=  padding) && 
                (
                    (leftCorVec3.z <= 0 && Math.abs(leftCorVec3.x) <= halfEdgeLength) ||
                    (rightCorVec3.z <= 0 && Math.abs(rightCorVec3.x) <= halfEdgeLength) ||
                    (leftBackCorVec3.z <= 0 && Math.abs(leftBackCorVec3.x) <= halfEdgeLength) ||
                    (rightBackCorVec3.z <= 0 && Math.abs(rightBackCorVec3.x) <= halfEdgeLength)
                )
            ) {

                if (leftCorVec3.z <= 0 && Math.abs(leftCorVec3.x) <= halfEdgeLength) {
                    
                    player.leftCorIntersects = true;
                    intersectCor = COR_DEF[0]; // left cornor

                } else if (rightCorVec3.z <= 0 && Math.abs(rightCorVec3.x) <= halfEdgeLength) {
                    
                    player.rightCorIntersects = true;
                    intersectCor = COR_DEF[1]; // right cornor

                } else if (leftBackCorVec3.z <= 0 && Math.abs(leftBackCorVec3.x) <= halfEdgeLength) {
                    
                    player.backLeftCorIntersects = true;
                    intersectCor = COR_DEF[2]; // left back cornor

                } else if (rightBackCorVec3.z <= 0 && Math.abs(rightBackCorVec3.x) <= halfEdgeLength) {
                    
                    player.backRightCorIntersects = true;
                    intersectCor = COR_DEF[3]; // right back cornor

                }

                intersect = true;

            } else if (Math.abs(dummyObject.position.z - halfPlayerDepth) >  player.velocity * delta) {
                
                const leftBorderIntersects = plane.leftRay ? plane.leftRay.intersectObject(player.group) : [];
                const rightBorderIntersects = plane.rightRay ? plane.rightRay.intersectObject(player.group) : [];
                
                if (
                    rightBorderIntersects.length > 0 ||
                    leftBorderIntersects.length > 0
                ) {
                    
                    // console.log('ray intersect');
                    const leftCorIntersectFace = leftBorderIntersects.length > 0 ? leftBorderIntersects[0].object.name : null;
                    const rightCorIntersectFace = rightBorderIntersects.length > 0 ? rightBorderIntersects[0].object.name : null;
                    
                    if (leftCorIntersectFace?.includes(FACE_DEF[0]) || rightCorIntersectFace?.includes(FACE_DEF[0])) 
                        
                        player.frontFaceIntersects = true;

                    else if (leftCorIntersectFace?.includes(FACE_DEF[1]) || rightCorIntersectFace?.includes(FACE_DEF[1])) 
                        
                        player.backFaceIntersects = true;

                    else if (leftCorIntersectFace?.includes(FACE_DEF[2]) || rightCorIntersectFace?.includes(FACE_DEF[2])) 
                        
                        player.leftFaceIntersects = true;

                    else if (leftCorIntersectFace?.includes(FACE_DEF[3]) || rightCorIntersectFace?.includes(FACE_DEF[3]))
                        
                        player.rightFaceIntersects = true;

                    intersect = true;
                    
                    return { wallMesh, intersect, borderReach: true, cornors, leftCorIntersectFace, rightCorIntersectFace };
                }

                return { intersect, borderReach: false };
                
            }
        }

        if (intersect)  
            return { wallMesh, intersect, borderReach: false, intersectCor, cornors };
        else
            return { intersect, borderReach: false }

    }

    checkStair(player, top) {

        let isStair = false;
        const offset = Math.abs(top.worldPosition.y - player.bottomY);

        if (player.bottomY < top.worldPosition.y && offset <= STAIR_OFFSET_MAX && offset >= STAIR_OFFSET_MIN) {
            
            isStair = true;

        }
        
        return isStair;
        
    }

    checkBlockByTopT(player, top) {

        let block = false;
        const offset = Math.abs(top.worldPosition.y - player.bottomY);

        if (player.bottomY < top.worldPosition.y && offset > STAIR_OFFSET_MAX) {
            
            block = true;

        }

        return block;

    }

    checkBlockByBottomT(player, bottom) {

        let block = false;
        const offset = Math.abs(bottom.worldPosition.y - player.topY);

        if (player.topY > bottom.worldPosition.y && offset > .1) {
            
            block = true;

        }

        return block;

    }

    checkObstacleBlockByTop(obs, top) {

        let block = false;

        if (obs.bottomY < top.worldPosition.y - OBSTACLE_BLOCK_OFFSET_MAX) {

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

    checkWallClimbable(player, wall) {

        let climbable = false;
        const wallBottom = wall.worldPosition.y - wall.height * .5;
        const wallTop = wall.worldPosition.y + wall.height * .5;

        // if wall is lower than half player height, and not below player, it will be climbable
        if (player.bottomY >= wallBottom - player.height * .5 && player.bottomY < wallTop) {

            climbable = true;

        }

        return climbable;

    }

    sortFloorTops() {

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
        
        if (delta > 0.056) { // lost frame when fps lower than 18fps

            return;

        }

        this.obstacleTick(delta);

        this.playerTick(delta);

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
    
        movingObs.forEach(obs => {

            obs.resetBlockStatus();

            this.obstacleCollisionOBBWalls.forEach(wall => {

                if (!obs.walls.find(w => w === wall) && this.checkObstacleInWallRangeT(obs, wall) && obs.box.obb.intersectsOBB(wall.obb)) {

                    // console.log(`${wall.name} intersets`);

                    obs.boundingFaces.forEach(bf => {

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
                    });

                }

            });

            obs.tickMoving(delta);

        });
        
        this.waterCubes.forEach(waterCube => {

            movableObs.forEach(obs => {

                if (obs.box.obb.intersectsOBB(waterCube.box.obb)) {

                    // console.log(`${obs.name} is on water of ${waterCube.name}`);

                    obs.hittingWater = waterCube;
                    obs.onWater();

                }

            });

        });

        const onTopsObs = [];
        const onSlopesObs = [];

        this.obstacleTops.forEach(top => {

            movableObs.forEach(obs => {
                
                if (!obs.hittingGround) {

                    if ((!groupHasChild(obs.group, top.mesh)) && obs.box.obb.intersectsOBB(top.obb) && !this.checkObstacleBlockByTop(obs, top)) {

                        onTopsObs.push(obs);
                        obs.hittingGround = top;

                    }

                }
            });

        });

        this.slopes.forEach(s => {

            movableObs.forEach(obs => {

                if (!obs.hittingGround) {

                    if (obs.box.obb.intersectsOBB(s.slope.obb)) {

                        onSlopesObs.push(obs);
                        obs.hittingGround = s.slope;

                    }
                }
            })
        })

        if (onTopsObs.length > 0) {

            onTopsObs.forEach(obs => {

                obs.onGround();

            });
        }

        if (onSlopesObs.length > 0) {

            onSlopesObs.forEach(obs => {

                obs.onSlope();

            });
        }

        const fallingObs = movableObs.filter(obs => obs.verticalAcceleratedSpeed !== 0 && !onTopsObs.find(t => t === obs) && !onSlopesObs.find(s => s === obs));

        // check obstacles falling on floors
        if (fallingObs.length > 0) {

            const onGroundObs = [];

            this.floors.forEach(floor => {
                
                fallingObs.forEach(obs => {

                    if (!obs.hittingGround) {

                        if (obs.box.obb.intersectsOBB(floor.obb)) {

                            onGroundObs.push(obs);
                            obs.hittingGround = floor;

                        } else {

                            obs.hittingGround = null;

                        }

                    }
                });
            });

            if (onGroundObs.length > 0) {

                onGroundObs.forEach(obs => {

                    obs.onGround();

                });
            }

            const stillFallingObs = fallingObs.filter(obs => !onGroundObs.find(f => f === obs));

            if (stillFallingObs.length > 0) {

                stillFallingObs.forEach(obs => {

                    obs.tickFall(delta);

                })
            }
        }
    }

    playerTick(delta) {

        this.activePlayers.filter(p => !p.group.isPicked).forEach(player => {

            // console.log(`is in air: ${player.isInAir}`);

            if (DEBUG && player._showBBHelper) {

                player?.setBoundingBoxHelperColor(Color.BBW);

            }

            if (DEBUG && player._showBBW) {

                player?.setBoundingBoxWireColor(Color.BBW);

            }

            if (DEBUG && player._showBF) {

                player?.resetBFColor();

            }

            player.resetIntersectStatus();

            const collisionedWalls = [];

            const wallsInScope = this.walls.filter(w => this.getObject2WallDistance(player, w) <= player.playerDetectScopeMin);

            player.resetWorldDeltaV3();

            wallsInScope.forEach(wall => {

                const checkResult = this.checkIntersection(player, wall, delta);

                if (checkResult.intersect) {

                    if (DEBUG && player._showBBHelper) {

                        player?.setBoundingBoxHelperColor(Color.intersect);

                    }

                    if (DEBUG && player._showBBW) {

                        player?.setBoundingBoxWireColor(Color.intersect);

                    }

                    wall.checkResult = checkResult;
                    collisionedWalls.push(wall);

                } else {

                    wall.checkResult = { intersect: false, borderReach: false };

                }

            });

            if (DEBUG && player._showBF) {

                if (player.frontFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[0])
                else if (player.backFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[1])
                else if (player.leftFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[2])
                else if (player.rightFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[3])

            }

            let playerTicked = false;

            if (collisionedWalls.length === 0) {

                player.tick(delta);
                playerTicked = true;

                wallsInScope.forEach(wall => {

                    const checkResult = this.checkIntersection(player, wall, delta);
    
                    if (checkResult.intersect) {
    
                        wall.checkResult = checkResult;
                        collisionedWalls.push(wall);
    
                    } 
                    
                });

            }
            
            if (collisionedWalls.length > 0) {

                collisionedWalls.forEach(wall => {

                    player.tickWithWall(delta, wall, playerTicked);

                });

                player.applyPositionAdjustment();

            }

            // console.log(`player world deltaV3:${player._worldDeltaV3.x}, ${player._worldDeltaV3.y}, ${player._worldDeltaV3.z}`);

            // for player falling down check
            const collisionTops = [];

            this.obstacleTops.forEach(top => {

                if (collisionTops.length === 0) {

                    if (player.obb.intersectsOBB(top.obb) && !this.checkBlockByTopT(player, top)) {

                        collisionTops.push(top);

                    }

                }

            });

            // for player hitting bottoms check
            const collisionBottoms = [];

            this.obstacleBottoms.forEach(bottom => {

                if (collisionBottoms.length === 0) {

                    if (player.obb.intersectsOBB(bottom.obb) && !this.checkBlockByBottomT(player, bottom)) {

                        // console.log(`player hitting bottom: ${bottom.name}`);
                        collisionBottoms.push(bottom);

                    }

                }
            });

            if (collisionBottoms.length === 0) {

                for (let i = 0; i < this.ceilings.length; i++) {

                    const ceiling = this.ceilings[i];

                    if (ceiling.isOBB && player.obb.intersectsOBB(ceiling.obb) && !this.checkBlockByBottomT(player, ceiling)) {

                        // console.log(`player hitting ceiling: ${ceiling.name}`);
                        collisionBottoms.push(ceiling);
                        break;

                    }
                }

            }

            // check slope collision
            const collisionSlopes = [];

            this.slopes.forEach(s => {

                if (collisionSlopes.length === 0) {

                    // check if player is on slope, and slow it down
                    const playerIntersectSlopeBox = player.obb.intersectsOBB(s.box.obb);
                    const playerIntersectSlope = player.obb.intersectsOBB(s.slope.obb);

                    if (!playerIntersectSlopeBox && (player.intersectSlope === s || !player.intersectSlope)) {

                        player.setSlopeIntersection?.();

                    } else if (player.isInAir && playerIntersectSlope) {

                        player.setSlopeIntersection?.(s);

                    } else if (playerIntersectSlope && (player.obb.intersectsOBB(s.topBoxBuffer.obb) || player.obb.intersectsOBB(s.bottomBoxBuffer.obb))) {

                        player.setSlopeIntersection?.(s);

                    }

                    if (playerIntersectSlope) {

                        collisionSlopes.push(s.slope.mesh);

                    }

                }

            });

            if (collisionBottoms.length > 0) {

                player.tickOnHittingBottom(collisionBottoms[0]);

            } else if (collisionTops.length > 0 && collisionSlopes.length === 0) {

                player.onGround(collisionTops[0]);

            } else if (collisionSlopes.length > 0) {

                player.tickOnSlope(collisionSlopes[0]);

            } else {

                player.isInAir = true;
                // console.log(`is in air`);

            }

            if (collisionTops.length === 0 && player.isInAir) {

                const collisionFloors = [];

                this.floors.forEach(floor => {

                    if (collisionFloors.length === 0 && !player.isClimbingUp && !this.checkBlockByTopT(player, floor)) {

                        if (player.obb.intersectsOBB(floor.obb)) {
                            // to do
                            collisionFloors.push(floor);

                        }
                    }
                });

                if (collisionFloors.length === 0) {

                    player.tickFall(delta);

                } else {

                    player.onGround(collisionFloors[0]);

                }
            }
            
            // check player push or climb an obstacle
            if (player.pushingObb) {

                const climbWalls = [];

                this.interactiveObs.forEach(obs => {

                    if (obs.movable && (obs.pushable || obs.draggable)) {

                        player.stopPushing();
                        obs.stopMoving();

                        obs.triggers?.forEach(tri => {

                            if (player.pushingObb.intersectsOBB(tri.obb) && !player.isClimbingUp && player.isMovingForward) {
                                // console.log(`${tri.name} is pushed`);

                                player.startPushing();

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

                        });
                    }

                    if (obs.climbable) {

                        obs.walls.forEach(w => {

                            if (w.isOBB) {

                                if (player.pushingObb.intersectsOBB(w.obb) && this.checkWallClimbable(player, w)) {
                                    
                                    // console.log(`${w.name} is climbed`);
                                    climbWalls.push(w);

                                }
                            }
                        });
                    }
                });

                if (climbWalls.length === 1) {

                    const wall = climbWalls[0];

                    // console.log(`${climbWalls[0].name} is climbed`);
                    player.tickClimb(delta, wall);

                }
            }

            player.finalTick?.(delta);
            
        });

    }
}

export { SimplePhysics, COR_DEF, FACE_DEF };