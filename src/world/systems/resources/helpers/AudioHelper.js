import { AudioLoader } from 'three';
import Resource from '../Resource';
import { RESOURCE_TYPE } from '../configs/resources';
import { Logger } from '../../Logger';

const worldAudioLoader = new AudioLoader().setPath('assets/sounds/');
const loadedSounds = {};

async function loadSingleSound(src, name) {

    if (!src) return null;

    if (src instanceof AudioBuffer) {

        return src;

    } else if (loadedSounds[src]) {

        return loadedSounds[src];

    } else if (name && loadedSounds[name]) {

        return loadedSounds[name];

    }
    
    const buffer = await worldAudioLoader.loadAsync(src);
    if (name) loadedSounds[name] = buffer;

    return buffer;

}

export { loadSingleSound, loadedSounds };

const DEBUG = true;
export default class AudioHelper extends Resource {

    _logger = new Logger(DEBUG, 'AudioHelper');

    constructor(sources = [], type = RESOURCE_TYPE.AUDIO) {

        super(sources, type);

    }

    setLoaders() {

        this.loaders = {
            audioLoader: worldAudioLoader
        };

    }

     async startLoading() {

        const loadPromises = [];
        this.startTime();
        
        for (const source of this.sources) {

            const { name, src } = source;

            if (src) {

                loadPromises.push(this.loaders.audioLoader
                    .loadAsync(src)
                    .then(buffer => {
                        this.sourceLoaded(name, buffer);
                    })
                );

            }

        }

        await Promise.all(loadPromises);

        Object.assign(loadedSounds, this.items);

        return loadedSounds;

    }

};