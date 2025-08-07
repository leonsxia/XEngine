import Stats from "stats.js";
import { modelRenderer } from "./globals";
import { Loop } from "./Loop";
import { spaceCadet } from "../components/basic/colorBase";
import { Camera } from "../components/cameras/Camera";
import { createAmbientLight, createDirectionalLight, createPointLight } from "../components/lights";
import { createScene } from "../components/scene";
import { addShadow } from "../components/shadowMaker";
import { BayonetItem, FirstAidKitItem, FirstAidKitLarge, FirstAidKitMedium, FirstAidKitSmall, GlockItem, MagnumAmmoBox, PistolAmmoBox, PistolItem, RevolverItem, SMGAmmoBox, SMGShortItem } from "../components/Models";
import { ArcballControls } from "three/addons/controls/ArcballControls.js";
import { Resizer } from "./Resizer";

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
    _stats = new Stats();

    _item;

    _enabled = false;

    constructor() {

        // renderer
        this._renderer = modelRenderer;
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
        this._controls.minDistance = .3;
        this._controls.maxDistance = .8;
        this._controls.setGizmosVisible(false);
        this._controls.saveState();

    }

    setupLights() {

        this._directionalLight = createDirectionalLight(DIRECTIONAL_LIGHT_SPECS);
        this._ambientLight = createAmbientLight(AMBIENT_LIGHT_SPECS);
        this._pointLight = createPointLight(POINT_LIGHT_SPECS);

        const mapSize = { width: 4096, height: 4096 };
        addShadow(this._directionalLight, mapSize);
        addShadow(this._pointLight, mapSize);
        this._directionalLight.shadow.camera.updateProjectionMatrix();
        this._pointLight.shadow.camera.updateProjectionMatrix();

        this._scene.add(this._directionalLight, this._ambientLight, this._pointLight);

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
            
            this._scene.add(this._item.group);

        }

    }

    removeItem() {

        if (this._item) {

            this._scene.remove(this._item.group);
            this._controls.reset();
            this.render();

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

    render() {

        this._renderer.render(this._scene, this._camera);

    }

    get canvas() {

        return this._renderer.domElement;

    }

}

const pdaItemViewer = new ItemViewer();

export { pdaItemViewer };