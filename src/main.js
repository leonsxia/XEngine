// import { WorldScene1 } from "./world/WorldScene1";
// import { WorldScene2 } from "./world/WorldScene2";
// import { WorldScene3 } from "./world/WorldScene3";
import { World } from "./world/World";

const container = document.querySelector('#scene-container');
const header = document.querySelector('#sceneTitle');
const msg = document.querySelector('#msg');
const manual = document.querySelector('#manual');
const world = new World(container, { header, msg, manual });

// create the main function
async function main() {
    await world.initScene('Animated Characters');
}

main().catch((err) => {
    console.log(err);
});