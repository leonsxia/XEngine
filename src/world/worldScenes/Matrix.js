
import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Matrix",
    src: 'assets/sceneObjects/matrix.json',
    enableGui: true
};

class WorldMatrix extends WorldScene {

    constructor(container, renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(container, renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WorldMatrix };