
import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Animated Characters",
    src: 'assets/sceneObjects/worldScene5.json',
    enableGui: true
};

class WorldScene5 extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig)
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WorldScene5 };