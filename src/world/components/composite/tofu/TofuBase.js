import { Group, Box3, Box3Helper, Raycaster, ArrowHelper, Vector3, Quaternion } from 'three';
import { createMeshes, createDefaultBoundingObjectMeshes, createSovBoundingSphereMesh } from './meshes';
import { Moveable2D } from '../../movement/Moveable2D';
import { orange, BF, BF2, green, yellow } from '../../basic/colorBase';
import { CAMERA_RAY_LAYER, TOFU_AIM_LAYER, TOFU_FOCUS_LAYER, TOFU_RAY_LAYER } from '../../utils/constants';
import { CollisionBox, RapierContainer } from '../../Models';
import { ResourceTracker } from '../../../systems/ResourceTracker';
import { Logger } from '../../../systems/Logger';
import { Health } from '../../mechanism/Health';
import { aimDirection } from '../../utils/enums';

const ENLARGE = 2.5;
const ENABLE_QUICK_TURN = true;
const ENABLE_CLIMBING = true;
const SLOWDOWN_COEFFICIENT = .78;
const SLOPE_COEFFICIENT = .75;
const DETECT_SCOPE_MIN = 1;
const RAY_PADDING = .11;

const HEAD_LENGTH = .5;
const HEAD_WIDTH = .1;

const SLOPE_RAY_LENGTH = 2;
const TERRAIN_RAY_LENGTH = .6;

// rapier component
const RAPIER_INSTANCES = {
    CHARACTER_CONTROLLER: 'characterController',
    DEAD_BODY: 'deadBody'
};

// auxiliary 
const _v1 = new Vector3();
const _v2 = new Vector3();
const _down = new Vector3(0, -1, 0);
const _forward = new Vector3(0, 0, 1);
const _forwardDown = new Vector3(0, -1, 1).normalize();
const _forwardUp = new Vector3(0, 1, 1).normalize();
const _q1 = new Quaternion();

const DEBUG = false;

class TofuBase extends Moveable2D {

    isTofu = true;

    name = '';
    group;
    boundingFaceGroup;
    meshes;
    boundingObjects;

    // bounding box & faces
    bodyMesh;
    slotMeshes = [];
    boundingBoxMesh;
    boundingBoxWireMesh;
    pushingOBBBoxMesh;
    boundingFaceMesh = []
    boundingFace2Mesh = [];
    sovBoundingSphereMesh;

    boundingBox;
    boundingBoxHelper;

    // rays
    hasRays = false;
    leftRay;
    rightRay;
    backLeftRay;
    backRightRay;
    centerRay;
    aimRay;
    focusRay;
    rays = [];
    
    leftArrow;
    rightArrow;
    backLeftArrow;
    backRightArrow;
    centerArrow;
    aimArrow;
    focusArrow;

    _needAimRay;
    _needFocusRay;

    intersectSlope;

    // collision box
    _collisionSize;
    collisionBox;
    walls = [];
    _useCustomBoundingFaces = false;
    
    _size;
    _showBF = false;
    _showBBHelper = false;
    _showBB = false;
    _showBBW = false;
    _showPushingBox = false;
    _showCBoxArrows = false;

    _target = null;
    _focusTarget = null;
    _inSightTargets = [];

    #w;
    #d;
    #h;
    #sightOfView;
    #rotateR = .9;
    #vel = 1.34;
    #stoodTurningVel = 1.5;
    #turnBackVel = 2.5 * Math.PI;
    #aimVel;
    #aimTime;
    #velEnlarge = 2.5;
    #rotateREnlarge = 2.5;
    #recoverCoefficient = .01;
    #quickRecoverCoefficient = .03;
    #climbingVel = 1.34;
    #rayPadding = RAY_PADDING;
    #slopeCoefficient = 1;
    #slowDownCoefficient = 1;
    #backwardSlowdownCoefficient = .7;
    #backwardRotatingRadiusCoefficient = .7;
    #isPushing = false;

    // actions
    #damageRange = 0;
    #damageRadius = 0;
    #armedHeight = 0;
    #aimDirection = aimDirection.forward;
    #focusHeight = 0;

    #pickRange = .8;
    #pickRadius = Math.PI / 3;

    #entryRange = .8;
    #entryRadius = Math.PI / 2;

    _cachedWidth;
    _cachedHeight;
    _cachedDepth;

