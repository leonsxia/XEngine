class WeaponActionMapping {

    name;

    idle;
    walk;
    run;
    rotate;
    aim;
    shoot;
    attack;
    hurt;
    die;

    ignoreCollisionBox = false;
    idleCollisionSize;
    walkCollisionSize;
    runCollisionSize;
    attackCollisionSize;

    ignoreBoundingFace = false;
    idleBoundingFaceSize;
    walkBoundingFaceSize;
    runBoundingFaceSize;
    rotateBoundingFaceSize;
    attackBoundingFaceSize;

    ignoreBoundingBox = false;
    idleBoundingBoxSize;
    walkBoundingBoxSize;
    runBoundingBoxSize;
    attackBoundingBoxSize;

    ignorePushingBox = false;
    pushingBoxSize;

    constructor(specs) {

        const { name } = specs;
        const { idle, walk, run, rotate, aim, shoot, attack, hurt, die } = specs;
        const { ignoreCollisionBox = false, idleCollisionSize, walkCollisionSize, runCollisionSize, attackCollisionSize } = specs;
        const { ignoreBoundingBox = false, idleBoundingBoxSize, walkBoundingBoxSize, runBoundingBoxSize, attackBoundingBoxSize } = specs;
        const { ignorePushingBox = false, pushingBoxSize } = specs;
        const { ignoreBoundingFace = false, idleBoundingFaceSize, walkBoundingFaceSize, runBoundingFaceSize, rotateBoundingFaceSize, attackBoundingFaceSize } = specs;

        this.name = name;
        this.idle = idle;
        this.walk = walk;
        this.run = run;
        this.rotate = rotate;
        this.aim = aim;
        this.shoot = shoot;
        this.attack = attack;
        this.hurt = hurt;
        this.die = die;

        this.ignoreCollisionBox = ignoreCollisionBox;
        this.idleCollisionSize = idleCollisionSize;
        this.walkCollisionSize = walkCollisionSize;
        this.runCollisionSize = runCollisionSize;
        this.attackCollisionSize = attackCollisionSize;

        this.ignoreBoundingFace = ignoreBoundingFace;
        this.idleBoundingFaceSize = idleBoundingFaceSize;
        this.walkBoundingFaceSize = walkBoundingFaceSize;
        this.runBoundingFaceSize = runBoundingFaceSize;
        this.rotateBoundingFaceSize = rotateBoundingFaceSize;
        this.attackBoundingFaceSize = attackBoundingFaceSize;

        this.ignoreBoundingBox = ignoreBoundingBox;
        this.idleBoundingBoxSize = idleBoundingBoxSize;
        this.walkBoundingBoxSize = walkBoundingBoxSize;
        this.runBoundingBoxSize = runBoundingBoxSize;
        this.attackBoundingBoxSize = attackBoundingBoxSize;

        this.ignorePushingBox = ignorePushingBox;
        this.pushingBoxSize = pushingBoxSize;

    }

}

export { WeaponActionMapping };