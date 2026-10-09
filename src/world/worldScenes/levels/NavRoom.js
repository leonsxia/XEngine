import { WorldScene } from "../WorldScene";

const worldSceneSpecs = {
    name: 'Navigation Room',
    src: 'assets/scene_objects/levels/navRoom.json',
    enableGui: true
};

class NavRoom extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig)
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { NavRoom };