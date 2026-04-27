import { Timer } from 'three';

class Loop {

    _timer = new Timer();
    _paused = false;
    _isLooping = false;
    callbackAfterTick;

    constructor(loopObject) {

        this._loopObject = loopObject;
        this.updatables = [];
        this._timer.connect(document);

    }

    setCallbackAfterTick(callback) {

        this.callbackAfterTick = callback;

    }

    start(stats) {

        if (this._isLooping) return;

        this.reset();

        this._loopObject.setAnimationLoop(() => {

            if (this._paused) {

                return;

            }

            stats?.begin();

            // tell every animated object to tick forward one frame
            this.tick();

            if (this.callbackAfterTick) this.callbackAfterTick();

            stats?.end();

        });

        this._isLooping = true;

    }

    stop() {

        this._loopObject.setAnimationLoop(null);
        this._isLooping = false;

    }

    pause() {

        this._paused = true;

    }

    unpause() {

        this._paused = false;

    }

    tick() {

        // only call the getDelta function once per frame
        this._timer.update();
        const delta = this._timer.getDelta();

        // console.log(
        //     `The last frame rendered in ${delta * 1000} milliseconds`,
        // );

        for (let i = 0, il = this.updatables.length; i < il; i++) {

            const obj = this.updatables[i];

            obj.tick(delta);

        }

    }

    reset() {

        this._timer.disconnect();
        this._timer = new Timer();
        this._timer.connect(document);

    }

    addUpdatables(...objects) {

        for (let i = 0, il = objects.length; i < il; i++) {

            const obj = objects[i];
            const idx = this.updatables.findIndex(u => u === obj);
            if (idx === -1) {

                this.updatables.push(obj);

            }
        }

    }

    removeUpdatables(...objects) {

        for (let i = 0, il = objects.length; i < il; i++) {

            const obj = objects[i];
            const idx = this.updatables.findIndex(u => u === obj);
            if (idx > -1) {

                this.updatables.splice(idx, 1);

            }

        }

        if (this.updatables.length === 0) this.stop();

    }

}

export { Loop };