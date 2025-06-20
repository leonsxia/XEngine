import { Logger } from "../../systems/Logger";

const DEBUG = true;

class Combat {

    player = [];
    enemies = [];
    isActive = true;

    #logger = new Logger(DEBUG, 'Combat');

    constructor(player = [], enemies = [], scene) {

        this.player = player;
        this.enemies = enemies;
        this.scene = scene;

    }

    tick(delta) {

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.isActive || enemy.dead) continue;

            enemy.attackTick?.(delta);

        }

        for (let i = 0, il = this.player.length; i < il; i++) {

            const player = this.player[i];

            const { onTarget: attackOn, damage } = player.attackTick?.({ delta, aimObjects: this.scene.children.filter(obj => obj.father?.isActive) }) ?? {};

            if (attackOn) {

                const { object } = attackOn;
                const objectFather = object.parent.father;
                let realTarget = objectFather ? 
                (
                    objectFather.isCreature ? 
                        objectFather :      // CreatureBase
                        object.father       // plane

                ) : object;    // gltf mesh

                if (realTarget.isCreature && realTarget.isActive && !realTarget.dead) {

                    realTarget.damageReceiveTick({ damage });

                    if (realTarget.health.isEmpty) {

                        player.removeInSightTarget(realTarget);

                    }

                }

                this.#logger.log(`player: ${player.name} attack on ${realTarget.name}`);

            }

        }

    }

}

export { Combat };