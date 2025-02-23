import { Group, MathUtils } from 'three';
import { CAMERA_RAY_LAYER, PLAYER_CAMERA_RAY_LAYER } from '../../utils/constants';
import { getVisibleMeshes } from '../../utils/objectHelper';
import { Logger } from '../../../systems/Logger';
import { BasicObject } from '../../basic/BasicObject';

const DEBUG = false;

class InWallObjectBase {

    isInWallObjectBase = true;

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

    #logger = new Logger(DEBUG, 'InWallObjectBase');

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
        this.group.father = this;

        this.rotationY = 0;     // local rotation y

    }

    makePlaneConfig(specs) {

        const { height } = specs;
        const { baseSize = height, mapRatio, lines = true } = this.specs;

        specs.lines = lines;
        specs.mapRatio = mapRatio;
        specs.baseSize = baseSize;
        specs.transparent = true;

        return specs;

    }

    bindBasicObjectEvents(obj) {
        
        const listener = (event) => {

            this.#logger.func = 'bindBasicObjectEvents';
            this.#logger.log(`${obj.name}: ${event.message}`);
            obj.setLayers(CAMERA_RAY_LAYER);
            obj.setLayers(PLAYER_CAMERA_RAY_LAYER);

        }
        const type = 'visibleChanged';

        if (!obj.hasEventListener(type, listener)) {

            obj.addEventListener(type, listener);

        }

    }

    setPickLayers() {

        const meshes = getVisibleMeshes(this.group);

        for (let i = 0, il = meshes.length; i < il; i++) {

            const m = meshes[i];

            if (m.father instanceof BasicObject) {

                this.bindBasicObjectEvents(m.father);

                m.father.visible = true;

            }

        }
        
    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotationY(y) {

        const preGroupRotY = this.rotationY;

        this.group.rotation.y = y;
        this.rotationY = y;

        for (let i = 0, il = this.walls.length; i < il; i++) {

            const w = this.walls[i];

            w.mesh.rotationY = w.mesh.rotationY - preGroupRotY + y;
            
        }

        return this;

    }

    get rotationYDegree() {

        return MathUtils.radToDeg(this.rotationY);

    }

    set rotationYDegree(value) {

        this.setRotationY(MathUtils.degToRad(value));

    }

    updateOBBs(needUpdateMatrixWorld = true, needUpdateWalls = true, needUpdateTopBottom = true) {

        if (needUpdateWalls) {

            for (let i = 0, il = this.walls.length; i < il; i++) {

                const w = this.walls[i];

                w.updateRay(needUpdateMatrixWorld);

                if (w.isOBB) {

                    w.updateOBB(false);

                }

            }

        }

        if (needUpdateTopBottom) {

            const topBottoms = this.topOBBs.concat(this.bottomOBBs);

            for (let i = 0, il = topBottoms.length; i < il; i++) {

                const obb = topBottoms[i];

                obb.updateOBB(needUpdateMatrixWorld);

            }

        }

    }

}

export { InWallObjectBase };