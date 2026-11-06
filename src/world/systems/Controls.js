import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Vector3 } from 'three';
import { Logger } from './Logger';

// module scope const
const vel = 0.5;
const velPerSecond = vel * 60;
const _v1 = new Vector3();
let _alpha = 0;

const DEBUG = false;

class WorldControls {

    length = 0;
    preTarget;
    preCamPos;
    enableDamping = false;
    gui;

    logger = new Logger(DEBUG, 'WorldControls');

    constructor(camera, canvas) {

        this.controls = new OrbitControls(camera, canvas);
        this.camera = camera;
    
        // damping and auto rotation require
        // the controls to be updated each frame
        // controls.autoRotate = true;
        this.controls.enableDamping = this.enableDamping;
        this.controls.update();
    
        this.resetTick();
        this.controls.enabled = false;

    }

    // dispose() {
    //     this.controls.dispose();
    //     this.camera = null;
    // }

    initPanels(gui) {

        this.gui = gui;

    }

    setDamping(enable, factor) {

        this.controls.enableDamping = enable;
        if (factor) this.controls.dampingFactor = factor;
        this.enableDamping = enable;
        
    }

    get defControl() {

        return this.controls;

    }

    enableDefControl(enable = true) {

        this.controls.enabled = enable;
        // this.controls.enablePan = enable;
        // this.controls.enableRotate = enable;
        // this.controls.enableZoom = enable;

    }

    resetCamera() {

        this.controls.reset();

    }

    setPanelState(disabled) {

        this.gui?.setPanelState(disabled);

    }
    
    resetTick() {

        this.length = 0;
        this.controls.enabled = true;
        this.controls.enableDamping = this.enableDamping;

        this.controls.tick = () => {
                        
            this.controls.update();

        };

    }

    initPreCoordinates() {

        this.setPreCoordinates(this.controls.target, this.camera.position);

    }

    setPreCoordinates(target, camPos) {

        this.preTarget = target.clone();
        this.preCamPos = camPos.clone();

        this.preTarget.x = this.preTarget.x.toFixed(4);
        this.preTarget.y = this.preTarget.y.toFixed(4);
        this.preTarget.z = this.preTarget.z.toFixed(4);
        this.preCamPos.x = this.preCamPos.x.toFixed(4);
        this.preCamPos.y = this.preCamPos.y.toFixed(4);
        this.preCamPos.z = this.preCamPos.z.toFixed(4);

    }

    coordinatesEqual(coord0, coord1) {

        return coord0.x === coord1.x && coord0.y === coord1.y && coord0.z === coord1.z;

    }

    moveCamera(dist) {

        this.setPanelState(true);
        this.controls.enabled = false;
        this.controls.enableDamping = false;

        this.controls.tick = (delta) => {

            if (this.length < dist) {

                const dist = velPerSecond * delta;
                this.length += dist;
                this.camera.position.x += dist;
                this.camera.position.y += dist;
                this.camera.position.z += dist;
                this.controls.target.x += dist;
                this.controls.target.y += dist;
                this.controls.target.z += dist;

                this.controls.update();

            } else {

                this.resetTick();
                this.setPanelState(false);

            }

        };

    }

    moveCameraStatic(dist) {

        const movingVec3 = new Vector3(dist, dist, dist);

        this.controls.target.add(movingVec3);
        this.camera.position.add(movingVec3);

        this.controls.update();

    }
    
    focusNext(target, position, isStatic = false) {

        if (isStatic) {

            this.controls.target.copy(target);
            this.camera.position.copy(position);
            this.controls.update();

            return;

        }

        const posDist = _v1.copy(position).sub(this.camera.position).length();
        let deltaDist = 0;
        let movingDist = 0;

        this.setPanelState(true);
        this.controls.enabled = false;
        this.controls.enableDamping = false;

        this.controls.tick = (delta) => {

            deltaDist = delta * velPerSecond;
            movingDist += deltaDist;

            if (movingDist <= posDist) {

                _v1.copy(position).sub(this.camera.position);
                _alpha = deltaDist / _v1.length();
                this.camera.position.lerp(position, _alpha);
                this.controls.target.lerp(target, _alpha);

                this.logger.log(`camPos:${this.camera.position.x} ${this.camera.position.y} ${this.camera.position.z}`);
                this.logger.log(`tarPos:${this.controls.target.x} ${this.controls.target.y} ${this.controls.target.z}`);

                this.controls.update();

            } else {

                this.resetTick();
                this.setPanelState(false);

            }

        };

    }

}

export { WorldControls };