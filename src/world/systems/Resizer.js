class Resizer {

    #ratio = window.devicePixelRatio;
    #container;
    #renderer;
    #camera;
    #postProcessor;

    constructor(container, camera, renderer, postProcessor) {

        this.#container = container;
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

    setSize() {

        const width = this.#container.clientWidth;
        const height = this.#container.clientHeight;

        // Set the camera's aspect ratio
        this.#camera.aspect = width / height;

        // Update the camera's frustum
        this.#camera.updateProjectionMatrix();

        // Set the pixel ratio (for mobile devices)
        this.#renderer.setPixelRatio(this.#ratio);
        this.#postProcessor.composer.setPixelRatio(this.#ratio);

        // Update the size of the renderer and the canvas
        this.#renderer.setSize(width, height);
        // renderer.domElement.style.width = `${container.clientWidth}px`;
        // renderer.domElement.style.height = `${container.clientHeight}px`;
        // renderer.setScissorTest(true);
        // renderer.setScissor(0, 0, container.clientWidth / 2, container.clientHeight / 2);
        // renderer.setViewport(0, 0, container.clientWidth / 2, container.clientHeight / 2);

        this.#postProcessor.composer.setSize(width, height);
        this.#postProcessor.reset();

    };

}

export { Resizer };