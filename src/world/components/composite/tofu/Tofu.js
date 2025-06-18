import { Group, Box3, Box3Helper, Vector3, Raycaster, ArrowHelper } from 'three';
import { createMeshes, createDefaultBoundingObjectMeshes, createSovBoundingSphereMesh } from './meshes';
import { Moveable2D } from '../../movement/Moveable2D';
import { orange, BF, BF2, green } from '../../basic/colorBase';
import { CAMERA_RAY_LAYER, CORNOR_RAY_LAYER, TOFU_AIM_LAYER, TOFU_RAY_LAYER } from '../../utils/constants';
import { polarity } from '../../utils/enums';
import { CollisionBox } from '../../Models';
import { ResourceTracker } from '../../../systems/ResourceTracker';
import { Logger } from '../../../systems/Logger';
import { Health } from '../../mechanism/Health';

const ENLARGE = 2.5;
const ENABLE_QUICK_TURN = true;
const ENABLE_CLIMBING = true;
const SLOWDOWN_COEFFICIENT = .78;
const SLOPE_COEFFICIENT = .8;
const DETECT_SCOPE_MIN = 1;

const HEAD_LENGTH = .5;
const HEAD_WIDTH = .1;

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
const _down = new Vector3(0, -1, 0);
const _forward = new Vector3(0, 0, 1);

const DEBUG = true;

class Tofu extends Moveable2D {

    name = '';
    group;
    meshes;
    boundingObjects;

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

    hasRays = false;
    leftRay;
    rightRay;
    backLeftRay;
    backRightRay;
    aimRay;
    rays = [];
    
    leftArrow;
    rightArrow;
    backLeftArrow;
    backRightArrow;
    aimArrow;

    intersectSlope;

    _collisionSize;
    collisionBox;
    walls = [];
    _useCustomBoundingFaces = false;
    
    _size;
    _useBF2 = false;
    _showBF = false;
    _showBBHelper = false;
    _showBB = false;
    _showBBW = false;
    _showPushingBox = false;
    _showCBoxArrows = false;
    _showArrows = false;

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
    #aimVel;
    #aimTime;
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

    #damageRange = 0;

    _cachedWidth;
    _cachedHeight;
    _cachedDepth;

    _cornors = [];

    resTracker = new ResourceTracker();
    track = this.resTracker.track.bind(this.resTracker);
    dispose = this.resTracker.dispose.bind(this.resTracker);
    isActive = true;

