import { Object3D, Vector3 } from 'three';
import { COR_DEF, FACE_DEF } from '../physics/SimplePhysics';

class Moveable2D {
    #movingLeft = false;
    #movingRight = false;
    #movingForward = false;
    #movingBackward = false;
    #accelerate = false;
    #dummyObject = new Object3D();

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
            (intersectCor === COR_DEF[3] && this.leftCorIntersects)
        );
    }

    isBackwardBlock(intersectCor) {
        return (
            (this.rightFaceIntersects && this.backLeftCorIntersects) ||
            (this.leftFaceIntersects && this.backRightCorIntersects) ||
            (intersectCor === COR_DEF[1] && this.backLeftCorIntersects) ||
            (intersectCor === COR_DEF[0] && this.backRightCorIntersects)
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

    tankmoveTick(params) {
        const { group, R, rotateVel, dist, delta } = params;
        let deltaVec3, deltaX, deltaZ; 
        if (this.isMovingForward) {
            deltaVec3 = new Vector3(0, 0, dist);
            group.position.copy(group.localToWorld(deltaVec3));
        } else if (this.isMovingBackward) {
            const deltaVec3 = new Vector3(0, 0, -dist);
            group.position.copy(group.localToWorld(deltaVec3));
        } else if (this.isTurnClockwise) {
            group.rotation.y -= rotateVel * delta;
        } else if (this.isTurnCounterClockwise) {
            group.rotation.y += rotateVel * delta;
        } else {
            deltaX = R - R * Math.cos(dist / R);
            deltaZ = R * Math.sin(dist / R);
            if (this.isMovingForwardLeft) {
                deltaVec3 = new Vector3(deltaX, 0, deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                group.rotation.y += rotateVel * delta;
            } else if (this.isMovingForwardRight) {
                deltaVec3 = new Vector3(-deltaX, 0, deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                group.rotation.y -= rotateVel * delta;
            } else if (this.isMovingBackwardLeft) {
                deltaVec3 = new Vector3(deltaX, 0, -deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                group.rotation.y -= rotateVel * delta;
            } else if (this.isMovingBackwardRight) {
                deltaVec3 = new Vector3(-deltaX, 0, -deltaZ);
                group.position.copy(group.localToWorld(deltaVec3));
                group.rotation.y += rotateVel * delta;
            }
        }
    }

    localToWorldBatch(object, positions) {
        positions.forEach(pos => {
            object.localToWorld(pos);
        });
    }

    tankmoveTickWithWall(params) {

        if (
            ((this.isMovingForwardLeft || this.isMovingBackwardRight || this.isTurnCounterClockwise) && this.isCounterClockwiseBlock) ||
            ((this.isMovingForwardRight || this.isMovingBackwardLeft || this.isTurnClockwise) && this.isClockwiseBlock)
        ) {
            return;
        }

        const { group, R, rotateVel, dist, delta, wall } = params;
        const {
            wallMesh,
            borderReach, leftCorIntersectFace, rightCorIntersectFace, intersectCor,
            cornors: { leftCorVec3, rightCorVec3, leftBackCorVec3, rightBackCorVec3 }
         } = wall.checkResult;

        // set dummy object related to zero position.
        const dummyObject = this.dummyObject;
        dummyObject.position.copy(wallMesh.worldToLocal(group.position.clone()));
        dummyObject.rotation.y = group.rotation.y - wallMesh.rotationY;
        dummyObject.scale.copy(group.scale);

        const recoverCoefficient = this.recoverCoefficient;
        const backwardCoefficient = this.backwardCoefficient;
        let deltaVec3, deltaX, deltaZ;

        if (this.isMovingForward) {
            const deltaVec3 = new Vector3(0, 0, dist);
            const offsetVec3 = dummyObject.localToWorld(deltaVec3);
            if (!this.isForwardBlock(intersectCor)) {
                if (!borderReach) {
                    if (leftCorVec3.z <= 0) {
                        const dirVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - leftCorVec3.z);
                        dummyObject.position.copy(dirVec3);
                    } else if (rightCorVec3.z <= 0) {
                        const dirVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - rightCorVec3.z);
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
            }
        } else if (this.isMovingBackward) {
            const deltaVec3 = new Vector3(0, 0, - dist);
            const offsetVec3 = dummyObject.localToWorld(deltaVec3);
            if (!this.isBackwardBlock(intersectCor)) {
                if (!borderReach) {
                    if (rightBackCorVec3.z <= 0) {
                        const dirVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - rightBackCorVec3.z);
                        dummyObject.position.copy(dirVec3);
                    } else if (leftBackCorVec3.z <= 0) {
                        const dirVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - leftBackCorVec3.z);
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
                if (leftCorVec3.z <= 0) {
                    dummyObject.position.z = dummyObject.position.z - leftCorVec3.z;
                } else if (rightCorVec3.z <= 0) {
                    dummyObject.position.z = dummyObject.position.z - rightCorVec3.z;
                } else if (leftBackCorVec3.z <= 0) {
                    dummyObject.position.z = dummyObject.position.z - leftBackCorVec3.z;
                } else if (rightBackCorVec3.z <= 0) {
                    dummyObject.position.z = dummyObject.position.z - rightBackCorVec3.z;
                }

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
            dummyObject.rotation.y -= rotateVel * delta;
        } else if (this.isTurnCounterClockwise) {
            if (!borderReach) {
                if (rightCorVec3.z <= 0) {
                    dummyObject.position.z = dummyObject.position.z - rightCorVec3.z;
                } else if (leftCorVec3.z <= 0) {
                    dummyObject.position.z = dummyObject.position.z - leftCorVec3.z;
                } else if (rightBackCorVec3.z <= 0) {
                    dummyObject.position.z = dummyObject.position.z - rightBackCorVec3.z;
                } else if (leftBackCorVec3.z <= 0) {
                    dummyObject.position.z = dummyObject.position.z - leftBackCorVec3.z;
                }

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
            dummyObject.rotation.y += rotateVel * delta;
        } else {
            deltaX = R - R * Math.cos(dist / R);
            deltaZ = R * Math.sin(dist / R);
            if (this.isMovingForwardLeft || this.isMovingBackwardLeft) {
                deltaVec3 = this.isMovingForwardLeft ? new Vector3(deltaX, 0, deltaZ) : new Vector3(deltaX, 0, - deltaZ);
                const offsetVec3 = dummyObject.localToWorld(deltaVec3);
                // dummyObject.position.copy(offsetVec3);
                dummyObject.rotation.y += this.isMovingForwardLeft ? rotateVel * delta : - rotateVel * delta;
                if (!borderReach) {
                    if (rightCorVec3.z <= 0) {
                        const newVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - rightCorVec3.z);
                        dummyObject.position.copy(newVec3);
                    } else if (leftCorVec3.z <= 0) {
                        const newVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - leftCorVec3.z);
                        dummyObject.position.copy(newVec3);
                    } else if (rightBackCorVec3.z <= 0) {
                        const newVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - rightBackCorVec3.z);
                        dummyObject.position.copy(newVec3);
                    } else if (leftBackCorVec3.z <= 0) {
                        const newVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - leftBackCorVec3.z);
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
                dummyObject.rotation.y += this.isMovingForwardRight ? - rotateVel * delta : rotateVel * delta;
                if (!borderReach) {
                    if (leftCorVec3.z <= 0) {
                        const newVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - leftCorVec3.z);
                        dummyObject.position.copy(newVec3);
                    } else if (rightCorVec3.z <= 0) {
                        const newVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - rightCorVec3.z);
                        dummyObject.position.copy(newVec3);
                    } else if (leftBackCorVec3.z <= 0) {
                        const newVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - leftBackCorVec3.z);
                        dummyObject.position.copy(newVec3);
                    } else if (rightBackCorVec3.z <= 0) {
                        const newVec3 = new Vector3(offsetVec3.x, 0, dummyObject.position.z - rightBackCorVec3.z);
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