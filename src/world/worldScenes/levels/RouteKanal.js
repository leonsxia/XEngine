
import { WorldScene } from '../WorldScene.js';

const worldSceneSpecs = {
    name: "Route Kanal",
    src: 'assets/scene_objects/levels/route_kanal.json',
    enableGui: true
};

class RouteKanal extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig)
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { RouteKanal };