    #logger = new Logger(DEBUG, 'Tofu');

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
            recoverCt = .01, quickRecoverCt = .03, slopeCt = 1, slowdownCt = 1, backwardSlowdownCt = .7, backwardRotatingRCt = .7,
            aimVel = 3 * Math.PI, aimTime = .05
        } = specs;
        const { collisionSize = { width, depth, height } } = specs;
        const { createDefaultBoundingObjects = true } = specs;

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

        this.name = name;
        this.group = new Group();
        this.group.isTofu = true;
        this.group.father = this;
        this.meshes = createMeshes(this._size);

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
                frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
                frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2,
                pushingOBBBox
            );

            this.boundingBoxMesh = boundingBox;
            this.boundingBoxWireMesh = boundingBoxWire;
            this.pushingOBBBoxMesh = pushingOBBBox;
            this.boundingFaceMesh = [frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace];
            this.boundingFace2Mesh = [frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2]
            
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

        this.health = new Health({
            baseWidth: 80, size: 7, borderSize: 2, showText: true
        });

        this.group.add(this.health.strip);        
        this.health.strip.position.y = height / 2 + .2;
        this.health.showStrip(false);

    }

    get activeBoundingFace() {

        if (this._useCustomBoundingFaces) {

            return this.boundingFaceMesh;

        } else {

            if (this._useBF2) {

                return this.boundingFace2Mesh;

            } else {

                return this.boundingFaceMesh;

            }

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

        return this.#damageRange;

    }

    set damageRange(val) {

        this.#damageRange = val;
        this.onDamgeRangeChanged();

    }

    onDamgeRangeChanged() {

        this.#logger.log(`${this.name} - damgeRange: ${this.#damageRange}`);
        this.updateAimRay();

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

        this.setBoundingFaceVisibility();
        this.enablePickLayers(...this.boundingFaceMesh, ...this.boundingFace2Mesh);

        return this;

    }

    showPushingBox(show) {

        this._showPushingBox = show ?? this._showPushingBox;

        this.pushingOBBBoxMesh.visible = this._showPushingBox;

        return this;

    }

    showArrows(show) {

        this._showArrows = show;
        this.leftArrow.visible = show;
        this.rightArrow.visible = show;
        this.backLeftArrow.visible = show;
        this.backRightArrow.visible = show;

    }

    showCollisionBox(show) {

        if (this.collisionBox) {

            this.collisionBox.group.visible = show;

        }

    }

    showHealth(show) {

        this.health.showStrip(show);

    }

    createRay() {

        this.hasRays = true;
 
        const length = this.height;
        const posY = this.height * .5;
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

        // aimRay
        fromVec3 = new Vector3();
        this.aimRay = new Raycaster(fromVec3, _forward.clone(), this.damageRange);
        this.aimRay.layers.set(TOFU_AIM_LAYER);
        this.aimArrow = new ArrowHelper(_forward, fromVec3, this.damageRange, green, HEAD_LENGTH, HEAD_WIDTH);

        this.rays.push(this.leftRay, this.rightRay, this.backLeftRay, this.backRightRay);

        return this;

    }

    updateAimRay(needUpdateMatrixWorld = true) {

        if (needUpdateMatrixWorld) {

            this.group.updateWorldMatrix(true, true);

        }
        
        _v1.set(0, 0, 0).applyMatrix4(this.group.matrixWorld);

        // get world direction
        const e = this.group.matrixWorld.elements;
        _v2.set(e[8], e[9], e[10]).normalize();

        this.aimRay.set(_v1, _v2);
        this.aimRay.far = this.damageRange;
        this.aimArrow.position.copy(_v1);
        this.aimArrow.setDirection(_v2);
        this.aimArrow.setLength(this.damageRange, HEAD_LENGTH, HEAD_WIDTH);

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

        // left
        _v1.set(posX, posY, posZ).applyMatrix4(this.group.matrixWorld);
        this.leftRay.set(_v1, _down);
        this.leftRay.far = length;
        this.leftArrow.position.copy(_v1);
        this.leftArrow.setDirection(_down);
        this.leftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // right
        _v1.set(- posX, posY, posZ).applyMatrix4(this.group.matrixWorld);
        this.rightRay.set(_v1, _down);
        this.rightRay.far = length;
        this.rightArrow.position.copy(_v1);
        this.rightArrow.setDirection(_down);
        this.rightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // backLeft
        _v1.set(posX, posY, - posZ).applyMatrix4(this.group.matrixWorld);
        this.backLeftRay.set(_v1, _down);
        this.backLeftRay.far = length;
        this.backLeftArrow.position.copy(_v1);
        this.backLeftArrow.setDirection(_down);
        this.backLeftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // backRight
        _v1.set(- posX, posY, - posZ).applyMatrix4(this.group.matrixWorld);
        this.backRightRay.set(_v1, _down);
        this.backRightRay.far = length;
        this.backRightArrow.position.copy(_v1);
        this.backRightArrow.setDirection(_down);
        this.backRightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        this.updateAimRay(false);

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
        this.onScaleChanged();

        return this;

    }

    onScaleChanged() {

        this._cachedWidth = this.#w * this.group.scale.x;
        this._cachedHeight = this.#h * this.group.scale.y;
        this._cachedWidth = this.#d * this.group.scale.z;

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
        const distance = this.getWorldPosition(_v1).distanceTo(target.getWorldPosition(_v2));

        if (distance < this.sightOfView) {

            isInSight = true;

        } else {

            isInSight = false;

        }

        const dirAngle = this.getTargetDirectionAngle(target);

        return { isInSight, distance, dirAngle, instance: target };

    }

    getNearestInSightTarget(targets, wrappedTargets, force = true, type = 'distance') {
        
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

            switch (type) {

                case 'distance':
                    targetsInSight.sort((a, b) => {

                        return a.distance - b.distance;

                    });
                    break;

                case 'angle':
                    targetsInSight.sort((a, b) => {

                        return a.dirAngle.angle - b.dirAngle.angle;

                    });
                    break;

            }
            

            nearestTarget = targetsInSight[0];

        }

        return nearestTarget;

    }

    checkTargetInSight(target) {

        const checkResult = this.checkSightOfView(target);

        if (checkResult.isInSight) {

            const find = this._inSightTargets.find(t => t.instance === checkResult.instance);
            if (!find) {

                this._inSightTargets.push(checkResult);
                this.onSovSphereTriggerEnter.call(this, checkResult.instance);                
                
            } else {

                Object.assign(find, checkResult);
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

        const selfDir = this.boundingBoxMesh.getWorldDirection(_v1);
        target.getWorldPosition(_v2);
        this.getWorldPosition(_v3);
        _v2.y = 0;
        _v3.y = 0;
        const tarDir = _v2.sub(_v3);
        const angle = selfDir.angleTo(tarDir);

        // in right-handed system, y > 0 means counter-clockwise, y < 0 means clockwise
        const direction = selfDir.cross(tarDir).y > 0 ? polarity.left : polarity.right;

        return {
            angle: angle,
            direction: direction
        };

    }

    checkAimRayIntersect(objects) {

        return this.aimRay.intersectObjects(objects);

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

    }

}

export { Tofu };