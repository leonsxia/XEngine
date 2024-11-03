import { Object3D, Vector3 } from 'three';
import { COR_DEF, FACE_DEF } from '../physics/SimplePhysics';

const COOLING_TIME = .7;

class Moveable2D {
    #movingLeft = false;
    #movingRight = false;
    #movingForward = false;
    #movingBackward = false;
    #accelerate = false;
    #jump;
    
    #dummyObject = new Object3D();

    #g = 9.8;
    #fallingTime = 0;
    #isFalling = true;

    #isQuickTuring = false;
    #turingRad = 0;
    #coolingT = COOLING_TIME;

    #isClimbingUp = false;
    #isClimbingForward = false;
    #climbHeight = 0;
    #climbDist = 0;
    #climbForwardDist = 0;

    constructor() {
        this.leftCorIntersects = false;
        this.rightCorIntersects = false;
        this.backLeftCorIntersects = false;
        this.backRightCorIntersects = false;
        this.frontFaceIntersects = false;
        this.backFaceIntersects = false;
        this.leftFaceIntersects = false;
        this.rightFaceIntersects = false;
    }

    resetIntersectStatus() {
        this.leftCorIntersects = false;
        this.rightCorIntersects = false;
        this.backLeftCorIntersects = false;
        this.backRightCorIntersects = false;
        this.frontFaceIntersects = false;
        this.backFaceIntersects = false;
        this.leftFaceIntersects = false;
        this.rightFaceIntersects = false;
    }

    movingLeft(val) {
        this.#movingLeft = val;
        // console.log(`[moveable2D]:movingLeft ${this.#movingLeft}`);
    }

    movingRight(val) {
        this.#movingRight = val;
        // console.log(`[moveable2D]:movingRight ${this.#movingRight}`);
    }

    movingForward(val) {
        this.#movingForward = val;
        // console.log(`[moveable2D]:movingForward ${this.#movingForward}`);
    }

    movingBackward(val) {
        this.#movingBackward = val;
        // console.log(`[moveable2D]:movingBackward ${this.#movingBackward}`);
    }

    accelerate(val) {
        this.#accelerate = val;
        // console.log(`[moveable2D]:accelerate ${this.#accelerate}`);
    }

    jump(val) {
        this.#jump = val;
        // console.log(`[moveable2D]:jump ${this.#jump}`);
    }

    get dummyObject() {
        return this.#dummyObject;
    }

    get stopped() {
        return !this.#movingLeft && !this.#movingRight && !this.#movingForward && !this.#movingBackward;
    }

    get isForward() {
        return this.isMovingForward || this.isMovingForwardLeft || this.isMovingForwardRight;
    }

    get isBackward() {
        return this.isMovingBackward || this.isMovingBackwardLeft || this.isMovingBackwardRight;
    }

    get isRotating() {
        return this.isTurnClockwise || this.isTurnCounterClockwise;
    }

    get isTurnCounterClockwise() {
        return this.#movingLeft && !this.#movingForward && !this.#movingBackward;
    }

    get isTurnClockwise() {
        return this.#movingRight && !this.#movingForward && !this.#movingBackward;
    }

    get isMovingForward() {
        return  this.#movingForward && !this.#movingLeft && !this.#movingRight;
    }

    get isMovingBackward() {
        return this.#movingBackward && !this.#movingLeft && !this.#movingRight;
    }

    get isMovingForwardLeft() {
        return this.#movingForward && this.#movingLeft;
    }

    get isMovingForwardRight() {
        return this.#movingForward && this.#movingRight;
    }

    get isMovingBackwardLeft() {
        return this.#movingBackward && this.#movingLeft;
    }

    get isMovingBackwardRight() {
        return this.#movingBackward && this.#movingRight;
    }

    get isAccelerating() {
        return this.#accelerate;
    }

    get isClimbing() {
        return this.#movingForward && this.#jump;
    }

    get isClimbingUp() {
        return this.#isClimbingUp || this.#isClimbingForward;
    }

    get isQuickTuring() {
        return this.isMovingBackward && this.#accelerate;
    }

