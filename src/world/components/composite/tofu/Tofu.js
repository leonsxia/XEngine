import { Group, Box3, Box3Helper, Vector3, Raycaster, ArrowHelper } from 'three';
import { createMeshes } from './meshes';
import { Moveable2D } from '../../movement/Moveable2D';
import { orange } from '../../basic/colorBase';

const ENLARGE = 2.5;
const ENABLE_QUICK_TURN = true;
const ENABLE_CLIMBING = true;
const SLOWDOWN_COEFFICIENT = .78;
const SLOPE_COEFFICIENT = .6;

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
    
    leftArrow;
    rightArrow;
    backLeftArrow;
    backRightArrow;

    #w;
    #d;
    #h;
    #rotateR = .9;
    #vel = 1.34;
    #turnBackVel = 2.5 * Math.PI;
    #recoverCoefficient = .01;
    #quickRecoverCoefficient = .03;
    #climbingVel = 1.34;
    #rayPadding = .1;
    #slopeCoefficient = 1;
    #slowDownCoefficient = 1;

    constructor(name) {

        super();

        this.name = name;
        this.group = new Group();
        this.meshes = createMeshes();

        const { 

            body, slotLeft, slotRight, 
            bbObjects: {
                boundingBox, boundingBoxWire, frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace
            },
            pushingOBBBox,
            specs: { width, depth, height }

        } = this.meshes;

        this.group.add(

            body, slotLeft, slotRight, 
            boundingBox, boundingBoxWire, 
            frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
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

    get rays() {
        
        return [this.leftRay, this.rightRay, this.backLeftRay, this.backRightRay];

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

    get velocity() {

        return this.isAccelerating && !this.isBackward ? 
            this.#vel * ENLARGE * this.#slopeCoefficient * this.#slowDownCoefficient : 
            this.#vel * this.#slopeCoefficient;

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

        return this.isAccelerating ? 0.002 : 0.001;

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
 
    showBB(show) {

        this.boundingBoxMesh.visible = show;

    }

    showBBW(show) {

        this.boundingBoxWireMesh.visible = show;

        return this;

    }

    showBF(show) {

        this.boundingFaceMesh.forEach(bf => { if (bf) bf.visible = show });

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
        const headLength = .5;
        const headWidth = .1;
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        this.leftRay = new Raycaster(fromVec3, dir, 0, length);
        this.leftRay.layers.set(2);
        this.leftArrow = new ArrowHelper(dir, fromVec3, length, orange, headLength, headWidth);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        this.rightRay = new Raycaster(fromVec3, dir, 0, length);
        this.rightRay.layers.set(2);
        this.rightArrow = new ArrowHelper(dir, fromVec3, length, orange, headLength, headWidth);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        this.backLeftRay = new Raycaster(fromVec3, dir, 0, length);
        this.backLeftRay.layers.set(2);
        this.backLeftArrow = new ArrowHelper(dir, fromVec3, length, orange, headLength, headWidth);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        this.backRightRay = new Raycaster(fromVec3, dir, 0, length);
        this.backRightRay.layers.set(2);
        this.backRightArrow = new ArrowHelper(dir, fromVec3, length, orange, headLength, headWidth);

        return this;
    }

    updateRay(needUpdateMatrixWorld) {

        if (needUpdateMatrixWorld) {

            this.group.updateWorldMatrix(true, true);

        }

        const posY = this.height * .5;
        const posX = this.width * .5 - this.#rayPadding;
        const posZ = this.depth * .5 - this.#rayPadding;
        const dir = new Vector3(0, - 1, 0);
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.leftRay.set(fromVec3, dir);
        this.leftArrow.position.copy(fromVec3);
        this.leftArrow.setDirection(dir);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.rightRay.set(fromVec3, dir);
        this.rightArrow.position.copy(fromVec3);
        this.rightArrow.setDirection(dir);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.backLeftRay.set(fromVec3, dir);
        this.backLeftArrow.position.copy(fromVec3);
        this.backLeftArrow.setDirection(dir);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.backRightRay.set(fromVec3, dir);
        this.backRightArrow.position.copy(fromVec3);
        this.backRightArrow.setDirection(dir);

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

        const find = this.boundingFaceMesh.find(bf => bf.name === face);

        if (find) find.material.color.setHex(color);

        return this;

    }

    resetBFColor(color) {

        this.boundingFaceMesh.forEach(bf => bf.material.color.setHex(color));

        return this;

    }

    setBoundingBoxHelperColor(color) {

        this.boundingBoxHelper.material.color.setHex(color);

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

        const R = this.isAccelerating ? this.#rotateR * ENLARGE : this.#rotateR;
        
        const rotateVel = this.velocity / R;

        const dist = this.velocity * delta;

        const params = {

            group: this.group, R, rotateVel, dist, delta,
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

    tickOnSlope(slope) {

        const isFalling = this.onSlopeTick({ slope, player: this });

        this.updateOBB();

        this.updateRay(false);

        return isFalling;

    }

    tickWithWall(delta, wall) {

        const params = this.setTickParams(delta);

        params.wall = wall;

        this.#slowDownCoefficient = SLOWDOWN_COEFFICIENT;

        this.tankmoveTickWithWall(params);

        this.updateOBB();

        this.updateRay(false);

    }
}

export { Tofu };