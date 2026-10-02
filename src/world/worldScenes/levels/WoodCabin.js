import { WorldScene } from "../WorldScene.js";

const worldSceneSpecs = {
    name: "Wood Cabin",
    src: 'assets/scene_objects/levels/woodCabin.json',
    enableGui: true
};

class WoodCabin extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig)
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WoodCabin };