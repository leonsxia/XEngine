import { WorldScene } from './WorldScene.js';

const worldSceneSpecs = {
    name: "Water Room",
    src: 'assets/sceneObjects/water_room.json',
    enableGui: true
};

class WaterRoom extends WorldScene {

    constructor(container, renderer, globalConfig, eventDispatcher) {

        Object.assign(worldSceneSpecs, globalConfig);
        super(container, renderer, worldSceneSpecs, eventDispatcher);

    }

}

export { WaterRoom };