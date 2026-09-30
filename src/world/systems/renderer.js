import { WebGLRenderer, NoToneMapping, LinearToneMapping, ACESFilmicToneMapping, AgXToneMapping, ReinhardToneMapping, CineonToneMapping } from 'three';

function createRenderer() {
    const renderer = new WebGLRenderer({ antialias: true });

    // turn on the physically correct lighting model
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = AgXToneMapping;
    renderer.toneMappingExposure = 1.0;

    return renderer;
}

function toneMappingStr(tone) {

    switch (tone) {
        case NoToneMapping:

            return 'NoTone';

        case ACESFilmicToneMapping:

            return 'Filmic';

        case AgXToneMapping:

            return 'AgX';

        case ReinhardToneMapping:

            return 'Reinhard';

        case CineonToneMapping:

            return 'Cineon';

        case LinearToneMapping:

            return 'Linear';

        default:

            return 'AgX';

    }

}

export { createRenderer, toneMappingStr };