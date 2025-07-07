
import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Enemy Test Scene",
    src: 'assets/sceneObjects/enemy_test_scene.json',
    enableGui: true
};

class EnemyTestScene extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { EnemyTestScene };