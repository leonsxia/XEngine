import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Mansion",
    src: 'assets/scene_objects/mansion.json',
    enableGui: true
};

class Mansion extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { Mansion };