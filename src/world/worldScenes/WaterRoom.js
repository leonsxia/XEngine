import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Water Room",
    src: 'assets/scene_objects/water_room.json',
    enableGui: true
};

class WaterRoom extends WorldScene {

    constructor(renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WaterRoom };