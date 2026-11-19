import { TextureLoader, SRGBColorSpace, EquirectangularReflectionMapping } from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { TEXTURES } from '../configs/textures';
import Resource from '../Resource';
import { RESOURCE_TYPE } from '../configs/resources';
import { Logger } from '../../Logger';

const worldTextureLoader = new TextureLoader();
const worldHDRLoader = new HDRLoader();

const loadedTextures = {};
const loadedHDRTextures = {};
const trackedTextures = [];

async function loadBasicTextures(specs) {

    const { map, normalMap, name } = specs;
    let texture, normal;

    if (loadedTextures[map]) {

        texture = loadedTextures[map];

    } else if (name && loadedTextures[name]) {

        texture = loadedTextures[name];

    }

    if (loadedTextures[normalMap]) {

        normal = loadedTextures[normalMap];

    } else if (name && loadedTextures[`${name}_NORMAL`]) {

        normal = loadedTextures[`${name}_NORMAL`];

    }

    if ((map && !texture) || (normalMap && !normal)) {

        const loader = worldTextureLoader;
        const loadPromises = [];
        if (!texture) {
            loadPromises.push(map ? loader.loadAsync(map) : Promise.resolve(null));
        }

        if (!normal) {
            loadPromises.push(normalMap ? loader.loadAsync(normalMap) : Promise.resolve(null));
        }

        [texture, normal] = await Promise.all(loadPromises);

        if (texture && !loadedTextures[map] && name) loadedTextures[name] = texture;
        if (normal && !loadedTextures[normalMap] && name) loadedTextures[`${name}_NORMAL`] = normal;

    }

    return { texture, normal };

}

async function loadSingleTexture(src, name, clone = false) {

    if (!src) return null;

    let result;
    if (src.isTexture) {

        result = clone ? src.clone() : src;

    } else if (loadedTextures[src]) {

        result = clone ? loadedTextures[src].clone() : loadedTextures[src];

    } else if (name && loadedTextures[name]) {

        result = clone ? loadedTextures[name].clone() : loadedTextures[name];

    }

    if (result) {

        if (clone) trackedTextures.push(result);
        return result;

    }

    result = await worldTextureLoader.loadAsync(src);
    trackedTextures.push(result);
    if (name) loadedTextures[name] = result;

    return result;

}

function setTextureAnisotropy(level) {

    const set = (level, texture) => {

        if (texture.anisotropy !== level) {

            texture.anisotropy = level;
            texture.needsUpdate = true;

        }

    };

    const setAnisotropy = (level, texture) => {

        switch (level.toString()) {

            case '1':
            case '1x':
                set(1, texture);
                break;

            case '2':
            case '2x':
                set(2, texture);
                break;

            case '4':
            case '4x':
                set(4, texture);
                break;

            case '8':
            case '8x':
                set(8, texture);
                break;

            case '16':
            case '16x':
                set(16, texture);
                break;

            default:
                set(1, texture);
                break;

        }        

    };

    for (const config of TEXTURES) {

        const { name, enableAnisotropy = true } = config;
        const texture = loadedTextures[name];

        if (texture?.isTexture && enableAnisotropy) {

            setAnisotropy(level, texture);

        }

    }

    for (const texture of trackedTextures) {

        setAnisotropy(level, texture);

    }

}

export { loadedTextures, loadedHDRTextures, loadSingleTexture, loadBasicTextures, setTextureAnisotropy };

const DEBUG = true;
export default class TextureHelper extends Resource {

    _logger = new Logger(DEBUG, 'TextureHelper');

    constructor(sources = [], type = RESOURCE_TYPE.PBR_TEXTURE) {

        super(sources, type);        

    }

    setLoaders() {

        this.loaders = {
            textureLoader: worldTextureLoader,
            hdrLoader: worldHDRLoader
        };

    }

    async startLoading() {

        const loadPromises = [];
        this.startTime();
        
        for (const source of this.sources) {

            switch(this.type) {

                case RESOURCE_TYPE.PBR_TEXTURE:

                    {
                        const { name, map, normalMap, armMap, aoMap, roughMap, metalMap, dispMap } = source;
                        if (map) {

                            loadPromises.push(this.loaders.textureLoader
                                .loadAsync(map)
                                .then(file => {
                                    file.colorSpace = SRGBColorSpace;
                                    this.sourceLoaded(name, file)
                                })
                            );

                        }

                        if (normalMap) {

                            loadPromises.push(this.loaders.textureLoader
                                .loadAsync(normalMap)
                                .then(file => this.sourceLoaded(`${name}_NORMAL`, file))
                            );

                        }

                        if (armMap) {

                            loadPromises.push(this.loaders.textureLoader
                                .loadAsync(armMap)
                                .then(file => this.sourceLoaded(`${name}_ARM`, file))
                            );

                        }

                        if (aoMap) {

                            loadPromises.push(this.loaders.textureLoader
                                .loadAsync(aoMap)
                                .then(file => this.sourceLoaded(`${name}_AO`, file))
                            );

                        }

                        if (roughMap) {

                            loadPromises.push(this.loaders.textureLoader
                                .loadAsync(roughMap)
                                .then(file => this.sourceLoaded(`${name}_ROUGH`, file))
                            );

                        }

                        if (metalMap) {

                            loadPromises.push(this.loaders.textureLoader
                                .loadAsync(metalMap)
                                .then(file => this.sourceLoaded(`${name}_METAL`, file))
                            );

                        }

                        if (dispMap) {

                            loadPromises.push(this.loaders.textureLoader
                                .loadAsync(dispMap)
                                .then(file => this.sourceLoaded(`${name}_DISP`, file))
                            );

                        }

                    }

                    break;
                
                case RESOURCE_TYPE.HDR_TEXTURE:

                    {
                        const { name, map } = source;
                        if (map) {

                            loadPromises.push(this.loaders.hdrLoader
                                .loadAsync(map)
                                .then(file => {
                                    file.mapping = EquirectangularReflectionMapping;
                                    this.sourceLoaded(name, file)}
                                )
                            );

                        }
                    }

                    break;

            }

        }

        await Promise.all(loadPromises);

        // assign global resources after loading completed.
        switch(this.type) {

            case RESOURCE_TYPE.PBR_TEXTURE:

                Object.assign(loadedTextures, this.items);
                return loadedTextures;

            case RESOURCE_TYPE.HDR_TEXTURE:

                Object.assign(loadedHDRTextures, this.items);
                return loadedHDRTextures;

        }

    }

};