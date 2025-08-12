import { modelRenderer } from "./globals";
import { Loop } from "./Loop";
import { spaceCadet } from "../components/basic/colorBase";
import { Camera } from "../components/cameras/Camera";
import { createAmbientLight, createDirectionalLight, createPointLight } from "../components/lights";
import { createScene } from "../components/scene";
import { addShadow } from "../components/shadowMaker";
import { BayonetItem, FirstAidKitItem, FirstAidKitLarge, FirstAidKitMedium, FirstAidKitSmall, GlockItem, MagnumAmmoBox, PistolAmmoBox, PistolItem, RevolverItem, SMGAmmoBox, SMGShortItem } from "../components/Models";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Resizer } from "./Resizer";
import { Quaternion, Vector3 } from "three";

const DIRECTIONAL_LIGHT_SPECS = {
    display: "Directional Light",
    detail: {
        color: [255, 255, 255],
        intensity: 1,
        position: [0, 0, -10],
        target: [0, 0, 0]
    }
};
const AMBIENT_LIGHT_SPECS = {
    detail: {
        color: [128, 128, 128],
        intensity: 1
    }
};
const POINT_LIGHT_SPECS = {
    detail: {
        color: [209, 244, 195],
        position: [1, 1, 1],
        intensity: 40,
        distance: 0,
        decay: 2
    }
};

const _xAxis = new Vector3(1, 0, 0);
const _yAxis = new Vector3(0, 1, 0);
const _originPosition = new Vector3();
const _originQuaternion = new Quaternion();
const _originCameraPosition = new Vector3(0, 0, .5);
const _originCameraTarget = new Vector3(0, 0, 0);
const _forward = new Vector3(0, 0, -1);
const _backward = new Vector3(0, 0, 1);
const _v0 = new Vector3();
const _v1 = new Vector3();
const _v2 = new Vector3();

class ItemViewer {

    _renderer;
    _scene;
    _loop;
    _camera;
    _controls;
    _resizer;
    _directionalLight;
    _ambientLight;
    _pointLight;
    stats;

    _item;

    _enabled = false;

    // movement
    _rotateYClockwise = false;
    _rotateYCounterClockwise = false;
    _rotateXClockwise = false;
    _rotateXCounterClockwise = false;
    _zoomIn = false;
    _zoomOut = false;

    _minDistance = .3;
    _maxDistance = .8;

    _lerpTick;
    _controlChanged = false;

    _useMouse = false;

    constructor() {

        // renderer
        this._renderer = modelRenderer;
        this._renderer.shadowMap.enabled = true;
        // scene
        this._scene = createScene(spaceCadet);
        // camera
        this._camera = new Camera({ fov: 50, aspect: 1, near: .1, far: 500 }).camera;
        this._camera.position.copy(_originCameraPosition);
        // controls
        this.setupControls();
        // resizer
        this.setupResizer();
        // loop
        this.setupLoop();
        // lights
        this.setupLights();

    }

    get scene() {

        return this._scene;

    }

    get useMouse() {

        return this._useMouse;

    }

    set useMouse(val) {

        this._useMouse = val;

    }

    setupResizer() {

        this._resizer = new Resizer(this._camera, this._renderer);
        window.addEventListener('resize', () => {

            this._resizer.setSize(false);

        });

    }

    setupControls() {

        this._controls = new OrbitControls(this._camera, this._renderer.domElement);
        this._controls.minDistance = this._minDistance;
        this._controls.maxDistance = this._maxDistance;
        this._controls.enablePan = false;
        this._controls.enableDamping = true;
        this._controls.saveState();

        this._controls.addEventListener('change', () => {

            this._controlChanged = true;

        });

        this._controls.enabled = false;

    }

    setupLights() {

        this._directionalLight = createDirectionalLight(DIRECTIONAL_LIGHT_SPECS);
        this._ambientLight = createAmbientLight(AMBIENT_LIGHT_SPECS);
        this._pointLight = createPointLight(POINT_LIGHT_SPECS);

        const mapSize = { width: 2048, height: 2048 };
        addShadow(this._directionalLight, mapSize);
        addShadow(this._pointLight, mapSize);
        this._directionalLight.shadow.camera.updateProjectionMatrix();
        this._pointLight.shadow.camera.updateProjectionMatrix();

        this._scene.add(this._directionalLight, this._ambientLight, this._pointLight);

    }

    setupLoop() {

        this._loop = new Loop(this._renderer);
        this._loop.addUpdatables(this);
        this._loop.setCallbackAfterTick(() => {

            this.render();

        });

    }

    addItem(item) {

        if (item instanceof GlockItem) {

            this._item = GlockItem.gltfModel;

        } else if (item instanceof PistolItem) {

            this._item = PistolItem.gltfModel;

        } else if (item instanceof RevolverItem) {

            this._item = RevolverItem.gltfModel;

        } else if (item instanceof SMGShortItem) {

            this._item = SMGShortItem.gltfModel;

        } else if (item instanceof BayonetItem) {

            this._item = BayonetItem.gltfModel;

        } else if (item instanceof PistolAmmoBox) {

            this._item = PistolAmmoBox.gltfModel;

        } else if (item instanceof MagnumAmmoBox) {

            this._item = MagnumAmmoBox.gltfModel;

        } else if (item instanceof SMGAmmoBox) {

            this._item = SMGAmmoBox.gltfModel;

        } else if (item instanceof FirstAidKitItem) {

            if (item.currentItem instanceof FirstAidKitSmall) {

                this._item = FirstAidKitSmall.gltfModel;

            } else if (item.currentItem instanceof FirstAidKitMedium) {

                this._item = FirstAidKitMedium.gltfModel;

            } else if (item.currentItem instanceof FirstAidKitLarge) {

                this._item = FirstAidKitLarge.gltfModel;

            }

        }

        if (this._item) {
            
            _originQuaternion.copy(this._item.group.quaternion);
            _originPosition.copy(this._item.group.position);
            this._scene.add(this._item.group);

        }

    }

