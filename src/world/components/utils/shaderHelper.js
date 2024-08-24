const shaders = {};

async function loadShaders(sources) {

    const loadPromises = [];
    const textPromises = [];

    sources.forEach(s => {

        const { name, src } = s;

        if (src) {

            const request = new Request(src);

            shaders[name] = null;
            loadPromises.push(fetch(request));

        }

    });

    const shaderFiles = await Promise.all(loadPromises);

    shaderFiles.forEach(file => {

        textPromises.push(file.text());

    });

    const shaderTexts = await Promise.all(textPromises);

    let i = 0;
    const reg = /\n|\t/gi;
    sources.forEach(s => {

        const { name, src } = s;

        if (src) {

            shaders[name] = shaderTexts[i].replaceAll(reg, '');
            i++;

        }

    });

    return shaders;

}

export { loadShaders, shaders };