    _cornors = [];

    // resource tracker
    resTracker = new ResourceTracker();
    track = this.resTracker.track.bind(this.resTracker);
    dispose = this.resTracker.dispose.bind(this.resTracker);
    isActive = true;
    disposed = false;

    currentRoom;

    #logger = new Logger(DEBUG, 'TofuBase');

    constructor(specs) {

        super();
        this._fastRotVel = 2;

        specs.size = specs.size || {};
        const { name, size: {
            width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8,
            sovRadius: sovRadius = Math.max(width, width2, depth, depth2, height)
        }} = specs;
        const { 
            rotateR = .9, vel = 1.34, stoodTurningVel = 1.5, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5, climbingVel = 1.34, rayPaddiing = RAY_PADDING,
            recoverCt = .01, quickRecoverCt = .03, slopeCt = 1, slowdownCt = 1, backwardSlowdownCt = .7, backwardRotatingRCt = .7,
            aimVel = 3 * Math.PI, aimTime = .05
        } = specs;
        const { collisionSize = { width, depth, height } } = specs;
        const { createDefaultBoundingObjects = true } = specs;
        const { enableDefaultCBox = false } = specs;
        const { needAimRay = true, needFocusRay = false, focusHeight = 0 } = specs;

        this._size = { width, width2, depth, depth2, height, sovRadius };
        this._collisionSize = collisionSize;
        this._useCustomBoundingFaces = !createDefaultBoundingObjects;

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
        this.#aimVel = aimVel;
        this.#aimTime = aimTime;
        this.aimingTime = aimTime;  // set Moveable2D default aimingTime
        this._needAimRay = needAimRay;
        this._needFocusRay = needFocusRay;
        this.#focusHeight = focusHeight;

        this.name = name;
        this.group = new Group();
        this.group.isTofu = true;
        this.group.father = this;
        this.meshes = createMeshes(this._size);
        this.boundingFaceGroup = new Group();
        this.group.add(this.boundingFaceGroup);

        if (enableDefaultCBox) {

            this.createCollisionBox();

        }

        const {
            body, slotLeft, slotRight
        } = this.meshes;

        this.enablePickLayers(body, slotLeft, slotRight);

        this.group.add(
            body, slotLeft, slotRight
        ).name = name;

        this.bodyMesh = body;
        this.slotMeshes = [slotLeft, slotRight];

        if (createDefaultBoundingObjects) {

            this.boundingObjects = createDefaultBoundingObjectMeshes(this._size);
            const {
                bbObjects: {
                boundingBox, boundingBoxWire,
                frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
                frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2
            },
            pushingOBBBox
            } = this.boundingObjects;

            this.group.add(
                boundingBox, boundingBoxWire,
                pushingOBBBox
            );

            this.boundingBoxMesh = boundingBox;
            this.boundingBoxWireMesh = boundingBoxWire;
            this.pushingOBBBoxMesh = pushingOBBBox;
            this.boundingFaceMesh = [frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace];
            this.boundingFace2Mesh = [frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2]
            this.boundingFaceGroup.add(...this.boundingFaceMesh);
            
        }

        const { sovSphere } = createSovBoundingSphereMesh(this._size);
        this.group.add(sovSphere);
        this.sovBoundingSphereMesh = sovSphere;

        this.#w = width;
        this.#d = depth;
        this.#h = height;

        this._cornors.push(this.leftCorVec3, this.rightCorVec3, this.leftBackCorVec3, this.rightBackCorVec3);

        this.boundingBox = new Box3();
        this.boundingBoxHelper = new Box3Helper(this.boundingBox, 0x00ff00);
        this.boundingBoxHelper.name = `${name}-box-helper`;

        this.createRay();

        this.paddingCoefficient = .05 * ENLARGE;

        const { HPMin = 0, HPMax = 100 } = specs;
        this.health = new Health({
            baseWidth: 80, size: 7, borderSize: 2, showText: true, min: HPMin, max: HPMax
        });

        this.group.add(this.health.strip);        
        this.health.strip.position.y = height / 2 + .2;
        this.health.showStrip(false);

        this.rapierContainer = new RapierContainer({ attachTo: this });

    }

    updateRoomInfo(room) {

        this.currentRoom = room.name;

    }

