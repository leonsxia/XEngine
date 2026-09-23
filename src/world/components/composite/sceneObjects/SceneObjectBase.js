import { Group, MathUtils, Vector3, Quaternion } from 'three';
import { CAMERA_RAY_LAYER, PLAYER_CAMERA_RAY_LAYER, PLAYER_CAMERA_TRANSPARENT_LAYER, TOFU_AIM_LAYER, TOFU_FOCUS_LAYER } from '../../utils/constants';
import { Logger } from '../../../systems/Logger';

const DEBUG = false;

const _v1 = new Vector3();
const _v2 = new Vector3();
const _q1 = new Quaternion();

class SceneObjectBase {

    isSceneObjectBase = true;

    canBeIgnored = false;

    name = '';
    group;
    gltf;

    _scale = [1, 1, 1];

    specs;

    #logger = new Logger(DEBUG, 'SceneObjectBase');

    constructor(specs) {

        this.specs = specs;;

        const {name, canBeIgnored = false } = specs;

        this.name = name;
        this.canBeIgnored = canBeIgnored;
        this.group = new Group();
        this.group.name = name;
        this.group.isInwallObject = true;
        this.group.father = this;

    }

    get position() {

        return this.group.position;

    }

    get rotation() {

        return this.group.rotation;

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

    bindGLTFEvents(gltf = this.gltf) {

        if (!gltf) return;

        const type = 'visibleChanged';
        const listener = (event) => {

            this.#logger.func = 'bindGLTFEvents';
            this.#logger.log(`${gltf.name}: ${event.message}`);
            gltf.setLayers(CAMERA_RAY_LAYER);
            if (!this.specs.ignoreTPC) gltf.setLayers(PLAYER_CAMERA_RAY_LAYER);

            const { transparent = false } = this.specs;
            if (transparent) {

                gltf.setLayers(PLAYER_CAMERA_TRANSPARENT_LAYER);

            }

            gltf.setLayers(TOFU_AIM_LAYER);
            gltf.setLayers(TOFU_FOCUS_LAYER);

        };

        gltf.addEventListener(type, listener);
        gltf.visible = true;

    }

    setPickLayers() {

        this.bindGLTFEvents();

    }

    setCanBeIgnored() {

        this.gltf?.setCanBeIgnored(this.canBeIgnored);

    }

    // Rapier physics function
    rapierInstances = [];
    // events
    onRapierInstanceRemoved;
    onRapierInstanceAdded;

    // can be inherited by children
    addRapierInstances() { }

    clearRapierInstances() {

        this.rapierInstances.length = 0;

    }

    syncRapierWorld(force = false) {
        
        if (this.rapierInstances.length > 0) {

            if (force || !this.onRapierInstanceRemoved || !this.onRapierInstanceAdded) {

                const { body } = this.group.userData.physics;
                if (body) {

                    this.group.updateWorldMatrix(true, false);
                    this.group.matrixWorld.decompose(_v1, _q1, _v2);
                    body.setTranslation(_v1);
                    body.setRotation(_q1);

                }
                
            } else if (this.onRapierInstanceRemoved && this.onRapierInstanceAdded) {

                this.onRapierInstanceRemoved(this);
                this.addRapierInstances();
                this.onRapierInstanceAdded(this);

            }

        }

    }

    // can be inherited by children
    onRapierUpdated() { }

    clearRapierEvents() {

        this.onRapierInstanceRemoved = undefined;
        this.onRapierInstanceAdded = undefined;

    }

}

export { SceneObjectBase };