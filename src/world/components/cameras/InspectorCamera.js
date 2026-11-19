import { Vector3 } from "three";

const _v0 = new Vector3();
const _v1 = new Vector3();
const _v2 = new Vector3();

class InspectorCamera {

    camera;
    target = new Vector3();
    damping = true;
    dampingSpeed = 1.5;
    icFollowPlayer = false;
    _currentArea = null;

    #player;
    #control;
    roomAreas = {};
    attachTo;

    isInspectorCamera = true;

    constructor(specs) {

        const { defaultCamera, ICFollowPlayer, attachTo } = specs;
        this.icFollowPlayer = ICFollowPlayer;
        
        this.camera = defaultCamera.camera;
        this.target.copy(defaultCamera.target);
        this.attachTo = attachTo;

    }

    setup(specs) {

        const { player, control, rooms } = specs;

        this.#player = player;
        this.#control = control;

        const inspectorRooms = rooms.filter(r => r.isInspectorRoom);

        for (let i = 0, il = inspectorRooms.length; i < il; i++) {

            const room = inspectorRooms[i];

            this.roomAreas[room.roomId] = { 
                areas: new Array(...room.areas),
                areaBlockMeshes: room.areas.map(a => a.box.mesh)
            };

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

    checkIntersection(delta) {

        const intersects = [];
        const roomAreas = this.roomAreas[this.attachTo.currentRoom.roomId];
        intersects.push(...this.#player.centerRay.intersectObjects(roomAreas.areaBlockMeshes));

        if (!intersects.length) {

            for (let i = 0; i < roomAreas.areas.length; i++) {

                const area = roomAreas.areas[i];
                if (this.#player.obb.intersectsOBB(area.box.obb)) {

                    intersects.push(area);

                }

            }

        }

        if (intersects.length) {

            if (intersects[0].object?.isMesh) {

                this.updateCamera(intersects[0].object.father.attachTo, delta);

            } else if (intersects[0].isAreaBlock) {

                intersects.sort((a, b) => a.index - b.index);
                this.updateCamera(intersects[0], delta);

            }                      

        }

    }

    updateCamera(area, delta) {

        const { box, cameraPosition, cameraTarget } = area;
        let { dampingSpeed } = area;
        if (dampingSpeed === undefined) dampingSpeed = this.dampingSpeed;

        const room = box.mesh.parent;
        _v1.set(...cameraPosition);

        room.updateWorldMatrix(true, false);
        const camPosWorld = _v1.applyMatrix4(room.matrixWorld);
        const camTarWorld = this.icFollowPlayer ? this.#player.getWorldPosition(_v2) : _v2.set(...cameraTarget).applyMatrix4(room.matrixWorld);        

        this.camera.position.copy(camPosWorld);

        let direction = camTarWorld;
        if (this._currentArea !== area) {

            this._currentArea = area;
            this.camera.lookAt(direction);

        }

        if (this.damping) {

            this.camera.getWorldDirection(_v0);
            direction = _v0.add(_v1);
            // direction.add(_v2.sub(direction).normalize().multiplyScalar(dampingSpeed * delta));
            const alpha = dampingSpeed * delta / direction.distanceTo(_v2);
            direction.lerp(_v2, alpha);

        }

        this.camera.lookAt(direction);
        this.target.copy(direction);

        this.#control.target.copy(this.target);

    }

    tick(delta) {

        this.checkIntersection(delta);

    }

}

export { InspectorCamera };