    get activeBoundingFace() {

        if (this._useCustomBoundingFaces) {

            return this.boundingFaceMesh;

        } else {

            return this.boundingFaceGroup.children;

        }

    }

    switchBoundingFace() {

        if (this.isRotating) {
            
            this.boundingFaceGroup.remove(...this.boundingFaceMesh);
            this.boundingFaceGroup.add(...this.boundingFace2Mesh);
            this.#w = this._size.width2;
            this.#d = this._size.depth2;

        } else {

            this.boundingFaceGroup.remove(...this.boundingFace2Mesh);
            this.boundingFaceGroup.add(...this.boundingFaceMesh);
            this.#w = this._size.width;
            this.#d = this._size.depth;

        }

    }

    movingLeft(val) {

        super.movingLeft(val);

        if (!this._useCustomBoundingFaces) {

            this.switchBoundingFace();

        }

    }

    movingRight(val) {

        super.movingRight(val);

        if (!this._useCustomBoundingFaces) {

            this.switchBoundingFace();

        }

    }

    movingForward(val) {

        super.movingForward(val);

        if (!this._useCustomBoundingFaces) {

            this.switchBoundingFace();

        }

    }

    movingBackward(val) {

        super.movingBackward(val);

        if (!this._useCustomBoundingFaces) {

            this.switchBoundingFace();

        }

    }

    gunPoint(val) {

        super.gunPoint(val);

        if (!this._useCustomBoundingFaces) {

            this.switchBoundingFace();

        }

    }

