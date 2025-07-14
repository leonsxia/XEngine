import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GlockItem, GLTFModel } from '../Models';
import { GLTF_NAMES } from './constants';

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

async function initPickableModels() {

    const castShadow = true;
    const receiveShadow = true;

    GlockItem.gltfModel = new GLTFModel({
        name: `glock_view_model`, src: loadedGLTFModels[GLTF_NAMES.GLOCK_ITEM], 
        offsetX: 0, offsetY: 0, offsetZ: 0, receiveShadow, castShadow
    });
    GlockItem.gltfModel.setScale([.025, .025, .025]);
    GlockItem.gltfModel.setRotation([0, Math.PI / 2, 0]);

    await Promise.all([GlockItem.gltfModel.init()]);

}

export { worldGLTFLoader, loadedGLTFModels, loadGLTFModels, initPickableModels };