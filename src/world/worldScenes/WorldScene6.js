
import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Entries Test",
    src: 'assets/scene_objects/worldScene6.json',
    enableGui: true
};

class WorldScene6 extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig)
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WorldScene6 };