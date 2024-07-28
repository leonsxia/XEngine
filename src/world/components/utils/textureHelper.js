import { TextureLoader, SRGBColorSpace} from 'three';

async function loadSingleTexture(specs) {

    const { map, normalMap } = specs;
    const loader = new TextureLoader();

    const [texture, normal] = await Promise.all([
        map ? loader.loadAsync(map) : Promise.resolve(null),
        normalMap ? loader.loadAsync(normalMap) : Promise.resolve(null)
    ]);

    return { texture, normal };

}

async function loadTextures(mapsArr) {

    const loadPromises = [];
    const loader = new TextureLoader();
    const loaded = {};
    mapsArr.forEach(m => {

        const { name, map, normalMap } = m;

        if (map) {
            loaded[name] = null;
            loadPromises.push(loader.loadAsync(map));
        }

        if (normalMap) {
            loaded[`${name}_NORMAL`] = null;
            loadPromises.push(loader.loadAsync(normalMap));
        }

    });

    const results = await Promise.all(loadPromises);

    let i = 0;
    mapsArr.forEach(m => {

        const { name, map, normalMap } = m;

        if (map) {
            results[i].colorSpace = SRGBColorSpace;
            loaded[name] = results[i];
            i++;
        }

        if (normalMap) {
            loaded[`${name}_NORMAL`] = results[i];
            i++;
        }
    });

    return loaded;

}

export { loadSingleTexture, loadTextures };