import { Vector3, Raycaster, ArrowHelper, Object3D } from 'three';
import { green, red, yellow } from '../basic/colorBase';
import { PLAYER_CAMERA_RAY_LAYER } from '../utils/constants';

const PADDING = .1;
const HEADLENGTH = .5;
const HEADWIDTH = .1;

class ThirdPersonCamera {

    camera;
    target;

    #player;
    #control;
    #scene;
    
    #camPosLocal = new Vector3(0, 3, - 5);
    #camTarLocal = new Vector3(0, 0, 3);

    rayArrowTop;
    rayArrowBottom;

    #rayTopFrontLeft;
    #rayTopFrontRight;
    #rayTopBackLeft;
    #rayTopBackRight;
    #rayCenter;
    #rayBottomBackLeft;
    #rayBottomBackRight;

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

    constructor(specs) {

        const { defaultCamera } = specs;

        this.camera = defaultCamera.camera;
        this.target = defaultCamera.target;

    }

    get playerTopFrontLeft() {

        return new Vector3(this.#player.width * .5 - PADDING, this.#player.height * .5, this.#player.depth * .5 - PADDING);

    }

    get playerTopFrontRight() {

        return new Vector3(- this.#player.width * .5 + PADDING, this.#player.height * .5, this.#player.depth * .5 - PADDING);

    }

    get playerTopBackLeft() {

        return new Vector3(this.#player.width * .5 - PADDING, this.#player.height * .5, - this.#player.depth * .5 + PADDING);

    }

    get playerTopBackRight() {

        return new Vector3(- this.#player.width * .5 + PADDING, this.#player.height * .5, - this.#player.depth * .5 + PADDING);

    }

    get playerBottomBackLeft() {

        return new Vector3(this.#player.width * .5 - PADDING, 0, - this.#player.depth * .5 + PADDING);

    }

    get playerBottomBackRight() {

        return new Vector3(- this.#player.width * .5 + PADDING, 0, - this.#player.depth * .5 + PADDING);

    }

    setup(specs) {

        const { player, control, scene } = specs;

        this.#player = player;
        this.#control = control;
        this.#scene = scene;

        this.setupRays();

    }

    changePlayer(player) {

        this.#player = player;

        const dirTopFrontLeftLength = this.playerTopFrontLeft.sub(this.#camPosLocal).length();
        const dirTopFrontRightLength = this.playerTopFrontRight.sub(this.#camPosLocal).length();
        const dirTopBackLeftLength = this.playerTopBackLeft.sub(this.#camPosLocal).length();
        const dirTopBackRightLength = this.playerTopBackRight.sub(this.#camPosLocal).length();
        const dirBottomBackLeftLength = this.playerBottomBackLeft.sub(this.#camPosLocal).length();
        const dirBottomBackRightLength = this.playerBottomBackRight.sub(this.#camPosLocal).length();

        this.#rayTopFrontLeft.far = dirTopFrontLeftLength;
        this.#rayTopFrontRight.far = dirTopFrontRightLength;
        this.#rayTopBackLeft.far = dirTopBackLeftLength;
        this.#rayTopBackRight.far = dirTopBackRightLength;
        this.#rayBottomBackLeft.far = dirBottomBackLeftLength;
        this.#rayBottomBackRight.far = dirBottomBackRightLength;

        this.#rayArrowTopFrontLeft.setLength(dirTopFrontLeftLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopFrontRight.setLength(dirTopFrontRightLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopBackLeft.setLength(dirTopBackLeftLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowTopBackRight.setLength(dirTopBackRightLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowBottomBackLeft.setLength(dirBottomBackLeftLength, HEADLENGTH, HEADWIDTH);
        this.#rayArrowBottomBackRight.setLength(dirBottomBackRightLength, HEADLENGTH, HEADWIDTH);

        const dummyObject = new Object3D();
        dummyObject.position.copy(this.#player.group.position);
        dummyObject.rotation.copy(this.#player.group.rotation);

        const camPosWorld = dummyObject.localToWorld(this.#camPosLocal.clone());

        this.updateRays(dummyObject, camPosWorld);
        
    }

    setupRays() {

        const dirTopFrontLeft = this.playerTopFrontLeft.sub(this.#camPosLocal);
        const dirTopFrontRight = this.playerTopFrontRight.sub(this.#camPosLocal);
        const dirTopBackLeft = this.playerTopBackLeft.sub(this.#camPosLocal);
        const dirTopBackRight = this.playerTopBackRight.sub(this.#camPosLocal);
        const dirCenter = new Vector3().sub(this.#camPosLocal);
        const dirBottomBackLeft = this.playerBottomBackLeft.sub(this.#camPosLocal);
        const dirBottomBackRight = this.playerBottomBackRight.sub(this.#camPosLocal);

        this.#rayTopFrontLeft = new Raycaster(this.#camPosLocal.clone(), dirTopFrontLeft.clone().normalize(), 0, dirTopFrontLeft.length());
        this.#rayTopFrontRight = new Raycaster(this.#camPosLocal.clone(), dirTopFrontRight.clone().normalize(), 0, dirTopFrontRight.length());
        this.#rayTopBackLeft = new Raycaster(this.#camPosLocal.clone(), dirTopBackLeft.clone().normalize(), 0, dirTopBackLeft.length());
        this.#rayTopBackRight = new Raycaster(this.#camPosLocal.clone(), dirTopBackRight.clone().normalize(), 0, dirTopBackRight.length());
        this.#rayCenter = new Raycaster(this.#camPosLocal.clone(), dirCenter.clone().normalize(), 0, dirCenter.length());
        this.#rayBottomBackLeft = new Raycaster(this.#camPosLocal.clone(), dirBottomBackLeft.clone().normalize(), 0, dirBottomBackLeft.length());
        this.#rayBottomBackRight = new Raycaster(this.#camPosLocal.clone(), dirBottomBackRight.clone().normalize(), 0, dirBottomBackRight.length());

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

        this.rays.forEach(r => r.layers.set(PLAYER_CAMERA_RAY_LAYER));

        this.rayArrows = [
            this.#rayArrowTopFrontLeft, this.#rayArrowTopFrontRight, this.#rayArrowTopBackLeft, this.#rayArrowTopBackRight,
            this.#rayArrowCenter,
            this.#rayArrowBottomBackLeft, this.#rayArrowBottomBackRight
        ];

        this.rayArrows.forEach(a => a.visible = false);

    }

    updateRays(dummyObject, camPosWorld) {

        const dirTopFrontLeft = dummyObject.localToWorld(this.playerTopFrontLeft).sub(camPosWorld).normalize();
        const dirTopFrontRight = dummyObject.localToWorld(this.playerTopFrontRight).sub(camPosWorld).normalize();
        const dirTopBackLeft = dummyObject.localToWorld(this.playerTopBackLeft).sub(camPosWorld).normalize();
        const dirTopBackRight = dummyObject.localToWorld(this.playerTopBackRight).sub(camPosWorld).normalize();
        const dirCenter = dummyObject.localToWorld(new Vector3()).sub(camPosWorld).normalize();
        const dirBottomBackLeft = dummyObject.localToWorld(this.playerBottomBackLeft).sub(camPosWorld).normalize();
        const dirBottomBackRight = dummyObject.localToWorld(this.playerBottomBackRight).sub(camPosWorld).normalize();

        this.#rayTopFrontLeft.set(camPosWorld, dirTopFrontLeft);
        this.#rayTopFrontRight.set(camPosWorld, dirTopFrontRight);
        this.#rayTopBackLeft.set(camPosWorld, dirTopBackLeft);
        this.#rayTopBackRight.set(camPosWorld, dirTopBackRight);
        this.#rayCenter.set(camPosWorld, dirCenter);
        this.#rayBottomBackLeft.set(camPosWorld, dirBottomBackLeft);
        this.#rayBottomBackRight.set(camPosWorld, dirBottomBackRight);

        this.rayArrows.forEach(a => a.position.copy(camPosWorld));

        this.#rayArrowTopFrontLeft.setDirection(dirTopFrontLeft);
        this.#rayArrowTopFrontRight.setDirection(dirTopFrontRight);
        this.#rayArrowTopBackLeft.setDirection(dirTopBackLeft);
        this.#rayArrowTopBackRight.setDirection(dirTopBackRight);
        this.#rayArrowCenter.setDirection(dirCenter);
        this.#rayArrowBottomBackLeft.setDirection(dirBottomBackLeft);
        this.#rayArrowBottomBackRight.setDirection(dirBottomBackRight);

    }

    setPositionFromPlayer() {

        // set dummy to avoid scale change
        const dummyObject = new Object3D();
        dummyObject.position.copy(this.#player.group.position);
        dummyObject.rotation.copy(this.#player.group.rotation);

        const camPosWorld = dummyObject.localToWorld(this.#camPosLocal.clone());
        const camTarWorld = dummyObject.localToWorld(this.#camTarLocal.clone());

        this.camera.position.copy(camPosWorld);
        this.camera.lookAt(camTarWorld);
        this.target = camTarWorld;

        this.updateRays(dummyObject, camPosWorld);

    }

    checkRayIntersection() {

        let intersects = [];

        this.rays.forEach(ray => {

            intersects.push(...ray.intersectObjects(this.#scene.children));

        });

        this.resetInterectObjects();

        if (intersects.length > 0) {
            
            intersects.forEach(i => {

                const { object } = i;

                this.#intersectObjects.push(object);

                if (Array.isArray(object.material)) {

                    object.material.forEach(m => {

                        m.transparent = true;
                        m.opacity = this.#invisibleOpacity;

                    });

                } else {

                    object.material.transparent = true;
                    object.material.opacity = this.#invisibleOpacity;

                }

            });

        }

    }

    resetInterectObjects() {

        this.#intersectObjects.forEach(obj => {

            if (Array.isArray(obj.material)) {

                obj.material.forEach(m => {

                    m.opacity = 1;

                });

            } else {

                obj.material.opacity = 1;

            }

        });

        this.#intersectObjects = [];

    }

    tick(delta) {

        this.setPositionFromPlayer();
        this.#control.target.copy(this.target);

        this.checkRayIntersection();

    }
}

export { ThirdPersonCamera };