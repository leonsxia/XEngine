import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Mansion",
    src: 'assets/sceneObjects/mansion.json',
    enableGui: true
};

class Mansion extends WorldScene {

    constructor(container, renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(container, renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { Mansion };