    get isInAir() {
        return this.#isFalling;
    }

    get isForwardBlock() {
        return (
            (this.leftFaceIntersects && this.rightCorIntersects) ||
            (this.rightFaceIntersects && this.leftCorIntersects) ||
            (this.leftCorIntersects && this.rightCorIntersects) || 
            (this.leftCorIntersects && this.backRightCorIntersects) ||
            (this.rightCorIntersects && this.backLeftCorIntersects) ||
            (this.frontFaceIntersects && (this.isMovingForwardLeft || this.isMovingForwardRight))
        );
    }

    get isBackwardBlock() {
        return (
            (this.rightFaceIntersects && this.backLeftCorIntersects) ||
            (this.leftFaceIntersects && this.backRightCorIntersects) ||
            (this.backRightCorIntersects && this.backLeftCorIntersects) ||
            (this.backRightCorIntersects && this.leftCorIntersects) ||
            (this.backLeftCorIntersects && this.rightCorIntersects) ||
            (this.backFaceIntersects && (this.isMovingBackwardLeft || this.isMovingBackwardRight))
        );
    }

    get isClockwiseBlock() {
        return (
            (this.rightCorIntersects && this.backLeftCorIntersects)
        );
    }

    get isCounterClockwiseBlock() {
        return (
            (this.leftCorIntersects && this.backRightCorIntersects)
        );
    }

    set isInAir(val) {

        this.#isFalling = val;

    }

    resetFallingState() {

        this.#isFalling = false;
        this.#fallingTime = 0;

    }

    fallingTick(params) {
        const { delta, player } = params;

        if (!this.#isClimbingUp && !this.#isClimbingForward) {
            
            const now = this.#fallingTime + delta;
            const deltaY = .5 * this.#g * (now * now - this.#fallingTime * this.#fallingTime);
            player.group.position.y -= deltaY;

            this.#isFalling = true;
            this.#fallingTime = now;
        }
    }

    onHittingBottomTick(params) {

        const {bottomWall, player} = params;

        // when climbing up, need to stop climbing
        if (this.#isClimbingUp) {

            this.resetClimbingState();
            
        }

        const dir = bottomWall.worldPosition.clone();
        dir.y -= player.height * .5;
        player.group.position.y = player.group.parent ? player.group.parent.worldToLocal(dir).y : dir.y;

    }

    onGroundTick(params) {

        const { floor, player } = params;

        const dir = floor.worldPosition.clone();
        const onGroundPadding = .001;
        dir.y += player.height * .5 - onGroundPadding;
        player.group.position.y = player.group.parent ? player.group.parent.worldToLocal(dir).y : dir.y;

        this.resetFallingState();

    }

    onSlopeTick(params) {

        const { slope, player } = params;

        const intersects = [];

        player.rays.forEach(ray => {

            const intersect = ray.intersectObject(slope);
            if (intersect.length > 0) intersects.push(intersect[0]);

        });

        if (intersects.length > 0) {

            intersects.sort((a, b) => {
                return b.point.y - a.point.y;
            });

            const dir = intersects[0].point.clone();
            dir.y += player.height * .5;
            player.group.position.y = player.group.parent ? player.group.parent.worldToLocal(dir).y : dir.y;

            this.resetFallingState();

        }

    }

    quickTurnTick(params) {
        let result = false;
        const { group, delta, player } = params;
        const worldY = player.worldYDirection;

        if (player.enableQuickTurn && !this.#isClimbingUp && !this.#isClimbingForward) {

            if (!this.#isQuickTuring && this.isQuickTuring) {

                this.#isQuickTuring = true;

            }
    
            if (this.#isQuickTuring) {

                if (this.#turingRad < Math.PI) {

                    const ang = player.turnBackVel * delta;

                    // group.rotation.y -= ang;
                    group.rotateOnWorldAxis(worldY, - ang);
                    this.#turingRad += ang;
                    result = true;

                }
                
                if (this.#coolingT <= 0) {

                    this.#isQuickTuring = false;
                    this.#turingRad = 0;
                    this.#coolingT = COOLING_TIME;
    
                } else  {
    
                    this.#coolingT -= delta;
    
                }
            }
        }

        return result;
    }

