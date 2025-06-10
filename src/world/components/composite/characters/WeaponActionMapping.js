class WeaponActionMapping {

    name;

    idle;
    walk;
    run;
    aim;
    shoot;
    attack;
    attackInterval;
    prepareInterval;
    fireRate;

    ignoreCollisionBox = false;
    idleCollisionSize;
    walkCollisionSize;
    runCollisionSize;
    attackCollisionSize;

    constructor(specs) {

        const { name } = specs;
        const { idle, walk, run, aim, shoot, attack } = specs;
        const { attackInterval, prepareInterval, fireRate } = specs;
        const { idleCollisionSize, walkCollisionSize, runCollisionSize, attackCollisionSize } = specs;

        this.name = name;
        this.idle = idle;
        this.walk = walk;
        this.run = run;
        this.aim = aim;
        this.shoot = shoot;
        this.attack = attack;
        this.attackInterval = attackInterval;
        this.prepareInterval = prepareInterval;
        this.fireRate = fireRate;

        this.idleCollisionSize = idleCollisionSize;
        this.walkCollisionSize = walkCollisionSize;
        this.runCollisionSize = runCollisionSize;
        this.attackCollisionSize = attackCollisionSize;

    }

}

export { WeaponActionMapping };