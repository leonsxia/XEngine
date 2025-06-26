import { Logger } from "../../systems/Logger";

const DEBUG = false;

class Combat {

    players = [];
    enemies = [];
    isActive = true;

    #logger = new Logger(DEBUG, 'Combat');

    constructor(players = [], enemies = [], scene) {

        this.players = players;
        this.enemies = enemies;
        this.scene = scene;

    }

    tick(delta) {

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.isActive || enemy.dead || !enemy.isNoticed) continue;

            for (let j = 0, jl = this.players.length; j < jl; j++) {

                const player = this.players[j];

                if (!player.isActive || player.dead) continue;

                const { onTarget: attackOn, damage } = enemy.attackTick?.({ delta, target: player }) ?? {};

                if (attackOn) {
                    
                    this.#logger.log(`${enemy.name} put damge: ${damage} on ${attackOn.name}`);
                    attackOn.damageReceiveTick({ damage });

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

            const { onTarget: attackOn, damage } = player.attackTick?.({ delta, aimObjects: this.scene.children, enemies: this.enemies.filter(e => e.isActive && !e.dead) }) ?? {};

            if (attackOn) {

                for (let j = 0, jl = attackOn.length; j < jl; j++) {

                    const on = attackOn[j];
                    let realTarget = null;

                    if (on.isCreature) {

                        realTarget = on;

                    } else {

                        const { object } = on;
                        const objectFather = object.parent.father;
                        realTarget = objectFather ?
                            (
                                objectFather.isCreature ?
                                    objectFather :      // CreatureBase
                                    object.father       // plane

                            ) : object;    // gltf mesh

                    }

                    if (realTarget.isCreature && realTarget.isActive && !realTarget.dead) {

                        realTarget.damageReceiveTick({ damage });

                        if (realTarget.health.isEmpty) {

                            for (let k = 0, kl = this.players.length; k < kl; k++) {

                                const p = this.players[k];
                                if (p.isActive && !p.dead) {

                                    p.removeInSightTarget(realTarget);

                                }

                            }                            

                        }

                    }

                    this.#logger.log(`player: ${player.name} attack on ${realTarget.name}`);

                }

            }

        }

    }

}

export { Combat };