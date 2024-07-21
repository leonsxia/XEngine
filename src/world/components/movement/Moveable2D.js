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
    #isFalling = false;

    #isQuickTuring = false;
    #turingRad = 0;
    #coolingT = COOLING_TIME;
    #canForward = false;
    #canBackward = false;

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

    resetItersectStatus() {
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

    get isQuickTuring() {
        return this.#movingBackward && this.#accelerate;
    }

    isForwardBlock(intersectCor) {
        return (
            (this.leftFaceIntersects && this.rightCorIntersects) ||
            (this.rightFaceIntersects && this.leftCorIntersects) ||
            (intersectCor === COR_DEF[2] && this.rightCorIntersects) ||
            (intersectCor === COR_DEF[3] && this.leftCorIntersects) ||
            (this.leftCorIntersects && this.rightCorIntersects) || 
            (this.leftCorIntersects && this.backRightCorIntersects) ||
            (this.rightCorIntersects && this.backLeftCorIntersects) ||
            (this.frontFaceIntersects && (this.isMovingForwardLeft || this.isMovingForwardRight))
        );
    }

    isBackwardBlock(intersectCor) {
        return (
            (this.rightFaceIntersects && this.backLeftCorIntersects) ||
            (this.leftFaceIntersects && this.backRightCorIntersects) ||
            (intersectCor === COR_DEF[1] && this.backLeftCorIntersects) ||
            (intersectCor === COR_DEF[0] && this.backRightCorIntersects) ||
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

    onGroundTick(params) {
        const { floor, player } = params;

        const dir = floor.worldPosition.clone();
        dir.y += player.height * .5;
        player.group.position.y = player.group.parent ? player.group.parent.worldToLocal(dir).y : dir.y;

        this.#isFalling = false;
        this.#fallingTime = 0;
    }

    quickTurnTick(params) {
        let result = false;
        const { group, delta, player } = params;

        if (player.enableQuickTurn && !this.#isClimbingUp && !this.#isClimbingForward) {

            if (!this.#isQuickTuring && this.isQuickTuring) {

                this.#isQuickTuring = true;

                if (this.#canForward) {

                    this.#canForward = false;
                    this.#canBackward = true;

                } else if (this.#canBackward) {

                    this.#canBackward = false;
                    this.#canForward = true;

                }
            }
    
            if (this.#isQuickTuring) {

                if (this.#turingRad < Math.PI) {

                    const ang = player.turnBackVel * delta;

                    group.rotation.y -= ang;
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

                    this.#isClimbingUp = false;
                    this.#isClimbingForward = false;
                    this.#climbHeight = 0;
                    this.#climbDist = 0;
                    this.#climbForwardDist = 0;

                }
            }
        }
    }

    tankmoveTick(params) {
        const { group, R, rotateVel, dist, delta } = params;
        let deltaVec3, deltaX, deltaZ;
        const rotateRad = rotateVel * delta;

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

            const deltaVec3 = new Vector3(0, 0, -dist);
            group.position.copy(group.localToWorld(deltaVec3));

        } else if (this.isTurnClockwise) {

            group.rotation.y -= rotateRad;

        } else if (this.isTurnCounterClockwise) {

            group.rotation.y += rotateRad;

        } else {

            deltaX = R - R * Math.cos(dist / R);
            deltaZ = R * Math.sin(dist / R);

            if (this.isMovingForwardLeft) {

                deltaVec3 = new Vector3(deltaX, 0, deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                group.rotation.y += rotateRad;

            } else if (this.isMovingForwardRight) {

                deltaVec3 = new Vector3(-deltaX, 0, deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                group.rotation.y -= rotateRad;

            } else if (this.isMovingBackwardLeft) {

                deltaVec3 = new Vector3(deltaX, 0, -deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                group.rotation.y -= rotateRad;

            } else if (this.isMovingBackwardRight) {

                deltaVec3 = new Vector3(-deltaX, 0, -deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                group.rotation.y += rotateRad;

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

    tankmoveTickWithWall(params) {
        const { group, R, rotateVel, dist, delta, wall, player } = params;
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

        dummyObject.position.copy(wallMesh.worldToLocal(group.position.clone()));
        dummyObject.rotation.y = group.rotation.y - wallMesh.rotation.y;
        dummyObject.scale.copy(group.scale);

        const posY = dummyObject.position.y;

        const recoverCoefficient = player.recoverCoefficient;
        const backwardCoefficient = player.backwardCoefficient;
        let deltaVec3, deltaX, deltaZ;
        const rotateRad = rotateVel * delta;

        // when climb forward has collistion will other walls, need to stop moving forward.
        if (this.#isClimbingForward) {

            if (leftCorVec3.z <= 0 || rightCorVec3.z <= 0) {

                this.#isClimbingUp = false;
                this.#isClimbingForward = false;
                this.#climbHeight = 0;
                this.#climbDist = 0;
                this.#climbForwardDist = 0;

            }

            dummyObject.position.copy(dummyObject.localToWorld(new Vector3(0, 0, - backwardCoefficient)));

            group.position.copy(wallMesh.localToWorld(dummyObject.position.clone()));
            group.rotation.y = dummyObject.rotation.y + wallMesh.rotation.y;

            return;
            
        }

        if (!this.isForwardBlock(intersectCor) && !this.isBackwardBlock(intersectCor) && 
            (this.#movingForward || ((!this.enableQuickTurn || !this.#accelerate) && this.#movingBackward))) {

            this.#canForward = false;
            this.#canBackward = false;

        }

        if (this.isMovingForward) {

            const deltaVec3 = new Vector3(0, 0, dist);
            const offsetVec3 = dummyObject.localToWorld(deltaVec3);

            if (!this.isForwardBlock(intersectCor) || this.#canForward) {

                if (!borderReach) {

                    if (leftCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - leftCorVec3.z);
                        dummyObject.position.copy(dirVec3);

                    } else if (rightCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, posY, dummyObject.position.z - rightCorVec3.z);
                        dummyObject.position.copy(dirVec3);

                    } else {

                        dummyObject.position.copy(offsetVec3);

                    }
                } else if (leftCorIntersectFace !== FACE_DEF[0] && rightCorIntersectFace !== FACE_DEF[0]) {

                    dummyObject.position.copy(offsetVec3);

                    if (leftCorIntersectFace) { // when left or right faces intersect the cornor

                        dummyObject.position.x += recoverCoefficient;

                    } else {

                        dummyObject.position.x -= recoverCoefficient;

                    }
                } else if (leftCorIntersectFace === FACE_DEF[0] || rightCorIntersectFace === FACE_DEF[0]) {

                    dummyObject.position.copy(dummyObject.localToWorld(new Vector3(0, 0, - backwardCoefficient)));

                }
            } else {

                this.#canForward = false;
                this.#canBackward = true;

            }
        } else if (this.isMovingBackward) {

            const deltaVec3 = new Vector3(0, 0, - dist);
            const offsetVec3 = dummyObject.localToWorld(deltaVec3);

            if (!this.isBackwardBlock(intersectCor) || this.#canBackward) {

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
            } else {

                this.#canBackward = false;
                this.#canForward = true;

            }
        } else if (this.isTurnClockwise) {

            if (!borderReach) {

                this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                if (
                    (this.rightCorIntersects && this.leftFaceIntersects) ||
                    (this.backLeftCorIntersects && this.rightFaceIntersects)
                ) {

                    dummyObject.position.x += recoverCoefficient;

                }
            } else {

                if (rightCorIntersectFace) dummyObject.position.x -= recoverCoefficient;
                else dummyObject.position.x += recoverCoefficient;

            }

            dummyObject.rotation.y -= rotateRad;

        } else if (this.isTurnCounterClockwise) {

            if (!borderReach) {

                this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                if (
                    (this.backRightCorIntersects && this.leftFaceIntersects) || 
                    (this.leftCorIntersects && this.rightFaceIntersects)
                ) {

                    dummyObject.position.x -= recoverCoefficient;

                }
            } else {

                if (leftCorIntersectFace) dummyObject.position.x += recoverCoefficient;
                else dummyObject.position.x -= recoverCoefficient;

            }

            dummyObject.rotation.y += rotateRad;

        } else {

            deltaX = R - R * Math.cos(dist / R);
            deltaZ = R * Math.sin(dist / R);

            if (this.isMovingForwardLeft || this.isMovingBackwardLeft) {

                deltaVec3 = this.isMovingForwardLeft ? new Vector3(deltaX, 0, deltaZ) : new Vector3(deltaX, 0, - deltaZ);

                const offsetVec3 = dummyObject.localToWorld(deltaVec3);

                // dummyObject.position.copy(offsetVec3);
                dummyObject.rotation.y += this.isMovingForwardLeft ? rotateRad : - rotateRad;

                if (!borderReach) {

                    if (this.isForwardBlock() || this.isBackwardBlock()) {

                        if (this.isMovingForwardLeft) {

                            this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                        }
                        else if (this.isMovingBackwardLeft) {

                            this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                        }
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

                    if (this.backLeftCorIntersects && this.rightFaceIntersects && this.isMovingBackwardLeft) {
                        
                        dummyObject.position.x += recoverCoefficient;

                    } else if (this.leftCorIntersects && this.rightFaceIntersects && this.isMovingForwardLeft) {
                        
                        dummyObject.position.x -= recoverCoefficient;

                    }
                } else {

                    if (leftCorIntersectFace) dummyObject.position.x += recoverCoefficient;
                    else dummyObject.position.x -= recoverCoefficient;

                }
            } else if (this.isMovingForwardRight || this.isMovingBackwardRight) {

                deltaVec3 = this.isMovingForwardRight ? new Vector3(- deltaX, 0, deltaZ) : new Vector3(- deltaX, 0, - deltaZ);

                const offsetVec3 = dummyObject.localToWorld(deltaVec3);

                // dummyObject.position.copy(offsetVec3);
                dummyObject.rotation.y += this.isMovingForwardRight ? - rotateRad : rotateRad;

                if (!borderReach) {

                    if (this.isForwardBlock() || this.isBackwardBlock()) {

                        if (this.isMovingForwardRight) {

                            this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                        }
                        else if (this.isMovingBackwardRight) {

                            this.rotateOffsetCorrection(dummyObject, wall.checkResult.cornors);

                        }
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

                    if (this.rightCorIntersects && this.leftFaceIntersects && this.isMovingForwardRight) {

                        dummyObject.position.x += recoverCoefficient;

                    } else if (this.backRightCorIntersects && this.leftFaceIntersects && this.isMovingBackwardRight) {

                        dummyObject.position.x -= recoverCoefficient;

                    }
                } else {

                    if (leftCorIntersectFace) dummyObject.position.x += recoverCoefficient;
                    else dummyObject.position.x -= recoverCoefficient;

                }
            }
        }

        // transfer dummy to group world position.
        group.position.copy(wallMesh.localToWorld(dummyObject.position.clone()));
        group.rotation.y = dummyObject.rotation.y + wallMesh.rotation.y;
    }
}

export { Moveable2D };