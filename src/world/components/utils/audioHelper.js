import { AudioLoader } from 'three';

function getAudioLoader() {

    const loader = new AudioLoader().setPath('assets/sounds/');
    return loader;

}

const worldAudioLoader = getAudioLoader();
const loadedSounds = {};

async function loadSingleSound(src, name) {

    const buffer = await worldAudioLoader.loadAsync(src);
    loadedSounds[name] = buffer;
    return buffer;

}

async function loadSounds(sources) {

    const loadPromises = [];
    const loader = worldAudioLoader;
    const loaded = {};

    for (let i = 0, il = sources.length; i < il; i++) {

        const s = sources[i];
        const { name, src } = s;

        if (src) {

            loaded[name] = null;
            loadPromises.push(loader.loadAsync(src));

        }

    }

    const results = await Promise.all(loadPromises);

    let i = 0;

    for (let j = 0, jl = sources.length; j < jl; j++) {

        const s = sources[j];
        const { name, src } = s;

        if (src) {

            loaded[name] = results[i];
            i++;

        }

    }

    Object.assign(loadedSounds, loaded);

    return loaded;

}

export { worldAudioLoader, loadedSounds, loadSounds, loadSingleSound };