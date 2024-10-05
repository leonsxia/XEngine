import { Group, Box3, Box3Helper, Vector3 } from 'three';
import { createMeshes } from './meshes';
import { Moveable2D } from '../../movement/Moveable2D';

const ENABLE_QUICK_TURN = false;
const ENABLE_CLIMBING = false;

class Train extends Moveable2D {
    name = '';
    group;
    meshes;
    #w;
    #d;
    #h;
    #rl;
    #rs;
    #rotateR = 3;
    boundingBox;
    boundingBoxHelper;

    constructor(name) {
        super();
        this.name = name;
        this.group = new Group();
        this.meshes = createMeshes();

        const {
            cabin, chimney, nose, smallWheelFront, smallWheelCenter, smallWheelRear, bigWheel,
            bbObjects: {
                boundingBox, boundingBoxWire, frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace
            },
            specs: { width, depth, height, Rl, Rs }
        } = this.meshes;
        this.group.add(
            cabin, nose, chimney, smallWheelRear, smallWheelCenter, smallWheelFront, bigWheel,
            boundingBox, boundingBoxWire,
            frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace
        ).name = name;
        this.#w = width;
        this.#d = depth;
        this.#h = height;
        this.#rl = Rl;
        this.#rs = Rs;

        this.boundingBox = new Box3();
        this.boundingBoxHelper = new Box3Helper(this.boundingBox, 0x00ff00);
        this.boundingBoxHelper.name = `${name}-box-helper`;

        this.paddingCoefficient = 0.1;
    }

    get boundingBoxWireMesh() {
        return this.group.getObjectByName('boundingBoxWire');
    }

    get boundingBoxMesh() {
        return this.group.getObjectByName('boundingBox');
    }

    get boundingFaceMesh() {
        return [
            this.group.getObjectByName('frontFace'),
            this.group.getObjectByName('backFace'),
            this.group.getObjectByName('leftFace'),
            this.group.getObjectByName('rightFace')
        ]
    }

    get obb() {
        return this.boundingBoxMesh.userData.obb;
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
        return new Vector3(this.#w / 2, 0, this.#d / 2);
    }

    get rightCorVec3() {
        return new Vector3(- this.#w / 2, 0, this.#d / 2);
    }

    get leftBackCorVec3() {
        return new Vector3(this.#w / 2, 0, - this.#d / 2);
    }

    get rightBackCorVec3() {
        return new Vector3( - this.#w / 2, 0, - this.#d / 2);
    }

    get velocity() {
        return this.isAccelerating ? 10 : 2.55;
    }

    get recoverCoefficient() {
        return this.isAccelerating ? 0.04 : 0.02;
    }

    get quickRecoverCoefficient() {
        return .03;
    }
    
    get backwardCoefficient() {
        return this.isAccelerating ? 0.02 : 0.005;
    }

    get enableQuickTurn() {
        return ENABLE_QUICK_TURN;
    }

    get enableClimbing() {
        return ENABLE_CLIMBING;
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

    updateOBB() {
        const { matrixWorld, geometry: { boundingBox, userData } } = this.boundingBoxMesh;
        this.group.updateWorldMatrix(true, true);
        this.boundingBox.copy(boundingBox).applyMatrix4(matrixWorld);
        // this.boundingBoxHelper.updateMatrixWorld();

        // update OBB
        this.boundingBoxMesh.userData.obb.copy( userData.obb );
        this.boundingBoxMesh.userData.obb.applyMatrix4( matrixWorld );

        return this;
    }

    setBoundingBoxHelperColor(color) {
        this.boundingBoxHelper.material.color.setHex(color);
        this.boundingBoxWireMesh.material.color.setHex(color);
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

    setTickParams(delta) {
        const R = this.isAccelerating ? this.#rotateR * 2.5 : this.#rotateR;
        const rotateVel = this.velocity / R;
        const smallWheelRotateVel = this.velocity / this.#rs;
        const largeWheelRotateVel = this.velocity / this.#rl;
        const dist = this.velocity * delta;
        const params = {
            group: this.group, R, rotateVel, dist, delta, 
            smallWheelRotateVel, largeWheelRotateVel,
            player: this
        };

        return params;
    }
    
    tick(delta) {
        const params = this.setTickParams(delta);
        this.tankmoveTick(params);
        this.tickWheels(delta, params);
        this.updateOBB();
    }

    tickFall(delta) {
        this.fallingTick({ delta, player: this });
        this.updateOBB();
    }

    onGround(floor) {
        this.onGroundTick({ floor, player: this });
        this.updateOBB();
    }

    tickOnSlope(slope) {
        // to do
    }

    tickOnHittingBottom(bottomWall) {

        this.onHittingBottomTick({ bottomWall, player: this });

        this.updateOBB();
        
    }

    tickWithWall(delta, wall, playerTicked = false) {
        const params = this.setTickParams(delta);
        params.wall = wall;
        params.playerTicked = playerTicked;
        this.tankmoveTickWithWall(params);
        this.tickWheels(delta, params);
        this.updateOBB();
    }

    tickWheels(delta, params) {
        const { smallWheelRotateVel, largeWheelRotateVel } = params;
        if (this.isForward) {
            this.meshes.bigWheel.rotation.x += delta * largeWheelRotateVel;
            this.meshes.smallWheelFront.rotation.x += delta * smallWheelRotateVel;
            this.meshes.smallWheelCenter.rotation.x += delta * smallWheelRotateVel;
            this.meshes.smallWheelRear.rotation.x += delta * smallWheelRotateVel;
        }else if (this.isBackward) {
            this.meshes.bigWheel.rotation.x -= delta * largeWheelRotateVel;
            this.meshes.smallWheelFront.rotation.x -= delta * smallWheelRotateVel;
            this.meshes.smallWheelCenter.rotation.x -= delta * smallWheelRotateVel;
            this.meshes.smallWheelRear.rotation.x -= delta * smallWheelRotateVel;
        }
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
}

export { Train };