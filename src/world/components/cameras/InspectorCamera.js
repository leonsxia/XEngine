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

            const { box, cameraPosition, cameraTarget } = intersects[0];

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

    }

    tick() {

        this.checkIntersection();

    }

}

export { InspectorCamera };