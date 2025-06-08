class CreatureTypeMapping {

    name;

    idle;
    walk;
    rotate;
    attack;

    idleToWalk;
    walkToIdle;

    walkTimeScale;

    idleCollisionSize;
    walkCollisionSize;

    idleBoundingFaceSize;
    walkBoundingFaceSize;
    rotateBoundingFaceSize;

    idleBoundingBoxSize;
    walkBoundingBoxSize;

    pushingBoxSize;

    attackInterval;
    prepareInterval;
    fireRate;

    constructor(specs) {

        const { name } = specs;
        const { idle, walk, walkTimeScale, rotate, attack, idleToWalk, walkToIdle } = specs;
        const { idleCollisionSize, walkCollisionSize } = specs;
        const { idleBoundingFaceSize, walkBoundingFaceSize, rotateBoundingFaceSize } = specs;
        const { idleBoundingBoxSize, walkBoundingBoxSize } = specs;
        const { pushingBoxSize } = specs;
        const { attackInterval, prepareInterval, fireRate } = specs;

        this.name = name;
        this.idle = idle;
        this.walk = walk;
        this.walkTimeScale = walkTimeScale;
        this.rotate = rotate;
        this.attack = attack;
        this.idleToWalk = idleToWalk;
        this.walkToIdle = walkToIdle;

        this.idleCollisionSize = idleCollisionSize;
        this.walkCollisionSize = walkCollisionSize;

        this.idleBoundingFaceSize = idleBoundingFaceSize;
        this.walkBoundingFaceSize = walkBoundingFaceSize;
        this.rotateBoundingFaceSize = rotateBoundingFaceSize;

        this.idleBoundingBoxSize = idleBoundingBoxSize;
        this.walkBoundingBoxSize = walkBoundingBoxSize;

        this.pushingBoxSize = pushingBoxSize;

        this.attackInterval = attackInterval;
        this.prepareInterval = prepareInterval;
        this.fireRate = fireRate;

    }

}

export { CreatureTypeMapping }