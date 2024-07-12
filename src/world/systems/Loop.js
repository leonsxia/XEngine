import { Clock } from 'three';

// let clock = new Clock();

class Loop {
    #camera;
    #scene;
    #renderer;
    #clock = new Clock();

    constructor(camera, scene, renderer) {
        this.#camera = camera;
        this.#scene = scene;
        this.#renderer = renderer;
        this.updatables = [];
    }

    // dispose() {
    //     this.#camera = this.#scene = this.#renderer = null;
    // }

    start(stats) {
        this.reset();
        this.#renderer.setAnimationLoop(() => {
            stats.begin();
            // tell every animated object to tick forward one frame
            this.tick();

            // render a frame
            this.#renderer.render(this.#scene, this.#camera);
            stats.end();
        });
    }

    stop() {
        this.#renderer.setAnimationLoop(null);
    }

    tick() {
        // only call the getDelta function once per frame
        const delta = this.#clock.getDelta();

        // console.log(
        //     `The last frame rendered in ${delta * 1000} milliseconds`,
        // );

        this.updatables.forEach((obj) => {
            obj.tick(delta);
        });
    }

    reset() {
        this.#clock = new Clock();
    }
}

export { Loop };