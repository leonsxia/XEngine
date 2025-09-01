import { Vector3 } from "three";
import { Logger } from "../../../systems/Logger";
import { TofuBase } from "./TofuBase";
import { polarity } from "../../utils/enums";

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();

const DEBUG = false;

class Tofu extends TofuBase {

    _currentHP;

    #logger = new Logger(DEBUG, 'Tofu');

    constructor(specs) {

        super(specs);

    }

    get currentHP() {

        return this.health.current;

    }

    set currentHP(val) {

        this.health.current = val;
        
        if (this.health.isEmpty && !this.dead) {

            this.setStateAfterDamageReceived();

        } else if (!this.health.isEmpty && this.dead) {

            this.isActive = true;
            this.resetAnimation();
            this.setAllBoundingBoxLayers(true);

        } else {

            this.clearInSightTargets();

        }

    }

    // inherited by children
    setStateAfterDamageReceived() {}

    // inherited by children
    setAllBoundingBoxLayers() {}

    checkSightOfView(target) {

        let isInSight = false;
        const distance = this.getWorldPosition(_v1).distanceTo(target.getWorldPosition(_v2));

        if (distance < this.sightOfView && this.checkTargetInHeight(target)) {

            isInSight = true;

        } else {

            isInSight = false;

        }

        const dirAngle = this.getTargetDirectionAngle(target);

        return { isInSight, distance, dirAngle, instance: target };

    }

    getNearestInSightTarget(targets, wrappedTargets, force = true, type = 'distance') {
        
        let nearestTarget = null;
        const targetsInSight = [];

        if (force) {

            for (let i = 0, il = targets.length; i < il; i++) {

                const target = targets[i];
                const targetCheck = this.checkSightOfView(target);

                if (targetCheck.isInSight) {

                    targetsInSight.push(targetCheck);

                }

            }

        } else {

            targetsInSight.push(...wrappedTargets);

        }

        if (targetsInSight.length > 0) {

            switch (type) {

                case 'distance':
                    targetsInSight.sort((a, b) => {

                        return a.distance - b.distance;

                    });
                    break;

                case 'angle':
                    targetsInSight.sort((a, b) => {

                        return a.dirAngle.angle - b.dirAngle.angle;

                    });
                    break;

            }
            

            nearestTarget = targetsInSight[0];

        }

        return nearestTarget;

    }

    checkTargetInSight(target) {

        const checkResult = this.checkSightOfView(target);

        if (checkResult.isInSight) {

            const find = this._inSightTargets.find(t => t.instance === checkResult.instance);
            if (!find) {

                this._inSightTargets.push(checkResult);
                this.onSovSphereTriggerEnter.call(this, checkResult.instance);                
                
            } else {

                Object.assign(find, checkResult);
                this.onSovSphereTriggerStay.call(this, checkResult.instance);
                
            }

        } else {

            const findIdx = this._inSightTargets.findIndex(t => t.instance === checkResult.instance);

            if (findIdx > -1) {

                this._inSightTargets.splice(findIdx, 1);
                this.onSovSphereTriggerExit.call(this, checkResult.instance);
                
            }

        }

    }

    removeInSightTarget(target) {

        const findIdx = this._inSightTargets.findIndex(t => t.instance === target);

        if (findIdx > -1) {

            this._inSightTargets.splice(findIdx, 1);

        }

        this.onInSightTargetsRemoved();

    }

    clearInSightTargets() {

        if (this.disposed) return;

        this._inSightTargets.length = 0;
        this._target = null;
        this.onInSightTargetsCleared();

    }

    onTargetDisposed(target) {

        this.removeInSightTarget(target);

    }

    // inherited by children
    onSovSphereTriggerEnter() {}

    // inherited by children
    onSovSphereTriggerStay() {}

    // inherited by children
    onSovSphereTriggerExit() {}

    // inherited by children
    onInSightTargetsCleared() {}

    // inherited by children
    onInSightTargetsRemoved() {}

    getTargetDirectionAngle(target) {

        const selfDir = this.boundingBoxMesh.getWorldDirection(_v1);
        target.getWorldPosition(_v2);
        this.getWorldPosition(_v3);
        _v2.y = 0;
        _v3.y = 0;
        const tarDir = _v2.sub(_v3);
        const angle = selfDir.angleTo(tarDir);

        // in right-handed system, y > 0 means counter-clockwise, y < 0 means clockwise
        const direction = selfDir.cross(tarDir).y > 0 ? polarity.left : polarity.right;

        return {
            angle: angle,
            direction: direction
        };

    }

    checkTargetInPickRange(target) {

        const { angle } = this.getTargetDirectionAngle(target);
        
        this.getWorldPosition(_v1);
        target.getWorldPosition(_v2);
        _v3.copy(_v2);
        _v2.y = _v1.y;
        const distance = _v1.distanceTo(_v2) - target.depth * .5;

        const thisBottomY = _v1.y - this.height * .5;
        const thisTopY = _v1.y + this.height * .5;
        const result = angle < this.pickRadius * .5 && distance < this.pickRange && (
            _v3.y > thisBottomY && _v3.y < thisTopY
        );

        return { in: result, distance, target };

    }

    checkTargetInDamageRange(target) {

        const { angle } = this.getTargetDirectionAngle(target);
        
        this.getWorldPosition(_v1);
        target.getWorldPosition(_v2);
        _v3.copy(_v2);
        _v2.y = _v1.y;
        const distance = _v1.distanceTo(_v2) - target.depth * .5;
        let result = angle < this.damageRadius * .5 && distance < this.damageRange;

        if (result) {

            result = this.checkTargetInHeight(target);

        }

        this.#logger.log(`target: ${target.name} is ${result ? 'in' : 'out of'} damage range.`);

        return { in: result, distance, target };

    }

    checkTargetInHeight(target) {

        this.getWorldPosition(_v1);
        target.getWorldPosition(_v2);

        const targetBottomY = _v2.y - target.height * .5;
        const targetTopY = _v2.y + target.height * .5;
        const thisBottomY = _v1.y - this.height * .5;
        const thisTopY = _v1.y + this.height * .5;
        const thisCenterY = _v1.y;

        const result = (thisBottomY <= targetTopY && thisBottomY >= targetBottomY )||
            (thisTopY <= targetTopY && thisTopY >= targetBottomY) ||
            (thisCenterY <= targetTopY && thisCenterY >= targetBottomY);

        return result;

    }

    getInDamageRangeTargets(objects, nearest = true) {

        const check = [];
        const inRangeTargets = [];
        for (let i = 0, il = objects.length; i < il; i++) {

            const obj = objects[i];

            if  (obj === this) return;

            const checkIns = this.checkTargetInDamageRange(obj);

            if (checkIns.in) {

                check.push(checkIns);
                inRangeTargets.push(obj);

            }

        }

        if (nearest) {

            check.sort((a, b) => {

                return a.distance - b.distance;

            });

            return check.length > 0 ? check[0].target : null;

        } else {

            return inRangeTargets;

        }    

    }

    checkAimRayIntersect(objects) {

        return this.aimRay.intersectObjects(objects);

    }

    resetHealth() {

        if (this.disposed) return;

        this.health.current = this.health.max;
        this.isActive = true;
        this.die(false);
        this.onHealthReset();

    }

    // inherited by children
    onHealthReset() {}

    // inherited by children
    resetAnimation() {}

}

export { Tofu };