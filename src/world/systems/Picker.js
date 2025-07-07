import { Raycaster, Vector2 } from 'three';
import { CAMERA_RAY_LAYER } from '../components/utils/constants';
import { getInwallParent, getTopParent } from '../components/utils/objectHelper';
import { container } from './htmlElements';

class Picker {
    #camera;
    #scene;
    #postProcessor;
    #worldScene;
    #raycaster;
    #mouse = new Vector2();

    constructor() {

        this.#raycaster = new Raycaster();
        this.#raycaster.layers.set(CAMERA_RAY_LAYER);

        this.bindClick();

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

        container.addEventListener('click', this.clickEvent.bind(this));

    }

    clickEvent(event) {

        if (!this.#scene || 
            !this.#worldScene.postProcessingEnabled || 
            !this.#worldScene.enablePick || 
            this.#worldScene.objectLocked
        ) 
            return;

        const canvas = container.querySelector('canvas');
        const canvasRatioH = canvas.clientWidth / container.clientWidth;
        const canvasRatioV = canvas.clientHeight / container.clientHeight;
        this.#mouse.x = ((event.clientX / container.clientWidth) * 2 - 1) / canvasRatioH;
        this.#mouse.y = (- (event.clientY / container.clientHeight) * 2 + 1) / canvasRatioV;

        if (Math.abs(this.#mouse.x) > 1 || Math.abs(this.#mouse.y) > 1) {

            this.clearPicked();
            return;

        }

        this.checkIntersection();

    }

    clearPicked() {

        this.#postProcessor.clearOutlineObjects();
        this.#worldScene.pickedObject = null;
        this.#worldScene.guiMaker.clearObjectsPanel();

    }

    checkIntersection() {

        this.#raycaster.setFromCamera(this.#mouse, this.#camera);

        const intersects = this.#raycaster.intersectObjects(this.#scene.children);

        this.clearPicked();

        if (intersects.length > 0) {

            const intersectObj = intersects[0].object;
            let tofu = {};
            let weapon = {};
            let selectedObject = null;
            
            if ( intersectObj.parent.isRoom) {

                selectedObject = intersectObj;

            } else if (getTopParent(intersectObj, weapon, 'isWeapon').isWeapon) {

                selectedObject = weapon.value;

            } else if (getTopParent(intersectObj, tofu).isTofu) {

                selectedObject = tofu.value;

            } else {

                selectedObject = getInwallParent(intersectObj);

            }

            selectedObject.isPicked = true;
            selectedObject.father?.resetFallingState?.();

            this.#postProcessor.addOutlineObjects([selectedObject]);

            this.#worldScene.pickedObject = selectedObject;

            this.#worldScene.guiMaker.setupObjectsGuiConfig([this.#worldScene.pickedObject]);

        }

        if (this.#worldScene.staticRendering && this.#worldScene.forceStaticRender) this.#worldScene.render();

    }

}

export { Picker };