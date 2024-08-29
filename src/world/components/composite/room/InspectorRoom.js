import { Room } from "./Room";
import { createOBBBox } from "../../physics/collisionHelper";
import { basic } from "../../basic/colorBase";
import { CAMERA_RAY_LAYER } from "../../utils/constants";

class InspectorRoom extends Room {

    isInspectorRoom = true;
    areas = [];

    constructor(specs) {

        super(specs);

        this.initAreas();

    }

    initAreas() {

        const { areas } = this.specs;

        areas.forEach(area => {

            const { name, width, height, depth, color = basic } = area;
            const { position = [0, 0, 0], rotation = [0, 0, 0] } = area;
            const { cameraPosition = [0, 0, 0], cameraTarget = [0, 0, 0] } = area;
            const boxSpecs = { size: { width, depth, height }, color };

            const areaBlock = {

                name,
                box: createOBBBox(boxSpecs, name, position, rotation, true, true),
                cameraPosition,
                cameraTarget

            };

            areaBlock.box.isArea = true;
            areaBlock.box.mesh.layers.enable(CAMERA_RAY_LAYER);

            this.areas.push(areaBlock);

            this.group.add(areaBlock.box.mesh);

        });

        this.areas.forEach(area => {

            area.box.mesh.visible = false;

        });

    }

    updateAreasOBBBox(needUpdateMatrixWorld = true) {

        this.areas.forEach(area => {

            const { box } = area;

            box.updateOBB(needUpdateMatrixWorld);

        });
        
    }

}

export { InspectorRoom };