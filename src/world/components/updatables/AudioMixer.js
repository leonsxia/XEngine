class AudioMixer {

    players = [];
    enemies = [];
    others = [];
    isActive = true;
    
    constructor(players = [], enemies = [], others = []) {

        this.players = players;
        this.enemies = enemies;
        this.others = others;

    }    

    setAudioWorkstation(camera) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];
            player.setupSounds(camera);

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            enemy.setupSounds(camera);

        }
    }

    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (!player.disposed) player.audioMixerTick?.(delta);

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.disposed) enemy.audioMixerTick?.(delta);

        }

    }

}

export { AudioMixer };