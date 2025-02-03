import { Object3D, Quaternion, Vector3 } from 'three';
import { COR_DEF, FACE_DEF } from '../physics/SimplePhysics';
import { Logger } from '../../systems/Logger';

const COOLING_TIME = .7;
const DEBUG = true;

class Moveable2D {
    #movingLeft = false;
    #movingRight = false;
    #movingForward = false;
    #movingBackward = false;
    #accelerate = false;
    #jump;
    #melee;
    #interact;
    #gunPoint;
    #shoot;
    
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

    #logger = new Logger(DEBUG, 'Moveable2D');

    _deltaV3 = new Vector3();
    _worldDeltaV3 = new Vector3();

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
        // this.#logger.log(`[moveable2D]:movingLeft ${this.#movingLeft}`);
    }

    movingRight(val) {
        this.#movingRight = val;
        // this.#logger.log(`movingRight ${this.#movingRight}`);
    }

    movingForward(val) {
        this.#movingForward = val;
        // this.#logger.log(`movingForward ${this.#movingForward}`);
    }

    movingBackward(val) {
        this.#movingBackward = val;
        // this.#logger.log(`movingBackward ${this.#movingBackward}`);
    }

    accelerate(val) {
        this.#accelerate = val;
        // this.#logger.log(`accelerate ${this.#accelerate}`);
    }

    jump(val) {
        this.#jump = val;
        // this.#logger.log(`jump ${this.#jump}`);
    }

    melee(val) {
        this.#melee = val;
        // this.#logger.log(`melee ${this.#melee}`);
    }

    gunPoint(val) {
        this.#gunPoint = val;
        // this.#logger.log(`gunPoint ${this.#gunPoint}`);
    }

    shoot(val) {
        this.#shoot = val;
        // this.#logger.log(`shoot ${this.#shoot}`);
    }

    interact(val) {
        this.#interact = val;
        // this.#logger.log(`interact ${this.#interact}`);
    }

    // animation state
    get forward() {
        return this.#movingForward;
    }

    get backward() {
        return this.#movingBackward;
    }

    get turningLeft() {
        return this.#movingLeft;
    }

    get turningRight() {
        return this.#movingRight;
    }

    get rotating() {
        return this.turningLeft || this.turningRight;
    }

    get accelerating() {
        return this.#accelerate;
    }

    get meleeing() {
        return this.#melee;
    }

    get gunPointing() {
        return this.#gunPoint;
    }

    get shooting() {
        return this.#shoot;
    }

    get attacking() {
        return this.#melee || this.#gunPoint || this.#shoot;
    }

    get interacting() {
        return this.#interact;
    }
    // animation state

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
        return (this.#movingLeft && !this.#movingForward && !this.#movingBackward) || (this.#movingLeft && (this.#melee || this.#gunPoint)) && !this.#interact;
    }

    get isTurnClockwise() {
        return (this.#movingRight && !this.#movingForward && !this.#movingBackward) || (this.#movingRight && (this.#melee || this.#gunPoint)) && !this.#interact;
    }

    get isMovingForward() {
        return  this.#movingForward && !this.#movingLeft && !this.#movingRight && !this.isActing;
    }

    get isMovingBackward() {
        return this.#movingBackward && !this.#movingLeft && !this.#movingRight && !this.isActing;
    }

    get isMovingForwardLeft() {
        return this.#movingForward && this.#movingLeft && !this.isActing;
    }

    get isMovingForwardRight() {
        return this.#movingForward && this.#movingRight && !this.isActing;
    }

    get isMovingBackwardLeft() {
        return this.#movingBackward && this.#movingLeft && !this.isActing;
    }

    get isMovingBackwardRight() {
        return this.#movingBackward && this.#movingRight && !this.isActing;
    }

    get isAccelerating() {
        return this.#accelerate;
    }

    get isMeleeing() {
        return this.#melee;
    }

    get isGunPointing() {
        return this.#gunPoint;
    }

    get isInteracting() {
        return this.#interact;
    }

    get isClimbing() {
        return this.isMovingForward && this.#jump;
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

    get isActing() {
        return this.#melee || this.#gunPoint || this.#interact;
    }

    get isForwardBlock() {
        return (
            (this.leftFaceIntersects && this.rightCorIntersects) ||
            (this.rightFaceIntersects && this.leftCorIntersects) ||
            (this.leftCorIntersects && this.rightCorIntersects) || 
            (this.leftCorIntersects && this.backRightCorIntersects) ||
            (this.rightCorIntersects && this.backLeftCorIntersects) ||
            (this.frontFaceIntersects && (this.isMovingForwardLeft || this.isMovingForwardRight)) ||
            (this.frontFaceIntersects && (this.leftFaceIntersects || this.rightFaceIntersects))
        );
    }

    get isBackwardBlock() {
        return (
            (this.rightFaceIntersects && this.backLeftCorIntersects) ||
            (this.leftFaceIntersects && this.backRightCorIntersects) ||
            (this.backRightCorIntersects && this.backLeftCorIntersects) ||
            (this.backRightCorIntersects && this.leftCorIntersects) ||
            (this.backLeftCorIntersects && this.rightCorIntersects) ||
            (this.backFaceIntersects && (this.isMovingBackwardLeft || this.isMovingBackwardRight)) ||
            (this.backFaceIntersects && (this.leftFaceIntersects || this.rightFaceIntersects))
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

                this.#logger.log(`${player.name} is climbing ${wall.name}`);

                const marginTop = .01;
                const pos = new Vector3(0, wall.height * .5 + marginTop, 0);
                wall.mesh.localToWorld(pos);
                this.#climbHeight = pos.y;
                this.#climbDist = player.boundingBoxMesh.geometry.parameters.depth;

                this.#isClimbingUp = true;

                // only climb once
                this.#jump = false;

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

    resetDeltaV3() {

        this._deltaV3.set(0, 0, 0);

    }

    resetWorldDeltaV3() {
        
        this._worldDeltaV3.set(0, 0, 0);

    }

    rotateOffsetCorrection(dummyObject, cornors) {

        const { leftCorVec3, rightCorVec3, leftBackCorVec3, rightBackCorVec3 } = cornors;

        if (leftCorVec3.z <= 0) {

            // dummyObject.position.z = dummyObject.position.z - leftCorVec3.z;
            this._deltaV3.add(new Vector3(0, 0, - leftCorVec3.z));

        } else if (rightCorVec3.z <= 0) {

            // dummyObject.position.z = dummyObject.position.z - rightCorVec3.z;
            this._deltaV3.add(new Vector3(0, 0, - rightCorVec3.z));

        } else if (leftBackCorVec3.z <= 0) {

            // dummyObject.position.z = dummyObject.position.z - leftBackCorVec3.z;
            this._deltaV3.add(new Vector3(0, 0, - leftBackCorVec3.z));

        } else if (rightBackCorVec3.z <= 0) {

            // dummyObject.position.z = dummyObject.position.z - rightBackCorVec3.z;
            this._deltaV3.add(new Vector3(0, 0, - rightBackCorVec3.z));

        }
    }

    rotateOffsetCorrection2(dummyObject, clockWise = true, player) {

        const quickRecoverCoefficient = player.quickRecoverCoefficient;

        if (clockWise) {

            if (
                this.backLeftCorIntersects && this.rightFaceIntersects ||
                this.rightCorIntersects && this.leftFaceIntersects
            ) {

                // dummyObject.position.x += quickRecoverCoefficient;
                this._deltaV3.add(new Vector3(quickRecoverCoefficient, 0, 0));

            }

        } else {

            if (
                this.leftCorIntersects && this.rightFaceIntersects ||
                this.backRightCorIntersects && this.leftFaceIntersects
            ) {

                // dummyObject.position.x -= quickRecoverCoefficient;
                this._deltaV3.add(new Vector3(- quickRecoverCoefficient, 0, 0));

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

        // const posY = dummyObject.position.y;

        const recoverCoefficient = player.recoverCoefficient;
        const quickRecoverCoefficient = player.quickRecoverCoefficient;
        const backwardCoefficient = player.backwardCoefficient;
        let deltaVec3, deltaX, deltaZ;
        const rotateRad = rotateVel * delta;

        const worldY = player.worldYDirection;

        const transformBack = () => {

            // transfer dummy to group world position.
            dummyObject.updateMatrix();

            const recoverMtx4 = dummyObject.matrix.clone().premultiply(wallTransformMtx4);

            // add delta position transfer to worldDeltaV3
            // console.log(`deltaV3:${this._deltaV3.x}, ${this._deltaV3.y}, ${this._deltaV3.z}`);
            const wallWorldQuat = new Quaternion(); 
            wallMesh.getWorldQuaternion(wallWorldQuat);
            this._worldDeltaV3.add(this._deltaV3.applyQuaternion(wallWorldQuat));

            const playerMatrixInverted = group.matrix.invert();
            const playerWorldMatrixInvterted = group.parent.matrixWorld.invert();
            // follow the euquition:
            // parentWorldMatirx * localMatrix = recoverMtx4 => localMatrix = parentWorldMatrix.invert() * recoverMtx4
            group.applyMatrix4(playerWorldMatrixInvterted.multiply(recoverMtx4.multiply(playerMatrixInverted)));

        }

        // when climb forward has collistion with other walls, need to stop moving forward.
        if (this.#isClimbingForward) {

            if (leftCorVec3.z <= 0 || rightCorVec3.z <= 0) {

                this.resetClimbingState();
                return;

            }

            this.climbWallTick(params);
            return;
            
        }

        this.resetDeltaV3();

        // recover position z when static
        if (this.stopped) {

            if (
                (intersectCor === COR_DEF[0] && leftCorVec3.z < 0) ||
                (intersectCor === COR_DEF[1] && rightCorVec3.z < 0) ||
                (intersectCor === COR_DEF[2] && leftBackCorVec3.z < 0) ||
                (intersectCor === COR_DEF[3] && rightBackCorVec3.z < 0)
            ) {

                // dummyObject.position.z += quickRecoverCoefficient;
                this._deltaV3.add(new Vector3(0, 0, quickRecoverCoefficient));
                
            }

            if (leftCorIntersectFace?.includes(FACE_DEF[0]) || rightCorIntersectFace?.includes(FACE_DEF[0])) {
    
                // dummyObject.position.copy(dummyObject.localToWorld(new Vector3(0, 0, - backwardCoefficient)));
                this._deltaV3.add(dummyObject.localToWorld(new Vector3(0, 0, - backwardCoefficient)).sub(dummyObject.position));
                
            } else if (leftCorIntersectFace?.includes(FACE_DEF[1]) || rightCorIntersectFace?.includes(FACE_DEF[1])) {

                // dummyObject.position.copy(dummyObject.localToWorld(new Vector3(0, 0, backwardCoefficient)));
                this._deltaV3.add(dummyObject.localToWorld(new Vector3(0, 0, backwardCoefficient)).sub(dummyObject.position));
                
            }

        } else if (borderReach && !this.isMovingForward && !this.isMovingBackward) {
            // recover position when reach the wall cornor and is rotating
            if (rightCorIntersectFace) {

                // dummyObject.position.x -= recoverCoefficient;
                // dummyObject.position.z += recoverCoefficient;
                this._deltaV3.add(new Vector3(- recoverCoefficient, 0, recoverCoefficient));
            
            } else {

                // dummyObject.position.x += recoverCoefficient;
                // dummyObject.position.z += recoverCoefficient;
                this._deltaV3.add(new Vector3(recoverCoefficient, 0, recoverCoefficient));

            }

        }

        if (this.isMovingForward) {

            deltaVec3 = new Vector3(0, 0, dist);
            const offsetVec3 = dummyObject.localToWorld(deltaVec3);
            offsetVec3.x = playerTicked ? dummyObject.position.x : offsetVec3.x;

            if (!this.isForwardBlock) {

                if (!borderReach) {

                    if (leftCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - leftCorVec3.z);
                        this._deltaV3.add(dirVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(dirVec3);
                        // this.#logger.log(`left cornor reach`);                        

                    } else if (rightCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - rightCorVec3.z);
                        this._deltaV3.add(dirVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(dirVec3);
                        // this.#logger.log(`right cornor reach`);                        

                    } else {

                        this._deltaV3.add(offsetVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(offsetVec3);

                    }

                } else if (!leftCorIntersectFace?.includes(FACE_DEF[0]) && !rightCorIntersectFace?.includes(FACE_DEF[0])) {

                    this._deltaV3.add(offsetVec3.sub(dummyObject.position));
                    // dummyObject.position.copy(offsetVec3);

                    if (leftCorIntersectFace) { // when left or right faces intersect the cornor

                        // dummyObject.position.x += recoverCoefficient;
                        // this.#logger.log(`left face reach`);
                        this._deltaV3.add(new Vector3(recoverCoefficient, 0, 0));


                    } else {

                        // dummyObject.position.x -= recoverCoefficient;
                        // this.#logger.log(`right face reach`);
                        this._deltaV3.add(new Vector3(- recoverCoefficient, 0, 0));

                    }
                }
            }

        } else if (this.isMovingBackward) {

            deltaVec3 = new Vector3(0, 0, - dist);
            const offsetVec3 = dummyObject.localToWorld(deltaVec3);
            offsetVec3.x = playerTicked ? dummyObject.position.x : offsetVec3.x;

            if (!this.isBackwardBlock) {

                if (!borderReach) {

                    if (rightBackCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - rightBackCorVec3.z);
                        this._deltaV3.add(dirVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(dirVec3);

                    } else if (leftBackCorVec3.z <= 0) {

                        const dirVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - leftBackCorVec3.z);
                        this._deltaV3.add(dirVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(dirVec3);

                    } else {

                        this._deltaV3.add(offsetVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(offsetVec3);

                    }

                } else if (!leftCorIntersectFace?.includes(FACE_DEF[1]) && !rightCorIntersectFace?.includes(FACE_DEF[1])) {

                    this._deltaV3.add(offsetVec3.sub(dummyObject.position));
                    // dummyObject.position.copy(offsetVec3);

                    if (leftCorIntersectFace) { // when left or right faces intersect the cornor

                        // dummyObject.position.x += recoverCoefficient;
                        this._deltaV3.add(new Vector3(recoverCoefficient, 0, 0));

                    } else {

                        // dummyObject.position.x -= recoverCoefficient;
                        this._deltaV3.add(new Vector3(- recoverCoefficient, 0, 0));

                    }
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

                        const newVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - rightCorVec3.z);
                        this._deltaV3.add(newVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(newVec3);

                    } else if (leftCorVec3.z <= 0 && this.isMovingForwardLeft) {

                        const newVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - leftCorVec3.z);
                        this._deltaV3.add(newVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(newVec3);

                    } else if (rightBackCorVec3.z <= 0 && this.isMovingBackwardLeft) {

                        const newVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - rightBackCorVec3.z);
                        this._deltaV3.add(newVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(newVec3);

                    } else if (leftBackCorVec3.z <= 0 && this.isMovingBackwardLeft) {

                        const newVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - leftBackCorVec3.z);
                        this._deltaV3.add(newVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(newVec3);

                    } else {

                        this._deltaV3.add(offsetVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(offsetVec3);

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

                        const newVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - leftCorVec3.z);
                        this._deltaV3.add(newVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(newVec3);

                    } else if (rightCorVec3.z <= 0 && this.isMovingForwardRight) {

                        const newVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - rightCorVec3.z);
                        this._deltaV3.add(newVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(newVec3);

                    } else if (leftBackCorVec3.z <= 0 && this.isMovingBackwardRight) {

                        const newVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - leftBackCorVec3.z);
                        this._deltaV3.add(newVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(newVec3);

                    } else if (rightBackCorVec3.z <= 0 && this.isMovingBackwardRight) {

                        const newVec3 = new Vector3(offsetVec3.x, offsetVec3.y, dummyObject.position.z - rightBackCorVec3.z);
                        this._deltaV3.add(newVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(newVec3);

                    } else {

                        this._deltaV3.add(offsetVec3.sub(dummyObject.position));
                        // dummyObject.position.copy(offsetVec3);

                    }

                    if (this.isMovingForwardRight) {

                        this.rotateOffsetCorrection2(dummyObject, true, player);

                    } else if (this.isMovingBackwardRight) {

                        this.rotateOffsetCorrection2(dummyObject, false, player);

                    }
                }
            }
        }

        transformBack();

    }

    applyWorldDeltaV3(params) {

        const { group } = params;

        group.position.add(this._worldDeltaV3);

    }
}

export { Moveable2D };