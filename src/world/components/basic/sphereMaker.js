import { SphereGeometry,  Mesh, MeshStandardMaterial, TextureLoader, SRGBColorSpace, MathUtils } from 'three'
import { basicMaterials } from './basicMaterial';

const material = basicMaterials.basic;

async function loadMaterial(specs) {
    const { map, sphere } = specs;
    const textureLoader = new TextureLoader();
    const [texture] = await Promise.all([
        map ? textureLoader.loadAsync(map) : new Promise(resolve => resolve(null))
    ])
    if (texture) {
        texture.colorSpace = SRGBColorSpace;
        sphere.material = new MeshStandardMaterial({ map: texture });
    }
}

function createSphere(specs = {}) {
    const { size: { radius, widthSegments, heightSegments }, name } = specs;
    // create a geometry
    const geometry = new SphereGeometry(radius, widthSegments, heightSegments);

    // create a default (white) basic material
    // switch the old "basic" material to a physically correct "standard" materail
    // createMaterial(spc);

    // create a mesh containing the geometry and material
    const sphere = new Mesh(geometry, material);
    sphere.name = name;

    const radiansPerSecond = MathUtils.degToRad(8.59);

    sphere.tick = (delta) => {
        sphere.rotation.y += delta * radiansPerSecond;
    }
    specs.sphere = sphere;

    return sphere;
}

export { createSphere, loadMaterial };