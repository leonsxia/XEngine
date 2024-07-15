import { Group, Box3, Box3Helper, Vector3 } from 'three';
import { createMeshes } from './meshes';
import { Moveable2D } from '../../movement/Moveable2D';

const ENLARGE = 2.5;

class Tofu extends Moveable2D {
    name = '';
    group;
    meshes;
    #w;
    #d;
    #h;
    #rotateR = 1.2;
    boundingBox;
    boundingBoxHelper;
    #g = 9.8;
    #fallingTime = 0;
    #vel = 1.34;

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
            specs: { width, depth, height }
        } = this.meshes;
        this.group.add(
            body, slotLeft, slotRight, 
            boundingBox, boundingBoxWire, 
            frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace
        ).name = name;
        this.#w = width;
        this.#d = depth;
        this.#h = height;
        this.boundingBox = new Box3();
        this.boundingBoxHelper = new Box3Helper(this.boundingBox, 0x00ff00);
        this.boundingBoxHelper.name = `${name}-box-helper`;
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
        return this.isAccelerating ? this.#vel * ENLARGE : this.#vel;
    }

    get recoverCoefficient() {
        return this.isAccelerating ? 0.008 : 0.004;
    }
    
    get backwardCoefficient() {
        return this.isAccelerating ? 0.002 : 0.001;
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

    updateBoundingBoxHelper() {
        const { matrixWorld, geometry: { boundingBox } } = this.boundingBoxMesh;
        this.group.updateMatrixWorld();
        this.boundingBox.copy(boundingBox).applyMatrix4(matrixWorld);
        // this.boundingBoxHelper.updateMatrixWorld();
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
            group: this.group, R, rotateVel, dist, delta
        };

        return params;
    }

    tick(delta) {
        const params = this.setTickParams(delta);
        this.tankmoveTick(params);
        this.updateBoundingBoxHelper();
    }

    tickFall(delta) {
        const now = this.#fallingTime + delta;
        const deltaY = .5 * this.#g * (now * now - this.#fallingTime * this.#fallingTime);
        this.group.position.y -= deltaY;
        this.#fallingTime = now;
        this.updateBoundingBoxHelper();
    }

    onGround(floor) {
        const floorY = floor.mesh.localToWorld(new Vector3(0, 0, 0)).y;
        this.group.position.y = floorY + this.height / 2;
        this.#fallingTime = 0;
        this.updateBoundingBoxHelper();
    }

    tickWithWall(delta, wall) {
        const params = this.setTickParams(delta);
        params.wall = wall;
        this.tankmoveTickWithWall(params);
        this.updateBoundingBoxHelper();
    }
}

export { Tofu };