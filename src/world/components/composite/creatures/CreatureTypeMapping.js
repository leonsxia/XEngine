class CreatureTypeMapping {

    name;

    idle;
    walk;
    attack;

    idleToWalk;
    walkToIdle;

    walkTimeScale;

    idleCollisionSize;
    walkCollisionSize;

    attackInterval;
    prepareInterval;
    fireRate;

    constructor(specs) {

        const { name } = specs;
        const { idle, walk, walkTimeScale, attack, idleToWalk, walkToIdle } = specs;
        const { idleCollisionSize, walkCollisionSize } = specs;
        const { attackInterval, prepareInterval, fireRate } = specs;

        this.name = name;
        this.idle = idle;
        this.walk = walk;
        this.walkTimeScale = walkTimeScale;
        this.attack = attack;
        this.idleToWalk = idleToWalk;
        this.walkToIdle = walkToIdle;
        this.idleCollisionSize = idleCollisionSize;
        this.walkCollisionSize = walkCollisionSize;
        this.attackInterval = attackInterval;
        this.prepareInterval = prepareInterval;
        this.fireRate = fireRate;

    }

}

export { CreatureTypeMapping }