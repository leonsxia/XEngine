import { Vector3, Raycaster, ArrowHelper, Object3D } from 'three';
import { blue, green, red, yellow } from '../basic/colorBase';
import { PLAYER_CAMERA_RAY_LAYER, PLAYER_CAMERA_TRANSPARENT_LAYER } from '../utils/constants';
import { container } from '../../systems/htmlElements';
import { Logger } from '../../systems/Logger';

const PADDING = .1;
const HEADLENGTH = .5;
const HEADWIDTH = .1;

const _v1 = new Vector3();
const _obj0 = new Object3D();

const DEBUG = true;

// const _euler = new Euler(0, 0, 0, 'YXZ');
const _MOUSE_SENSITIVITY = 0.008;
const _STICK_SPEED = 6;
// const _PI_2 = Math.PI / 2;

class ThirdPersonCamera {

    camera;
    target;

    #player;
    #control;

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

    _targetObject3D = new Object3D();
    _pointerObject3D = new Object3D();

    minPolarAngle = 0;
    maxPolarAngle = Math.PI;
    pointerSpeed = 1.0;
    pointerMaxPositiveX = 2.5;
    pointerMaxNegativeX = 1;
    pointerMaxY = 2;

    _enabled = false;

    attachTo;

    _objectsNeedChecked = [];

    _xboxControllerConnected;
    _rstickIsUp = false;
    _rstickIsDown = false;
    _rstickIsLeft = false;
    _rstickIsRight = false;

    _keyADownEvent = new KeyboardEvent('keydown', {key: 'a'});
    _keyAUpEvent = new KeyboardEvent('keyup', {key: 'a'});
    _keyDDownEvent = new KeyboardEvent('keydown', {key: 'd'});
    _keyDUpEvent = new KeyboardEvent('keyup', {key: 'd'});

    #KeyAIsDown = false;
    #KeyDIsDown = false;

    // chrome has 1s delay to re-lock the pointer after exit lock, if click too fast the console will throw error
    _pointerLockDeactivateAt = performance.now();

    #logger = new Logger(DEBUG, 'ThirdPersonCamera');

    constructor(specs) {

        const { defaultCamera, attachTo } = specs;

        this.camera = defaultCamera.camera;
        this.target = defaultCamera.target;
        this.attachTo = attachTo;

        this._targetObject3D.add(this._pointerObject3D);

        this.bindEvents();

    }

    get enabled() {

        return this._enabled;

    }

    set enabled(val) {

        if (val) {

            this._pointerObject3D.position.set(0, 0, 0);
            this.updateObjectsNeedChecked();

        }

        this._enabled = val;

    }

    get keyAIsDown() {

        return this.#KeyAIsDown;

    }

    set keyAIsDown(val) {

        if (val && !this.#KeyAIsDown) {

            window.dispatchEvent(this._keyADownEvent);

        } else if (!val && this.#KeyAIsDown) {

            window.dispatchEvent(this._keyAUpEvent);

        }

        this.#KeyAIsDown = val;

    }

    get keyDIsDown() {

        return this.#KeyDIsDown;

    }

    set keyDIsDown(val) {

        if (val && !this.#KeyDIsDown) {

            window.dispatchEvent(this._keyDDownEvent);

        } else if (!val && this.#KeyDIsDown) {

            window.dispatchEvent(this._keyDUpEvent);

        }

        this.#KeyDIsDown = val;

    }

    get currentRoom() {

        return this.attachTo.currentRoom;

    }

    get sceneObjects() {

        const objects = [];
        for (let i = 0, il = this.attachTo.sceneObjects.length; i < il; i++) {

            const obj = this.attachTo.sceneObjects[i];
            const { mesh, group } = obj;

            if (mesh) objects.push(mesh);
            else if (group) objects.push(group);

        }

        return objects;

    }

    updateObjectsNeedChecked() {

        this._objectsNeedChecked.length = 0;
        this._objectsNeedChecked.push(this.currentRoom.group, ...this.sceneObjects);

    }

    disablePointerLock() {

        const now = performance.now();        
        this._pointerLockDeactivateAt = now;
        document.exitPointerLock();

    }

    enablePointerLock() {

        const now = performance.now();
        if (!document.pointerLockElement) {

            if (this._pointerLockDeactivateAt && now - this._pointerLockDeactivateAt > 1000) {

                container.requestPointerLock();
                this._mousedown = true;

            } else {

                this.#logger.log(`pinter lock not ready`);

            }

        } else {

            this.#logger.log(`pointer locked`);

        }

    }

