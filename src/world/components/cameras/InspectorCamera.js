import { Vector3 } from "three";

class InspectorCamera {

    camera;
    target;

    #player;
    #control;
    #scene;
    #roomAreas = [];

    isInspectorCamera = true;

    constructor(specs) {

        const { defaultCamera } = specs;
        
        this.camera = defaultCamera.camera;
        this.target = defaultCamera.target;

    }


    setup(specs) {
        
        const { player, control, scene, rooms } = specs;

        this.#player = player;
        this.#control = control;
        this.#scene = scene;

        const inspectorRooms = rooms.filter(r => r.isInspectorRoom);

        inspectorRooms.forEach(room => {

            this.#roomAreas.push(...room.areas);

        });

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

        }

    }

    tick(delta) {

        this.#control.target.copy(this.target);

        this.checkIntersection();

    }

}

export { InspectorCamera };