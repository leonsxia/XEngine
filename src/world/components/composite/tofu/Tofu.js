import { Group, Box3, Box3Helper, Vector3, Raycaster, ArrowHelper } from 'three';
import { createMeshes } from './meshes';
import { Moveable2D } from '../../movement/Moveable2D';
import { orange, BF, BF2 } from '../../basic/colorBase';
import { CAMERA_RAY_LAYER, CORNOR_RAY_LAYER, TOFU_RAY_LAYER } from '../../utils/constants';
import { polarity } from '../../utils/enums';
import { CollisionBox } from '../../Models';

const ENLARGE = 2.5;
const ENABLE_QUICK_TURN = true;
const ENABLE_CLIMBING = true;
const SLOWDOWN_COEFFICIENT = .78;
const SLOPE_COEFFICIENT = .8;
const DETECT_SCOPE_MIN = 1;

const HEAD_LENGTH = .5;
const HEAD_WIDTH = .1;

class Tofu extends Moveable2D {

    name = '';
    group;
    meshes;

    boundingBox;
    boundingBoxHelper;

    hasRays = false;
    leftRay;
    rightRay;
    backLeftRay;
    backRightRay;
    rays = [];
    
    leftArrow;
    rightArrow;
    backLeftArrow;
    backRightArrow;

    intersectSlope;

    _collisionSize;
    collisionBox;
    walls = [];
    
    _size;
    _useBF2 = false;
    _showBF = false;
    _showBBHelper = false;
    _showBBW = false;

    _target = null;
    _inSightTargets = [];

    #w;
    #d;
    #h;
    #sightOfView;
    #rotateR = .9;
    #vel = 1.34;
    #stoodTurningVel = 1.5;
    #turnBackVel = 2.5 * Math.PI;
    #velEnlarge = 2.5;
    #rotateREnlarge = 2.5;
    #recoverCoefficient = .01;
    #quickRecoverCoefficient = .03;
    #climbingVel = 1.34;
    #rayPadding = .2;
    #slopeCoefficient = 1;
    #slowDownCoefficient = 1;
    #backwardSlowdownCoefficient = .7;
    #backwardRotatingRadiusCoefficient = .7;
    #isPushing = false;

    constructor(specs) {

        super();
        this._fastRotVel = 2;

        specs.size = specs.size || {};
        const { name, size: {
            width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8,
            sovRadius: sovRadius = Math.max(width, width2, depth, depth2, height)
        }} = specs;
        const { 
            rotateR = .9, vel = 1.34, stoodTurningVel = 1.5, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5, climbingVel = 1.34, rayPaddiing = .2, 
            recoverCt = .01, quickRecoverCt = .03, slopeCt = 1, slowdownCt = 1, backwardSlowdownCt = .7, backwardRotatingRCt = .7 
        } = specs;
        const { collisionSize = { width, depth, height } } = specs;

        this._size = { width, width2, depth, depth2, height, sovRadius };
        this._collisionSize = collisionSize;

        this.#sightOfView = sovRadius;
        this.#rotateR = rotateR;
        this.#vel = vel;
        this.#stoodTurningVel = stoodTurningVel;
        this.#velEnlarge = velEnlarge;
        this.#rotateREnlarge = rotateREnlarge;
        this.#turnBackVel = turnbackVel;
        this.#climbingVel = climbingVel;
        this.#rayPadding = rayPaddiing;
        this.#recoverCoefficient = recoverCt;
        this.#quickRecoverCoefficient = quickRecoverCt;
        this.#slopeCoefficient = slopeCt;
        this.#slowDownCoefficient = slowdownCt;
        this.#backwardSlowdownCoefficient = backwardSlowdownCt;
        this.#backwardRotatingRadiusCoefficient = backwardRotatingRCt;

        this.name = name;
        this.group = new Group();
        this.group.isTofu = true;
        this.group.father = this;
        this.meshes = createMeshes(this._size);

        const { 

            body, slotLeft, slotRight, 
            bbObjects: {
                boundingBox, boundingBoxWire, sovBoundingSphere,
                frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
                frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2
            },
            pushingOBBBox

        } = this.meshes;

        this.enablePickLayers(body, slotLeft, slotRight);

        this.group.add(

            body, slotLeft, slotRight, 
            boundingBox, boundingBoxWire, sovBoundingSphere,
            frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
            frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2,
            pushingOBBBox

        ).name = name;

        this.#w = width;
        this.#d = depth;
        this.#h = height;

        this.boundingBox = new Box3();
        this.boundingBoxHelper = new Box3Helper(this.boundingBox, 0x00ff00);
        this.boundingBoxHelper.name = `${name}-box-helper`;

        this.createRay();
        this.showArrows(false);

        this.paddingCoefficient = .05 * ENLARGE;

    }

