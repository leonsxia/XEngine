import { Vector3 } from 'three';

class ObstacleMoveable {

    #movingLeft = false;
    #movingRight = false;
    #movingForward = false;
    #movingBackward = false;

    forwardBlock = false;
    backwardBlock = false;
    leftBlock = false;
    rightBlock = false;
    
    #fallingTime = 0;
    // #isFalling = false;
    #g = 9.8;
    #verticalForceSpeed = 0;
    #lastFrameFallingDist = 0;

    frictionCoefficient = 1;
    density = .5;

    // falling ground
    hittingGround;
    // falling water
    hittingWater;

    constructor() {}

    get isMovingForward() {

        return  this.#movingForward;

    }

    get isMovingBackward() {

        return this.#movingBackward;

    }

    get isMovingLeft() {

        return this.#movingLeft;

    }

    get isMovingRight() {

        return this.#movingRight;

    }

    get isMoving() {

        return this.isMovingForward || 
            this.isMovingBackward ||
            this.isMovingLeft ||
            this.isMovingRight;
            
    }

    get verticalAcceleratedSpeed() {

        return parseFloat((this.#g + this.#verticalForceSpeed).toFixed(3));

    }

    get lastFrameFallingDistance() {

        return this.#lastFrameFallingDist;

    }

    resetFallingState() {

        // this.#isFalling = false;
        this.#fallingTime = 0;
        this.#lastFrameFallingDist = 0;

    }

    resetInwaterState() {

        this.#verticalForceSpeed = 0;

    }

    stopMoving() {

        this.#movingForward = false;
        this.#movingBackward = false;
        this.#movingLeft = false;
        this.#movingRight = false;

    }

    resetBlockStatus() {

        this.forwardBlock = false;
        this.backwardBlock = false;
        this.leftBlock = false;
        this.rightBlock = false;
        
    }

    movingLeft(val) {

        this.#movingLeft = val;
        // console.log(`[ObstacleMoveable]:movingLeft ${this.#movingLeft}`);

    }

    movingRight(val) {

        this.#movingRight = val;
        // console.log(`[ObstacleMoveable]:movingRight ${this.#movingRight}`);

    }

    movingForward(val) {

        this.#movingForward = val;
        // console.log(`[ObstacleMoveable]:movingForward ${this.#movingForward}`);

    }

    movingBackward(val) {

        this.#movingBackward = val;
        // console.log(`[ObstacleMoveable]:movingBackward ${this.#movingBackward}`);

    }

    fallingTick(params) {

        const { delta, obstacle } = params;

        const now = this.#fallingTime + delta;
        const deltaY = .5 * this.verticalAcceleratedSpeed * (now * now - this.#fallingTime * this.#fallingTime);
        obstacle.group.position.y -= deltaY;

        this.#lastFrameFallingDist = deltaY;

        // this.#isFalling = true;
        this.#fallingTime = now;

    }

    onGroundTick(params) {

        const { floor, obstacle } = params;

        const onGroundPadding = 0.001;

        const dir = floor.worldPosition.clone();
        dir.y += obstacle.box.height * .5 - onGroundPadding;
        obstacle.group.position.y = obstacle.group.parent ? obstacle.group.parent.worldToLocal(dir).y : dir.y;

        this.resetFallingState();
        
    }

    onSlopeTick(params) {

        const { slope, obstacle } = params;

        const intersects = [];

        for (let i = 0, il = obstacle.rays.length; i < il; i++) {

            const ray = obstacle.rays[i];
            const intersect = ray.intersectObject(slope.mesh);
            if (intersect.length > 0) intersects.push(intersect[0]);

        }

        if (intersects.length > 0) {

            intersects.sort((a, b) => {
                return b.point.y - a.point.y;
            });

            const dir = intersects[0].point.clone();
            dir.y += obstacle.height * .5;
            obstacle.group.position.y = obstacle.group.parent ? obstacle.group.parent.worldToLocal(dir).y : dir.y;

            this.resetFallingState();

        }
        
    }

    onWaterTick(params) {

        const { waterCube, obstacle } = params;
        const dropHeight = waterCube.topY - obstacle.bottomY;
        const inwaterHeight = dropHeight >= obstacle.height ? obstacle.height : dropHeight;

        // console.log(`${obstacle.name} ${inwaterHeight} m in water`);

        const inwaterVolume = obstacle.width * obstacle.depth * inwaterHeight;
        this.#verticalForceSpeed = - this.#g * waterCube.waterDensity * inwaterVolume / obstacle.weight;

        // console.log(`${obstacle.name}: verticalForceSpeed: ${this.#verticalForceSpeed}, verticalAcceleratedSpeed: ${this.verticalAcceleratedSpeed}`);
        if (this.verticalAcceleratedSpeed === 0) {

            this.resetFallingState();

        }

    }

    movingTick(params) {

        const { obstacle, dist } = params;

        const recoverCoefficient = .005;

        let deltaVec3;

        if (this.forwardBlock) {

            obstacle.group.position.z -= recoverCoefficient;

        }
        
        if (this.backwardBlock) {

            obstacle.group.position.z += recoverCoefficient;

        }
        
        if (this.leftBlock) {

            obstacle.group.position.x -= recoverCoefficient;
            
        }
        
        if (this.rightBlock) {

            obstacle.group.position.x += recoverCoefficient;

        }

        if (this.isMovingForward && !this.forwardBlock) {

            deltaVec3 = new Vector3(0, 0, dist);
            deltaVec3.applyEuler(obstacle.group.rotation);
            obstacle.group.position.add(deltaVec3);

        }
        
        if (this.isMovingBackward && !this.backwardBlock) {

            deltaVec3 = new Vector3(0, 0, - dist);
            deltaVec3.applyEuler(obstacle.group.rotation);
            obstacle.group.position.add(deltaVec3);

        }

        if (this.isMovingLeft && !this.leftBlock) {

            deltaVec3 = new Vector3(dist, 0, 0);
            deltaVec3.applyEuler(obstacle.group.rotation);
            obstacle.group.position.add(deltaVec3);

        }

        if (this.isMovingRight && !this.rightBlock) {

            deltaVec3 = new Vector3(- dist, 0, 0);
            deltaVec3.applyEuler(obstacle.group.rotation);
            obstacle.group.position.add(deltaVec3);

        }

    }
}

export { ObstacleMoveable };