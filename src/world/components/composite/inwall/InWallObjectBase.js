import { Group } from 'three';
import { CAMERA_RAY_LAYER } from '../../utils/constants';
import { getVisibleMeshes } from '../../utils/objectHelper';

class InWallObjectBase {

    name = '';

    walls = [];
    tops = [];
    bottoms = [];
    topOBBs = [];
    bottomOBBs = [];

    isObstacle = false;
    enableOBBs = false;
    enableWallOBBs = false;
    climbable = false;

    specs;

    constructor(specs) {

        this.specs = specs;

        const { name } = specs;
        const { isObstacle = false, enableOBBs = false, enableWallOBBs = false, climbable = false } = specs;

        this.name = name;
        this.isObstacle = isObstacle;
        this.enableOBBs = enableOBBs;
        this.enableWallOBBs = enableWallOBBs;
        this.climbable = climbable;
        this.group = new Group();
        this.group.name = name;
        this.group.isInwallObject = true;
        this.group.rotationY = 0;
        this.group.father = this;

    }

    makePlaneConfig(specs) {

        const { height } = specs;
        const { baseSize = height, mapRatio, lines = true } = this.specs;

        specs.lines = lines;
        specs.mapRatio = mapRatio;
        specs.baseSize = baseSize

        return specs;

    }

    setPickLayers() {

        const meshes = getVisibleMeshes(this.group);

        meshes.forEach(m => m.layers.enable(CAMERA_RAY_LAYER));
        
    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotationY(y) {

        const preGroupRotY = this.group.rotationY;

        this.group.rotation.y = y;
        this.group.rotationY = y;

        this.walls.forEach(w => w.mesh.rotationY = w.mesh.rotationY - preGroupRotY + y);

        return this;

    }

    updateOBBs(needUpdateMatrixWorld = true, needUpdateWalls = true, needUpdateTopBottom = true) {

        if (needUpdateWalls) {

            this.walls.forEach(w => {

                w.updateRay();

                if (w.isOBB) {

                    w.updateOBB(needUpdateMatrixWorld);

                }

            });
        }

        if (needUpdateTopBottom) {

            this.topOBBs.concat(this.bottomOBBs).forEach(obb => obb.updateOBB(needUpdateMatrixWorld));

        }

    }

}

export { InWallObjectBase };