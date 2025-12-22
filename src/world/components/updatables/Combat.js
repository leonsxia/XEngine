import { Logger } from "../../systems/Logger";
import { getIntersectionTarget } from "../utils/objectHelper";
import { UpdatableBase } from "./UpdatableBase";

const DEBUG = false;

class Combat extends UpdatableBase {

    players = [];
    enemies = [];
    isActive = true;

    #logger = new Logger(DEBUG, 'Combat');

    constructor(players = [], enemies = []) {

        super();
        this.players = players;
        this.enemies = enemies;

    }

    get currentRoom() {

        return this.attachTo.currentRoom;

    }

    get sceneObjects() {

        const objects = [];
        for (let i = 0, il = this.attachTo.sceneObjects.length; i < il; i++) {

            const obj = this.attachTo.sceneObjects[i];
            const { mesh, group } = obj;

            if (mesh) objects.push(mesh);
            else if (group) objects.push(group);

        }

        return objects;

    }

    get enemyObjects() {

        const objects = [];
        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            if (enemy.isActive && !enemy.dead) {

                objects.push(enemy.group);

            }            

        }

        return objects;

    }

    tick(delta) {

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.isActive || enemy.dead || !enemy.isNoticed) continue;

            for (let j = 0, jl = this.players.length; j < jl; j++) {

                const player = this.players[j];

                if (!player.isActive || player.dead) continue;

                const { onTarget: attackOn, attackBy, damage } = enemy.attackTick?.({ delta, target: player }) ?? {};

                if (attackOn) {
                    
                    this.#logger.log(`${enemy.name} put damge: ${damage} on ${attackOn.name}`);
                    attackOn.damageReceiveTick({ damage, attackBy });

                    if (attackOn.health.isEmpty) {

                        for (let k = 0, kl = this.enemies.length; k < kl; k++) {

                            const e = this.enemies[k];
                            if (e.isActive && !e.dead) {

                                e.removeInSightTarget(attackOn);

                            }

                        }

                    }

                }

            }
        
        }

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (!player.isActive || player.dead) continue;

            this.concatObjects(this.currentRoom.group, ...this.enemyObjects, ...this.sceneObjects);
            const { onTarget: attackOn, attackBy, damage } = player.attackTick?.({ delta, aimObjects: this._concats, enemies: this.enemies.filter(e => e.isActive && !e.dead) }) ?? {};

            if (attackOn) {

                for (let j = 0, jl = attackOn.length; j < jl; j++) {

                    const on = attackOn[j];
                    let realTarget = null;

                    if (on.isCreature) {

                        realTarget = on;

                    } else {

                        const { object } = on;
                        realTarget = getIntersectionTarget(object);

                    }

                    if (realTarget.isCreature && realTarget.isActive && !realTarget.dead) {

                        realTarget.damageReceiveTick({ damage, attackBy });

                        if (realTarget.health.isEmpty) {

                            for (let k = 0, kl = this.players.length; k < kl; k++) {

                                const p = this.players[k];
                                if (p.isActive && !p.dead) {

                                    p.removeInSightTarget(realTarget);

                                }

                            }                            

                        }

                    }

                    this.#logger.log(`player: ${player.name} attack on ${realTarget.name}, damage: ${damage}`);

                }

            }

        }

    }

}

export { Combat };