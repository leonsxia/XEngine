import { Logger } from "../../systems/Logger";

class AI {

    players = [];
    enemies = [];
    isActive = true;

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(true, 'AI');

    constructor(players = [], enemies = []) {

        this.players = players;
        this.enemies = enemies;

    }

    tick(delta) {

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.isActive) continue;

            for (let j = 0, jl = this.players.length; j < jl; j++) {
                
                const player = this.players[j];

                if (!player.isActive) continue;

                enemy.checkTargetInSight(player);

            }

            enemy.movingTick(delta);

        }

    }

}

export { AI };