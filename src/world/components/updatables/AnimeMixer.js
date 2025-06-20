class AnimeMixer {

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

            if (!player.disposed) player.mixerTick?.(delta);

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.disposed) enemy.mixerTick?.(delta);

        }

    }

}

export { AnimeMixer };