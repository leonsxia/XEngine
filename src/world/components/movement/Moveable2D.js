import { Matrix4, Object3D, Vector3 } from 'three';
import { COR_DEF, FACE_DEF } from '../physics/SimplePhysics';
import { Logger } from '../../systems/Logger';

const COOLING_TIME = .4;
const DEBUG = true;

const _m1 = new Matrix4();
const _v1 = new Vector3();
const _obj0 = new Object3D();

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
    #nextAimTarget;
    #hurt;
    #die;
    
    #dummyObject = new Object3D();

    #g = 9.8;
    #fallingTime = 0;
    #isFalling = true;

    #isQuickTuring = false;
    #turingRad = 0;
    #coolingT = COOLING_TIME;
    #quickTuringOver = false;

    #isAimTurning = false;
    #isAimTurnOver = false;
    #aimingRad = 0;
    #aimingRadStep = 0;
    #aimingTime = 0;
    _shootInQueue = false;

    #isClimbingUp = false;
    #isClimbingForward = false;
    #climbHeight = 0;
    #climbDist = 0;
    #climbForwardDist = 0;

    #lastFrameFallingDist = 0;

    #logger = new Logger(DEBUG, 'Moveable2D');

    _deltaV3 = new Vector3();
    _worldDeltaV3 = new Vector3();
    
    _fastRotVel = 2;
    _rotated = false;
    _intersectNum = 0;

    // for SimplePhysics, use to check border reach
    locked = false;

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

    resetCollisionInfo() {

        this._rotated = false;
        this._intersectNum = 0;

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

    nextAimTarget(val) {
        this.#nextAimTarget = val;
        // this.#logger.log(`nextAimTarget ${this.#nextAimTarget}`);
    }

    interact(val) {
        this.#interact = val;
        // this.#logger.log(`interact ${this.#interact}`);
    }

    hurt(val) {
        this.#hurt = val;
    }
    
    die(val) {
        this.#die = val;
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

    get nextAimTargeting() {
        return this.#nextAimTarget;
    }

    get attacking() {
        return this.#melee || this.#gunPoint || this.#shoot;
    }

    get interacting() {
        return this.#interact;
    }

    get hurting() {
        return this.#hurt;
    }

    get dead() {
        return this.#die;
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
        return !this.#interact && !this.#hurt && !this.#die &&
            ((this.#movingLeft && !this.#movingForward && !this.#movingBackward) || (this.#movingLeft && (this.#melee || this.#gunPoint)));
    }

    get isTurnClockwise() {
        return !this.#interact && !this.#hurt && !this.#die &&
            ((this.#movingRight && !this.#movingForward && !this.#movingBackward) || (this.#movingRight && (this.#melee || this.#gunPoint)));
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

    get isGunReady() {
        return this.#gunPoint && !this.#isAimTurning;;
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
        return this.#melee || this.#gunPoint || this.#interact || this.#hurt || this.#die;
    }

    get isForwardBlock() {
        return (
            (this.leftFaceIntersects && this.rightCorIntersects) ||
            (this.rightFaceIntersects && this.leftCorIntersects) ||
            (this.leftCorIntersects && this.rightCorIntersects) || 
            (this.leftCorIntersects && this.backRightCorIntersects) ||
            (this.rightCorIntersects && this.backLeftCorIntersects) ||
            (this.frontFaceIntersects && (this.leftFaceIntersects || this.rightFaceIntersects)) ||
            (this.leftFaceIntersects && this.rightFaceIntersects)
        );
    }

    get isBackwardBlock() {
        return (
            (this.rightFaceIntersects && this.backLeftCorIntersects) ||
            (this.leftFaceIntersects && this.backRightCorIntersects) ||
            (this.backRightCorIntersects && this.backLeftCorIntersects) ||
            (this.backRightCorIntersects && this.leftCorIntersects) ||
            (this.backLeftCorIntersects && this.rightCorIntersects) ||
            (this.backFaceIntersects && (this.leftFaceIntersects || this.rightFaceIntersects)) ||
            (this.leftFaceIntersects && this.rightFaceIntersects)
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

    /**
     * @param {number} val
     */
    set intersectNum(val) {

        this._intersectNum = val;

    }

    get lastFrameFallingDistance() {

        return this.#lastFrameFallingDist;

    }

    resetFallingState() {

        this.#isFalling = false;
        this.#fallingTime = 0;
        this.#lastFrameFallingDist = 0;

    }

    fallingTick(params) {

        const { delta, $self } = params;

        if (!this.#isClimbingUp && !this.#isClimbingForward) {
            
            const now = this.#fallingTime + delta;
            const deltaY = .5 * this.#g * (now * now - this.#fallingTime * this.#fallingTime);
            $self.group.position.y -= deltaY;

            this.#lastFrameFallingDist = deltaY;

            this.#isFalling = true;
            this.#fallingTime = now;

        }

    }

    onHittingBottomTick(params) {

        const { bottomWall, $self } = params;

        // when climbing up, need to stop climbing
        if (this.#isClimbingUp) {

            this.resetClimbingState();
            
        }

        const dir = bottomWall.getWorldPosition(_v1);
        dir.y -= $self.height * .5;
        $self.group.position.y = $self.group.parent ? dir.applyMatrix4(_m1.copy($self.group.parent.matrixWorld).invert()).y : dir.y;

    }

    onGroundTick(params) {

        const { floor, $self } = params;

        const dir = floor.getWorldPosition(_v1);
        const onGroundPadding = .001;
        dir.y += $self.height * .5 - onGroundPadding;
        $self.group.position.y = $self.group.parent ? dir.applyMatrix4(_m1.copy($self.group.parent.matrixWorld).invert()).y : dir.y;

        this.resetFallingState();

    }

    onSlopeTick(params) {

        const { slope, $self } = params;

        const intersects = [];

        for (let i = 0, il = $self.rays.length; i < il; i++) {

            const ray = $self.rays[i];
            const intersect = ray.intersectObject(slope);

            if (intersect.length > 0) intersects.push(intersect[0]);

        }

        if (intersects.length > 0) {

            intersects.sort((a, b) => {
                return b.point.y - a.point.y;
            });

            const dir = _v1.copy(intersects[0].point);
            dir.y += $self.height * .5;
            $self.group.position.y = $self.group.parent ? dir.applyMatrix4(_m1.copy($self.group.parent.matrixWorld).invert()).y : dir.y;

            this.resetFallingState();

        }

    }

    onSurfaceTick(params) {

        const { surface, $self, point } = params;
        let result = { isOnSurface: false, point: null };

        if (surface) {

            const intersects = [];

            for (let i = 0, il = $self.rays.length; i < il; i++) {

                const ray = $self.rays[i];
                const intersect = ray.intersectObject(surface);

                if (intersect.length > 0) intersects.push(intersect[0]);

            }

            if (intersects.length > 0) {

                intersects.sort((a, b) => {
                    return b.point.y - a.point.y;
                });

                result.isOnSurface = true;
                result.point = intersects[0].point;

            }

            return result;

        } else {

            const dir = _v1.copy(point);
            const onGroundPadding = .001;
            dir.y += $self.height * .5 - onGroundPadding;;
            $self.group.position.y = $self.group.parent ? dir.applyMatrix4(_m1.copy($self.group.parent.matrixWorld).invert()).y : dir.y;

            this.resetFallingState();

        }

    }

    /**
     * @param {number} val
     */
    set aimingRad(val) {

        this.#aimingRad = val;

    }

    /**
     * @param {number} val
     */
    set aimingTime(val) {

        this.#aimingTime = val;

    }

    get isAimTurning() {

        return this.#isAimTurning;

    }

    aimTick(params) {

        let result = false;
        const { group, delta, $self } = params;
        const worldY = $self.worldYDirection;
        const aimRad = Math.abs(this.#aimingRad);

        if ((this.#gunPoint || this.#melee)  && !this.#isAimTurnOver) {

            if (!this.#isAimTurning) {

                this.#isAimTurning = true;

            }

            if (this.#aimingRadStep < aimRad) {

                let ang = $self.aimVel * delta;
                                
                if (this.#aimingRadStep + ang >= aimRad) {

                    ang = aimRad - this.#aimingRadStep;

                }

                group.rotateOnWorldAxis(worldY, this.#aimingRad > 0 ? ang : - ang);
                this.#aimingRadStep += ang;
                this.#aimingTime -= delta;
                result = true;

            } else {

                if (this.#aimingTime <= 0 && this.#aimingRadStep === aimRad) {

                    this.#isAimTurnOver = true;
                    this.#isAimTurning = false;

                    if (this._shootInQueue) {

                        this.shoot?.(true);
                        this._shootInQueue = false;

                    }

                } else {

                    this.#aimingTime -= delta;
                    result = true;

                }

            }
            
        }

        if (!this.#gunPoint && !this.#melee && (this.#isAimTurning || this.#isAimTurnOver)) {

            this.resetAimingState($self);

        }

        return result;

    }

    resetAimingState($self) {

        this.#isAimTurnOver = false;
        this.#isAimTurning = false;
        this.#aimingRadStep = 0;
        this.#aimingTime = $self.aimTime;

    }

    stopQuickTurning() {

        this.#isQuickTuring = false;
        this.#quickTuringOver = true;
        this.#turingRad = 0;
        this.#coolingT = COOLING_TIME;

    }

    quickTurnTick(params) {

        let result = false;
        const { group, delta, $self } = params;
        const worldY = $self.worldYDirection;

        if ($self.enableQuickTurn && !this.#quickTuringOver && !this.#isClimbingUp && !this.#isClimbingForward) {

            if (!this.#isQuickTuring && this.isQuickTuring) {

                this.#isQuickTuring = true;

            }
    
            if (this.#isQuickTuring) {

                if (this.#turingRad < Math.PI) {

                    let ang = $self.turnBackVel * delta;

                    if (this.#turingRad + ang >= Math.PI) {

                        ang = Math.PI - this.#turingRad;

                    }

                    group.rotateOnWorldAxis(worldY, - ang);

                    this.#turingRad += ang;
                    
                    result = true;

                }
                
                if (this.#coolingT <= 0) {

                    this.stopQuickTurning();
    
                } else {

                    this.#coolingT -= delta;

                }

            }

        }

        if ((!this.#accelerate || !this.#movingBackward) && this.#quickTuringOver) {

            this.#quickTuringOver = false;

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
        
        const { delta, wall, $self } = params;

        if ($self.enableClimbing) {

            if (wall && !this.#isClimbingUp && !this.#isClimbingForward && this.isClimbing && !this.#isFalling) {

                this.#logger.log(`${$self.name} is climbing ${wall.name}`);

                const marginTop = .01;           
                this.#climbHeight = wall.getWorldPosition(_v1).y + wall.height * .5 + marginTop;
                this.#climbDist = $self.boundingBoxMesh.geometry.parameters.depth;

                this.#isClimbingUp = true;

                // only climb once
                this.#jump = false;

            }

            if (this.#isClimbingUp || this.#isClimbingForward) {

                if ($self.bottomY < this.#climbHeight) {

                    $self.group.position.y += delta * $self.climbingVel;

                } else if (this.#climbForwardDist < this.#climbDist) {

                    this.#isClimbingUp = false;
                    this.#isClimbingForward = true;

                    const dist = delta * $self.climbingVel;

                    $self.group.position.copy(_v1.set(0, 0, dist).applyMatrix4($self.group.matrixWorld));

                    this.#climbForwardDist += dist;

                } else {

                    this.resetClimbingState();

                }

            }

        }

    }

    tankmoveTick(params) {

        const { group, R, rotateVel, stoodRotateVel, dist, delta, $self } = params;
        let deltaX, deltaZ;
        const rotateRad = rotateVel * delta;
        const stoodRotateRad = stoodRotateVel * delta;
        const worldY = $self.worldYDirection;

        if(this.#isQuickTuring || this.#isAimTurning || this.#isClimbingUp || this.#isClimbingForward) {

            return;

        }

        if (this.isMovingForward) {

            group.position.copy(_v1.set(0, 0, dist).applyMatrix4(group.matrixWorld));

        } else if (this.isMovingBackward) {

            group.position.copy(_v1.set(0, 0, - dist).applyMatrix4(group.matrixWorld));

        } else if (this.isTurnClockwise) {

            // group.rotation.y -= rotateRad;
            group.rotateOnWorldAxis(worldY, - stoodRotateRad);

        } else if (this.isTurnCounterClockwise) {

            // group.rotation.y += rotateRad;
            group.rotateOnWorldAxis(worldY, stoodRotateRad);

        } else {

            deltaX = R - R * Math.cos(dist / R);
            deltaZ = R * Math.sin(dist / R);

            if (this.isMovingForwardLeft) {

                group.position.copy(_v1.set(deltaX, 0, deltaZ).applyMatrix4(group.matrixWorld));
                // group.rotation.y += rotateRad;
                group.rotateOnWorldAxis(worldY, rotateRad);

            } else if (this.isMovingForwardRight) {

                group.position.copy(_v1.set(-deltaX, 0, deltaZ).applyMatrix4(group.matrixWorld));
                // group.rotation.y -= rotateRad;
                group.rotateOnWorldAxis(worldY, - rotateRad);

            } else if (this.isMovingBackwardLeft) {

                group.position.copy(_v1.set(deltaX, 0, -deltaZ).applyMatrix4(group.matrixWorld));
                // group.rotation.y -= rotateRad;
                group.rotateOnWorldAxis(worldY, - rotateRad);

            } else if (this.isMovingBackwardRight) {

                group.position.copy(_v1.set(-deltaX, 0, -deltaZ).applyMatrix4(group.matrixWorld));
                // group.rotation.y += rotateRad;
                group.rotateOnWorldAxis(worldY, rotateRad);

            }

        }

    }

    resetDeltaV3() {

        this._deltaV3.set(0, 0, 0);

    }

    resetWorldDeltaV3() {
        
        this._worldDeltaV3.set(0, 0, 0);

    }

    rotateOffsetCorrection(cornorsArr) {

        const [
                , , leftCorVec3Z,
                , , rightCorVec3Z,
                , , leftBackCorVec3Z,
                , , rightBackCorVec3Z
            ] = cornorsArr

        if (leftCorVec3Z <= 0 || rightCorVec3Z <= 0 || leftBackCorVec3Z <= 0 || rightBackCorVec3Z <= 0) {

            const overlap = Math.min(leftCorVec3Z, rightCorVec3Z, leftBackCorVec3Z, rightBackCorVec3Z);

            this._deltaV3.add(_v1.set(0, 0, - overlap));

        }

    }

    rotateOffsetCorrection2(clockWise = true, target) {

        const quickRecoverCoefficient = target.quickRecoverCoefficient;

        if (clockWise) {

            if (
                this.backLeftCorIntersects && this.rightFaceIntersects ||
                this.rightCorIntersects && this.leftFaceIntersects
            ) {

                this._deltaV3.add(_v1.set(quickRecoverCoefficient, 0, 0));

            }

        } else {

            if (
                this.leftCorIntersects && this.rightFaceIntersects ||
                this.backRightCorIntersects && this.leftFaceIntersects
            ) {

                this._deltaV3.add(_v1.set(- quickRecoverCoefficient, 0, 0));

            }

        }
    }

    tankmoveTickWithWall(params) {

        const { group, rotateVel, stoodRotateVel, dist, delta, wall, $self } = params;
        const {
            wallMesh,
            borderReach, leftCorIntersectFace, rightCorIntersectFace, intersectCor,
            cornorsArr: [
                leftCorVec3X, , leftCorVec3Z,
                rightCorVec3X, , rightCorVec3Z,
                leftBackCorVec3X, , leftBackCorVec3Z,
                rightBackCorVec3X, , rightBackCorVec3Z
            ],
            halfEdgeLength
        } = wall.checkResult;

        if (this.#isQuickTuring || this.#isAimTurning || this.#isClimbingUp) {

            return;

        }

        // set dummy object related to zero position.
        const dummyObject = this.dummyObject.copy(_obj0);

        // group.updateWorldMatrix(true, false);

        const wallTransformMtx4 = wallMesh.matrixWorld;
        const wallWorldMatrixInverted = _m1.copy(wallMesh.matrixWorld).invert();
        // get moving object position towards wall local space
        // group.matrixWorld will no longer needed below, so no need to clone, it will be auto updated
        const dummy2WallMtx4 = group.matrixWorld.premultiply(wallWorldMatrixInverted);
        // dummyObject.matrix no need to clone, 
        // due to applyMatrix4 will auto compose matrix from current position, quaternion and scale
        // const dummyMatrixInverted = dummyObject.matrix.invert();
        dummyObject.applyMatrix4(dummy2WallMtx4);

        dummyObject.updateWorldMatrix(true, false);

        // const posY = dummyObject.position.y;

        const recoverCoefficient = $self.recoverCoefficient;
        const quickRecoverCoefficient = $self.quickRecoverCoefficient;
        const backwardCoefficient = $self.backwardCoefficient;
        const rotateRad = rotateVel * delta;
        const stoodRotateRad = stoodRotateVel * delta;

        const worldY = $self.worldYDirection;

        const transformBack = () => {

            // transfer dummy to group world position.
            dummyObject.updateMatrix();

            // ** this time dummyObject.matrix need to clone due to it will be used in SimplePhysics -> checkIntersection
            const recoverMtx4 = _m1.copy(dummyObject.matrix).premultiply(wallTransformMtx4);

            // add delta position transfer to worldDeltaV3
            // console.log(`deltaV3:${this._deltaV3.x}, ${this._deltaV3.y}, ${this._deltaV3.z}`);
            // wallMesh has no parent, so its matrix equals matrixWorld
            this._worldDeltaV3.add(this._deltaV3.applyQuaternion(wallMesh.quaternion));

            // group.matrix and group.parent.matrixWorld no need to clone, 
            // due to applyMatrix4 will auto compose matrix from current position, quaternion and scale
            // group matrixWorld will auto updated when call worldToLocal
            group.position.set(0, 0, 0);
            group.quaternion.set(0, 0, 0, 1);
            group.scale.set(1, 1, 1);
            const movingObjWorldMatrixInvterted = group.parent.matrixWorld.invert();
            // follow the euquition:
            // parentWorldMatirx * localMatrix = recoverMtx4 => localMatrix = parentWorldMatrix.invert() * recoverMtx4
            group.applyMatrix4(movingObjWorldMatrixInvterted.multiply(recoverMtx4));

        }

        // when climb forward has collistion with other walls, need to stop moving forward.
        if (this.#isClimbingForward) {

            if (leftCorVec3Z <= 0 || rightCorVec3Z <= 0) {

                this.resetClimbingState();

            }

            return;
            
        }

        this.resetDeltaV3();

        // recover position z when static
        if (this.stopped) {

            if (
                (intersectCor === COR_DEF[0] && leftCorVec3Z < 0) ||
                (intersectCor === COR_DEF[1] && rightCorVec3Z < 0) ||
                (intersectCor === COR_DEF[2] && leftBackCorVec3Z < 0) ||
                (intersectCor === COR_DEF[3] && rightBackCorVec3Z < 0)
            ) {

                // dummyObject.position.z += quickRecoverCoefficient;
                this._deltaV3.add(_v1.set(0, 0, quickRecoverCoefficient));
                
            }

            if (leftCorIntersectFace?.includes(FACE_DEF[0]) || rightCorIntersectFace?.includes(FACE_DEF[0])) {
    
                this._deltaV3.add(_v1.set(0, 0, - backwardCoefficient).applyMatrix4(dummyObject.matrixWorld).sub(dummyObject.position));
                
            } else if (leftCorIntersectFace?.includes(FACE_DEF[1]) || rightCorIntersectFace?.includes(FACE_DEF[1])) {

                this._deltaV3.add(_v1.set(0, 0, backwardCoefficient).applyMatrix4(dummyObject.matrixWorld).sub(dummyObject.position));
                
            }

        } else if (borderReach && !this.isMovingForward && !this.isMovingBackward) {
            // recover position when reach the wall cornor and is rotating
            if (rightCorIntersectFace) {

                // dummyObject.position.x -= recoverCoefficient;
                // dummyObject.position.z += recoverCoefficient;
                this._deltaV3.add(_v1.set(- recoverCoefficient, 0, recoverCoefficient));
            
            } else {

                // dummyObject.position.x += recoverCoefficient;
                // dummyObject.position.z += recoverCoefficient;
                this._deltaV3.add(_v1.set(recoverCoefficient, 0, recoverCoefficient));

            }

        }

        let checkCornors = [];

        const cornorsIsOverlap = () => {

            checkCornors = [];
            
            if (leftCorVec3Z <= 0 && Math.abs(leftCorVec3X) <= halfEdgeLength) checkCornors.push(leftCorVec3Z);

            if (rightCorVec3Z <= 0 && Math.abs(rightCorVec3X) <= halfEdgeLength) checkCornors.push(rightCorVec3Z);

            if (leftBackCorVec3Z <= 0 && Math.abs(leftBackCorVec3X) <= halfEdgeLength) checkCornors.push(leftBackCorVec3Z);

            if (rightBackCorVec3Z <= 0 && Math.abs(rightBackCorVec3X) <= halfEdgeLength) checkCornors.push(rightBackCorVec3Z);
            
            return checkCornors.length ? true : false;

        }

        const getMinCornorZ = () => {
            
            return Math.min(...checkCornors);

        }

        if (this.isMovingForward) {

            if (!borderReach) {

                if (cornorsIsOverlap()) {

                    const overlap = getMinCornorZ();

                    _v1.set(dummyObject.position.x, dummyObject.position.y, dummyObject.position.z - overlap);
                    this._deltaV3.add(_v1.sub(dummyObject.position));  

                }

            } else if (!leftCorIntersectFace?.includes(FACE_DEF[0]) && !rightCorIntersectFace?.includes(FACE_DEF[0])) {                

                if (this._intersectNum <= 2) {

                    _v1.set(0, 0, dist).applyMatrix4(dummyObject.matrixWorld);
                    _v1.x = dummyObject.position.x;
                    this._deltaV3.add(_v1.sub(dummyObject.position));

                    if (leftCorIntersectFace) { // when left or right faces intersect the cornor

                        // this.#logger.log(`left face reach`);
                        this._deltaV3.add(_v1.set(recoverCoefficient, 0, recoverCoefficient));


                    } else {

                        // this.#logger.log(`right face reach`);
                        this._deltaV3.add(_v1.set(- recoverCoefficient, 0, recoverCoefficient));

                    }

                }

            }

        } else if (this.isMovingBackward) {
            if (!borderReach) {

                if (cornorsIsOverlap()) {

                    const overlap = getMinCornorZ();

                    _v1.set(dummyObject.position.x, dummyObject.position.y, dummyObject.position.z - overlap);
                    this._deltaV3.add(_v1.sub(dummyObject.position));

                }

            } else if (!leftCorIntersectFace?.includes(FACE_DEF[1]) && !rightCorIntersectFace?.includes(FACE_DEF[1])) {                

                if (this._intersectNum <= 2) {

                    _v1.set(0, 0, - dist).applyMatrix4(dummyObject.matrixWorld);
                    _v1.x = dummyObject.position.x;
                    this._deltaV3.add(_v1.sub(dummyObject.position));

                    if (leftCorIntersectFace) { // when left or right faces intersect the cornor

                        this._deltaV3.add(_v1.set(recoverCoefficient, 0, recoverCoefficient));

                    } else {

                        this._deltaV3.add(_v1.set(- recoverCoefficient, 0, recoverCoefficient));

                    }

                }

            }
            
        } else if (this.isTurnClockwise) {

            if (!borderReach) {

                this.rotateOffsetCorrection(wall.checkResult.cornorsArr);

                this.rotateOffsetCorrection2(true, $self);

            }

            dummyObject.rotateOnWorldAxis(worldY, - stoodRotateRad);

        } else if (this.isTurnCounterClockwise) {

            if (!borderReach) {

                this.rotateOffsetCorrection(wall.checkResult.cornorsArr);

                this.rotateOffsetCorrection2(false, $self);

            }

            dummyObject.rotateOnWorldAxis(worldY, stoodRotateRad);

        } else {

            if (this.isMovingForwardLeft || this.isMovingBackwardLeft) {

                if (!this._rotated) {

                    const rot = borderReach ? 2 * rotateRad : rotateRad;

                    if (this.isMovingForwardLeft) {

                        dummyObject.rotateOnWorldAxis(worldY, rot);

                    } else {

                        dummyObject.rotateOnWorldAxis(worldY, - rot);

                    }

                    this._rotated = true;

                }

                if (!borderReach) {

                    if (this.isForwardBlock || this.isBackwardBlock) {

                        this.rotateOffsetCorrection(wall.checkResult.cornorsArr);

                    } else if (cornorsIsOverlap()) {

                        const overlap = getMinCornorZ();
                        _v1.set(dummyObject.position.x, dummyObject.position.y, dummyObject.position.z - overlap);
                        this._deltaV3.add(_v1.sub(dummyObject.position));

                    }

                    if (this.isMovingBackwardLeft) {
                        
                        this.rotateOffsetCorrection2(true, $self);
    
                    } else if (this.isMovingForwardLeft) {
                        
                        this.rotateOffsetCorrection2(false, $self);
    
                    }
                    
                }

            } else if (this.isMovingForwardRight || this.isMovingBackwardRight) {

                if (!this._rotated) {

                    const rot = borderReach ? 2 * rotateRad : rotateRad;

                    if (this.isMovingForwardRight) {

                        dummyObject.rotateOnWorldAxis(worldY, - rot);

                    } else {

                        dummyObject.rotateOnWorldAxis(worldY, rot);

                    }

                    this._rotated = true;
                    
                }

                if (!borderReach) {

                    if (this.isForwardBlock || this.isBackwardBlock) {

                        this.rotateOffsetCorrection(wall.checkResult.cornorsArr);

                    } else if (cornorsIsOverlap()) {

                        const overlap = getMinCornorZ();
                        _v1.set(dummyObject.position.x, dummyObject.position.y, dummyObject.position.z - overlap);
                        this._deltaV3.add(_v1.sub(dummyObject.position));

                    }

                    if (this.isMovingForwardRight) {

                        this.rotateOffsetCorrection2(true, $self);
    
                    } else if (this.isMovingBackwardRight) {
    
                        this.rotateOffsetCorrection2(false, $self);
    
                    }
                    
                }
                
            }
        }

        transformBack();

    }

    applyWorldDeltaV3(params) {

        const { group } = params;

        const worldPos = group.getWorldPosition(_v1);
        
        worldPos.add(this._worldDeltaV3);

        group.position.copy(worldPos.applyMatrix4(_m1.copy(group.parent.matrixWorld).invert()));

    }
    
}

export { Moveable2D };