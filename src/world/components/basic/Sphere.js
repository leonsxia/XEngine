import { Mesh, MeshPhongMaterial, TextureLoader, SRGBColorSpace, MathUtils} from 'three';
import { BasicObject } from './BasicObject';

class Sphere extends BasicObject {
    #surfaceMap = null;
    #normalMap = null;
    #specularMap = null;
    #radiansPerSecond = MathUtils.degToRad(8.59);

    constructor(specs) {
        super('sphere', specs);
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;
    }

    async init(specs) {
        const { surfaceMap, normalMap, specularMap } = specs;
        const [surfaceMapT, normalMapT, specularMapT] = await Promise.all([
            surfaceMap ? new TextureLoader().loadAsync(surfaceMap) : new Promise((resolve) => resolve(null)),
            normalMap ? new TextureLoader().loadAsync(normalMap) : new Promise((resolve) => resolve(null)),
            specularMap ? new TextureLoader().loadAsync(specularMap) : new Promise((resolve) => resolve(null))
        ]);
        this.#surfaceMap = surfaceMapT;
        if (this.#surfaceMap) this.#surfaceMap.colorSpace = SRGBColorSpace;
        this.#normalMap = normalMapT;
        this.#specularMap = specularMapT;
        if (this.#surfaceMap || this.#normalMap || this.#specularMap)
            this.mesh.material = this.material = new MeshPhongMaterial({ map: this.#surfaceMap, normalMap: this.#normalMap, specularMap: this.#specularMap, specular: 0x111111 });
    }

    tick(delta) {
        this.mesh.rotation.y += delta * this.#radiansPerSecond;
    }
}

export { Sphere };