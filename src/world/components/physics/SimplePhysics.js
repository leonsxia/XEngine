import { Vector3 } from 'three';
import * as Color from '../basic/colorBase.js';

const COR_DEF = ['leftCor', 'rightCor', 'leftBackCor', 'rightBackCor'];
const FACE_DEF = ['frontFace', 'backFace', 'leftFace', 'rightFace'];

class SimplePhysics {
    players = [];
    floors = []
    walls = [];
    obstacles = [];
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
        })
    }

    checkIntersection(player, plane, delta) {
        let intersect = false;
        let intersectCor = null;

        // set dummy object related to zero position.
        const dummyObject = player.dummyObject;
        const wallMesh = plane.mesh.clone();
        
        wallMesh.position.copy(plane.mesh.localToWorld(new Vector3(0, 0, 0)));
        wallMesh.position.y = 0;
        wallMesh.rotation.x = 0;
        wallMesh.rotation.y = plane.mesh.rotationY;
        wallMesh.rotation.z = 0;
        wallMesh.rotationY = plane.mesh.rotationY;

        dummyObject.position.copy(wallMesh.worldToLocal(player.position.clone()));
        dummyObject.rotation.y = player.rotation.y - plane.mesh.rotationY;
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

        const halfPlayerDepth = Math.max(Math.abs(leftCorVec3.z - rightBackCorVec3.z), Math.abs(rightCorVec3.z - leftBackCorVec3.z)) / 2;
        // const halfPlayerWidth = Math.max(Math.abs(leftCorVec3.x - rightBackCorVec3.x), Math.abs(rightCorVec3.x - leftBackCorVec3.x)) / 2;
        if ((leftCorVec3.z <=0 || rightCorVec3.z <= 0 || leftBackCorVec3.z <= 0 || rightBackCorVec3.z <= 0) 
            && Math.abs(dummyObject.position.z) - halfPlayerDepth <= 0
        ) {
            const halfEdgeLength = plane.width / 2;
            const padding = player.velocity * delta + 0.1;
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
                }
                else if (rightCorVec3.z <= 0 && Math.abs(rightCorVec3.x) <= halfEdgeLength) {
                    player.rightCorIntersects = true;
                    intersectCor = COR_DEF[1]; // right cornor
                }
                else if (leftBackCorVec3.z <= 0 && Math.abs(leftBackCorVec3.x) <= halfEdgeLength) {
                    player.backLeftCorIntersects = true;
                    intersectCor = COR_DEF[2]; // left back cornor
                }
                else if (rightBackCorVec3.z <= 0 && Math.abs(rightBackCorVec3.x) <= halfEdgeLength) {
                    player.backRightCorIntersects = true;
                    intersectCor = COR_DEF[3]; // right back cornor
                }
                intersect = true;
            } 
            else if (Math.abs(dummyObject.position.z - halfPlayerDepth) >  player.velocity * delta) {
                const leftBorderIntersects = plane.leftRay.intersectObject(player.group);
                const rightBorderIntersects = plane.rightRay.intersectObject(player.group);
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

    tick(delta) {
        // if (delta > 0.0333) { // lost frame when fps lower than 30fps
        //     return;
        // }
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
                    wall.checkResult = { intersect: false, borderReach: false }
                }
            });

            if (player.frontFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[0])
            else if (player.backFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[1])
            else if (player.leftFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[2])
            else if (player.rightFaceIntersects) player.setBFColor(Color.intersect, FACE_DEF[3])

            if (collisionedWalls.length === 0) {
                player.tick(delta);
            } else {
                collisionedWalls.forEach(wall => {
                    player.tickWithWall(delta, wall);
                })
            }

            const collisionFloors = [];
            this.floors.forEach(floor => {
                if (player.boundingBox.intersectsBox(floor.boundingBox)) {
                    // to do
                    // player.tickWithFloor(delta, floor);
                    collisionFloors.push(floor);
                }
            });

            if (collisionFloors.length === 0) {
                player.tickFall(delta);
            } else {
                player.onGround(collisionFloors[0]);
            }
        });
    }
}

export { SimplePhysics, COR_DEF, FACE_DEF };