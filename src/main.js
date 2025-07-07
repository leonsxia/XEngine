import { World } from "./world/World";

const world = new World();

// create the main function
async function main() {
    await world.initScene('Matrix');
}

main().catch((err) => {
    console.log(err);
});