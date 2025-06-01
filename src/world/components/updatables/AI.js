import { Logger } from "../../systems/Logger";
import { BS, AI as AICodes } from "../basic/colorBase";

class AI {

    players = [];
    enemies = [];
    isActive = true;

    #logger = new Logger(true, 'AI');

    constructor(players = [], enemies = []) {

        this.players = players;
        this.enemies = enemies;

    }

    tick(delta) {

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            for (let j = 0, jl = this.players.length; j < jl; j++) {

                const player = this.players[j];

                if (enemy.isActive) {
                    
                    const distance = enemy.worldPosition.distanceTo(player.worldPosition);

                    if (distance < enemy.sightOfView) {

                        if (!enemy.isAttacking) {

                            enemy.isAttacking = true;
                            enemy.target = player;

                            enemy.boundingSphereMesh.material.color.setHex(AICodes.playerInRange);

                            this.#logger.log(`Enemy ${enemy.name} is attacking player ${player.name} at distance ${distance.toFixed(2)}`);

                        }

                    } else {

                        if (enemy.isAttacking) {

                            enemy.isAttacking = false;
                            enemy.target = null;
                            
                            enemy.boundingSphereMesh.material.color.setHex(BS);

                            this.#logger.log(`player ${player.name} is out of Enemy ${enemy.name}'s sov at distance ${distance.toFixed(2)}`);

                        }

                    }

                }

            }

            enemy.aiTick?.(delta);

        }

    }

}

export { AI };