    removeItem() {

        if (this._item) {

            this.resetState();
            this._scene.remove(this._item.group);
            this.resetControl();

        }

    }

    start() {

        this._loop.start(this.stats);

    }

    stop() {

        this._loop.stop();

    }

    render() {

        this._renderer.render(this._scene, this._camera);

    }

    resetControl() {

        this._controls.reset();
        this._controlChanged = false;

    }

    resetState(lerp = false) {

        this._rotateXClockwise = false;
        this._rotateXCounterClockwise = false;
        this._rotateYClockwise = false;
        this._rotateYCounterClockwise = false;

        if (lerp) {
            
            this._lerpTick = (delta) => {

                const itemPositionInterval = _v0.copy(_originPosition).sub(this._item.group.position).length();
                const itemAngleTo = Math.abs(this._item.group.quaternion.angleTo(_originQuaternion));
                const camPositionInterval = parseFloat(_v1.copy(_originCameraPosition).sub(this._camera.position).length().toFixed(3));
                const camTargetInterval = _v2.copy(_originCameraTarget).sub(this._controls.target).length();
                let alpha = 0;

                const needLerp = Math.max(0, itemPositionInterval, itemAngleTo, camPositionInterval, camTargetInterval) > 0;

                if (!needLerp) {

                    this._lerpTick = undefined;
                    this.resetControl();
                    return;

                }

                if (itemPositionInterval) {

                    alpha = Math.min(1, 1 * delta / itemPositionInterval);
                    this._item.group.position.lerp(_originPosition, alpha);

                }

                if (itemAngleTo) {

                    alpha = Math.min(1, 10 * delta / itemAngleTo);
                    this._item.group.quaternion.slerp(_originQuaternion, alpha);

                }

                if (camPositionInterval) {

                    alpha = Math.min(1, 2 * delta / camPositionInterval);
                    this._camera.position.lerp(_originCameraPosition, alpha);

                }

                if (camTargetInterval) {

                    alpha = Math.min(1, 2 * delta / camTargetInterval);
                    this._controls.target.lerp(_originCameraTarget, alpha);

                }

            };

        } else {

            this._item.group.position.set(0, 0, 0);
            this._item.group.quaternion.copy(_originQuaternion);
            this._lerpTick = undefined;

        }        

    }

    get canvas() {

        return this._renderer.domElement;

    }

    /**
     * @param {boolean} val
     */
    set rotateXClockwise(val) {

        this._rotateXClockwise = val;

    }

    /**
     * @param {boolean} val
     */
    set rotateXCounterClockwise(val) {

        this._rotateXCounterClockwise = val;

    }

    /**
     * @param {boolean} val
     */
    set rotateYClockwise(val) {

        this._rotateYClockwise = val;

    }

    /**
     * @param {boolean} val
     */
    set rotateYCounterClockwise(val) {

        this._rotateYCounterClockwise = val;

    }

    /**
     * @param {boolean} val
     */
    set zoomIn(val) {

        this._zoomIn = val;

    }

    /**
     * @param {boolean} val
     */
    set zoomOut(val) {

        this._zoomOut = val;

    }

    tick(delta) {

        if (!this._item) return;

        if (this._controls.enabled) this._controls.update(delta);

        if (this._lerpTick) {

            this._lerpTick(delta);
            return;

        }

        const rotateSpeed = (this._useMouse ? 5 : 2) * delta;
        const zoomSpeed = .5 * delta;
        const group = this._item.group;
        if (this._rotateXClockwise) {

            group.rotateOnWorldAxis(_xAxis, - rotateSpeed);

        }

        if (this._rotateXCounterClockwise) {

            group.rotateOnWorldAxis(_xAxis, rotateSpeed);

        }

        if (this._rotateYClockwise) {

            group.rotateOnWorldAxis(_yAxis, - rotateSpeed);

        }

        if (this._rotateYCounterClockwise) {

            group.rotateOnWorldAxis(_yAxis, rotateSpeed);

        }

        if (this._zoomIn && !this._zoomOut) {

            const dist = this._camera.position.length();
            if (dist > this._minDistance) {

                _v0.copy(_forward).multiplyScalar(zoomSpeed);
                _v0.applyMatrix4(this._camera.matrixWorld);
                this._camera.position.copy(_v0);

            } else {

                const delta = Math.abs(this._minDistance - dist);
                _v0.set(0, 0, delta);
                _v0.applyMatrix4(this._camera.matrixWorld);
                this._camera.position.copy(_v0);

            }

        }

        if (this._zoomOut && !this._zoomIn) {

            const dist = this._camera.position.length();
            if (dist < this._maxDistance) {

                _v0.copy(_backward).multiplyScalar(zoomSpeed);;
                _v0.applyMatrix4(this._camera.matrixWorld);
                this._camera.position.copy(_v0);

            } else {

                const delta = Math.abs(this._maxDistance - dist);
                _v0.set(0, 0, - delta);
                _v0.applyMatrix4(this._camera.matrixWorld);
                this._camera.position.copy(_v0);

            }

        }

    }

}

const pdaItemViewer = new ItemViewer();

export { pdaItemViewer };