    get bodyMesh() {

        return this.group.getObjectByName('body');

    }

    get slotMeshes() {

        return [this.group.getObjectByName('slotLeft'), this.group.getObjectByName('slotRight')];

    }

    get boundingBoxWireMesh() {

        return this.group.getObjectByName('boundingBoxWire');

    }

    get boundingBoxMesh() {

        return this.group.getObjectByName('boundingBox');

    }

    get sovBoundingSphereMesh() {

        return this.group.getObjectByName('sovBoundingSphere-helper');

    }

    get pushingOBBBoxMesh() {

        return this.group.getObjectByName('pushingOBBBox');

    }

    get boundingFaceMesh() {

        return [
            this.group.getObjectByName('frontFace'),
            this.group.getObjectByName('backFace'),
            this.group.getObjectByName('leftFace'),
            this.group.getObjectByName('rightFace')
        ];

    }

    get boundingFace2Mesh() {

        return [
            this.group.getObjectByName('frontFace2'),
            this.group.getObjectByName('backFace2'),
            this.group.getObjectByName('leftFace2'),
            this.group.getObjectByName('rightFace2')
        ];

    }

    get activeBoundingFace() {

        if (this._useBF2) {

            return this.boundingFace2Mesh;

        } else {

            return this.boundingFaceMesh;

        }

    }

    switchBoundingFace() {

        if (this.isRotating) {
            
            this.boundingFaceMesh.forEach(bf => { bf.layers.disable(CORNOR_RAY_LAYER) });
            this.boundingFace2Mesh.forEach(bf2 => { bf2.layers.enable(CORNOR_RAY_LAYER) });
            this.#w = this._size.width2;
            this.#d = this._size.depth2;
            this._useBF2 = true;

        } else {

            this.boundingFaceMesh.forEach(bf => { bf.layers.enable(CORNOR_RAY_LAYER) });
            this.boundingFace2Mesh.forEach(bf2 => { bf2.layers.disable(CORNOR_RAY_LAYER) });
            this.#w = this._size.width;
            this.#d = this._size.depth;
            this._useBF2 = false;

        }

        this.setBoundingFaceVisibility();

    }

    setBoundingFaceVisibility() {

        this.boundingFace2Mesh.forEach(bf2 => { bf2.visible = false });
        this.boundingFaceMesh.forEach(bf => { bf.visible = false });

        if (this._showBF) {

            this.activeBoundingFace.forEach(bf => bf.visible = true);

        }

    }

    movingLeft(val) {

        super.movingLeft(val);

        this.switchBoundingFace();

    }

    movingRight(val) {

        super.movingRight(val);

        this.switchBoundingFace();

    }

    movingForward(val) {

        super.movingForward(val);

        this.switchBoundingFace();

    }

    movingBackward(val) {

        super.movingBackward(val);

        this.switchBoundingFace();

    }

    get obb() {

        return this.boundingBoxMesh.userData.obb;

    }

    get pushingObb() {

        return this.pushingOBBBoxMesh.userData.obb;

    }

    get position() {

        return this.group.position;

    }

    get rotation() {

        return this.group.rotation;
    }

    get scale() {

        return this.group.scale;

    }

    get width() {

        return this.#w * this.group.scale.x;
        
    }

    get height() {

        return this.#h * this.group.scale.y;

    }

    get depth() {

        return this.#d * this.group.scale.z;

    }

    get worldPosition() {

        const pos = new Vector3();

        this.boundingBoxMesh.getWorldPosition(pos);

        return pos;

    }

    get bottomY() {

        const target = new Vector3();

        this.boundingBoxMesh.getWorldPosition(target);

        return target.y - this.height * .5;

    }

    get topY() {

        const target = new Vector3();

        this.boundingBoxMesh.getWorldPosition(target);

        return target.y + this.height * .5;

    }

