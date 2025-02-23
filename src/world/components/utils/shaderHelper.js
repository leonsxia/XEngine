const shaders = {};

async function loadShaders(sources) {

    const loadPromises = [];
    const textPromises = [];

    for (let i = 0, il = sources.length; i < il; i++) {

        const s = sources[i];
        const { name, src } = s;

        if (src) {

            const request = new Request(src);

            shaders[name] = null;
            loadPromises.push(fetch(request));

        }

    }

    const shaderFiles = await Promise.all(loadPromises);

    for (let i = 0, il = shaderFiles.length; i < il; i++) {

        const file = shaderFiles[i];

        textPromises.push(file.text());

    }

    const shaderTexts = await Promise.all(textPromises);

    let i = 0;
    const reg = /\n|\t/gi;

    for (let j = 0, jl = sources.length; j < jl; j++) {

        const s = sources[j];
        const { name, src } = s;

        if (src) {

            shaders[name] = shaderTexts[i].replaceAll(reg, '');
            i++;

        }

    }

    return shaders;

}

export { loadShaders, shaders };