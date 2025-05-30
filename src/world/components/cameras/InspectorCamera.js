import { Vector3 } from "three";

class InspectorCamera {

    camera;
    target;

    #player;
    #control;
    #roomAreas = [];

    isInspectorCamera = true;

    constructor(specs) {

        const { defaultCamera } = specs;
        
        this.camera = defaultCamera.camera;
        this.target = defaultCamera.target;

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
            const camPos = new Vector3(...cameraPosition);
            const camTar = new Vector3(...cameraTarget);
            const camPosWorld = room.localToWorld(camPos);
            const camTarWorld = room.localToWorld(camTar);

            this.camera.position.copy(camPosWorld);
            this.camera.lookAt(camTarWorld);
            this.target = camTarWorld;

            this.#control.target.copy(this.target);

        }

    }

    tick() {

        this.checkIntersection();

    }

}

export { InspectorCamera };