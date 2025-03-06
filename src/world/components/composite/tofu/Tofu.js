import { Group, Box3, Box3Helper, Vector3, Raycaster, ArrowHelper } from 'three';
import { createMeshes } from './meshes';
import { Moveable2D } from '../../movement/Moveable2D';
import { orange, BF, BF2 } from '../../basic/colorBase';
import { CAMERA_RAY_LAYER, CORNOR_RAY_LAYER, PLAYER_RAY_LAYER } from '../../utils/constants';

const ENLARGE = 2.5;
const ENABLE_QUICK_TURN = true;
const ENABLE_CLIMBING = true;
const SLOWDOWN_COEFFICIENT = .78;
const SLOPE_COEFFICIENT = .8;
const PLAYER_DETECT_SCOPE_MIN = 1;

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
    
    _size;
    _useBF2 = false;
    _showBF = false;
    _showBBHelper = false;
    _showBBW = false;

    #w;
    #d;
    #h;
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

        const { name, size = { width: .9, width2: .9, depth: .9, depth2: .9, height: 1.8 } } = specs;
        const { 
            rotateR = .9, vel = 1.34, stoodTurningVel = 1.5, turnbackVel = 2.5 * Math.PI, velEnlarge = 2.5, rotateREnlarge = 2.5, climbingVel = 1.34, rayPaddiing = .2, 
            recoverCt = .01, quickRecoverCt = .03, slopeCt = 1, slowdownCt = 1, backwardSlowdownCt = .7, backwardRotatingRCt = .7 
        } = specs;

        this._size = size;

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
        this.group.isPlayer = true;
        this.group.father = this;
        this.meshes = createMeshes(size);

        const { 

            body, slotLeft, slotRight, 
            bbObjects: {
                boundingBox, boundingBoxWire, 
                frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
                frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2
            },
            pushingOBBBox

        } = this.meshes;

        this.enablePickLayers(body, slotLeft, slotRight);

        this.group.add(

            body, slotLeft, slotRight, 
            boundingBox, boundingBoxWire, 
            frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
            frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2,
            pushingOBBBox

        ).name = name;

        this.#w = size.width;
        this.#d = size.depth;
        this.#h = size.height;

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

    get playerDetectScopeMin() {

        return PLAYER_DETECT_SCOPE_MIN;
        
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
        this.leftRay.layers.set(PLAYER_RAY_LAYER);
        this.leftArrow = new ArrowHelper(dir, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        this.rightRay = new Raycaster(fromVec3, dir, 0, length);
        this.rightRay.layers.set(PLAYER_RAY_LAYER);
        this.rightArrow = new ArrowHelper(dir, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        this.backLeftRay = new Raycaster(fromVec3, dir, 0, length);
        this.backLeftRay.layers.set(PLAYER_RAY_LAYER);
        this.backLeftArrow = new ArrowHelper(dir, fromVec3, length, orange, HEAD_LENGTH, HEAD_WIDTH);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        this.backRightRay = new Raycaster(fromVec3, dir, 0, length);
        this.backRightRay.layers.set(PLAYER_RAY_LAYER);
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

    setTickParams(delta) {

        const R = this.isAccelerating && this.isForward ?
            this.#rotateR * this.#rotateREnlarge :
            (this.isBackward ? this.#rotateR * this.#backwardRotatingRadiusCoefficient : this.#rotateR);
        
        const rotateVel = this.velocity / R;
        const stoodRotateVel = this.#stoodTurningVel / R;

        const dist = this.velocity * delta;

        const params = {

            group: this.group, R, rotateVel, stoodRotateVel, dist, delta,
            player: this

        };

        return params;

    }

    tick(delta) {

        const params = this.setTickParams(delta);

        this.#slowDownCoefficient = 1;

        this.tankmoveTick(params);

        this.updateOBB();

        this.updateRay(false);

    }

    tickClimb(delta, wall) {

        this.climbWallTick({ delta, wall, player: this });

        this.updateOBB();

        this.updateRay(false);

    }

    tickFall(delta) {

        this.fallingTick({ delta, player: this });

        this.updateOBB();

        this.updateRay(false);

    }

    onGround(floor) {

        this.onGroundTick({ floor, player: this });

        this.updateOBB();

        this.updateRay(false);

    }

    tickOnHittingBottom(bottomWall) {

        this.onHittingBottomTick({ bottomWall, player: this });

        this.updateOBB();

        this.updateRay(false);
        
    }

    tickOnSlope(slope) {

        this.onSlopeTick({ slope, player: this });

        this.updateOBB();

        this.updateRay(false);

    }

    tickWithWall(delta, wall, playerTicked = false) {

        const params = this.setTickParams(delta);

        params.wall = wall;
        params.playerTicked = playerTicked;

        this.#slowDownCoefficient = SLOWDOWN_COEFFICIENT;

        this.tankmoveTickWithWall(params);

        this.updateOBB();

        this.updateRay(false);

    }

    applyPositionAdjustment() {

        this.applyWorldDeltaV3({ group: this.group });

        this.updateOBB();

        this.updateRay(false);

    }

    // eslint-disable-next-line no-unused-vars
    finalTick(delta) {}

}

export { Tofu };