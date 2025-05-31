class UpdatableQueue {

    constructor() {

        this.queue = [];

    }

    add(updatable) {

        this.queue.push(updatable);

    }

    remove(updatable) {

        const index = this.queue.indexOf(updatable);

        if (index > -1) {

            this.queue.splice(index, 1);

        }

    }

    tick(delta) {

        for (let i = 0, il = this.queue.length; i < il; i++) {

            const updatable = this.queue[i];

            if (updatable.isActive) {

                updatable.tick(delta);

            }

        }

    }
    
}

export { UpdatableQueue };