    resetClimbingState() {

        this.#isClimbingUp = false;
        this.#isClimbingForward = false;
        this.#climbHeight = 0;
        this.#climbDist = 0;
        this.#climbForwardDist = 0;

    }

    climbWallTick(params) {
        const { delta, wall, player } = params;

        if (player.enableClimbing) {

            if (!this.#isClimbingUp && !this.#isClimbingForward && this.isClimbing && !this.#isFalling) {

                console.log(`${player.name} is climbing ${wall.name}`);

                const marginTop = .01;
                const pos = new Vector3(0, wall.height * .5 + marginTop, 0);
                wall.mesh.localToWorld(pos);
                this.#climbHeight = pos.y;
                this.#climbDist = player.depth;

                this.#isClimbingUp = true;

            }

            if (this.#isClimbingUp || this.#isClimbingForward) {

                if (player.bottomY < this.#climbHeight) {

                    player.group.position.y += delta * player.climbingVel;

                } else if (this.#climbForwardDist < this.#climbDist) {

                    this.#isClimbingUp = false;
                    this.#isClimbingForward = true;

                    const dist = delta * player.climbingVel;
                    const dir = new Vector3(0, 0, dist);

                    player.group.position.copy(player.group.localToWorld(dir));

                    this.#climbForwardDist += dist;

                } else {

                    this.resetClimbingState();

                }
            }
        }
    }

