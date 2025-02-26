import { Vector3, Raycaster, ArrowHelper, Object3D } from 'three';
import { blue } from '../basic/colorBase';
import { PLAYER_CAMERA_RAY_LAYER } from '../utils/constants';

const HEADLENGTH = .5;
const HEADWIDTH = .1;

class ThirdPersonCameraV2 {

    camera;
    target;

    #player;
    #control;
    #scene;

    _v1 = new Vector3(- 1, 0.8, - 1.5);
    _v2 = new Vector3(0, 0.3, 3);
    _v3 = new Vector3(- 1.1, 0.5, - 1.5);
    #camPosLocal = new Vector3();
    #camTarLocal = new Vector3();
    #collisionCamPosLocal = new Vector3();
    #collisionRay;

    #rayArrowCollisionRay;

    rays = [];
    rayArrows = [];

    isThirdPersonCamera = true;

    constructor(specs) {

        const { defaultCamera } = specs;

        this.camera = defaultCamera.camera;
        this.target = defaultCamera.target;

    }

    get playerTop() {

        return new Vector3(0, this.#collisionCamPosLocal.y, 0);

    }

    updateCameraParams() {

        this.#camPosLocal.copy(this._v1.clone().multiply(this.#player.group.scale));
        this.#camTarLocal.copy(this._v2.clone().multiply(this.#player.group.scale));
        this.#collisionCamPosLocal.copy(this._v3.clone().multiply(this.#player.group.scale));

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

        const dirTopLength = this.#collisionCamPosLocal.clone().sub(this.playerTop).length();

        this.#collisionRay.far = dirTopLength;

        this.#rayArrowCollisionRay.setLength(dirTopLength, HEADLENGTH, HEADWIDTH);

        const dummyObject = new Object3D();
        dummyObject.position.copy(this.#player.group.position);
        dummyObject.rotation.copy(this.#player.group.rotation);

        const collisionCamPosWorld = dummyObject.localToWorld(this.#collisionCamPosLocal.clone());

        this.updateRays(dummyObject, collisionCamPosWorld);

    }

    setupRays() {

        const dirTop = this.#collisionCamPosLocal.clone().sub(this.playerTop);

        this.#collisionRay = new Raycaster(this.playerTop, dirTop.clone().normalize(), 0, dirTop.length());

        this.#rayArrowCollisionRay = new ArrowHelper(dirTop.clone().normalize(), this.playerTop, dirTop.length(), blue, HEADLENGTH, HEADWIDTH);

        this.rays = [this.#collisionRay];

        for (let i = 0, il = this.rays.length; i < il; i++) {

            const r = this.rays[i];

            r.layers.set(PLAYER_CAMERA_RAY_LAYER);

        }


        this.rayArrows = [this.#rayArrowCollisionRay];

        for (let i = 0, il = this.rayArrows.length; i < il; i++) {

            const a = this.rayArrows[i];

            a.visible = false;

        }

    }

    updateRays(dummyObject, collisionCamPosWorld) {

        const collisionRayOrigin = dummyObject.localToWorld(this.playerTop);
        const dirTop = collisionCamPosWorld.clone().sub(collisionRayOrigin).normalize();

        this.#collisionRay.set(collisionRayOrigin, dirTop);

        this.#rayArrowCollisionRay.position.copy(collisionRayOrigin);
        this.#rayArrowCollisionRay.setDirection(dirTop);

    }

    setPositionFromPlayer() {

        // set dummy to avoid scale change
        const dummyObject = new Object3D();
        dummyObject.position.copy(this.#player.group.position);
        dummyObject.rotation.copy(this.#player.group.rotation);

        const camPosWorld = dummyObject.localToWorld(this.#camPosLocal.clone());
        const camTarWorld = dummyObject.localToWorld(this.#camTarLocal.clone());
        const collisionCamPosWorld = dummyObject.localToWorld(this.#collisionCamPosLocal.clone());

        this.camera.position.copy(camPosWorld);
        this.camera.lookAt(camTarWorld);
        this.target = camTarWorld;

        this.updateRays(dummyObject, collisionCamPosWorld);

    }

    checkRayIntersection() {

        let intersects = [];

        intersects.push(...this.#collisionRay.intersectObjects(this.#scene.children));

        if (intersects.length > 0) {

            const { point, object } = intersects[0];

            const dummy = new Object3D();

            object.updateWorldMatrix(true, false);
            dummy.applyMatrix4(object.matrixWorld);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrixWorld();

            const pointToObject = dummy.worldToLocal(point.clone());

            pointToObject.z += 0.1;
            pointToObject.x += 0.05;
            pointToObject.y += this.#camPosLocal.y - this.#collisionCamPosLocal.y;

            const updatedPos = dummy.localToWorld(pointToObject);

            this.camera.position.copy(updatedPos);

        }

    }

    tick() {

        this.setPositionFromPlayer();
        this.checkRayIntersection();

        this.#control.target.copy(this.target);

    }

}

export { ThirdPersonCameraV2 };