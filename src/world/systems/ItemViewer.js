import Stats from "stats.js";
import { pdaRenderer } from "./globals";
import { Loop } from "./Loop";
import { spaceCadet } from "../components/basic/colorBase";
import { Camera } from "../components/cameras/Camera";
import { createAmbientLight, createDirectionalLight, createPointLight } from "../components/lights";
import { createScene } from "../components/scene";
import { addShadow } from "../components/shadowMaker";
import { BayonetItem, FirstAidKitLarge, FirstAidKitMedium, FirstAidKitSmall, GlockItem, MagnumAmmoBox, PistolAmmoBox, PistolItem, RevolverItem, SMGAmmoBox, SMGShortItem } from "../components/Models";
import { ArcballControls } from "three/addons/controls/ArcballControls.js";
import { Resizer } from "./Resizer";

const DIRECTIONAL_LIGHT_SPECS = {
    display: "Directional Light",
    detail: {
        color: [255, 255, 255],
        intensity: 1,
        position: [0, 10, 0],
        target: [0, 0, 0]
    }
};
const AMBIENT_LIGHT_SPECS = {
    detail: {
        color: [128, 128, 128],
        intensity: 2
    }
};
const POINT_LIGHT_SPECS_0 = {
    detail: {
        color: [209, 244, 195],
        position: [2, 2, 2],
        intensity: 99.49,
        distance: 0,
        decay: 2
    }
};
const POINT_LIGHT_SPECS_1 = {
    detail: {
        color: [209, 244, 195],
        position: [2, 2, -2],
        intensity: 99.49,
        distance: 0,
        decay: 2
    }
};

class ItemViewer {

    _renderer;
    _scene;
    _loop;
    _camera;
    _controls;
    _resizer;
    _directionalLight;
    _ambientLight;
    _pointLight0;
    _pointLight1;
    _stats = new Stats();

    _item;

    _enabled = false;

    constructor() {

        // renderer
        this._renderer = pdaRenderer;
        this._renderer.shadowMap.enabled = true;
        // scene
        this._scene = createScene(spaceCadet);
        // camera
        this._camera = new Camera({ fov: 50, aspect: 1, near: .1, far: 500 }).camera;
        this._camera.position.set(0, 0, .5);
        // controls
        this.setupControls();
        // resizer
        this.setupResizer();
        // loop
        this._loop = new Loop(this._camera, this._scene, this._renderer);
        // lights
        this.setupLights();

    }

    setupResizer() {

        this._resizer = new Resizer(this._camera, this._renderer);
        window.addEventListener('resize', () => {

            this._resizer.setSize(false);

        });

    }

    setupControls() {

        this._controls = new ArcballControls( this._camera, this._renderer.domElement, this._scene );
        this._controls.minDistance = .25;
        this._controls.maxDistance = .8;
        this._controls.setGizmosVisible(false);
        this._controls.saveState();

    }

    setupLights() {

        this._directionalLight = createDirectionalLight(DIRECTIONAL_LIGHT_SPECS);
        this._ambientLight = createAmbientLight(AMBIENT_LIGHT_SPECS);
        this._pointLight0 = createPointLight(POINT_LIGHT_SPECS_0);
        this._pointLight1 = createPointLight(POINT_LIGHT_SPECS_1);

        addShadow(this._directionalLight);
        addShadow(this._pointLight0);
        addShadow(this._pointLight1);
        this._directionalLight.shadow.camera.updateProjectionMatrix();
        this._pointLight0.shadow.camera.updateProjectionMatrix();
        this._pointLight1.shadow.camera.updateProjectionMatrix();

        this._scene.add(this._directionalLight, this._ambientLight, this._pointLight0, this._pointLight1);

    }

    addItem(item) {

        switch (item.constructor.name) {

            case 'GlockItem':
                this._item = GlockItem.gltfModel;
                break;
            case 'PistolItem':
                this._item = PistolItem.gltfModel;
                break;
            case 'RevolverItem':
                this._item = RevolverItem.gltfModel;
                break;
            case 'SMGShortItem':
                this._item = SMGShortItem.gltfModel;
                break;
            case 'BayonetItem':
                this._item = BayonetItem.gltfModel;
                break;
            case 'PistolAmmoBox':
                this._item = PistolAmmoBox.gltfModel;
                break;
            case 'MagnumAmmoBox':
                this._item = MagnumAmmoBox.gltfModel;
                break;
            case 'SMGAmmoBox':
                this._item = SMGAmmoBox.gltfModel;
                break;
            case 'FirstAidKitItem':
                {
                    switch (item.currentItem.constructor.name) {

                        case 'FirstAidKitSmall':
                            this._item = FirstAidKitSmall.gltfModel;
                            break;
                        case 'FirstAidKitMedium':
                            this._item = FirstAidKitMedium.gltfModel;
                            break;
                        case 'FirstAidKitLarge':
                            this._item = FirstAidKitLarge.gltfModel;
                            break;

                    }
                }
                break;

        }

        if (this._item) {
            
            this._scene.add(this._item.group);

        }

    }

    removeItem() {

        if (this._item) {

            this._scene.remove(this._item.group);
            this._controls.reset();

        }

    }

    start() {

        document.body.appendChild(this._stats.dom);
        this._loop.start(this._stats);

    }

    stop() {

        document.body.removeChild(this._stats.dom);
        this._loop.stop();

    }

    get canvas() {

        return this._renderer.domElement;

    }

}

const pdaItemViewer = new ItemViewer();

export { pdaItemViewer };