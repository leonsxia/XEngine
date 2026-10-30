import { WorldScene } from "../WorldScene";
import { WorldScene1 } from "./WorldScene1";
import { WorldScene2 } from "./WorldScene2";
import { WorldScene3 } from "./WorldScene3";

const scenes = [
    'BasicObjects',
    'RunningTrain',
    'Birds',
    'Simple Physics',
    'Water Room',
    'Mansion',
    'Animated Characters',
    'Entries Test',
    'Matrix',
    'Enemy Test Scene',
    'Terrain',
    'Rapier Physics',
    'Route Kanal',
    'Wood Cabin',
    'Navigation Room'
];  // scene list for scene selector

const buildLevels = function () {

    return [
        new WorldScene1(),
        new WorldScene2(),
        new WorldScene3(),
        new WorldScene({
            name: "Simple Physics",
            src: 'assets/scene_objects/worldScene4.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Animated Characters",
            src: 'assets/scene_objects/worldScene5.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Entries Test",
            src: 'assets/scene_objects/worldScene6.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Water Room",
            src: 'assets/scene_objects/water_room.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Mansion",
            src: 'assets/scene_objects/mansion.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Matrix",
            src: 'assets/scene_objects/matrix.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Enemy Test Scene",
            src: 'assets/scene_objects/enemy_test_scene.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Terrain",
            src: 'assets/scene_objects/terrain.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Rapier Physics",
            src: 'assets/scene_objects/rapierPhysics.json',
            enableGui: true
        }),
        new WorldScene({
            name: "Route Kanal",
            src: 'assets/scene_objects/levels/route_kanal.json',
            enableGui: true
        }),
        new WorldScene({
            name: 'Wood Cabin',
            src: 'assets/scene_objects/levels/woodCabin.json',
            enableGui: true
        }),
        new WorldScene({
            name: 'Navigation Room',
            src: 'assets/scene_objects/levels/navRoom.json',
            enableGui: true
        })
    ];

}

export { scenes, buildLevels };