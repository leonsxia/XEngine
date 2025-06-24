class CreatureTypeMapping {

    name;

    idle;
    walk;
    rotate;
    attack;
    hurt;
    die;

    idleToWalk;
    walkToIdle;

    walkTimeScale;

    idleCollisionSize;
    walkCollisionSize;
    attackCollisionSize;

    idleBoundingFaceSize;
    walkBoundingFaceSize;
    rotateBoundingFaceSize;
    attackBoundingFaceSize;

    idleBoundingBoxSize;
    walkBoundingBoxSize;
    attackBoundingBoxSize;

    pushingBoxSize;

    weapon;

    constructor(specs) {

        const { name } = specs;
        const { idle, walk, walkTimeScale, rotate, attack, hurt, die, idleToWalk, walkToIdle } = specs;
        const { idleCollisionSize, walkCollisionSize, attackCollisionSize } = specs;
        const { idleBoundingFaceSize, walkBoundingFaceSize, rotateBoundingFaceSize, attackBoundingFaceSize } = specs;
        const { idleBoundingBoxSize, walkBoundingBoxSize, attackBoundingBoxSize } = specs;
        const { pushingBoxSize } = specs;
        const { weapon } = specs;

        this.name = name;
        this.idle = idle;
        this.walk = walk;
        this.walkTimeScale = walkTimeScale;
        this.rotate = rotate;
        this.attack = attack;
        this.hurt = hurt;
        this.die = die;
        this.idleToWalk = idleToWalk;
        this.walkToIdle = walkToIdle;

        this.idleCollisionSize = idleCollisionSize;
        this.walkCollisionSize = walkCollisionSize;
        this.attackCollisionSize = attackCollisionSize;

        this.idleBoundingFaceSize = idleBoundingFaceSize;
        this.walkBoundingFaceSize = walkBoundingFaceSize;
        this.rotateBoundingFaceSize = rotateBoundingFaceSize;
        this.attackBoundingFaceSize = attackBoundingFaceSize;

        this.idleBoundingBoxSize = idleBoundingBoxSize;
        this.walkBoundingBoxSize = walkBoundingBoxSize;
        this.attackBoundingBoxSize = attackBoundingBoxSize;

        this.pushingBoxSize = pushingBoxSize;

        this.weapon = weapon;

    }

}

export { CreatureTypeMapping }