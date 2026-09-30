// eslint-disable-next-line no-unused-vars
import { WebGLRenderer, ACESFilmicToneMapping, AgXToneMapping, ReinhardToneMapping, CineonToneMapping, LinearToneMapping } from 'three';

function createRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });
    
    // turn on the physically correct lighting model
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = AgXToneMapping;
    renderer.toneMappingExposure = 1.0;

    return renderer;
}

export { createRenderer };