    tankmoveTick(params) {
        const { group, R, rotateVel, dist, delta, player } = params;
        let deltaVec3, deltaX, deltaZ;
        const rotateRad = rotateVel * delta;
        const worldY = player.worldYDirection;

        if(this.quickTurnTick(params) || this.#isClimbingUp || this.#isClimbingForward) {
            
            if (this.#isClimbingUp || this.#isClimbingForward) {

                this.climbWallTick(params);

            }

            return;

        }

        if (this.isMovingForward) {

            deltaVec3 = new Vector3(0, 0, dist);
            group.position.copy(group.localToWorld(deltaVec3));

        } else if (this.isMovingBackward) {

            deltaVec3 = new Vector3(0, 0, - dist);
            group.position.copy(group.localToWorld(deltaVec3));

        } else if (this.isTurnClockwise) {

            // group.rotation.y -= rotateRad;
            group.rotateOnWorldAxis(worldY, - rotateRad);

        } else if (this.isTurnCounterClockwise) {

            // group.rotation.y += rotateRad;
            group.rotateOnWorldAxis(worldY, rotateRad);

        } else {

            deltaX = R - R * Math.cos(dist / R);
            deltaZ = R * Math.sin(dist / R);

            if (this.isMovingForwardLeft) {

                deltaVec3 = new Vector3(deltaX, 0, deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                // group.rotation.y += rotateRad;
                group.rotateOnWorldAxis(worldY, rotateRad);

            } else if (this.isMovingForwardRight) {

                deltaVec3 = new Vector3(-deltaX, 0, deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                // group.rotation.y -= rotateRad;
                group.rotateOnWorldAxis(worldY, - rotateRad);

            } else if (this.isMovingBackwardLeft) {

                deltaVec3 = new Vector3(deltaX, 0, -deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                // group.rotation.y -= rotateRad;
                group.rotateOnWorldAxis(worldY, - rotateRad);

            } else if (this.isMovingBackwardRight) {

                deltaVec3 = new Vector3(-deltaX, 0, -deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                // group.rotation.y += rotateRad;
                group.rotateOnWorldAxis(worldY, rotateRad);

            }
        }
    }

    localToWorldBatch(object, positions) {

        positions.forEach(pos => {

            object.localToWorld(pos);

        });
    }

    rotateOffsetCorrection(dummyObject, cornors) {

        const { leftCorVec3, rightCorVec3, leftBackCorVec3, rightBackCorVec3 } = cornors;

        if (leftCorVec3.z <= 0) {

            dummyObject.position.z = dummyObject.position.z - leftCorVec3.z;

        } else if (rightCorVec3.z <= 0) {

            dummyObject.position.z = dummyObject.position.z - rightCorVec3.z;

        } else if (leftBackCorVec3.z <= 0) {

            dummyObject.position.z = dummyObject.position.z - leftBackCorVec3.z;

        } else if (rightBackCorVec3.z <= 0) {

            dummyObject.position.z = dummyObject.position.z - rightBackCorVec3.z;

        }
    }

    rotateOffsetCorrection2(dummyObject, clockWise = true, player) {

        const quickRecoverCoefficient = player.quickRecoverCoefficient;

        if (clockWise) {

            if (
                this.backLeftCorIntersects && this.rightFaceIntersects ||
                this.rightCorIntersects && this.leftFaceIntersects
            ) {

                dummyObject.position.x += quickRecoverCoefficient;

            }

        } else {

            if (
                this.leftCorIntersects && this.rightFaceIntersects ||
                this.backRightCorIntersects && this.leftFaceIntersects
            ) {

                dummyObject.position.x -= quickRecoverCoefficient;

            }

        }
    }

    checkPlayerTowardsWall(player, wall) {

        const wallDir = new Vector3();
        const playerDir = new Vector3();

        wall.getWorldDirection(wallDir);
        player.getWorldDirection(playerDir);

        const isTowards = playerDir.dot(wallDir) > 0 ? false : true;

        return isTowards;

    }

    tankmoveTickWithWall(params) {

        const { group, R, rotateVel, dist, delta, wall, player, playerTicked = false } = params;
        const {
            wallMesh,
            borderReach, leftCorIntersectFace, rightCorIntersectFace, intersectCor,
            cornors: { leftCorVec3, rightCorVec3, leftBackCorVec3, rightBackCorVec3 }
         } = wall.checkResult;

        if (this.quickTurnTick(params) || this.#isClimbingUp) {

            if (this.#isClimbingUp) {

                this.climbWallTick(params);

            }

            return;

        }

        // set dummy object related to zero position.
        const dummyObject = this.dummyObject;

        group.updateWorldMatrix(true, false);

        const wallTransformMtx4 = wallMesh.matrixWorld;
        const wallWorldMatrixInverted = wallMesh.matrixWorld.clone().invert();
        // get player position towards wall local space
        const dummy2WallMtx4 = group.matrixWorld.clone().premultiply(wallWorldMatrixInverted);
        const dummyMatrixInverted = dummyObject.matrix.clone().invert();
        dummyObject.applyMatrix4(dummy2WallMtx4.multiply(dummyMatrixInverted));

        const posY = dummyObject.position.y;

        const recoverCoefficient = player.recoverCoefficient;
        const quickRecoverCoefficient = player.quickRecoverCoefficient;
        const backwardCoefficient = player.backwardCoefficient;
        let deltaVec3, deltaX, deltaZ;
        const rotateRad = rotateVel * delta;

        const worldY = player.worldYDirection;

        // when climb forward has collistion with other walls, need to stop moving forward.
        if (this.#isClimbingForward) {

            if (leftCorVec3.z <= 0 || rightCorVec3.z <= 0) {

                this.resetClimbingState();

            }

            return;
            
        }

        // recover position z when static
        if (
            this.stopped &&
            (
                (intersectCor === COR_DEF[0] && leftCorVec3.z < 0) ||
                (intersectCor === COR_DEF[1] && rightCorVec3.z < 0) ||
                (intersectCor === COR_DEF[2] && leftBackCorVec3.z < 0) ||
                (intersectCor === COR_DEF[3] && rightBackCorVec3.z < 0)
            )
        ) {

            dummyObject.position.z += quickRecoverCoefficient;

        }

        // recover position when reach the wall cornor and is rotating
        if (borderReach && !this.isMovingForward && !this.isMovingBackward) {

            if (rightCorIntersectFace) {

                dummyObject.position.x -= recoverCoefficient;
                dummyObject.position.z += recoverCoefficient;
            
            } else {

                dummyObject.position.x += recoverCoefficient;
                dummyObject.position.z += recoverCoefficient;

            }

        }

        if (this.isMovingForward) {

            deltaVec3 = new Vector3(0, 0, dist);
            const offsetVec3 = dummyObject.localToWorld(deltaVec3);
            offsetVec3.x = playerTicked ? dummyObject.position.x : offsetVec3.x;

            if (!this.isForwardBlock) {

                if (!borderReach) {

                    if (leftCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - leftCorVec3.z);
                        dummyObject.position.copy(dirVec3);
                        // console.log(`left cornor reach`);

                    } else if (rightCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - rightCorVec3.z);
                        dummyObject.position.copy(dirVec3);
                        // console.log(`right cornor reach`);

                    } else {

                        dummyObject.position.copy(offsetVec3);

                    }
                } else if (leftCorIntersectFace !== FACE_DEF[0] && rightCorIntersectFace !== FACE_DEF[0]) {

                    dummyObject.position.copy(offsetVec3);

                    if (leftCorIntersectFace) { // when left or right faces intersect the cornor

                        dummyObject.position.x += recoverCoefficient;
                        // console.log(`left face reach`);


                    } else {

                        dummyObject.position.x -= recoverCoefficient;
                        // console.log(`right face reach`);

                    }
                } else if (leftCorIntersectFace === FACE_DEF[0] || rightCorIntersectFace === FACE_DEF[0]) {

                    dummyObject.position.copy(dummyObject.localToWorld(new Vector3(0, 0, - backwardCoefficient)));
                    // console.log(`front/back face reach`);

                }
            }
        } else if (this.isMovingBackward) {

            deltaVec3 = new Vector3(0, 0, - dist);
            const offsetVec3 = dummyObject.localToWorld(deltaVec3);
            offsetVec3.x = playerTicked ? dummyObject.position.x : offsetVec3.x;

            if (!this.isBackwardBlock) {

                if (!borderReach) {

                    if (rightBackCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - rightBackCorVec3.z);
                        dummyObject.position.copy(dirVec3);

                    } else if (leftBackCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - leftBackCorVec3.z);
                        dummyObject.position.copy(dirVec3);

                    } else {

                        dummyObject.position.copy(offsetVec3);

                    }
                } else if (leftCorIntersectFace !== FACE_DEF[1] && rightCorIntersectFace !== FACE_DEF[1]) {

                    dummyObject.position.copy(offsetVec3);

                    if (leftCorIntersectFace) { // when left or right faces intersect the cornor

                        dummyObject.position.x += recoverCoefficient;

                    } else {

                        dummyObject.position.x -= recoverCoefficient;

                    }
                } else if (leftCorIntersectFace === FACE_DEF[1] || rightCorIntersectFace === FACE_DEF[1]) {

                    dummyObject.position.copy(dummyObject.localToWorld(new Vector3(0, 0, backwardCoefficient)));

                }
            }
        } else if (this.isTurnClockwise) {

            if (!borderReach) {

                this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                this.rotateOffsetCorrection2(dummyObject, true, player);

            }

            // dummyObject.rotation.y -= rotateRad;
            dummyObject.rotateOnWorldAxis(worldY, - rotateRad);

        } else if (this.isTurnCounterClockwise) {

            if (!borderReach) {

                this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                this.rotateOffsetCorrection2(dummyObject, false, player);

            }

            // dummyObject.rotation.y += rotateRad;
            dummyObject.rotateOnWorldAxis(worldY, rotateRad);

        } else {

            deltaX = R - R * Math.cos(dist / R);
            deltaZ = R * Math.sin(dist / R);

            if (this.isMovingForwardLeft || this.isMovingBackwardLeft) {

                deltaVec3 = this.isMovingForwardLeft ? new Vector3(deltaX, 0, deltaZ) : new Vector3(deltaX, 0, - deltaZ);

                const offsetVec3 = dummyObject.localToWorld(deltaVec3);
                offsetVec3.x = playerTicked ? dummyObject.position.x : offsetVec3.x;

                // dummyObject.rotation.y += this.isMovingForwardLeft ? rotateRad : - rotateRad;
                if (this.isMovingForwardLeft) {

                    dummyObject.rotateOnWorldAxis(worldY, rotateRad);

                } else {

                    dummyObject.rotateOnWorldAxis(worldY, - rotateRad);

                }

                if (!borderReach) {

                    if (this.isForwardBlock || this.isBackwardBlock) {

                        this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);
                        
                    } else if (rightCorVec3.z <= 0 && this.isMovingForwardLeft) {

                        const newVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - rightCorVec3.z);
                        dummyObject.position.copy(newVec3);

                    } else if (leftCorVec3.z <= 0 && this.isMovingForwardLeft) {

                        const newVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - leftCorVec3.z);
                        dummyObject.position.copy(newVec3);

                    } else if (rightBackCorVec3.z <= 0 && this.isMovingBackwardLeft) {

                        const newVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - rightBackCorVec3.z);
                        dummyObject.position.copy(newVec3);

                    } else if (leftBackCorVec3.z <= 0 && this.isMovingBackwardLeft) {

                        const newVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - leftBackCorVec3.z);
                        dummyObject.position.copy(newVec3);

                    } else {

                        dummyObject.position.copy(offsetVec3);

                    }

                    if (this.isMovingBackwardLeft) {
                        
                        this.rotateOffsetCorrection2(dummyObject, true, player);

                    } else if (this.isMovingForwardLeft) {
                        
                        this.rotateOffsetCorrection2(dummyObject, false, player);

                    }
                }
            } else if (this.isMovingForwardRight || this.isMovingBackwardRight) {

                deltaVec3 = this.isMovingForwardRight ? new Vector3(- deltaX, 0, deltaZ) : new Vector3(- deltaX, 0, - deltaZ);

                const offsetVec3 = dummyObject.localToWorld(deltaVec3);
                offsetVec3.x = playerTicked ? dummyObject.position.x : offsetVec3.x;

                // dummyObject.position.copy(offsetVec3);
                // dummyObject.rotation.y += this.isMovingForwardRight ? - rotateRad : rotateRad;
                if (this.isMovingForwardRight) {

                    dummyObject.rotateOnWorldAxis(worldY, - rotateRad);

                } else {

                    dummyObject.rotateOnWorldAxis(worldY, rotateRad);
                    
                }

                if (!borderReach) {

                    if (this.isForwardBlock || this.isBackwardBlock) {

                        this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                    } else if (leftCorVec3.z <= 0 && this.isMovingForwardRight) {

                        const newVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - leftCorVec3.z);
                        dummyObject.position.copy(newVec3);

                    } else if (rightCorVec3.z <= 0 && this.isMovingForwardRight) {

                        const newVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - rightCorVec3.z);
                        dummyObject.position.copy(newVec3);

                    } else if (leftBackCorVec3.z <= 0 && this.isMovingBackwardRight) {

                        const newVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - leftBackCorVec3.z);
                        dummyObject.position.copy(newVec3);

                    } else if (rightBackCorVec3.z <= 0 && this.isMovingBackwardRight) {

                        const newVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - rightBackCorVec3.z);
                        dummyObject.position.copy(newVec3);

                    } else {

                        dummyObject.position.copy(offsetVec3);

                    }

                    if (this.isMovingForwardRight) {

                        this.rotateOffsetCorrection2(dummyObject, true, player);

                    } else if (this.isMovingBackwardRight) {

                        this.rotateOffsetCorrection2(dummyObject, false, player);

                    }
                }
            }
        }

        // transfer dummy to group world position.
        dummyObject.updateMatrix();

        const recoverMtx4 = dummyObject.matrix.clone().premultiply(wallTransformMtx4);

        const playerMatrixInverted = group.matrix.invert();
        const playerWorldMatrixInvterted = group.parent.matrixWorld.invert();
        // follow the euquition:
        // parentWorldMatirx * localMatrix = recoverMtx4 => localMatrix = parentWorldMatrix.invert() * recoverMtx4
        group.applyMatrix4(playerWorldMatrixInvterted.multiply(recoverMtx4.multiply(playerMatrixInverted)));

    }
}

export { Moveable2D };