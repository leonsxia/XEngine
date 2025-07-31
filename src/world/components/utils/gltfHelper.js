import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { 
    GLTFModel, BayonetItem, GlockItem, PistolItem, RevolverItem, SMGShortItem,
    PistolAmmoBox, MagnumAmmoBox, SMGAmmoBox,
    FirstAidKitSmall, FirstAidKitMedium, FirstAidKitLarge
} from '../Models';
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

    Object.assign(loadedGLTFModels, loaded);

    return loaded;

}

async function initPickableModels() {

    const castShadow = true;
    const receiveShadow = true;

    GlockItem.gltfModel = new GLTFModel({
        name: `glock_view_model`, src: loadedGLTFModels[GLTF_NAMES.GLOCK_ITEM], 
        receiveShadow, castShadow
    });
    GlockItem.gltfModel.setScale([.025, .025, .025]);
    GlockItem.gltfModel.setRotation([0, Math.PI / 2, 0]);

    PistolItem.gltfModel = new GLTFModel({
        name: `pistol1_view_model`, src: loadedGLTFModels[GLTF_NAMES.PISTOL1_ITEM], 
        receiveShadow, castShadow
    });
    PistolItem.gltfModel.setScale([.15, .15, .15]);

    RevolverItem.gltfModel = new GLTFModel({
        name: `revolver_view_model`, src: loadedGLTFModels[GLTF_NAMES.REVOLVER_ITEM], 
        receiveShadow, castShadow
    });
    RevolverItem.gltfModel.setScale([.19, .19, .19]);

    SMGShortItem.gltfModel = new GLTFModel({
        name: `smg_short_view_model`, src: loadedGLTFModels[GLTF_NAMES.SMG_SHORT_ITEM], 
        receiveShadow, castShadow
    });
    SMGShortItem.gltfModel.setScale([.15, .15, .15]);

    BayonetItem.gltfModel = new GLTFModel({
        name: `bayonet_view_model`, src: loadedGLTFModels[GLTF_NAMES.BAYONET_ITEM], 
        receiveShadow, castShadow
    });
    BayonetItem.gltfModel.setScale([.25, .25, .25]);

    PistolAmmoBox.gltfModel = new GLTFModel({
        name: `pistol_ammo_box_view_model`, src: loadedGLTFModels[GLTF_NAMES.PISTOL1_ITEM], 
        receiveShadow, castShadow
    });
    PistolAmmoBox.gltfModel.setScale([.1, .1, .1]);
    PistolAmmoBox.gltfModel.setRotation([0, Math.PI / 2, 0]);

    MagnumAmmoBox.gltfModel = new GLTFModel({
        name: `magnum_ammo_box_view_model`, src: loadedGLTFModels[GLTF_NAMES.PISTOL1_ITEM], 
        receiveShadow, castShadow
    });
    MagnumAmmoBox.gltfModel.setScale([1.13, 1.13, 1.13]);

    SMGAmmoBox.gltfModel = new GLTFModel({
        name: `smg_ammo_box_view_model`, src: loadedGLTFModels[GLTF_NAMES.PISTOL1_ITEM], 
        receiveShadow, castShadow
    });
    SMGAmmoBox.gltfModel.setScale([0.08, 0.08, 0.08]);

    FirstAidKitSmall.gltfModel = new GLTFModel({
        name: `first_aid_kit_small_view_model`, src: loadedGLTFModels[GLTF_NAMES.FIRST_AID_KIT_SMALL], 
        receiveShadow, castShadow
    });
    FirstAidKitSmall.gltfModel.setScale([.2, .2, .2]);

    FirstAidKitMedium.gltfModel = new GLTFModel({
        name: `first_aid_kit_medium_view_model`, src: loadedGLTFModels[GLTF_NAMES.FIRST_AID_KIT_MEDIUM], 
        receiveShadow, castShadow
    });
    FirstAidKitMedium.gltfModel.setScale([.15, .15, .15]);

    FirstAidKitLarge.gltfModel = new GLTFModel({
        name: `first_aid_kit_large_view_model`, src: loadedGLTFModels[GLTF_NAMES.FIRST_AID_KIT_LARGE], 
        receiveShadow, castShadow
    });
    FirstAidKitLarge.gltfModel.setScale([.15, .15, .15]);

    await Promise.all([
        GlockItem.gltfModel.init(),
        PistolItem.gltfModel.init(),
        RevolverItem.gltfModel.init(),
        SMGShortItem.gltfModel.init(),
        BayonetItem.gltfModel.init(),
        PistolAmmoBox.gltfModel.init(),
        MagnumAmmoBox.gltfModel.init(),
        SMGAmmoBox.gltfModel.init(),
        FirstAidKitSmall.gltfModel.init(),
        FirstAidKitMedium.gltfModel.init(),
        FirstAidKitLarge.gltfModel.init()
    ]);

}

export { worldGLTFLoader, loadedGLTFModels, loadGLTFModels, initPickableModels };