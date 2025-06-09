class WeaponActionMapping {

    idle;
    walk;
    run;
    aim;
    shoot;
    attack;
    attackInterval;
    prepareInterval;
    fireRate;

    constructor(specs) {

        const { idle, walk, run, aim, shoot, attack } = specs;
        const { attackInterval, prepareInterval, fireRate } = specs;

        this.idle = idle;
        this.walk = walk;
        this.run = run;
        this.aim = aim;
        this.shoot = shoot;
        this.attack = attack;
        this.attackInterval = attackInterval;
        this.prepareInterval = prepareInterval;
        this.fireRate = fireRate;

    }

}

export { WeaponActionMapping };