import { BoxGeometry, Mesh, MeshStandardMaterial, TextureLoader, MathUtils, SRGBColorSpace } from 'three'
import { basicMaterials } from './basicMaterial';

const material = basicMaterials.basic;

async function loadMaterial(specs) {
    const { cube, map } = specs;
    const textureLoader = new TextureLoader();
    const [texture] = await Promise.all([
        map ? textureLoader.loadAsync(map) : new Promise(resolve => resolve(null))
    ]);
    if (texture) {
        texture.colorSpace = SRGBColorSpace;
        cube.material = new MeshStandardMaterial({map: texture});
    }
}

function createCube(specs = {}) {
    const {size: {width, height, depth}, name} = specs;
    // create a geometry
    const geometry = new BoxGeometry(width, height, depth);

    // create a default (white) basic material
    // switch the old "basic" material to a physically correct "standard" materail
    // createMaterial(spc);

    // create a mesh containing the geometry and material
    const cube = new Mesh(geometry, material);
    cube.name = name;

    const radiansPerSecond = MathUtils.degToRad(30);

    // this method will be called once per frame
    cube.tick = (delta) => {
        // increase the cube's rotation each frame
        cube.rotation.z += radiansPerSecond * delta;
        cube.rotation.x += radiansPerSecond * delta;
        cube.rotation.y += radiansPerSecond * delta;
    };
    specs.cube = cube;
    return cube;
}

export { createCube, loadMaterial };