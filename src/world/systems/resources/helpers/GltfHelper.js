import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { DRACOLoader, DRACO_GLTF_CONFIG } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import {
    GLTFModel, BayonetItem, GlockItem, PistolItem, RevolverItem, SMGShortItem,
    PistolAmmoBox, MagnumAmmoBox, SMGAmmoBox,
    FirstAidKitSmall, FirstAidKitMedium, FirstAidKitLarge 
} from '../../../components/Models';
import { GLTF_NAMES } from '../configs/gltfs';
import Resource from '../Resource';
import { RESOURCE_TYPE } from '../configs/resources';
import { Logger } from '../../Logger';

function getGLTFLoader() {

    const loader = new GLTFLoader().setPath('assets/models/gltf/');
    const dracoLoader = new DRACOLoader();
    
    // dracoLoader.setDecoderPath('node_modules/three/examples/jsm/libs/draco/');
    dracoLoader.setDecoderPath(DRACO_GLTF_CONFIG);
    loader.setDRACOLoader(dracoLoader);
    loader.setMeshoptDecoder(MeshoptDecoder);    

    return loader;

}

function setKTX2Loader(renderer) {

    // ktx2Loader.setTranscoderPath('node_modules/three/examples/jsm/libs/basis/');
    ktx2Loader.detectSupport(renderer);
    worldGLTFLoader.setKTX2Loader(ktx2Loader);

}

const worldGLTFLoader = getGLTFLoader();
const ktx2Loader = new KTX2Loader();
const loadedGLTFModels = {};

async function loadGLTFModel(src, name) {

    if (!src) return null;

    if (src.scene) {

        return src;

    } else if (loadedGLTFModels[src]) {

        return loadedGLTFModels[src];

    } else if (name && loadedGLTFModels[name]) {

        return loadedGLTFModels[name];

    }

    const gltf = await worldGLTFLoader.loadAsync(src);

    if (name) loadedGLTFModels[name] = gltf;

    return gltf;

}

async function initPickableModels() {

    const castShadow = true;
    const receiveShadow = true;

    GlockItem.gltfModel = new GLTFModel({
        name: `glock_view_model`, src: GLTF_NAMES.GLOCK_ITEM, 
        receiveShadow, castShadow
    });
    GlockItem.gltfModel.setScale([.025, .025, .025]);
    GlockItem.gltfModel.setRotation([0, Math.PI / 2, 0]);

    PistolItem.gltfModel = new GLTFModel({
        name: `pistol1_view_model`, src: GLTF_NAMES.PISTOL1_ITEM, 
        receiveShadow, castShadow
    });
    PistolItem.gltfModel.setScale([.15, .15, .15]);

    RevolverItem.gltfModel = new GLTFModel({
        name: `revolver_view_model`, src: GLTF_NAMES.REVOLVER_ITEM, 
        receiveShadow, castShadow
    });
    RevolverItem.gltfModel.setScale([.19, .19, .19]);

    SMGShortItem.gltfModel = new GLTFModel({
        name: `smg_short_view_model`, src: GLTF_NAMES.SMG_SHORT_ITEM, 
        receiveShadow, castShadow
    });
    SMGShortItem.gltfModel.setScale([.15, .15, .15]);

    BayonetItem.gltfModel = new GLTFModel({
        name: `bayonet_view_model`, src: GLTF_NAMES.BAYONET_ITEM, 
        receiveShadow, castShadow
    });
    BayonetItem.gltfModel.setScale([.25, .25, .25]);

    PistolAmmoBox.gltfModel = new GLTFModel({
        name: `pistol_ammo_box_view_model`, src: GLTF_NAMES.PISTOL_AMMO_BOX_ITEM, 
        receiveShadow, castShadow
    });
    PistolAmmoBox.gltfModel.setScale([.1, .1, .1]);
    PistolAmmoBox.gltfModel.setRotation([0, Math.PI / 2, 0]);

    MagnumAmmoBox.gltfModel = new GLTFModel({
        name: `magnum_ammo_box_view_model`, src: GLTF_NAMES.MAGNUM_AMMO_BOX_ITEM, 
        receiveShadow, castShadow
    });
    MagnumAmmoBox.gltfModel.setScale([1.13, 1.13, 1.13]);

    SMGAmmoBox.gltfModel = new GLTFModel({
        name: `smg_ammo_box_view_model`, src: GLTF_NAMES.SMG_AMMO_BOX_ITEM, 
        receiveShadow, castShadow
    });
    SMGAmmoBox.gltfModel.setScale([0.08, 0.08, 0.08]);

    FirstAidKitSmall.gltfModel = new GLTFModel({
        name: `first_aid_kit_small_view_model`, src: GLTF_NAMES.FIRST_AID_KIT_SMALL, 
        receiveShadow, castShadow
    });
    FirstAidKitSmall.gltfModel.setScale([.2, .2, .2]);

    FirstAidKitMedium.gltfModel = new GLTFModel({
        name: `first_aid_kit_medium_view_model`, src: GLTF_NAMES.FIRST_AID_KIT_MEDIUM,
        receiveShadow, castShadow
    });
    FirstAidKitMedium.gltfModel.setScale([.15, .15, .15]);

    FirstAidKitLarge.gltfModel = new GLTFModel({
        name: `first_aid_kit_large_view_model`, src: GLTF_NAMES.FIRST_AID_KIT_LARGE,
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

export { loadedGLTFModels, loadGLTFModel, initPickableModels };

const DEBUG = true;
export default class GltfHelper extends Resource {

    _logger = new Logger(DEBUG, 'GltfHelper');

    constructor(sources, renderer, type = RESOURCE_TYPE.GLTF) {

        super(sources, type, renderer);

    }

     setLoaders() {

        this.loaders = {
            gltfLoader: worldGLTFLoader
        };

        setKTX2Loader(this.renderer);

    }

    async startLoading() {

        const loadPromises = [];
        this.startTime();

        for (const source of this.sources) {

            const { name, src } = source;

            if (src) {

                loadPromises.push(this.loaders.gltfLoader
                    .loadAsync(src)
                    .then(gltf => {
                        this.sourceLoaded(name, gltf);
                    })
                );

            }

        }

        await Promise.all(loadPromises);

        Object.assign(loadedGLTFModels, this.items);

        return loadedGLTFModels;

    }

};