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

        const { areas = [] } = this.specs;

        areas.forEach(area => {

            const { name, width, height, depth, color = basic } = area;
            const { position = [0, 0, 0], rotation = [0, 0, 0] } = area;
            const { cameraPosition = [0, 0, 0], cameraTarget = [0, 0, 0] } = area;
            const boxSpecs = { size: { width, depth, height }, color };

            const areaBlock = {

                name,
                box: createOBBBox(boxSpecs, name, position, rotation, false, false),
                cameraPosition,
                cameraTarget

            };

            areaBlock.box.isArea = true;
            areaBlock.box.mesh.layers.enable(CAMERA_RAY_LAYER);

            this.areas.push(areaBlock);

            this.group.add(areaBlock.box.mesh);

        });

        // set collision areas invisible
        this.areas.forEach(area => {

            area.box.visible = false;
            area.box.mesh.layers.disable(CAMERA_RAY_LAYER);

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