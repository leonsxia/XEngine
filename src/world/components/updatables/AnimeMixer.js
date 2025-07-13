class AnimeMixer {

    players = [];
    enemies = [];
    others = [];
    isActive = true;
    
    constructor(players = [], enemies = [], others = []) {

        this.players = players;
        this.enemies = enemies;
        this.others = others;

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

        for (let i = 0, il = this.others.length; i < il; i++) {

            const obj = this.others[i];

            if (obj.isPickableItem && !obj.isPicked) obj.tick(delta);

        }

    }

}

export { AnimeMixer };