import { Group } from 'three';
import { REPEAT } from '../../utils/constants';

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
    }

    makePlaneConfig(specs) {

        const { width, height } = specs;
        const { baseSize = height, mapRatio, noRepeat = false, lines = true } = this.specs;

        specs.lines = lines;
        
        if (noRepeat) return specs;

        if (mapRatio) {

            specs.repeatU = width / (mapRatio * baseSize);
            specs.repeatV = height / baseSize;

        }

        specs.repeatModeU = REPEAT;
        specs.repeatModeV = REPEAT;

        return specs;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotationY(y) {

        this.group.rotation.y = y;

        this.walls.forEach(w => w.mesh.rotationY += y);

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