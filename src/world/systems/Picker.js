import { Raycaster, Vector2 } from 'three';
import { CAMERA_RAY_LAYER } from '../components/utils/constants';
import { getInwallParent } from '../components/utils/objectHelper';

class Picker {

    #container;
    #camera;
    #scene;
    #postProcessor;
    #worldScene;
    #raycaster;
    #mouse = new Vector2();

    constructor(container) {

        this.#raycaster = new Raycaster();
        this.#raycaster.layers.set(CAMERA_RAY_LAYER);
        this.#container = container;

        this.bindClick();

    }

    get clientWidth() {

        return this.#container.clientWidth;

    }

    get clientHeight() {

        return this.#container.clientHeight;

    }

    setup(worldScene) {

        this.#camera = worldScene.camera;
        this.#scene = worldScene.scene;
        this.#postProcessor = worldScene.postProcessor;
        this.#worldScene = worldScene;

    }

    reset() {

        this.#camera = null;
        this.#scene = null;
        this.#postProcessor = null;
        this.#worldScene = null;

    }

    get isUnavailable() {

        return !this.#camera && !this.#scene && !this.#postProcessor && !this.#worldScene;

    }

    bindClick() {

        this.#container.addEventListener('click', this.clickEvent.bind(this));

    }

    clickEvent(event) {

        if (!this.#scene || !this.#worldScene.postProcessingEnabled || !this.#worldScene.enablePick) 
            return;

        this.#mouse.x = (event.clientX / this.clientWidth) * 2 - 1;
        this.#mouse.y = - (event.clientY / this.clientHeight) * 2 + 1;

        this.checkIntersection();

    }

    checkIntersection() {

        this.#raycaster.setFromCamera(this.#mouse, this.#camera);

        const intersects = this.#raycaster.intersectObjects(this.#scene.children);

        this.#postProcessor.clearOutlineObjects();
        this.#worldScene.pickedObject = null;
        this.#worldScene.clearObjectsPanel();

        if (intersects.length > 0) {

            const intersectObj = intersects[0].object;
            const selectedObject = intersectObj.parent.isRoom ? intersectObj : 
                intersectObj.parent.isPlayer ? intersectObj.parent : getInwallParent(intersectObj);

            selectedObject.isPicked = true;

            this.#postProcessor.addOutlineObjects([selectedObject]);

            this.#worldScene.pickedObject = selectedObject;

            this.#worldScene.setupObjectsGuiConfig([this.#worldScene.pickedObject]);

        }

        if (this.#worldScene.staticRendering && this.#worldScene.forceStaticRender) this.#worldScene.render();
    }
}

export { Picker };