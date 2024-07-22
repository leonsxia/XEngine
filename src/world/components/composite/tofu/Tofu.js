import { Group, Box3, Box3Helper, Vector3 } from 'three';
import { createMeshes } from './meshes';
import { Moveable2D } from '../../movement/Moveable2D';

const ENLARGE = 2.5;
const ENABLE_QUICK_TURN = true;
const ENABLE_CLIMBING = true;

class Tofu extends Moveable2D {
    name = '';
    group;
    meshes;
    #w;
    #d;
    #h;
    #rotateR = .9;
    boundingBox;
    boundingBoxHelper;
    #vel = 1.34;

    #climbingVel = 1.34;

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

        this.paddingCoefficient = .06 * ENLARGE;
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
        ]
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
        return this.isAccelerating && !this.isBackward ? this.#vel * ENLARGE : this.#vel;
    }

    get turnBackVel() {
        return 2.5 * Math.PI;
    }

    get climbingVel() {
        return this.#climbingVel;
    }

    get recoverCoefficient() {
        return this.isAccelerating ? 0.01 : 0.01;
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
        this.group.updateMatrixWorld();

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
        this.tankmoveTick(params);
        this.updateOBB();
    }

    tickClimb(delta, wall) {
        this.climbWallTick({ delta, wall, player: this });
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

    tickWithWall(delta, wall) {
        const params = this.setTickParams(delta);
        params.wall = wall;
        this.tankmoveTickWithWall(params);
        this.updateOBB();
    }
}

export { Tofu };