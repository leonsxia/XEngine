import { UpdatableBase } from "./UpdatableBase";

class AnimeMixer extends UpdatableBase {

    players = [];
    enemies = [];
    isActive = true;
    
    constructor(players = [], enemies = []) {

        super();
        this.players = players;
        this.enemies = enemies;

    }

    get pickables() {

        return this.attachTo.pickables;

    }

    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (!player.disposed) player.animationMixerTick?.(delta);

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.disposed) enemy.animationMixerTick?.(delta);

        }

        for (let i = 0, il = this.pickables.length; i < il; i++) {

            const obj = this.pickables[i];

            if (obj.isPickableItem && !obj.isPicked) obj.tick(delta);

        }

    }

}

export { AnimeMixer };