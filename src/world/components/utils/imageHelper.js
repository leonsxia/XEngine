const loadedImages = {};

async function loadImages(sources) {

    const loadPromises = [];
    const blobPromises = [];
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
        blobPromises.push(res.blob());

    }

    const blobs = await Promise.all(blobPromises);

    let i = 0;

    for (let j = 0, jl = sources.length; j < jl; j++) {

        const s = sources[j];
        const { name, src } = s;

        if (src) {

            loaded[name] = URL.createObjectURL(blobs[i]);
            i++;

        }

    }

    Object.assign(loadedImages, loaded);

    return loaded;

}

async function loadSingleImageUrl(src) {

    const response = await fetch(src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    return url;

}

async function getImageUrl(srcName) {

    let url;

    if (loadedImages[srcName]) {

        url = loadedImages[srcName];

    } else {

        url = await loadSingleImageUrl(srcName);

    }

    return url;

}

export {
    loadSingleImageUrl,
    loadImages,
    getImageUrl,
    loadedImages
}