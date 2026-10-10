import { Layers, Vector3 } from 'three';
import { Logger } from '../../systems/Logger';
import { UpdatableBase } from './UpdatableBase';
import { TOFU_FOCUS_LAYER } from '../utils/constants';

const tofuFocusLayer = new Layers();
tofuFocusLayer.set(TOFU_FOCUS_LAYER);

const _v1 = new Vector3();
const _v2 = new Vector3();
let groupID, path;

const DEBUG = true;

class AI extends UpdatableBase {

    players = [];
    enemies = [];
    navMeshIntersects = [];
    isActive = true;

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(DEBUG, 'AI');

    constructor(players = [], enemies = []) {

        super();
        this.players = players;
        this.enemies = enemies;

    }

    get sceneObjects() {

        const objects = [];
        for (let i = 0, il = this.attachTo.sceneObjects.length; i < il; i++) {

            const obj = this.attachTo.sceneObjects[i];
            const { mesh, group } = obj;

            if (mesh && mesh.visible) objects.push(mesh);
            else if (group && group.visible) objects.push(group);

        }

        return objects;

    }

    get playerObjects() {

        const objects = [];
        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];
            if (player.isActive && !player.dead) {

                objects.push(player.group);

            }

        }

        return objects;

    }

    get currentRoomObjects() {

        if (this._cachedRoomObjects.length === 0) {

            this.currentRoom.group.traverse(object => {

                if (tofuFocusLayer.test(object.layers) && !(object.canBeIgnored ?? object.father?.canBeIgnored)) {

                    this._cachedRoomObjects.push(object);

                }

            });

        }

        return this._cachedRoomObjects;

    }

    get navigationMesh() {

        return this.currentRoom.navigationMesh;

    }

    get pathfinder() {

        return this.currentRoom.pathfinder;

    }

    get zone() {

        return this.currentRoom.zone;

    }

    getNavMeshIntersect(object, target) {

        this.navMeshIntersects.length = 0;

        if (this.navigationMesh) {

            object.navigationRay.intersectObject(this.navigationMesh, false, this.navMeshIntersects);

            if (this.navMeshIntersects.length > 0) {

                target.copy(this.navMeshIntersects[0].point);

            }

        }

        return this.navMeshIntersects.length > 0;

    }

    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (!player.isActive || player.dead) continue;

            for (let j = 0, jl = this.enemies.length; j < jl; j++) {

                const enemy = this.enemies[j];

                if (!enemy.isActive || enemy.dead || enemy.currentRoom !== this.currentRoom.name) continue;

                player.checkTargetInSight(enemy);

            }

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.isActive || enemy.dead || enemy.currentRoom !== this.currentRoom.name) continue;

            for (let j = 0, jl = this.players.length; j < jl; j++) {
                
                const player = this.players[j];

                if (!player.isActive || player.dead) continue;

                this.concatObjects(...this.currentRoomObjects, ...this.sceneObjects, ...this.playerObjects);
                enemy.checkTargetInSight(player, !enemy.ignoreInSightObstacles ? this._concats : null);

            }

            if (enemy.isNoticed) {

                let target = enemy.getNearestInSightTarget(null, enemy._inSightTargets, false);

                if (this.navigationMesh) {

                    if (this.getNavMeshIntersect(target.instance, _v1) && this.getNavMeshIntersect(enemy, _v2)) {

                        groupID = this.pathfinder.getGroup(this.zone, _v2, true);
                        path = this.pathfinder.findPath(_v2, _v1, this.zone, groupID);

                        if (path && path.length > 0) {

                            target = { dirAngle: enemy.getTargetDirectionAngle(path[0]) };

                        }

                    }

                }

                enemy.movingTick({ delta, target });

            } else {

                enemy.movingTick({ delta });

            }

        }

    }

}

export { AI };