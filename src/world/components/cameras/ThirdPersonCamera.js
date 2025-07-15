import { Vector3, Raycaster, ArrowHelper, Object3D } from 'three';
import { blue, green, red, yellow } from '../basic/colorBase';
import { PLAYER_CAMERA_RAY_LAYER, PLAYER_CAMERA_TRANSPARENT_LAYER } from '../utils/constants';

const PADDING = .1;
const HEADLENGTH = .5;
const HEADWIDTH = .1;

const _v1 = new Vector3();
const _obj0 = new Object3D();

class ThirdPersonCamera {

    camera;
    target;

    #player;
    #control;
    #scene;

    _camV1 = new Vector3(- 1, 0.8, - 1.5);
    _camV2 = new Vector3(0, 0.3, 3);
    _camV3 = new Vector3(- 1.1, 0.5, - 1.5);
    #camPosLocal = new Vector3();
    #camTarLocal = new Vector3();
    #collisionCamPosLocal = new Vector3();

    rayArrowTop;
    rayArrowBottom;

    #collisionRay;

    #rayTopFrontLeft;
    #rayTopFrontRight;
    #rayTopBackLeft;
    #rayTopBackRight;
    #rayCenter;
    #rayBottomBackLeft;
    #rayBottomBackRight;

    #rayArrowCollisionRay;

    #rayArrowTopFrontLeft;
    #rayArrowTopFrontRight;
    #rayArrowTopBackLeft;
    #rayArrowTopBackRight;
    #rayArrowCenter;
    #rayArrowBottomBackLeft;
    #rayArrowBottomBackRight;

    rays = [];
    rayArrows = [];

    #invisibleOpacity = .15;
    #intersectObjects = [];

    isThirdPersonCamera = true;

    dummyObject = new Object3D();

    playerTop = new Vector3();
    playerTopFrontLeft = new Vector3();
    playerTopFrontRight = new Vector3();
    playerTopBackLeft = new Vector3();
    playerTopBackRight = new Vector3();
    playerBottomBackLeft = new Vector3();
    playerBottomBackRight = new Vector3();

    constructor(specs) {

        const { defaultCamera } = specs;

        this.camera = defaultCamera.camera;
        this.target = defaultCamera.target;

    }

