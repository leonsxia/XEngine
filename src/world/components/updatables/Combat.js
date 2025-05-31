class Combat {

    player = [];
    enemies = [];
    isActive = true;

    constructor(player = [], enemies = []) {

        this.player = player;
        this.enemies = enemies;

    }

    tick(delta) {

        for (let i = 0, il = this.player.length; i < il; i++) {

            const player = this.player[i];

            player.attackTick?.(delta);

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            enemy.attackTick?.(delta);

        }

    }

}

export { Combat };