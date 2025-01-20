import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Vector3 } from 'three';
import { Logger } from './Logger';

// module scope const
const vel = 0.5;
const velPerSecond = vel * 60;
const _v0 = new Vector3();
let _alpha = 0;
const DEBUG = false;

class WorldControls {

    #controls;
    #thisCamera;
    #length = 0;
    #panels = [];
    #preTarget;
    #preCamPos;
    #logger = new Logger();

    constructor(camera, canvas) {

        this.#controls = new OrbitControls(camera, canvas);

        this.#thisCamera = camera;
    
        // damping and auto rotation require
        // the controls to be updated each frame
        // controls.autoRotate = true;
        this.#controls.enableDamping = false;
        this.#controls.update();
    
        this.resetTick();
        this.#controls.enabled = false;

        this.#logger.enable = DEBUG;

    }

    // dispose() {
    //     this.#controls.dispose();
    //     this.#thisCamera = null;
    // }

    initPanels(gui) {

        if (gui) {

            this.#panels.push(gui.leftPanel);

        }

    }

    get defControl() {

        return this.#controls;

    }

    resetCamera() {

        this.#controls.reset();

    }

    setPanelState(disabled) {

        if (this.#panels.length === 0) return;

        this.#panels.forEach(panel => {

            panel.children.forEach((child) => {

                child.controllers.forEach(ctl => {

                    if (disabled) {

                        ctl.disable();

                    } else {

                        ctl.enable();
                    }

                });
            });
        });

    }
    
    resetTick() {

        this.#controls.tick = (delta) => {

            this.#length = 0;
            this.#controls.enabled = true;

            const tarX = this.#controls.target.x.toFixed(4);
            const tarY = this.#controls.target.y.toFixed(4);
            const tarZ = this.#controls.target.z.toFixed(4);
            const camX = this.#thisCamera.position.x.toFixed(4);
            const camY = this.#thisCamera.position.y.toFixed(4);
            const camZ = this.#thisCamera.position.z.toFixed(4);

            if (this.coordinatesEqual(this.#preTarget, {x: tarX, y: tarY, z: tarZ}) && 
                this.coordinatesEqual(this.#preCamPos, {x: camX, y: camY, z: camZ})) {
                    
                this.setPanelState(false);

            } else {

                this.setPanelState(true);

            }

            this.setPreCoordinates(this.#controls.target, this.#thisCamera.position);

            this.#controls.update();

        };

    }

    initPreCoordinates() {

        this.setPreCoordinates(this.#controls.target, this.#thisCamera.position);

    }

    setPreCoordinates(target, camPos) {

        this.#preTarget = target.clone();
        this.#preCamPos = camPos.clone();

        this.#preTarget.x = this.#preTarget.x.toFixed(4);
        this.#preTarget.y = this.#preTarget.y.toFixed(4);
        this.#preTarget.z = this.#preTarget.z.toFixed(4);
        this.#preCamPos.x = this.#preCamPos.x.toFixed(4);
        this.#preCamPos.y = this.#preCamPos.y.toFixed(4);
        this.#preCamPos.z = this.#preCamPos.z.toFixed(4);

    }

    coordinatesEqual(coord0, coord1) {

        return coord0.x === coord1.x && coord0.y === coord1.y && coord0.z === coord1.z;

    }

    moveCamera(dist) {

        this.setPanelState(true);

        this.#controls.tick = (delta) => {

            this.#controls.enabled = false;

            if (this.#length < dist) {

                this.#length += vel;
                this.#thisCamera.position.x += vel;
                this.#thisCamera.position.y += vel;
                this.#thisCamera.position.z += vel;
                this.#controls.target.x += vel;
                this.#controls.target.y += vel;
                this.#controls.target.z += vel;

                this.#controls.update();

            } else {

                this.resetTick();
                this.setPanelState(false);

            }

        };

    }

    moveCameraStatic(dist) {

        const movingVec3 = new Vector3(dist, dist, dist);

        this.#controls.target.add(movingVec3);
        this.#thisCamera.position.add(movingVec3);

        this.#controls.update();

    }
    
    focusNext(target0, target1, position0, position1) {
        
        const tar0Vec3 = new Vector3(target0.x, target0.y, target0.z);
        const tar1Vec3 = new Vector3(target1.x, target1.y, target1.z);
        const pos0Vec3 = new Vector3(position0.x, position0.y, position0.z);
        const pos1Vec3 = new Vector3(position1.x, position1.y, position1.z);
        const tarDirVec3 = tar1Vec3.clone().sub(tar0Vec3);
        // const tarDirNormal = tarDirVec3.clone().normalize();
        // const tarDist = tarDirVec3.length();
        const posDirVec3 = pos1Vec3.clone().sub(pos0Vec3);
        // const posDirNormal = posDirVec3.clone().normalize();
        const posDist = posDirVec3.length();
        // const movingTime = posDist / velPerSecond;
        // const camVelPerSec = posDist < 0.001 ? 0 : posDist / movingTime;
        // const tarVelPerSec = tarDist / movingTime;
        let movingDist = 0;

        this.setPanelState(true);

        this.#controls.tick = (delta) => {

            this.#controls.enabled = false;

            movingDist += delta * velPerSecond;

            if (movingDist <= posDist) {

                // this.#logger.log(`movingDist:${movingDist} posDist:${posDist}`);
                // this.#thisCamera.position.add(posDirNormal.clone().multiplyScalar(velPerSecond * delta));
                // this.#controls.target.add(tarDirNormal.clone().multiplyScalar(tarVelPerSec * delta));

                _v0.copy(pos1Vec3.clone().sub(this.#thisCamera.position));
                _alpha = delta * velPerSecond / _v0.length();
                this.#thisCamera.position.lerp(pos1Vec3, _alpha);
                this.#controls.target.lerp(tar1Vec3, _alpha);

                this.#logger.log(`camPos:${this.#thisCamera.position.x} ${this.#thisCamera.position.y} ${this.#thisCamera.position.z}`);
                this.#logger.log(`tarPos:${this.#controls.target.x} ${this.#controls.target.y} ${this.#controls.target.z}`);

                this.#controls.update();

            } else {

                this.resetTick();
                this.setPanelState(false);

            }
            
        };
    }
}

export { WorldControls };