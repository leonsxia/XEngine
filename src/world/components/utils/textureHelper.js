import { TextureLoader, SRGBColorSpace} from 'three';

function getTextureLoader() {

    const loader = new TextureLoader();

    return loader;

}

const worldTextureLoader = getTextureLoader();
const loadedTextures = {};

async function loadSingleTexture(specs) {

    const { map, normalMap } = specs;
    let texture, normal;

    if (loadedTextures[map]) {
        texture = loadedTextures[map];
    }

    if (loadedTextures[normal]) {
        normal = loadedTextures[normal];
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

    }

    return { texture, normal };

}

async function loadTextures(mapsArr) {

    const loadPromises = [];
    const loader = worldTextureLoader;
    const loaded = {};

    for (let i = 0, il = mapsArr.length; i < il; i++) {

        const m = mapsArr[i];
        const { name, map, normalMap, armMap, aoMap, roughMap, metalMap, dispMap } = m;

        if (map) {

            loaded[name] = null;
            loadPromises.push(loader.loadAsync(map));
            
        }

        if (normalMap) {

            loaded[`${name}_NORMAL`] = null;
            loadPromises.push(loader.loadAsync(normalMap));

        }

        if (armMap) {

            loaded[`${name}_ARM`] = null;
            loadPromises.push(loader.loadAsync(armMap));

        }

        if (aoMap) {

            loaded[`${name}_AO`] = null;
            loadPromises.push(loader.loadAsync(aoMap));

        }

        if (roughMap) {

            loaded[`${name}_ROUGH`] = null;
            loadPromises.push(loader.loadAsync(roughMap));

        }

        if (metalMap) {

            loaded[`${name}_METAL`] = null;
            loadPromises.push(loader.loadAsync(metalMap));

        }

        if (dispMap) {

            loaded[`${name}_DISP`] = null;
            loadPromises.push(loader.loadAsync(dispMap));

        }

    }   

    const results = await Promise.all(loadPromises);

    let i = 0;
    for (let j = 0, jl = mapsArr.length; j < jl; j++) {

        const m = mapsArr[j];

        const { name, map, normalMap, armMap, aoMap, roughMap, metalMap, dispMap } = m;

        if (map) {

            results[i].colorSpace = SRGBColorSpace;
            loaded[name] = results[i];
            i++;

        }

        if (normalMap) {

            loaded[`${name}_NORMAL`] = results[i];
            i++;

        }

        if (armMap) {

            loaded[`${name}_ARM`] = results[i];
            i++;

        }

        if (aoMap) {

            loaded[`${name}_AO`] = results[i];
            i++;

        }

        if (roughMap) {

            loaded[`${name}_ROUGH`] = results[i];
            i++;

        }

        if (metalMap) {

            loaded[`${name}_METAL`] = results[i];
            i++;

        }

        if (dispMap) {

            loaded[`${name}_DISP`] = results[i];
            i++;

        }

    }

    Object.assign(loadedTextures, loaded);

    return loaded;

}

export { worldTextureLoader, loadSingleTexture, loadTextures, loadedTextures };