    setPlayerPostions() {

        this.playerTop.set(0, this.#collisionCamPosLocal.y, 0);
        this.playerTopFrontLeft.set(this.#player.width * .5 - PADDING, this.#player.height * .5, this.#player.depth * .5 - PADDING);
        this.playerTopFrontRight.set(- this.#player.width * .5 + PADDING, this.#player.height * .5, this.#player.depth * .5 - PADDING);
        this.playerTopBackLeft.set(this.#player.width * .5 - PADDING, this.#player.height * .5, - this.#player.depth * .5 + PADDING);
        this.playerTopBackRight.set(- this.#player.width * .5 + PADDING, this.#player.height * .5, - this.#player.depth * .5 + PADDING);
        this.playerBottomBackLeft.set(this.#player.width * .5 - PADDING, 0, - this.#player.depth * .5 + PADDING);
        this.playerBottomBackRight.set(- this.#player.width * .5 + PADDING, 0, - this.#player.depth * .5 + PADDING);
    }

    updateCameraParams() {

        this.#camPosLocal.copy(_v1.copy(this._camV1).multiply(this.#player.group.scale));
        this.#camTarLocal.copy(_v1.copy(this._camV2).multiply(this.#player.group.scale));
        this.#collisionCamPosLocal.copy(_v1.copy(this._camV3).multiply(this.#player.group.scale));

        this.setPlayerPostions();

    }

    setup(specs) {

        const { player, control, scene } = specs;

        this.#player = player;
        this.#control = control;
        this.#scene = scene;

        this.updateCameraParams();
        this.setupRays();

    }

    changePlayer(player) {

        this.#player = player;

        this.updateCameraParams();

        const dirTopLength = _v1.copy(this.#collisionCamPosLocal).sub(this.playerTop).length();
        const dirTopFrontLeftLength = _v1.copy(this.playerTopFrontLeft).sub(this.#camPosLocal).length();
        const dirTopFrontRightLength = _v1.copy(this.playerTopFrontRight).sub(this.#camPosLocal).length();
        const dirTopBackLeftLength = _v1.copy(this.playerTopBackLeft).sub(this.#camPosLocal).length();
        const dirTopBackRightLength = _v1.copy(this.playerTopBackRight).sub(this.#camPosLocal).length();
        const dirBottomBackLeftLength = _v1.copy(this.playerBottomBackLeft).sub(this.#camPosLocal).length();
        const dirBottomBackRightLength = _v1.copy(this.playerBottomBackRight).sub(this.#camPosLocal).length();

        this.#collisionRay.far = dirTopLength;
        this.#rayTopFrontLeft.far = dirTopFrontLeftLength;
        this.#rayTopFrontRight.far = dirTopFrontRightLength;
        this.#rayTopBackLeft.far = dirTopBackLeftLength;
        this.#rayTopBackRight.far = dirTopBackRightLength;
        this.#rayBottomBackLeft.far = dirBottomBackLeftLength;
        this.#rayBottomBackRight.far = dirBottomBackRightLength;

        this.#rayArrowCollisionRay.setLength(dirTopLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopFrontLeft.setLength(dirTopFrontLeftLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopFrontRight.setLength(dirTopFrontRightLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopBackLeft.setLength(dirTopBackLeftLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopBackRight.setLength(dirTopBackRightLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowBottomBackLeft.setLength(dirBottomBackLeftLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowBottomBackRight.setLength(dirBottomBackRightLength, HEADLENGTH, HEADWIDTH);

        const dummyObject = this.dummyObject.copy(_obj0);
        dummyObject.position.copy(this.#player.group.position);
        dummyObject.rotation.copy(this.#player.group.rotation);

        dummyObject.updateMatrixWorld();
        const camPosWorld = this.#camPosLocal.clone().applyMatrix4(dummyObject.matrixWorld);
        const collisionCamPosWorld = this.#collisionCamPosLocal.clone().applyMatrix4(dummyObject.matrixWorld);

        this.updateRays(dummyObject, camPosWorld, collisionCamPosWorld);

    }

    setupRays() {

        const dirTop = this.#collisionCamPosLocal.clone().sub(this.playerTop);
        const dirTopFrontLeft = this.playerTopFrontLeft.clone().sub(this.#camPosLocal);
        const dirTopFrontRight = this.playerTopFrontRight.clone().sub(this.#camPosLocal);
        const dirTopBackLeft = this.playerTopBackLeft.clone().sub(this.#camPosLocal);
        const dirTopBackRight = this.playerTopBackRight.clone().sub(this.#camPosLocal);
        const dirCenter = new Vector3().sub(this.#camPosLocal);
        const dirBottomBackLeft = this.playerBottomBackLeft.clone().sub(this.#camPosLocal);
        const dirBottomBackRight = this.playerBottomBackRight.clone().sub(this.#camPosLocal);

        this.#collisionRay = new Raycaster(this.playerTop.clone(), dirTop.clone().normalize(), 0, dirTop.length());
        this.#rayTopFrontLeft = new Raycaster(this.#camPosLocal.clone(), dirTopFrontLeft.clone().normalize(), 0, dirTopFrontLeft.length());
        this.#rayTopFrontRight = new Raycaster(this.#camPosLocal.clone(), dirTopFrontRight.clone().normalize(), 0, dirTopFrontRight.length());
        this.#rayTopBackLeft = new Raycaster(this.#camPosLocal.clone(), dirTopBackLeft.clone().normalize(), 0, dirTopBackLeft.length());
        this.#rayTopBackRight = new Raycaster(this.#camPosLocal.clone(), dirTopBackRight.clone().normalize(), 0, dirTopBackRight.length());
        this.#rayCenter = new Raycaster(this.#camPosLocal.clone(), dirCenter.clone().normalize(), 0, dirCenter.length());
        this.#rayBottomBackLeft = new Raycaster(this.#camPosLocal.clone(), dirBottomBackLeft.clone().normalize(), 0, dirBottomBackLeft.length());
        this.#rayBottomBackRight = new Raycaster(this.#camPosLocal.clone(), dirBottomBackRight.clone().normalize(), 0, dirBottomBackRight.length());

        this.#rayArrowCollisionRay = new ArrowHelper(dirTop.clone().normalize(), this.playerTop, dirTop.length(), blue, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopFrontLeft = new ArrowHelper(dirTopFrontLeft.clone().normalize(), this.#camPosLocal, dirTopFrontLeft.length(), green, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopFrontRight = new ArrowHelper(dirTopFrontRight.clone().normalize(), this.#camPosLocal, dirTopFrontRight.length(), red, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopBackLeft = new ArrowHelper(dirTopBackLeft.clone().normalize(), this.#camPosLocal, dirTopBackLeft.length(), green, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopBackRight = new ArrowHelper(dirTopBackRight.clone().normalize(), this.#camPosLocal, dirTopBackRight.length(), red, HEADLENGTH, HEADWIDTH);
        this.#rayArrowCenter = new ArrowHelper(dirCenter.clone().normalize(), this.#camPosLocal, dirCenter.length(), yellow, HEADLENGTH, HEADWIDTH);
        this.#rayArrowBottomBackLeft = new ArrowHelper(dirBottomBackLeft.clone().normalize(), this.#camPosLocal, dirBottomBackLeft.length(), green, HEADLENGTH, HEADWIDTH);
        this.#rayArrowBottomBackRight = new ArrowHelper(dirBottomBackRight.clone().normalize(), this.#camPosLocal, dirBottomBackRight.length(), red, HEADLENGTH, HEADWIDTH);

        this.rays = [
            this.#rayTopFrontLeft, this.#rayTopFrontRight, this.#rayTopBackLeft, this.#rayTopBackRight,
            this.#rayCenter,
            this.#rayBottomBackLeft, this.#rayBottomBackRight
        ];

        for (let i = 0, il = this.rays.length; i < il; i++) {

            const r = this.rays[i];

            r.layers.set(PLAYER_CAMERA_TRANSPARENT_LAYER);

        }

        this.#collisionRay.layers.set(PLAYER_CAMERA_RAY_LAYER);

        this.rayArrows = [
            this.#rayArrowTopFrontLeft, this.#rayArrowTopFrontRight, this.#rayArrowTopBackLeft, this.#rayArrowTopBackRight,
            this.#rayArrowCenter,
            this.#rayArrowBottomBackLeft, this.#rayArrowBottomBackRight,
            this.#rayArrowCollisionRay
        ];


        for (let i = 0, il = this.rayArrows.length; i < il; i++) {
            
            const a = this.rayArrows[i];

            a.visible = false;
            // this.#scene.add(a);

        }

    }

    updateRays(dummyObject, camPosWorld, collisionCamPosWorld) {

        const collisionRayOrigin = _v1.copy(this.playerTop).applyMatrix4(dummyObject.matrixWorld);
        const dirTop = collisionCamPosWorld.sub(collisionRayOrigin).normalize();
        this.#collisionRay.set(collisionRayOrigin, dirTop);
        this.#rayArrowCollisionRay.position.copy(collisionRayOrigin);
        this.#rayArrowCollisionRay.setDirection(dirTop);

        _v1.copy(this.playerTopFrontLeft).applyMatrix4(dummyObject.matrixWorld).sub(camPosWorld).normalize();
        this.#rayTopFrontLeft.set(camPosWorld, _v1);
        this.#rayArrowTopFrontLeft.setDirection(_v1);

        _v1.copy(this.playerTopFrontRight).applyMatrix4(dummyObject.matrixWorld).sub(camPosWorld).normalize();
        this.#rayTopFrontRight.set(camPosWorld, _v1);
        this.#rayArrowTopFrontRight.setDirection(_v1);

        _v1.copy(this.playerTopBackLeft).applyMatrix4(dummyObject.matrixWorld).sub(camPosWorld).normalize();
        this.#rayTopBackLeft.set(camPosWorld, _v1);
        this.#rayArrowTopBackLeft.setDirection(_v1);

        _v1.copy(this.playerTopBackRight).applyMatrix4(dummyObject.matrixWorld).sub(camPosWorld).normalize();
        this.#rayTopBackRight.set(camPosWorld, _v1);
        this.#rayArrowTopBackRight.setDirection(_v1);

        _v1.set(0, 0, 0).applyMatrix4(dummyObject.matrixWorld).sub(camPosWorld).normalize();
        this.#rayCenter.set(camPosWorld, _v1);
        this.#rayArrowCenter.setDirection(_v1);

        _v1.copy(this.playerBottomBackLeft).applyMatrix4(dummyObject.matrixWorld).sub(camPosWorld).normalize();
        this.#rayBottomBackLeft.set(camPosWorld, _v1);
        this.#rayArrowBottomBackLeft.setDirection(_v1);

        _v1.copy(this.playerBottomBackRight).applyMatrix4(dummyObject.matrixWorld).sub(camPosWorld).normalize();
        this.#rayBottomBackRight.set(camPosWorld, _v1);
        this.#rayArrowBottomBackRight.setDirection(_v1);

        for (let i = 0, il = this.rayArrows.length; i < il; i++) {

            const a = this.rayArrows[i];

            if (a === this.#rayArrowCollisionRay) continue;

            a.position.copy(camPosWorld);

        }

    }

    setPositionFromPlayer() {

        // set dummy to avoid scale change
        const dummyObject = this.dummyObject.copy(_obj0);
        dummyObject.position.copy(this.#player.group.position);
        dummyObject.rotation.copy(this.#player.group.rotation);

        dummyObject.updateMatrixWorld();
        const camPosWorld = this.#camPosLocal.clone().applyMatrix4(dummyObject.matrixWorld);
        const camTarWorld = this.#camTarLocal.clone().applyMatrix4(dummyObject.matrixWorld);
        const collisionCamPosWorld = this.#collisionCamPosLocal.clone().applyMatrix4(dummyObject.matrixWorld);

        this.camera.position.copy(camPosWorld);
        this.camera.lookAt(camTarWorld);
        this.target = camTarWorld;

        this.updateRays(dummyObject, camPosWorld, collisionCamPosWorld);

    }

    sortIntersections(a, b) {

        return a.distance - b.distance; // return > 0 => [b, a]; return < 0 => [a, b]

    }

    checkRayIntersection() {

        let intersects = [];
        let collisionRayIntersects = [];

        for (let i = 0, il = this.rays.length; i < il; i++) {

            const ray = this.rays[i];

            intersects.push(...ray.intersectObjects(this.#scene.children));

        }

        collisionRayIntersects.push(...this.#collisionRay.intersectObjects(this.#scene.children));

        this.resetInterectObjects();

        if (intersects.length > 0) {

            for (let i = 0, il = intersects.length; i < il; i++) {

                const { object } = intersects[i];

                this.#intersectObjects.push(object);

                if (Array.isArray(object.material)) {

                    for (let j = 0, jl = object.material.length; j < jl; j++) {

                        const m = object.material[j];

                        if (!m.transparent) {

                            m.transparent = true;

                        }

                        m.opacity = this.#invisibleOpacity;

                    }

                } else {

                    if (!object.material.transparent) {

                        object.material.transparent = true;

                    }

                    object.material.opacity = this.#invisibleOpacity;

                }

            }

        }

        if (collisionRayIntersects.length > 0) {

            const { point, object } = collisionRayIntersects[0];

            const dummy = this.dummyObject.copy(_obj0);

            object.updateWorldMatrix(true, false);
            dummy.applyMatrix4(object.matrixWorld);
            dummy.scale.set(1, 1, 1);
            // dummy.updateMatrixWorld();  // worldToLocal will do this

            const pointToObject = dummy.worldToLocal(_v1.copy(point));

            pointToObject.z += 0.1;
            pointToObject.x += 0.05;
            pointToObject.y += this.#camPosLocal.y - this.#collisionCamPosLocal.y;

            const updatedPos = pointToObject.applyMatrix4(dummy.matrixWorld);

            this.camera.position.copy(updatedPos);

        }

    }

    resetInterectObjects() {

        for (let i = 0, il = this.#intersectObjects.length; i < il; i++) {

            const obj = this.#intersectObjects[i];

            if (Array.isArray(obj.material)) {

                for (let j = 0, jl = obj.material.length; j < jl; j++) {

                    const m = obj.material[j];

                    m.opacity = 1;

                }

            } else {

                obj.material.opacity = 1;

            }

        }

        this.#intersectObjects.length = 0;

    }

    tick() {

        this.setPositionFromPlayer();
        this.checkRayIntersection();

        this.#control.target.copy(this.target);

    }

}

export { ThirdPersonCamera };