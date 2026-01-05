
import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "World Terrain",
    src: 'assets/scene_objects/terrain.json',
    enableGui: true
};

class WorldTerrain extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig)
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WorldTerrain };