import { Object3D, Vector3 } from 'three';
import { COR_DEF, FACE_DEF } from '../physics/SimplePhysics';

const COOLING_TIME = .7;

class Moveable2D {
    #movingLeft = false;
    #movingRight = false;
    #movingForward = false;
    #movingBackward = false;
    #accelerate = false;
    #dummyObject = new Object3D();
    #isQuickTuring = false;
    #turingRad = 0;
    #coolingT = COOLING_TIME;
    #canForward = false;
    #canBackward = false;

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

    quickTurnTick(params) {
        let result = false;
        const { group, delta } = params;

        if (this.enableQuickTurn) {

            if (!this.#isQuickTuring && this.#movingBackward && this.#accelerate) {
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
                    const ang = this.turnBackVel * delta;
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

    tankmoveTick(params) {
        const { group, R, rotateVel, dist, delta } = params;
        let deltaVec3, deltaX, deltaZ;
        const rotateRad = rotateVel * delta;

        if(this.quickTurnTick(params)) {
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
        const { group, R, rotateVel, dist, delta, wall } = params;
        const {
            wallMesh,
            borderReach, leftCorIntersectFace, rightCorIntersectFace, intersectCor,
            cornors: { leftCorVec3, rightCorVec3, leftBackCorVec3, rightBackCorVec3 }
         } = wall.checkResult;

        if (this.quickTurnTick(params)) {
            return;
        }

        // set dummy object related to zero position.
        const dummyObject = this.dummyObject;
        dummyObject.position.copy(wallMesh.worldToLocal(group.position.clone()));
        dummyObject.rotation.y = group.rotation.y - wallMesh.rotationY;
        dummyObject.scale.copy(group.scale);
        const posY = dummyObject.position.y;

        const recoverCoefficient = this.recoverCoefficient;
        const backwardCoefficient = this.backwardCoefficient;
        let deltaVec3, deltaX, deltaZ;
        const rotateRad = rotateVel * delta;

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
        group.position.copy(wallMesh.localToWorld(dummyObject.position.clone()));
        group.rotation.y = dummyObject.rotation.y + wallMesh.rotationY;
    }
}

export { Moveable2D };