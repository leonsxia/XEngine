import { Clock } from 'three';

// let clock = new Clock();

class Loop {
    
    #camera;
    #scene;
    #renderer;
    #postProcessor;
    #clock = new Clock();
    #postProcessingEnabled = false;

    _paused = false;

    constructor(camera, scene, renderer, postProcessor) {

        this.#camera = camera;
        this.#scene = scene;
        this.#renderer = renderer;
        this.#postProcessor = postProcessor;
        this.updatables = [];

    }

    // dispose() {
    //     this.#camera = this.#scene = this.#renderer = null;
    // }

    start(stats) {

        this.reset();

        this.#renderer.setAnimationLoop(() => {

            if (!this._paused) stats?.begin();

            // tell every animated object to tick forward one frame
            this.tick();

            if (this._paused) {

                return;

            }

            // render a frame
            if (this.#postProcessingEnabled) {

                this.#postProcessor.render();

            } else {

                this.#renderer.render(this.#scene, this.#camera);

            }

            stats?.end();

        });

    }

    stop() {

        this.#renderer.setAnimationLoop(null);

    }

    pause() {

        this._paused = true;

    }

    unpause() {

        this._paused = false;

    }

    tick() {

        // only call the getDelta function once per frame
        const delta = this.#clock.getDelta();

        // console.log(
        //     `The last frame rendered in ${delta * 1000} milliseconds`,
        // );

        if (this._paused) {
            
            const gamepad = this.updatables.find(u => u.isGamePad);
            gamepad?.tick();

            return;

        }

        for (let i = 0, il = this.updatables.length; i < il; i++) {

            const obj = this.updatables[i];

            obj.tick(delta);

        }

    }

    reset() {

        this.#clock = new Clock();

    }

    enablePostProcessing(enable) {

        this.#postProcessingEnabled = enable;

    }

}

export { Loop };