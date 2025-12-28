import { UpdatableBase } from "./UpdatableBase";

class AudioMixer extends UpdatableBase {

    players = [];
    enemies = [];
    isActive = true;

    constructor(players = [], enemies = []) {

        super();
        this.players = players;
        this.enemies = enemies;

    }

    init() {

        this.setAudioWorkstation(this.attachTo.camera);

    }

    setAudioWorkstation(camera) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];
            player.setupSounds?.(camera).registerSounds();

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            enemy.setupSounds(camera).registerSounds();

        }

    }

    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (player.isActive && !player.disposed) player.audioMixerTick?.(delta);

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (enemy.isActive && !enemy.disposed && enemy.currentRoom === this.currentRoom.name) {
                
                enemy.audioMixerTick?.(delta);

            }

        }

    }

}

export { AudioMixer };