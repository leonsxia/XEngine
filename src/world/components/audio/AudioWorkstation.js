import { Audio, AudioListener, PositionalAudio } from 'three';
import { loadedSounds } from '../utils/audioHelper';
import { Logger } from '../../systems/Logger';
import { SOUNDS } from '../utils/audioConstants';
import { ResourceTracker } from '../../systems/ResourceTracker';

const DEBUG = false;

class AudioWorkstation {

    _listener = new AudioListener();
    _camera = undefined;
    _sounds = {};

    _registeredSounds = [];
    _pausedSounds = [];

    _resTracker = new ResourceTracker();

    _logger = new Logger(DEBUG, 'AudioWorkstation');

    constructor(spces) {

        const { camera } = spces ?? {};
        this.changeCamera(camera);
        this.init();

    }

    init() {

        const sources = SOUNDS;
        for (let i = 0, il = sources.length; i < il; i++) {

            const sconfig = sources[i];
            const { name, loop = false, volume = 1, refDistance = 5, isPositionalAudio = true } = sconfig;
            const buffer = loadedSounds[name];

            if (!buffer) continue;

            const sound = isPositionalAudio ? new PositionalAudio(this._listener) : new Audio(this._listener);
            sound.setBuffer(buffer);
            if (isPositionalAudio) sound.setRefDistance(refDistance);
            sound.setLoop(loop);
            sound.setVolume(volume);

            this._sounds[name] = { buffer, sound };

            this._resTracker.track(sound);

        }

    }

    changeCamera(camera) {

        if (!camera) return this;
        if (this._camera) this._camera.remove(this._listener);

        this._camera = camera;
        this._camera.add(this._listener);

        return this;

    }

    play(soundName, needStop = true) {

        this._logger.func = 'play';

        if (!soundName) return;
        const soundObj = this._sounds[soundName];
        if (!soundObj) return;

        const { sound } = soundObj;

        if (sound.isPlaying && needStop) sound.stop();
        if (!sound.isPlaying) sound.play();

        this._logger.log(`play sound: ${soundName}`);

        return this;

    }

    stop(soundName) {

        if (!soundName) return;
        const soundObj = this._sounds[soundName];
        if (!soundObj) return;

        const { sound } = soundObj;

        if (sound.isPlaying) sound.stop();

        return this;

    }

    pause(soundName) {
        
        if (!soundName) return;
        const soundObj = this._sounds[soundName];
        if (!soundObj) return;

        const { sound } = soundObj;
        
        if (sound.isPlaying) sound.pause();

        return this;

    }

    setLoop(soundName, isLoop) {

        if (!soundName) return;
        const soundObj = this._sounds[soundName];
        if (!soundObj) return;

        const { sound } = soundObj;
        sound.setLoop(isLoop);

        return this;

    }

    stopAll() {

        for (const key in this._sounds) {

            const soundObj = this._sounds[key];
            const { sound } = soundObj;

            if (sound.isPlaying) sound.stop();

        }

        return this;

    }

    pauseAll() {

        for (const key in this._sounds) {

            const soundObj = this._sounds[key];
            const { sound } = soundObj;

            if (sound.isPlaying) {

                this._pausedSounds.push(sound);
                sound.pause();

            }

        }

        return this;

    }

    unpauseAll() {

        for (let i = 0, il = this._pausedSounds.length; i < il; i++) {

            const sound = this._pausedSounds[i];
            sound.play();

        }

        this._pausedSounds.length = 0;

        return this;

    }

    getSound(soundName) {

        const soundObj = this._sounds[soundName];
        if (!soundObj) return null;

        return soundObj.sound;

    }

    registerSound(soundName) {

        const sound = this.getSound(soundName);
        if (sound) {
            
            const findIdx = this._registeredSounds.findIndex(s => s.sound === sound);
            if (findIdx === -1) {

                this._registeredSounds.push({ name: soundName, sound, originLevel: sound.getVolume() });

            }

        }

        return sound;

    }

    unregisterSound(soundName) {

        const sound = this.getSound(soundName);
        if (sound) {

            const findIdx = this._registeredSounds.findIndex(s => s.sound === sound);
            if (findIdx > -1) {

                this._registeredSounds.splice(findIdx, 1);

            }

        }

        return sound;

    }

    changeMasterLevel(level) {

        for (let i = 0, il = this._registeredSounds.length; i < il; i++) {

            const { sound, originLevel } = this._registeredSounds[i];
            sound.setVolume(originLevel * level);

        }

    }

    dispose() {

        this.stopAll();
        this._pausedSounds.length = 0;
        this._registeredSounds.length = 0;
        this._resTracker.dispose();        

    }

}

export { AudioWorkstation };