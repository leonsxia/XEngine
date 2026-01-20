import { Group, MathUtils, Quaternion, Vector3 } from 'three';
import { CAMERA_RAY_LAYER, PHYSICS_TYPES, PLAYER_CAMERA_RAY_LAYER, PLAYER_CAMERA_TRANSPARENT_LAYER, TOFU_AIM_LAYER, TOFU_FOCUS_LAYER } from '../../utils/constants';
import { getVisibleMeshes } from '../../utils/objectHelper';
import { Logger } from '../../../systems/Logger';
import { BasicObject } from '../../basic/BasicObject';
import { GLOBALS } from '../../../systems/globals';

const _v1 = new Vector3();
const _v2 = new Vector3();
const _q1 = new Quaternion();

const DEBUG = false;

class InWallObjectBase {

    isInWallObjectBase = true;

    canBeIgnored = false;
    isSimplePhysics = GLOBALS.CURRENT_PHYSICS === PHYSICS_TYPES.SIMPLE ? true : false;

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

    _scale = [1, 1, 1];

    #logger = new Logger(DEBUG, 'InWallObjectBase');

    constructor(specs) {

        this.specs = specs;

        const { name } = specs;
        const { isObstacle = false, enableOBBs = false, enableWallOBBs = false, climbable = false } = specs;
        const { canBeIgnored = false } = specs;

        this.name = name;
        this.isObstacle = isObstacle;
        this.enableOBBs = enableOBBs;
        this.enableWallOBBs = enableWallOBBs;
        this.climbable = climbable;
        this.group = new Group();
        this.group.name = name;
        this.group.isInwallObject = true;
        this.group.father = this;
        this.canBeIgnored = canBeIgnored;

    }

    get position() {

        return this.group.position;

    }

    get rotation() {

        return this.group.rotation;

    }

    get scaleX() {

        return this._scale[0];

    }

    set scaleX(x) {

        this._scale[0] = x;

        this.update();

    }

    get scaleY() {

        return this._scale[1];

    }

    set scaleY(y) {

        this._scale[1] = y;

        this.update();

    }

    get scaleZ() {

        return this._scale[2];

    }

    set scaleZ(z) {

        this._scale[2] = z;

        this.update();

    }

    get scale() {

        return this._scale;

    }

    set scale(val) {

        this._scale = new Array(...val);

        this.update();

    }

    // this should be inherited and implemented by child class
    update() { }

    makePlaneConfig(specs) {

        const { height } = specs;
        const { baseSize = height, mapRatio, lines = false, transparent = true } = this.specs;

        specs.lines = lines;
        specs.mapRatio = mapRatio;
        specs.baseSize = baseSize;
        specs.transparent = transparent;

        return specs;

    }

    bindBasicObjectEvents(obj) {
        
        const listener = (event) => {

            this.#logger.func = 'bindBasicObjectEvents';
            this.#logger.log(`${obj.name}: ${event.message}`);
            obj.setLayers(CAMERA_RAY_LAYER);
            obj.setLayers(PLAYER_CAMERA_RAY_LAYER);
            obj.setLayers(TOFU_AIM_LAYER);
            obj.setLayers(TOFU_FOCUS_LAYER);

            const { transparent = true } = obj.specs;

            if (transparent) {

                obj.setLayers(PLAYER_CAMERA_TRANSPARENT_LAYER);

            }

        }
        const type = 'visibleChanged';

        obj.addEventListener(type, listener);

    }

    setPickLayers() {

        const meshes = getVisibleMeshes(this.group).filter(m => m.father instanceof BasicObject);

        for (let i = 0, il = meshes.length; i < il; i++) {

            const m = meshes[i];

            this.bindBasicObjectEvents(m.father);

            m.father.visible = true;

        }
        
    }

    setCanBeIgnored() {

        const meshes = getVisibleMeshes(this.group).filter(m => m.father instanceof BasicObject);

        for (let i = 0, il = meshes.length; i < il; i++) {

            const m = meshes[i];
            m.father.canBeIgnored = this.canBeIgnored;

        }

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotation(rot) {

        this.group.rotation.set(...rot);

        return this;

    }

    setRotationX(x) {

        this.group.rotation.x = x;

        return this;

    }

    setRotationY(y) {

        this.group.rotation.y = y;

        return this;

    }

    setRotationZ(z) {

        this.group.rotation.z = z;

        return this;

    }

    get rotationX() {

        return this.group.rotation.x;

    }

    get rotationXDegree() {

        return MathUtils.radToDeg(this.rotationX);

    }

    set rotationXDegree(value) {

        this.setRotationX(MathUtils.degToRad(value));

    }

    get rotationY() {

        return this.group.rotation.y;

    }

    get rotationYDegree() {

        return MathUtils.radToDeg(this.rotationY);

    }

    set rotationYDegree(value) {

        this.setRotationY(MathUtils.degToRad(value));

    }

    get rotationZ() {

        return this.group.rotation.z;

    }

    get rotationZDegree() {

        return MathUtils.radToDeg(this.rotationZ);

    }

    set rotationZDegree(value) {

        this.setRotationZ(MathUtils.degToRad(value));

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

    // Rapier physics function
    rapierInstances = [];
    // events
    onRapierInstanceRemoved;
    onRapierInstanceAdded;

    // can be inherited by children
    addRapierInstances() {}

    syncRapierWorld() {

        if (this.rapierInstances.length > 0) {

            // remove and add instances
            if (this.onRapierInstanceRemoved && this.onRapierInstanceAdded) {

                this.rapierInstances.length = 0;
                this.onRapierInstanceRemoved(this);
                this.addRapierInstances();
                this.onRapierInstanceAdded(this);

            } else {

                const { body } = this.group.userData.physics;
                if (body) {

                    this.group.updateWorldMatrix(true, false);
                    this.group.matrixWorld.decompose(_v1, _q1, _v2);
                    body.setTranslation(_v1);
                    body.setRotation(_q1);

                }

            }

        }

    }

    onRapierUpdated() {

        this.updateOBBs();

    }

}

export { InWallObjectBase };