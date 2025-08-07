import { container } from "./htmlElements";

class Resizer {

    #ratio = window.devicePixelRatio;
    #renderer;
    #camera;
    #postProcessor;
    #size = Resizer.SIZE.WIDE;

    constructor(camera, renderer, postProcessor) {

        this.#camera = camera;
        this.#renderer = renderer;
        this.#postProcessor = postProcessor;

        // set initial size on load
        this.setSize();

    }

    onResize() {}

    changeResolution(ratio) {

        const devicePixelRatio = window.devicePixelRatio;

        this.#ratio = devicePixelRatio * ratio;

        this.setSize();
        
    }

    changeScreenAspect(size) {

        this.#size = size;

        this.setSize();

    }

    setSize(needSetCss = true) {

        const width = container.clientWidth;
        const height = container.clientHeight;
        const containerSize = parseFloat(width / height).toFixed(2);
        const targetSize = this.#size === Resizer.SIZE.FULL ? containerSize : parseFloat(this.#size.toFixed(2));
        let targetWidth = width;
        let targetHeight = height;
        let top = `0px`;
        let left = `0px`;

        if (this.#size !== Resizer.SIZE.FULL) {

            if (containerSize > targetSize) {

                targetWidth = targetHeight * this.#size;
                left = `${(width - targetWidth) / 2}px`;
                

            } else {

                targetHeight = targetWidth / this.#size;
                top = `${(height - targetHeight) / 2}px`;

            }

        }

        // this.#renderer.domElement.style.setProperty('top', top);
        // this.#renderer.domElement.style.setProperty('left', left);

        // Set the camera's aspect ratio
        this.#camera.aspect = targetSize;

        // Update the camera's frustum
        this.#camera.updateProjectionMatrix();

        // Set the pixel ratio (for mobile devices)
        this.#renderer.setPixelRatio(this.#ratio);
        this.#postProcessor?.composer.setPixelRatio(this.#ratio);

        // Update the size of the renderer and the canvas
        this.#renderer.setSize(targetWidth, targetHeight);
        // renderer.domElement.style.width = `${container.clientWidth}px`;
        // renderer.domElement.style.height = `${container.clientHeight}px`;

        // this.#renderer.setScissorTest(true);
        // this.#renderer.setScissor(0, 0, container.clientWidth / 2, container.clientHeight / 2);
        // this.#renderer.setViewport(0, 0, container.clientWidth / 2, container.clientHeight / 2);

        this.#postProcessor?.composer.setSize(targetWidth, targetHeight);
        this.#postProcessor?.reset();

        if (!needSetCss) return;
        // set css calculated properties
        const documentEl = document.documentElement;
        documentEl.style.setProperty('--calculated-vh', `${Math.ceil(targetHeight) / 100}px`);
        documentEl.style.setProperty('--calculated-vw', `${Math.ceil(targetWidth) / 100}px`);
        documentEl.style.setProperty('--calculated-v-top', top);
        documentEl.style.setProperty('--calculated-v-left', left);

    };

}

Resizer.SIZE = {
    WIDE: 16 / 9,
    NORMAL: 4 / 3,
    FULL: 1
}

export { Resizer };