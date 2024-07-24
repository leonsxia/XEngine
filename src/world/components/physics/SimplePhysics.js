import { Object3D, Vector3 } from 'three';
import * as Color from '../basic/colorBase.js';

const DEBUG = true;
const COR_DEF = ['leftCor', 'rightCor', 'leftBackCor', 'rightBackCor'];
const FACE_DEF = ['frontFace', 'backFace', 'leftFace', 'rightFace'];
const STAIR_OFFSET_MAX = .3;
const STAIR_OFFSET_MIN = .1;

class SimplePhysics {

    players = [];
    floors = [];
    walls = [];
    obstacles = [];
    obstacleTops = [];
    slopes = [];
    activePlayers = [];

    constructor(players, floors, walls, obstacles) {

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

    checkOutOfWallRangeLocal(player, wall, halfPlayerWidth, halfPlayerHeight) {

        let result = false;
        const padding = .1;

        const leftBorderX = - wall.width * .5 + padding;
        const rightBorderX = wall.width * .5 - padding;
        const topBorderY = wall.height * .5 - padding;
        const bottomBorderY = - wall.height * .5 + padding;

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
        const padding = .1;
        const { x, y } = player.position;
        const { width, height, geometry: { parameters: { leftHanded } } } = wall;
        const tanTheta = height / width;
        const deltaX = leftHanded ? x + width * .5 : width * .5 - x;
        const deltaY = deltaX * tanTheta;
        const offsetY = halfPlayerWidth * tanTheta;

        const leftBorderX = - width * .5 + padding;
        const rightBorderX = width * .5 - padding;
        const topBorderY = deltaY <= height * .5 ? - height * .5 + deltaY + offsetY - padding : deltaY - height * .5 + offsetY - padding;
        const bottomBorderY = - height * .5 + padding;

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
        const wallWorldPos = new Vector3();
        
        plane.mesh.getWorldPosition(wallWorldPos);

        wallMesh.position.copy(wallWorldPos);
        wallMesh.rotation.y = plane.mesh.rotationY;

        dummyObject.position.copy(wallMesh.worldToLocal(player.position.clone()));
        dummyObject.rotation.y = player.rotation.y - wallMesh.rotation.y;
        dummyObject.scale.copy(player.scale);
        
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
                    (
                        ((leftCorVec3.z <= 0 || rightCorVec3.z <= 0) && (leftCorVec3.x < - halfEdgeLength) && (rightCorVec3.x > halfEdgeLength)) ||
                        ((leftBackCorVec3.z <= 0 || rightBackCorVec3.z <= 0) && (rightBackCorVec3.x < - halfEdgeLength) && (leftBackCorVec3.x > halfEdgeLength))
                    ) ||
                    (
                        (leftCorVec3.z <= 0 && Math.abs(leftCorVec3.x) <= halfEdgeLength) ||
                        (rightCorVec3.z <= 0 && Math.abs(rightCorVec3.x) <= halfEdgeLength) ||
                        (leftBackCorVec3.z <= 0 && Math.abs(leftBackCorVec3.x) <= halfEdgeLength) ||
                        (rightBackCorVec3.z <= 0 && Math.abs(rightBackCorVec3.x) <= halfEdgeLength)
                    )
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
                    
                    if (leftCorIntersectFace === FACE_DEF[0] || rightCorIntersectFace === FACE_DEF[0]) 
                        
                        player.frontFaceIntersects = true;

                    else if (leftCorIntersectFace === FACE_DEF[1] || rightCorIntersectFace === FACE_DEF[1]) 
                        
                        player.backFaceIntersects = true;

                    else if (leftCorIntersectFace === FACE_DEF[2] || rightCorIntersectFace === FACE_DEF[2]) 
                        
                        player.leftFaceIntersects = true;

                    else if (leftCorIntersectFace === FACE_DEF[3] || rightCorIntersectFace === FACE_DEF[3])
                        
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

    checkBlockByTopS(player, top){

        let block = false;
        const offset = Math.abs(top.worldPosition.y - player.bottomY);

        if (player.bottomY < top.worldPosition.y && offset > STAIR_OFFSET_MAX) {
            
            block = true;

        }

        return block;

    }

    checkWallBelow(player, wall) {

        let isBelow = false;
        const wallBottom = wall.worldPosition.y - wall.height * .5;

        // if wall is higher than half player height, it will be climbable
        if (player.bottomY >= wallBottom - player.height * .5) {

            isBelow = true;

        }

        return isBelow;

    }

    sortFloorTops() {

        this.obstacleTops.sort((a, b) => {

            return b.worldPosition.y - a.worldPosition.y;

        });

        this.floors.sort((a, b) => {

            return b.worldPosition.y - a.worldPosition.y;

        });

    }

    tick(delta) {
        if (delta > 0.0333) { // lost frame when fps lower than 30fps

            return;

        }

        this.activePlayers.forEach(player => {

            player.setBoundingBoxHelperColor(Color.BBW).resetBFColor(Color.BF);
            player.resetItersectStatus();

            const collisionedWalls = [];

            this.walls.forEach(wall => {

                const checkResult = this.checkIntersection(player, wall, delta);

                if (checkResult.intersect) {

                // if (player.boundingBox.intersectsBox(wall.boundingBox)) {
                    player.setBoundingBoxHelperColor(Color.intersect);
                    wall.checkResult = checkResult;
                    collisionedWalls.push(wall);

                } else {

                    wall.checkResult = { intersect: false, borderReach: false };

                }

                if (wall.isOBB) {
                    // if (player.pushingObb.intersectsOBB(wall.obb)) {
                    //     console.log(`${wall.name} intersets`);
                    // }
                }
            });

            if (DEBUG) {

                if (player.frontFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[0])
                else if (player.backFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[1])
                else if (player.leftFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[2])
                else if (player.rightFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[3])

            }

            if (collisionedWalls.length === 0) {

                player.tick(delta);

            } else {

                collisionedWalls.forEach(wall => {

                    player.tickWithWall(delta, wall);

                });
            }

            // for movable obstacles falling down check
            const movableObs = this.obstacles.filter(obs => obs.movable);
            const onTopsObs = [];

            // for player falling down check
            const collisionTops = [];

            this.obstacleTops.forEach(top => {

                if (collisionTops.length === 0) {

                    if (player.obb.intersectsOBB(top.obb) && !this.checkBlockByTopS(player, top)) {

                        // to do
                        collisionTops.push(top);

                    }

                }

                movableObs.forEach((obs, idx) => {

                    if (top.mesh.parent !== obs.group && obs.box.obb.intersectsOBB(top.obb)) {

                        onTopsObs.push(obs);
                        movableObs.splice(idx, 1);
                        obs.hittingGround = top;

                    } else {

                        obs.hittingGround = null;

                    }
                });

            });

            // check slope collision
            const collisionSlopes = [];

            this.slopes.forEach(s => {

                if (collisionSlopes.length === 0) {

                    if (player.obb.intersectsOBB(s.slope.obb)) {

                        collisionSlopes.push(s.slope.mesh);

                    }
                }

            });

            if (collisionTops.length > 0) {

                player.onGround(collisionTops[0]);

            } else if (collisionSlopes.length > 0) {

                player.tickOnSlope(collisionSlopes[0]);

            }

            if (onTopsObs.length > 0) {

                onTopsObs.forEach(obs => {

                    obs.onGround();

                });
            }

            if (collisionTops.length === 0) {

                const collisionFloors = [];

                this.floors.forEach(floor => {

                    if (collisionFloors.length === 0) {

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

            // check obstacles falling on floors
            if (movableObs.length > 0) {

                const onGroundObs = [];

                this.floors.forEach(floor => {

                    movableObs.forEach((obs, idx) => {

                        if (obs.box.obb.intersectsOBB(floor.obb)) {

                            onGroundObs.push(obs);
                            movableObs.splice(idx, 1);
                            obs.hittingGround = floor;

                        } else {

                            obs.hittingGround = null;

                        }
                    });
                });

                if (onGroundObs.length > 0) {

                    onGroundObs.forEach(obs => {

                        obs.onGround();

                    });
                }

                if (movableObs.length > 0) {

                    movableObs.forEach(obs => {

                        obs.tickFall(delta);

                    })
                }
            }
            
            // check player push or climb an obstacle
            if (player.pushingObb) {

                const climbWalls = [];

                this.obstacles.forEach(obs => {

                    if (obs.movable) {

                        obs.triggers.forEach(tri => {

                            if (player.pushingObb.intersectsOBB(tri.obb)) {
                                // console.log(`${tri.name} is pushed`);
                            }

                        });
                    }

                    if (obs.climbable) {

                        obs.walls.forEach(w => {

                            if (w.isOBB) {

                                if (player.pushingObb.intersectsOBB(w.obb)) {
                                    
                                    // console.log(`${w.name} is climbed`);
                                    climbWalls.push(w);

                                }
                            }
                        });
                    }
                });

                if (climbWalls.length === 1 && this.checkWallBelow(player, climbWalls[0])) {

                    const wall = climbWalls[0];

                    // console.log(`${climbWalls[0].name} is climbed`);
                    player.tickClimb(delta, wall);

                }
            }
        });
    }
}

export { SimplePhysics, COR_DEF, FACE_DEF };