
import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Enemy Test Scene",
    src: 'assets/sceneObjects/enemy_test_scene.json',
    enableGui: true
};

class EnemyTestScene extends WorldScene {

    constructor(container, renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(container, renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { EnemyTestScene };