    get leftCorVec3() {

        return new Vector3(this.#w * .5, 0, this.#d * .5);

    }

    get rightCorVec3() {

        return new Vector3(- this.#w * .5, 0, this.#d * .5);

    }

    get leftBackCorVec3() {

        return new Vector3(this.#w * .5, 0, - this.#d * .5);

    }

    get rightBackCorVec3() {

        return new Vector3( - this.#w * .5, 0, - this.#d * .5);

    }

    get worldYDirection() {

        const dir = this.group.up;
        return this.group.localToWorld(dir.clone()).sub(this.worldPosition).normalize();

    }

    get velocity() {

        return this.isAccelerating && this.isForward && !this.#isPushing ? 
            this.#vel * this.#velEnlarge * this.#slopeCoefficient * this.#slowDownCoefficient : 
            (this.isBackward ? this.#vel * this.#backwardSlowdownCoefficient : this.#vel * this.#slopeCoefficient);

    }

    get turnBackVel() {

        return this.#turnBackVel;

    }

    get climbingVel() {

        return this.#climbingVel;

    }

    get recoverCoefficient() {

        return this.#recoverCoefficient;

    }

    get quickRecoverCoefficient() {

        return this.#quickRecoverCoefficient;

    }
    
    get backwardCoefficient() {

        return this.#recoverCoefficient + 0.001;

    }

    get enableQuickTurn() {

        return ENABLE_QUICK_TURN;

    }

    get enableClimbing() {

        return ENABLE_CLIMBING;

    }

    get slopeCoefficient() {

        return this.#slopeCoefficient;

    }

    set slopeCoefficient(val) {

        this.#slopeCoefficient = val;

    }

    get detectScopeMin() {

        return DETECT_SCOPE_MIN;

    }

    get sightOfView() {

        return this.#sightOfView * Math.max(this.group.scale.x, this.group.scale.y, this.group.scale.z);

    }

    enablePickLayers(...meshes) {

        for (let i = 0, il = meshes.length; i < il; i++) {

            const mesh = meshes[i];

            if (mesh.visible) {

                mesh.layers.enable(CAMERA_RAY_LAYER);
    
            } else {
    
                mesh.layers.disable(CAMERA_RAY_LAYER);
    
            }
    
        }
        
    }

    showTofu(show) {

        this.meshes.body.visible = show;
        this.enablePickLayers(this.meshes.body);
        
        this.slotMeshes.forEach(slot => {
            
            slot.visible = show;
            
            this.enablePickLayers(slot);
        
        });

    }
 
    showBB(show) {

        this.boundingBoxMesh.visible = show;

    }

    showBS(show) {

        this.sovBoundingSphereMesh.visible = show;

    }

    showBBW(show) {

        this._showBBW = show;

        this.boundingBoxWireMesh.visible = show;

        return this;

    }

    showBF(show) {
        
        this._showBF = show;

        this.setBoundingFaceVisibility();

        this.enablePickLayers(...this.boundingFaceMesh, ...this.boundingFace2Mesh);

        return this;

    }

    showPushingBox(show) {

        this.pushingOBBBoxMesh.visible = show;

        return this;

    }

    showArrows(show) {

        this.leftArrow.visible = show;
        this.rightArrow.visible = show;
        this.backLeftArrow.visible = show;
        this.backRightArrow.visible = show;

    }

    showCollisionBox(show) {

        this.collisionBox.group.visible = show;
        
    }

    createRay() {

        this.hasRays = true;
 
        const length = this.height;
        const dir = new Vector3(0, - 1, 0);
        const posY = this.height * .5;
        const posX = this.width * .5 - this.#rayPadding;
        const posZ = this.depth * .5 - this.#rayPadding;
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        this.leftRay = new Raycaster(fromVec3, dir, 0, length);
        this.leftRay.layers.set(TOFU_RAY_LAYER);
        this.leftArrow = new ArrowHelper(dir, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        this.rightRay = new Raycaster(fromVec3, dir, 0, length);
        this.rightRay.layers.set(TOFU_RAY_LAYER);
        this.rightArrow = new ArrowHelper(dir, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        this.backLeftRay = new Raycaster(fromVec3, dir, 0, length);
        this.backLeftRay.layers.set(TOFU_RAY_LAYER);
        this.backLeftArrow = new ArrowHelper(dir, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        this.backRightRay = new Raycaster(fromVec3, dir, 0, length);
        this.backRightRay.layers.set(TOFU_RAY_LAYER);
        this.backRightArrow = new ArrowHelper(dir, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        this.rays.push(this.leftRay, this.rightRay, this.backLeftRay, this.backRightRay);

        return this;
    }

    updateRay(needUpdateMatrixWorld = true) {

        if (needUpdateMatrixWorld) {

            this.group.updateWorldMatrix(true, true);

        }

        const length = this.height;
        const posY = this.#h * .5;
        const posX = this.#w * .5 - this.#rayPadding;
        const posZ = this.#d * .5 - this.#rayPadding;
        const dir = new Vector3(0, - 1, 0);
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.leftRay.set(fromVec3, dir);
        this.leftRay.far = length;
        this.leftArrow.position.copy(fromVec3);
        this.leftArrow.setDirection(dir);
        this.leftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.rightRay.set(fromVec3, dir);
        this.rightRay.far = length;
        this.rightArrow.position.copy(fromVec3);
        this.rightArrow.setDirection(dir);
        this.rightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.backLeftRay.set(fromVec3, dir);
        this.backLeftRay.far = length;
        this.backLeftArrow.position.copy(fromVec3);
        this.backLeftArrow.setDirection(dir);
        this.backLeftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.backRightRay.set(fromVec3, dir);
        this.backRightRay.far = length;
        this.backRightArrow.position.copy(fromVec3);
        this.backRightArrow.setDirection(dir);
        this.backRightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        return this;

    }

    updateOBB() {

        this.group.updateWorldMatrix(true, true);

        {
            const { matrixWorld, geometry: { boundingBox, userData } } = this.boundingBoxMesh;
            this.boundingBox.copy(boundingBox).applyMatrix4(matrixWorld);
            // this.boundingBoxHelper.updateMatrixWorld();

            // update OBB
            this.boundingBoxMesh.userData.obb.copy(userData.obb);
            this.boundingBoxMesh.userData.obb.applyMatrix4(matrixWorld);
        }

        {
            // update pushing OBB Box
            const { matrixWorld, geometry: { userData } } = this.pushingOBBBoxMesh;
            this.pushingOBBBoxMesh.userData.obb.copy(userData.obb);
            this.pushingOBBBoxMesh.userData.obb.applyMatrix4( matrixWorld );
        }

        return this;

    }

    createCollisionBox() {

        const cBoxSpecs = {
            name: `${this.name}-cBox`, 
            width: this._collisionSize.width, depth: this._collisionSize.depth, height: this._collisionSize.height, 
            enableWallOBBs: true, showArrow: false, lines: false,
            ignoreFaces: [4, 5]
        };

        this.collisionBox = new CollisionBox(cBoxSpecs);
        this.collisionBox.father = this;

        this.walls.push(...this.collisionBox.walls);
        this.group.add(this.collisionBox.group);

    }

    updateWalls(needUpdateMatrixWorld = true) {

        for (let i = 0, il = this.walls.length; i < il; i++) {

            const w = this.walls[i];

            w.updateRay(needUpdateMatrixWorld);

            if (w.isOBB) {

                w.updateOBB(false);

            }

        }

    }

    updateAccessories(needUpdateMatrixWorld = true) {
        
        this.updateOBB(needUpdateMatrixWorld);
        this.updateRay(false);
        this.updateWalls(false);

    }

    setBFColor(color, face) {

        const find = this.activeBoundingFace.find(bf => bf.name.includes(face));

        if (find) find.material.color.setHex(color);

        return this;

    }

    resetBFColor() {

        this.boundingFaceMesh.forEach(bf => bf.material.color.setHex(BF));
        this.boundingFace2Mesh.forEach(bf2 => bf2.material.color.setHex(BF2));

        return this;

    }

    setBoundingBoxHelperColor(color) {

        this.boundingBoxHelper.material.color.setHex(color);

        return this;

    }

    setBoundingBoxWireColor(color) {

        this.boundingBoxWireMesh.material.color.setHex(color);

        return this;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotation(rot) {

        this.group.rotation.set(...rot);

        return this;

    }

    setScale(scale) {

        this.group.scale.set(...scale);

        return this;

    }

    setSlopeCoefficient(slope) {

        if (!slope) {

            this.slopeCoefficient = 1;

        }

        else {

            const { depth, height } = slope;
            const cosTheta = depth / Math.sqrt(depth * depth + height * height);

            this.slopeCoefficient = cosTheta * SLOPE_COEFFICIENT;

        }

        return this;

    }

    setSlopeIntersection(s) {

        this.setSlopeCoefficient(s);
        this.intersectSlope = s;

    }

    startPushing() {

        this.#isPushing = true;

    }

    stopPushing() {

        this.#isPushing = false;

    }

    castShadow(cast) {

        this.group.children.forEach(child => {

            if (child.isMesh) {

                child.castShadow = cast;

            }

        });

        return this;

    }

    receiveShadow(receive) {

        this.group.children.forEach(child => {

            if (child.isMesh) {

                child.receiveShadow = receive;

            }

        });

        return this;

    }

    checkSightOfView(target) {

        let isInSight = false;
        const distance = this.worldPosition.distanceTo(target.worldPosition);

        if (distance < this.sightOfView) {

            isInSight = true;

        } else {

            isInSight = false;

        }

        return { isInSight, distance, instance: target };

    }

    getNearestInSightTarget(targets, wrappedTargets, force = true) {
        
        let nearestTarget = null;
        const targetsInSight = [];

        if (force) {

            for (let i = 0, il = targets.length; i < il; i++) {

                const target = targets[i];
                const targetCheck = this.checkSightOfView(target);

                if (targetCheck.isInSight) {

                    targetsInSight.push(targetCheck);

                }

            }

        } else {

            targetsInSight.push(...wrappedTargets);

        }

        if (targetsInSight.length > 0) {

            targetsInSight.sort((a, b) => {

                return a.distance - b.distance;

            });

            nearestTarget = targetsInSight[0].instance;

        }

        return nearestTarget;

    }

    checkTargetInSight(target) {

        const checkResult = this.checkSightOfView(target);

        if (checkResult.isInSight) {

            if (!this._inSightTargets.find(t => t.instance === checkResult.instance)) {

                this._inSightTargets.push(checkResult);
                this.onSovSphereTriggerEnter.call(this, checkResult.instance);                
                
            } else {

                this.onSovSphereTriggerStay.call(this, checkResult.instance);
                
            }

        } else {

            const findIdx = this._inSightTargets.findIndex(t => t.instance === checkResult.instance);

            if (findIdx > -1) {

                this._inSightTargets.splice(findIdx, 1);
                this.onSovSphereTriggerExit.call(this, checkResult.instance);
                
            }

        }

    }

    // inherited by children
    onSovSphereTriggerEnter() {}

    // inherited by children
    onSovSphereTriggerStay() {}

    // inherited by children
    onSovSphereTriggerExit() {}

    getTargetDirectionAngle(target) {

        const selfDir = this.boundingBoxMesh.getWorldDirection(new Vector3());
        const tarPos = target.worldPosition;
        const selfPos = this.worldPosition;
        const tarDir = new Vector3(tarPos.x, 0, tarPos.z).sub(new Vector3(selfPos.x, 0, selfPos.z));
        const angle = selfDir.angleTo(tarDir);

        // in right-handed system, y > 0 means counter-clockwise, y < 0 means clockwise
        const direction = selfDir.clone().cross(tarDir).y > 0 ? polarity.left : polarity.right;

        return {
            angle: angle,
            direction: direction,
            targetPosition: tarPos,
            selfPosition: selfPos
        };

    }

    setTickParams(delta) {

        const R = this.isAccelerating && this.isForward ?
            this.#rotateR * this.#rotateREnlarge :
            (this.isBackward ? this.#rotateR * this.#backwardRotatingRadiusCoefficient : this.#rotateR);
        
        const rotateVel = this.velocity / R;
        const stoodRotateVel = this.#stoodTurningVel / R;

        const dist = this.velocity * delta;

        const params = {

            group: this.group, R, rotateVel, stoodRotateVel, dist, delta,
            $self: this

        };

        return params;

    }

    tick(delta) {

        const params = this.setTickParams(delta);

        this.#slowDownCoefficient = 1;

        this.tankmoveTick(params);

        this.updateAccessories();

    }

    tickClimb(delta, wall) {

        this.climbWallTick({ delta, wall, $self: this });

        this.updateAccessories();

    }

    tickFall(delta) {

        this.fallingTick({ delta, $self: this });

        this.updateAccessories();

    }

    onGround(floor) {

        this.onGroundTick({ floor, $self: this });

        this.updateAccessories();

    }

    tickOnHittingBottom(bottomWall) {

        this.onHittingBottomTick({ bottomWall, $self: this });

        this.updateAccessories();
        
    }

    tickOnSlope(slope) {

        this.onSlopeTick({ slope, $self: this });

        this.updateAccessories();

    }

    tickWithWall(delta, wall, selfTicked = false) {

        const params = this.setTickParams(delta);

        params.wall = wall;
        params.selfTicked = selfTicked;

        this.#slowDownCoefficient = SLOWDOWN_COEFFICIENT;

        this.tankmoveTickWithWall(params);

        this.updateAccessories();

    }

    applyPositionAdjustment() {

        this.applyWorldDeltaV3({ group: this.group });

        this.updateAccessories();

    }

}

export { Tofu };