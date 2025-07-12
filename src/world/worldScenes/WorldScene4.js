import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Simple Physics",
    src: 'assets/scene_objects/worldScene4.json',
    enableGui: true
};

class WorldScene4 extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WorldScene4 };