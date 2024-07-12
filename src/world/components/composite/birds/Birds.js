import { Vector3, Group } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { setupModel } from './setModel';

class Bird {
    #mesh;
    constructor() {
    }

    async init(specs) {
        try {
            const loader = new GLTFLoader();
            const modelData = await loader.loadAsync(specs.src);
            this.#mesh = setupModel(modelData, specs.position);
            this.#mesh.name = specs.name;
        } catch (err) {
            console.log(`load bird err: ${err}`);
        }
    }

    get mesh() {
        return this.#mesh;
    }
}

class BirdsGroup extends Group {
    #specs;

    constructor (specs) {
        super();
        this.positions = [];
        this.birds = [];
        this.#specs = specs;
        specs.models.forEach((model) => {
            const [x, y, z] = model.position;
            this.positions.push({x: x, y: y, z: z});
        });
    }

    async loadBirds() {
        try {
            const loadPromises = [];
            this.#specs.models.forEach((spec) => {
                const bird = new Bird();
                this.birds.push(bird);
                loadPromises.push(bird.init(spec));
            });
            await Promise.all(loadPromises);
            for (let i = 0; i < this.birds.length; i++) {
                this.add(this.birds[i].mesh);
                this.birds[i].mesh.position.set(...this.#specs.models[i].position);
            }
        } catch (err) {
            console.log(`load birds err: ${err}`);
        }
    }

    getBirds(i) {
        if (this.birds.length > 0 && i >=0 && i < this.birds.length)
            return this.birds[i].mesh;
        else 
            return null;
    }

    getBirdsCamsPositions(dist) {
        const dirVec3 = new Vector3(-dist, dist, dist);
        const focusCamPositions = this.positions.map((pos) => {
            const origin = new Vector3(pos.x, pos.y, pos.z);
            const newCamPos = origin.add(dirVec3);
            return { x: newCamPos.x, y: newCamPos.y, z: newCamPos.z };
        });
        return focusCamPositions;
    }

    tick(delta) {
        this.birds.forEach((bird) => {
            bird.mesh.tick(delta);
        });
    }
}

// async function loadBirds() {
//     const loader = new GLTFLoader();
//     const [parrotData, flamingoData, storkData] = await Promise.all([
//         loader.loadAsync('assets/models/Parrot.glb'),
//         loader.loadAsync('assets/models/Flamingo.glb'),
//         loader.loadAsync('assets/models/Stork.glb')
//     ]);
//     const parrot = setupModel(parrotData);
//     parrot.position.set(positions[0].x, positions[0].y, positions[0].z);
//     const flamingo = setupModel(flamingoData);
//     flamingo.position.set(positions[1].x, positions[1].y, positions[1].z);
//     const stork = setupModel(storkData);
//     stork.position.set(positions[2].x, positions[2].y, positions[2].z);
//     // console.log(parrotData);
//     return { parrot, flamingo, stork };
// }

export { BirdsGroup };