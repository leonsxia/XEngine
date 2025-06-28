import { Vector3 } from "three";

const _v1 = new Vector3();
const _v2 = new Vector3();

class InspectorCamera {

    camera;
    target = new Vector3();

    #player;
    #control;
    #roomAreas = [];

    isInspectorCamera = true;

    constructor(specs) {

        const { defaultCamera } = specs;
        
        this.camera = defaultCamera.camera;
        this.target.copy(defaultCamera.target);

    }


    setup(specs) {

        const { player, control, rooms } = specs;

        this.#player = player;
        this.#control = control;

        const inspectorRooms = rooms.filter(r => r.isInspectorRoom);

        for (let i = 0, il = inspectorRooms.length; i < il; i++) {

            const room = inspectorRooms[i];

            this.#roomAreas.push(...room.areas);

            for (let j = 0, jl = room.areas.length; j < jl; j++) {

                const area = room.areas[j];
                const { box, cameraPosition, cameraTarget } = area;
                const $this = this;

                Object.defineProperties(box, {
                    cameraPositionX: {
                        get() {
                            return cameraPosition[0];
                        },
                        set(val) {
                            cameraPosition[0] = val;
                            $this.updateCamera(area);
                        }
                    },
                    cameraPositionY: {
                        get() {
                            return cameraPosition[1];
                        },
                        set(val) {
                            cameraPosition[1] = val;
                            $this.updateCamera(area);
                        }
                    },
                    cameraPositionZ: {
                        get() {
                            return cameraPosition[2];
                        },
                        set(val) {
                            cameraPosition[2] = val;
                            $this.updateCamera(area);
                        }
                    },
                    cameraTargetX: {
                        get() {
                            return cameraTarget[0];
                        },
                        set(val) {
                            cameraTarget[0] = val;
                            $this.updateCamera(area);
                        }
                    },
                    cameraTargetY: {
                        get() {
                            return cameraTarget[1];
                        },
                        set(val) {
                            cameraTarget[1] = val;
                            $this.updateCamera(area);
                        }
                    },
                    cameraTargetZ: {
                        get() {
                            return cameraTarget[2];
                        },
                        set(val) {
                            cameraTarget[2] = val;
                            $this.updateCamera(area);
                        }
                    }
                });

            }

        }

    }

    changePlayer(player) {

        this.#player = player;

    }

    checkIntersection() {

        const intersects = [];

        for (let i = 0; i < this.#roomAreas.length; i++) {

            if (this.#player.obb.intersectsOBB(this.#roomAreas[i].box.obb)) {

                intersects.push(this.#roomAreas[i]);

            }

        }

        if (intersects.length === 1) {

            this.updateCamera(intersects[0]);            

        }

    }

    updateCamera(area) {

        const { box, cameraPosition, cameraTarget } = area;

        const room = box.mesh.parent;
        _v1.set(...cameraPosition);
        _v2.set(...cameraTarget);
        room.updateWorldMatrix(true, false);
        const camPosWorld = _v1.applyMatrix4(room.matrixWorld);
        const camTarWorld = _v2.applyMatrix4(room.matrixWorld);

        this.camera.position.copy(camPosWorld);
        this.camera.lookAt(camTarWorld);
        this.target.copy(camTarWorld);

        this.#control.target.copy(this.target);

    }

    tick() {

        this.checkIntersection();

    }

}

export { InspectorCamera };