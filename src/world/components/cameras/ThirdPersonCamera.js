import { Vector3, Raycaster, ArrowHelper, Object3D } from 'three';
import { Camera } from './Camera';
import { yellow } from '../basic/colorBase';
import { PLAYER_CAMERA_RAY_LAYER } from '../utils/constants';

class ThirdPersonCamera extends Camera {

    #player;
    #control;
    #scene;
    
    #camPosLocal = new Vector3(0, 3, - 5);
    #camTarLocal = new Vector3(0, 0, 3);

    #raycaster;
    rayArrow;

    #invisibleOpacity = .15;
    #intersectObjects = [];

    constructor(specs) {

        super(specs);

        const headLength = 1;
        const headWidth = .2;

        const dir = this.#camTarLocal.clone().sub(this.#camPosLocal).normalize();

        this.#raycaster = new Raycaster(this.#camPosLocal.clone(), dir, 0, this.rayLength);
        this.#raycaster.layers.set(PLAYER_CAMERA_RAY_LAYER);

        this.rayArrow = new ArrowHelper(dir, this.#camPosLocal, this.rayLength, yellow, headLength, headWidth);
        this.rayArrow.visible = false;

    }

    get rayLength() {

        const totalDistZ = this.#camTarLocal.z - this.#camPosLocal.z;
        const totalDist = Math.sqrt(totalDistZ * totalDistZ + this.#camPosLocal.y * this.#camPosLocal.y);
        const rayLength = Math.abs(this.#camPosLocal.z) * totalDist / totalDistZ;

        return rayLength;

    }

    set player(p) {

        this.#player = p;

    }

    setup(specs) {

        const { player, control, scene } = specs;

        this.#player = player;
        this.#control = control;
        this.#scene = scene;

    }

    setPositionFromPlayer() {

        // set dummy to avoid scale change
        const dummyObject = new Object3D();
        dummyObject.position.copy(this.#player.group.position);
        dummyObject.rotation.copy(this.#player.group.rotation);

        const camPosWorld = dummyObject.localToWorld(this.#camPosLocal.clone());
        const camTarWorld = dummyObject.localToWorld(this.#camTarLocal.clone());
        const dir = camTarWorld.clone().sub(camPosWorld).normalize();

        this.camera.position.copy(camPosWorld);
        this.camera.lookAt(camTarWorld);
        this.target = camTarWorld;

        this.#raycaster.set(camPosWorld, dir);
        
        this.rayArrow.position.copy(camPosWorld);
        this.rayArrow.setDirection(dir);
        this.rayArrow.setLength(this.rayLength);

    }

    checkRayIntersection() {

        const intersects = this.#raycaster.intersectObjects(this.#scene.children);

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