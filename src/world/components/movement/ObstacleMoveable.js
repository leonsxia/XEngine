class ObstacleMoveable {
    #fallingTime = 0;
    #isFalling = false;
    #g = 9.8;

    constructor() {}

    resetFallingState() {

        this.#isFalling = false;
        this.#fallingTime = 0;

    }

    fallingTick(params) {

        const { delta, obstacle } = params;

        const now = this.#fallingTime + delta;
        const deltaY = .5 * this.#g * (now * now - this.#fallingTime * this.#fallingTime);
        obstacle.group.position.y -= deltaY;

        this.#isFalling = true;
        this.#fallingTime = now;

    }

    onGroundTick(params) {

        const { floor, obstacle } = params;

        const dir = floor.worldPosition.clone();
        dir.y += obstacle.box.height * .5;
        obstacle.group.position.y = obstacle.group.parent ? obstacle.group.parent.worldToLocal(dir).y : dir.y;

        this.resetFallingState()
        
    }

    onSlopeTick() {

        this.resetFallingState();
        
    }
}

export { ObstacleMoveable };