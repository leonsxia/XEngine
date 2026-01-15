
import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Rapier Physics",
    src: 'assets/scene_objects/rapierPhysics.json',
    enableGui: true
};

class WorldRapier extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig)
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WorldRapier };