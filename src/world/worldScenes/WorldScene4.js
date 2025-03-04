import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Simple Physics",
    src: 'assets/sceneObjects/worldScene4.json',
    enableGui: true
};

class WorldScene4 extends WorldScene {

    constructor(container, renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(container, renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WorldScene4 };