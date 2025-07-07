const container = document.querySelector('#scene-container');
const header = document.querySelector('#sceneTitle');
const msg = document.querySelector('#msg');
const manual = document.querySelector('#manual');
const infosDomElements = {
    header,
    msg,
    manual
};

function createPdaContainer(specs) {

    const { background, backdropFilter } = specs || {};
    const pdaContainer = document.createElement('div');
    const pdaDiv = document.createElement('div');

    pdaDiv.id = 'pda';
    pdaContainer.id = 'pda-container';
    pdaContainer.appendChild(pdaDiv);

    pdaContainer.style.position = 'absolute';
    pdaContainer.style.background = background;
    pdaDiv.style.backdropFilter = backdropFilter;

    return { pdaContainer, pdaDiv };

}

function getScenePosition() {
    const sceneCanvas = container.querySelector('canvas');
    const rect = sceneCanvas.getBoundingClientRect();

    return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
    };

}

export { container, infosDomElements, createPdaContainer, getScenePosition }