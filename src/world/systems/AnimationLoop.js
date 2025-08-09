class AnimationLoop {

    constructor(context) {

        this.context = context ?? window;
        this.isAnimating = false;
        this.animationLoop = null;
        this.requestId = null;

    }

    start() {

        const onAnimationFrame = (time, frame) => {

            this.animationLoop(time, frame);

            this.requestId = this.context.requestAnimationFrame(onAnimationFrame);

        };

        if (this.isAnimating === true) return;
        if (this.animationLoop === null) return;

        this.requestId = this.context.requestAnimationFrame(onAnimationFrame);

        this.isAnimating = true;

    }

    stop() {

        this.context.cancelAnimationFrame(this.requestId);

        this.isAnimating = false;

    }

    setAnimationLoop(callback) {

        this.animationLoop = callback;

    }

    setContext(value) {

        this.context = value;

    }

}

export { AnimationLoop };