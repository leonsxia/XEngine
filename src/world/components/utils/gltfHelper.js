import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function getGLTFLoader() {

    const loader = new GLTFLoader().setPath('assets/models/gltf/');

    return loader;

}

const worldGLTFLoader = getGLTFLoader();
const loadedGLTFModels = {};

async function loadGLTFModels(sources) {

    const loadPromises = [];
    const loader = worldGLTFLoader;
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

    return loaded;

}

export { worldGLTFLoader, loadedGLTFModels, loadGLTFModels };