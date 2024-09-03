import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function getGLTFLoader() {

    const loader = new GLTFLoader().setPath('assets/models/gltf/');

    return loader;

}

const worldGLTFLoader = getGLTFLoader();

async function loadGLTFModels(sources) {

    const loadPromises = [];
    const loader = worldGLTFLoader;
    const loaded = {};

    sources.forEach(s => {

        const { name, src } = s;

        if (src) {

            loaded[name] = null;
            loadPromises.push(loader.loadAsync(src));

        }

    });

    const results = await Promise.all(loadPromises);

    let i = 0;
    sources.forEach(s => {

        const { name, src } = s;

        if (src) {

            loaded[name] = results[i];
            i++;

        }

    });

    return loaded;

}

export { worldGLTFLoader, loadGLTFModels };