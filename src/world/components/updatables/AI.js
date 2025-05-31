class AI {

    players = [];
    enemies = [];
    isActive = true;

    constructor(players = [], enemies = []) {

        this.players = players;
        this.enemies = enemies;

    }

    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            player.aiTick?.(delta);
            // todo: add player AI logic here
        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            enemy.aiTick?.(delta);
            //todo: add enemy AI logic here
        }

    }

}

export { AI };