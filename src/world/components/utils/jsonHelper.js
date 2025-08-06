const loadedJsons = {};

async function loadJsons(sources) {

    const loadPromises = [];
    const jsonPromises = [];
    const loaded = {};

    for (let i = 0, il = sources.length; i < il; i++) {

        const s = sources[i];
        const { name, src } = s;

        if (src) {

            loaded[name] = null;
            loadPromises.push(fetch(src));

        }

    }

    const rawResponses = await Promise.all(loadPromises);

    for (let i = 0, il = rawResponses.length; i < il; i++) {

        const res = rawResponses[i];
        jsonPromises.push(res.json());

    }

    const jsons = await Promise.all(jsonPromises);

    let i = 0;

    for (let j = 0, jl = sources.length; j < jl; j++) {

        const s = sources[j];
        const { name, src } = s;

        if (src) {

            loaded[name] = jsons[i];
            i++;

        }

    }

    Object.assign(loadedJsons, loaded);

    return loaded;

}

async function loadSingleJson(src) {

    const response = await fetch(src);
    const json = await response.json();

    return json;

}

async function getJson(srcName) {

    let json;

    if (loadedJsons[srcName]) {

        json = loadedJsons[srcName];

    } else {

        json = await loadSingleJson(srcName);

    }

    return json;

}

async function getJsonItem(src, name) {

    let item = {};
    const json = await getJson(src);
    if (json) {

        Object.assign(item, json[name]);

    }

    return item;

}

export {
    loadJsons,
    loadSingleJson,
    getJson,
    getJsonItem,
    loadedJsons
}