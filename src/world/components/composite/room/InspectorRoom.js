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

        for (let i = 0, il = areas.length; i < il; i++) {

            const area = areas[i];

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

            // set collision areas invisible
            const listener = () => {

                areaBlock.box.setLayers(CAMERA_RAY_LAYER);

            }
            const type = 'visibleChanged';
            areaBlock.box.addEventListener(type, listener);
            areaBlock.box.visible = false;

            this.areas.push(areaBlock);
            this.group.add(areaBlock.box.mesh);

        }

    }

    updateAreasOBBBox(needUpdateMatrixWorld = true) {

        for (let i = 0, il = this.areas.length; i < il; i++) {

            const { box } = this.areas[i];

            box.updateOBB(needUpdateMatrixWorld);

        }
        
    }

}

export { InspectorRoom };