    melee(val) {

        super.melee(val);

        if (!this._useCustomBoundingFaces) {

            this.switchBoundingFace();

        }
        
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

    get w() {

        return this.#w;

    }

    get d() {

        return this.#d;

    }

    onBasicSizeChanged() {

        this._cornors[0].set(this.#w * .5, 0, this.#d * .5);
        this._cornors[1].set(- this.#w * .5, 0, this.#d * .5);
        this._cornors[2].set(this.#w * .5, 0, - this.#d * .5);
        this._cornors[3].set(- this.#w * .5, 0, - this.#d * .5);

    }

    /**
     * @param {number} val
     */
    set w(val) {

        this.#w = val;
        this._cachedWidth = this.#w * this.group.scale.x;
        this.onBasicSizeChanged();

    }

    /**
     * @param {number} val
     */
    set d(val) {

        this.#d = val;
        this._cachedDepth = this.#d * this.group.scale.z;
        this.onBasicSizeChanged();

    }

    get width() {

        if (!this._cachedWidth) {

            this._cachedWidth = this.#w * this.group.scale.x;

        }

        return this._cachedWidth;
        
    }

    get height() {

        if (!this._cachedHeight) {

            this._cachedHeight = this.#h * this.group.scale.y;
        }

        return this._cachedHeight;

    }

    get depth() {

        if (!this._cachedDepth) {

            this._cachedDepth = this.#d * this.group.scale.z;

        }

        return this._cachedDepth;

    }

    get worldPosition() {

        return this.boundingBoxMesh.getWorldPosition(new Vector3());

    }

    getWorldPosition(target) {

        return this.boundingBoxMesh.getWorldPosition(target);

    }

    get bottomY() {

        this.boundingBoxMesh.getWorldPosition(_v1);

        return _v1.y - this.height * .5;

    }

    get topY() {

        this.boundingBoxMesh.getWorldPosition(_v1);

        return _v1.y + this.height * .5;

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

        return new Vector3(- this.#w * .5, 0, - this.#d * .5);

    }

    get worldYDirection() {

        return this.group.up;

    }

    get velocity() {

        return this.isAccelerating && this.isForward && !this.#isPushing ? 
            this.#vel * this.#velEnlarge * this.#slopeCoefficient * this.#slowDownCoefficient : 
            (this.isBackward ? this.#vel * this.#backwardSlowdownCoefficient : this.#vel * this.#slopeCoefficient);

    }

    get turnBackVel() {

        return this.#turnBackVel;

    }

    get aimVel() {

        return this.#aimVel;

    }

    get aimTime() {

        return this.#aimTime;

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

    get damageRange() {

        return this.#damageRange * this.group.scale.z;

    }

    set damageRange(val) {

        this.#damageRange = val;
        this.#logger.log(`${this.name} - damageRange change to: ${this.#damageRange}`);

    }

    get damageRadius() {

        return this.#damageRadius;

    }

    set damageRadius(val) {

        this.#damageRadius = val;
        this.#logger.log(`${this.name} - damageRadius change to: ${this.#damageRadius}`);

    }

    get armedHeight() {

        return this.#armedHeight;

    }

    set armedHeight(val) {

        this.#armedHeight = val;

    }

    get aimDirection() {

        return this.#aimDirection;

    }

    set aimDirection(val) {

        this.#aimDirection = val;

    }

    get pickRange() {

        return this.#pickRange * this.group.scale.z;

    }

    get pickRadius() {

        return this.#pickRadius;

    }

    get entryRange() {

        return this.#entryRange * this.group.scale.z;

    }

    get entryRadius() {

        return this.#entryRadius;

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

        this._showBB = show ?? this._showBB;

        this.boundingBoxMesh.visible = this._showBB;
        this.enablePickLayers(this.boundingBoxMesh);

    }

    showBS(show) {

        this.sovBoundingSphereMesh.visible = show;

    }

    showBBW(show) {

        this._showBBW = show ?? this._showBBW;

        this.boundingBoxWireMesh.visible = this._showBBW;

        return this;

    }

    showBF(show) {

        this._showBF = show ?? this._showBF;

        this.boundingFaceMesh.forEach(bf => bf.visible = show);
        this.boundingFace2Mesh.forEach(bf2 => bf2.visible = show);
        this.enablePickLayers(...this.boundingFaceMesh, ...this.boundingFace2Mesh);

        return this;

    }

    showPushingBox(show) {

        this._showPushingBox = show ?? this._showPushingBox;

        this.pushingOBBBoxMesh.visible = this._showPushingBox;
        this.enablePickLayers(this.pushingOBBBoxMesh);

        return this;

    }

    showCollisionBox(show) {

        if (this.collisionBox) {

            this.collisionBox.group.children.forEach(p => p.visible = show);
            this.enablePickLayers(...this.collisionBox.group.children);

        }

    }

    showHealth(show) {

        this.health.showStrip(show);

    }

    createRay() {

        this.hasRays = true;
 
        const length = this.height * SLOPE_RAY_LENGTH;
        const posY = 0;
        const posX = this.width * .5 - this.#rayPadding;
        const posZ = this.depth * .5 - this.#rayPadding;
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        this.leftRay = new Raycaster(fromVec3, _down, 0, length);
        this.leftRay.layers.set(TOFU_RAY_LAYER);
        this.leftArrow = new ArrowHelper(_down, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        this.rightRay = new Raycaster(fromVec3, _down, 0, length);
        this.rightRay.layers.set(TOFU_RAY_LAYER);
        this.rightArrow = new ArrowHelper(_down, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        this.backLeftRay = new Raycaster(fromVec3, _down, 0, length);
        this.backLeftRay.layers.set(TOFU_RAY_LAYER);
        this.backLeftArrow = new ArrowHelper(_down, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        this.backRightRay = new Raycaster(fromVec3, _down, 0, length);
        this.backRightRay.layers.set(TOFU_RAY_LAYER);
        this.backRightArrow = new ArrowHelper(_down, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // center
        fromVec3 = new Vector3(0, posY, 0);
        this.centerRay = new Raycaster(fromVec3, _down, 0, length);
        this.centerRay.layers.set(TOFU_RAY_LAYER);
        this.centerArrow = new ArrowHelper(_down, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // aimRay
        if (this._needAimRay) {

            fromVec3 = new Vector3(0, this.#armedHeight, 0);
            this.aimRay = new Raycaster(fromVec3, _forward.clone(), 0, this.#damageRange);
            this.aimRay.layers.set(TOFU_AIM_LAYER);
            this.aimArrow = new ArrowHelper(_forward, fromVec3, this.#damageRange, green, HEAD_LENGTH, HEAD_WIDTH);

        }

        // focusRay
        if (this._needFocusRay) {

            fromVec3 = new Vector3(0, this.#focusHeight, 0);
            this.focusRay = new Raycaster(fromVec3, _forward.clone(), 0, this.sightOfView);
            this.focusRay.layers.set(TOFU_FOCUS_LAYER);
            this.focusArrow = new ArrowHelper(_forward, fromVec3, this.sightOfView, yellow, HEAD_LENGTH, HEAD_WIDTH);

        }

        this.rays.push(this.leftRay, this.rightRay, this.backLeftRay, this.backRightRay);

        return this;

    }

    updateAimRay(needUpdateMatrixWorld = true) {

        if (!this._needAimRay) return;

        if (needUpdateMatrixWorld) {

            this.group.updateWorldMatrix(true, false);

        }
        
        _v1.set(0, this.#armedHeight, 0).applyMatrix4(this.group.matrixWorld);
        
        if (this._target) {

            const instance = this._target.instance;
            instance.getWorldPosition(_v2);
            _v2.y += instance.height * .5 - 0.01;
            _v2.sub(_v1).normalize();

        } else {

            // get world direction
            if (this.#aimDirection === aimDirection.forward) {

                _v2.copy(_forward);

            } else if (this.#aimDirection === aimDirection.forwardDown) {

                _v2.copy(_forwardDown);

            } else if (this.#aimDirection === aimDirection.forwardUp) {

                _v2.copy(_forwardUp);

            }

            _v2.applyQuaternion(this.group.quaternion).normalize();

        }        

        this.aimRay.set(_v1, _v2);
        this.aimRay.far = this.damageRange;
        this.aimArrow.position.copy(_v1);
        this.aimArrow.setDirection(_v2);
        this.aimArrow.setLength(this.damageRange, HEAD_LENGTH, HEAD_WIDTH);

        return this;

    }

    updateFocusRay(needUpdateMatrixWorld = true) {
        
        if (!this._needFocusRay) return;

        if (needUpdateMatrixWorld) {
            
            this.group.updateWorldMatrix(true, false);  

        }

        _v1.set(0, this.#focusHeight, 0).applyMatrix4(this.group.matrixWorld);

        if (this._focusTarget) {

            this._focusTarget.getWorldPosition(_v2);
            _v2.y += this.#focusHeight;
            _v2.sub(_v1).normalize();

        } else {

            _v2.copy(_forward);
            _v2.applyQuaternion(this.group.quaternion).normalize();

        }

        this.focusRay.set(_v1, _v2);
        this.focusRay.far = this.sightOfView;
        this.focusArrow.position.copy(_v1);
        this.focusArrow.setDirection(_v2);
        this.focusArrow.setLength(this.sightOfView, HEAD_LENGTH, HEAD_WIDTH);

        return this;

    }

    updateRay(needUpdateMatrixWorld = true) {

        if (needUpdateMatrixWorld) {

            this.group.updateWorldMatrix(true, false);

        }

        // const length = this.height * SLOPE_RAY_LENGTH;
        const posY = 0;
        const posX = this.#w * .5 - this.#rayPadding;
        const posZ = this.#d * .5 - this.#rayPadding;

        // left
        _v1.set(posX, posY, posZ).applyMatrix4(this.group.matrixWorld);
        this.leftRay.set(_v1, _down);
        // this.leftRay.far = length;
        this.leftArrow.position.copy(_v1);
        this.leftArrow.setDirection(_down);
        // this.leftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // right
        _v1.set(- posX, posY, posZ).applyMatrix4(this.group.matrixWorld);
        this.rightRay.set(_v1, _down);
        // this.rightRay.far = length;
        this.rightArrow.position.copy(_v1);
        this.rightArrow.setDirection(_down);
        // this.rightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // backLeft
        _v1.set(posX, posY, - posZ).applyMatrix4(this.group.matrixWorld);
        this.backLeftRay.set(_v1, _down);
        // this.backLeftRay.far = length;
        this.backLeftArrow.position.copy(_v1);
        this.backLeftArrow.setDirection(_down);
        // this.backLeftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // backRight
        _v1.set(- posX, posY, - posZ).applyMatrix4(this.group.matrixWorld);
        this.backRightRay.set(_v1, _down);
        // this.backRightRay.far = length;
        this.backRightArrow.position.copy(_v1);
        this.backRightArrow.setDirection(_down);
        // this.backRightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // center
        _v1.set(0, posY, 0).applyMatrix4(this.group.matrixWorld);
        this.centerRay.set(_v1, _down);
        // this.centerRay.far = length;
        this.centerArrow.position.copy(_v1);
        this.centerArrow.setDirection(_down);
        // this.centerArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        this.updateAimRay(false);
        if (this._inSightTargets.length === 0) this.updateFocusRay(false);

        return this;

    }

    updateRayLength(type) {

        let length;
        switch (type) {

            case 'terrain':
                length = this.height * TERRAIN_RAY_LENGTH;
                break;

            default:
                length = this.height * SLOPE_RAY_LENGTH;
                break;

        }

        this.leftRay.far = length;
        this.rightRay.far = length;
        this.backLeftRay.far = length;
        this.backRightRay.far = length;
        this.centerRay.far = length;

        this.leftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);
        this.rightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);
        this.backLeftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);
        this.backRightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);
        this.centerArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        return this;

    }

    updateOBB() {

        this.group.updateWorldMatrix(true, false);
        this.boundingBoxMesh.updateMatrixWorld();
        this.pushingOBBBoxMesh.updateMatrixWorld();

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
        // for SimplePhysics self-check
        this.collisionBox.father = this;

        this.walls.push(...this.collisionBox.walls);
        this.group.add(this.collisionBox.group);

        this.showCollisionBox(false);

    }

    updateWalls(needUpdateParentMatrixWorld = true) {

        if (needUpdateParentMatrixWorld) {

            this.collisionBox.group.updateWorldMatrix(true, true);

        } else {

            this.collisionBox.group.updateWorldMatrix(false, true);

        }
        
        for (let i = 0, il = this.walls.length; i < il; i++) {

            const w = this.walls[i];

            w.updateRay(false);

            if (w.isOBB) {

                w.updateOBB(false);

            }

        }

        return this;

    }

    updateBoundingFaces(needUpdateParentMatrixWorld = true) {

        if (needUpdateParentMatrixWorld) {

            this.boundingFaceGroup.updateWorldMatrix(true, true);

        } else {

            this.boundingFaceGroup.updateWorldMatrix(false, true)

        }

    }

    updateAccessories(needUpdateMatrixWorld = true) {
        
        this.updateOBB(needUpdateMatrixWorld);
        this.updateRay(false);
        this.updateWalls(false);
        this.updateBoundingFaces(false);

    }

    setBFColor(color, face) {

        const find = this.activeBoundingFace.find(bf => bf.name.includes(face));

        if (find) find.material.color.setHex(color);

        return this;

    }

    resetBFColor() {

        if (this._useCustomBoundingFaces) {

            if (this.isRotating && !this.attacking) {

                this.boundingFaceMesh.forEach(bf => bf.material.color.setHex(BF2));

            } else {

                this.boundingFaceMesh.forEach(bf => bf.material.color.setHex(BF));

            }

        } else {

            this.boundingFaceMesh.forEach(bf => bf.material.color.setHex(BF));
            this.boundingFace2Mesh.forEach(bf2 => bf2.material.color.setHex(BF2));

        }

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

    setPosition(pos, resetState = false) {

        this.group.position.set(...pos);

        if (resetState) {

            this.updateAccessories();
            this.setSlopeIntersection();
            this.resetFallingState();
            this.syncRapierWorld();

        }

        return this;

    }

    setRotation(rot) {

        this.group.rotation.set(...rot);

        return this;

    }

    setScale(scale) {

        this.group.scale.set(...scale);
        this.onScaleChanged();

        return this;

    }

    onScaleChanged() {

        this._cachedWidth = this.#w * this.group.scale.x;
        this._cachedHeight = this.#h * this.group.scale.y;
        this._cachedDepth = this.#d * this.group.scale.z;

        this.rapierContainer.scale = this.group.scale;

    }

    setSlopeCoefficient(slope) {

        if (!slope) {

            this.slopeCoefficient = 1;

        }

        else {

            const { slopeRatio, depth, height } = slope;
            const cosTheta = slopeRatio ?? depth / Math.sqrt(depth * depth + height * height);

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

    tickRotateActions(delta) {

        const params = { group: this.group, delta, $self: this };
        this.aimTick(params);
        this.quickTurnTick(params);

    }

    tick(delta) {

        const params = this.setTickParams(delta);
        this.#slowDownCoefficient = 1;

        this.tankmoveTick(params);
        this.updateAccessories();

    }

    tickRaw(delta) {

        const params = this.setTickParams(delta);
        const moveVector = this.tankmoveTickRaw(params);

        return moveVector;

    }

    tickClimb(delta, wall) {

        this.climbWallTick({ delta, wall, $self: this });
        this.updateAccessories();

    }

    tickFall(delta) {

        this.fallingTick({ delta, $self: this });
        this.updateAccessories();

    }

    tickFallRaw(delta) {

        const moveVector = this.fallingTickRaw({ delta });

        return moveVector;

    }

    onGround(floor) {

        this.onGroundTick({ floor, $self: this });
        this.updateAccessories();

    }

    tickOnHittingBottom(bottomWall) {

        this.onHittingBottomTick({ bottomWall, $self: this });
        this.updateAccessories();
        
    }

    tickOnSlope(slopes, type = 'normal') {

        let result = this.onSlopeTick({ slopes, type, $self: this });
        this.updateAccessories();

        return result;

    }

    tickOnSlopePointsAdjust(points) {

        this.setOnSlopePoint({ points, $self: this });
        this.updateAccessories();

    }

    tickOnLandPointsAdjustRaw(points) {

        const moveVector = this.setOnLandPointRaw({ points, $self: this });

        return moveVector;

    }

    tickWithWall(delta, wall) {

        const params = this.setTickParams(delta);
        params.wall = wall;

        this.#slowDownCoefficient = SLOWDOWN_COEFFICIENT;
        this.tankmoveTickWithWall(params);
        this.updateAccessories();

    }

    applyPositionAdjustment() {

        this.applyWorldDeltaV3({ group: this.group });
        this.updateAccessories();

    }

    trackResources() {

        this.track(this.group);

        this.track(this.leftArrow);
        this.track(this.rightArrow);
        this.track(this.backLeftArrow);
        this.track(this.backRightArrow);
        this.track(this.aimArrow);

        this.track(this.boundingBoxHelper);

    }

    destroy() {

        this.dispose();
        this.isActive = false;
        this.disposed = true;
        this._inSightTargets = undefined;

    }

    // Rapier physics function
    rapierContainer;
    rapierInstances = Object.assign({}, RAPIER_INSTANCES);
    // events
    onRapierInstanceRemoved;
    onRapierInstanceAdded;

    adjustDeadInstance() {

        if (this.rapierContainer.actives.length === 0) return;

        const { offsetY, gltfScale = [1, 1, 1] } = this.specs;
        const deadInstance = this.rapierContainer.getInstanceByName(this.rapierInstances.DEAD_BODY);
        const deadMeshHeight = deadInstance.geometry.parameters.height * deadInstance.scale.y;
        const totalScaleY = gltfScale[1] * this.scale.y;
        const biasy = (offsetY ? (offsetY * totalScaleY + (this.height - deadMeshHeight) * .5) : - deadMeshHeight * .5) // world y
            / totalScaleY; // local y
        this.gltf.adjustModelPosition({ biasy });
        this.group.position.y -= (this.height - deadMeshHeight) * .5;
        this.rapierContainer.setActiveInstances([this.rapierInstances.DEAD_BODY]);

    }

    adjustCharacterControllerInstance() {

        if (this.rapierContainer.actives.length === 0) return;

        this.rapierContainer.setActiveInstances([this.rapierInstances.CHARACTER_CONTROLLER]);
        this.gltf.adjustModelPosition();

    }

    syncRapierWorld() {

        if (this.rapierContainer.actives.length === 0) return;

        const activeInstance = this.rapierContainer.getInstanceByName(this.rapierContainer.actives[0].name);
        if (activeInstance.userData.physics) {

            const { collider, body } = activeInstance.userData.physics;

            if (this.onRapierInstanceRemoved && this.onRapierInstanceAdded) {

                if (collider || body) {

                    this.onRapierInstanceRemoved(this);
                    this.onRapierInstanceAdded(this);

                }

            } else {

                if (body) {

                    // for dynamic body
                    this.group.updateWorldMatrix(true, false);
                    this.group.matrixWorld.decompose(_v1, _q1, _v2);
                    body.setTranslation(_v1);
                    body.setRotation(_q1);

                } else if (collider) {

                    // for character controller
                    this.group.updateWorldMatrix(true, false);
                    this.group.matrixWorld.decompose(_v1, _q1, _v2);
                    collider.setTranslation(_v1);
                    collider.setRotation(_q1);

                }

            }

        }

        return this;

    }

    onRapierUpdated() {

        this.updateAccessories();

    }

}

export { TofuBase };