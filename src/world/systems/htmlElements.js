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

    pdaContainer.id = 'pda-container';
    pdaContainer.style.position = 'absolute';
    pdaContainer.style.background = background;
    pdaContainer.style.backdropFilter = backdropFilter;

    return { pdaContainer };

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