    bindEvents() {

        const mousedownEvent = () => {

            if (!this.attachTo.isRunning || !this._enabled || this.attachTo.isPdaOn) return;

            this.enablePointerLock();

        };

        const pointerLockChangeEvent = () => {

            const now = performance.now();
            if (!document.pointerLockElement) {

                this._pointerLockDeactivateAt = now;

            }

        };

        container.addEventListener('mousemove', this.mousemoveEvent.bind(this));
        container.addEventListener('mousedown', mousedownEvent);
        document.addEventListener('pointerlockchange', pointerLockChangeEvent);

    }

    mousemoveEvent(event) {

        if (!this.attachTo.isRunning || !this.enabled || document.pointerLockElement !== container || this.attachTo.isPdaOn) return;

        this.#logger.func = this.mousemoveEvent.name;        

        const movementX = event.movementX;
        const movementY = event.movementY;

        /* fps mouse movement
        _euler.setFromQuaternion(this.camera.quaternion);

        _euler.y -= movementX * _MOUSE_SENSITIVITY * this.pointerSpeed;
        _euler.x -= movementY * _MOUSE_SENSITIVITY * this.pointerSpeed;

        _euler.x = Math.max(_PI_2 - this.maxPolarAngle, Math.min(_PI_2 - this.minPolarAngle, _euler.x));

        this.camera.quaternion.setFromEuler( _euler );
        */

        this._pointerObject3D.position.x -= movementX * _MOUSE_SENSITIVITY * this.pointerSpeed;
        this._pointerObject3D.position.y -= movementY * _MOUSE_SENSITIVITY * this.pointerSpeed;
        
        this._pointerObject3D.position.x = Math.max(- this.pointerMaxNegativeX, Math.min(this._pointerObject3D.position.x, this.pointerMaxPositiveX));
        this._pointerObject3D.position.y = Math.max(- this.pointerMaxY, Math.min(this._pointerObject3D.position.y, this.pointerMaxY));

        if (this.attachTo.player && (this.attachTo.player.isMeleeing || this.attachTo.player.isGunReady)) {

            if (this._pointerObject3D.position.x === - this.pointerMaxNegativeX) {

                this.keyDIsDown = true;

            } else {

                this.keyDIsDown = false;

            }

            if (this._pointerObject3D.position.x === this.pointerMaxPositiveX) {

                this.keyAIsDown = true;

            } else {

                this.keyAIsDown = false;

            }

        }

        // this.#logger.log(`mouse movementX: ${movementX}, movementY: ${movementY}`);        

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

        const { player, control } = specs;

        this.#player = player;
        this.#control = control;

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
            // this.attachTo.scene.add(a);

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
        this._targetObject3D.position.copy(camTarWorld);
        this._targetObject3D.rotation.copy(dummyObject.rotation);
        this._pointerObject3D.getWorldPosition(_v1);
        this.camera.lookAt(_v1);
        this.target.copy(_v1);

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

            intersects.push(...ray.intersectObjects(this._objectsNeedChecked));

        }

        collisionRayIntersects.push(...this.#collisionRay.intersectObjects(this._objectsNeedChecked));

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

    // events
    xboxControllerConnected(val) {

        if (val && !this._xboxControllerConnected) {

            this._xboxControllerConnected = true;

        } else if (!val && this._xboxControllerConnected) {

            this._xboxControllerConnected = false;

        }

    }

    rstickUp(val) {

        this._rstickIsUp = val;

    }

    rstickDown(val) {

        this._rstickIsDown = val;

    }

    rstickLeft(val) {

        this._rstickIsLeft = val;

    }

    rstickRight(val) {

        this._rstickIsRight = val;

    }

    handleStickEvents(delta) {

        if (!this._xboxControllerConnected) return;

        if (this._rstickIsLeft) {

            this._pointerObject3D.position.x += _STICK_SPEED * delta * this.pointerSpeed;

        } else if (this._rstickIsRight) {

            this._pointerObject3D.position.x -= _STICK_SPEED * delta * this.pointerSpeed;

        }

        if (this._rstickIsUp) {

            this._pointerObject3D.position.y += _STICK_SPEED * delta * this.pointerSpeed;

        } else if (this._rstickIsDown) {

            this._pointerObject3D.position.y -= _STICK_SPEED * delta * this.pointerSpeed;

        }

        this._pointerObject3D.position.x = Math.max(- this.pointerMaxNegativeX, Math.min(this._pointerObject3D.position.x, this.pointerMaxPositiveX));
        this._pointerObject3D.position.y = Math.max(- this.pointerMaxY, Math.min(this._pointerObject3D.position.y, this.pointerMaxY));
    }

    // events

    tick(delta) {

        this.setPositionFromPlayer();
        this.checkRayIntersection();

        this.handleStickEvents(delta);

        this.#control.target.copy(this.target);

    }

}

export { ThirdPersonCamera };