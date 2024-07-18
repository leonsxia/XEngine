import { Mesh, MeshPhongMaterial, TextureLoader, SRGBColorSpace } from 'three';
import { BasicObject } from './BasicObject';

class Sphere extends BasicObject {
    #surfaceMapSrc;
    #normalMapSrc;
    #specularMapSrc;
    #surfaceMap = null;
    #normalMap = null;
    #specularMap = null;

    constructor(specs) {
        super('sphere', specs);

        const { name, surfaceMap, normalMap, specularMap } = specs;

        this.#surfaceMapSrc = surfaceMap;
        this.#normalMapSrc = normalMap;
        this.#specularMapSrc = specularMap;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = name;
    }

    async init() {
        const [surfaceMapT, normalMapT, specularMapT] = await Promise.all([
            this.#surfaceMapSrc ? new TextureLoader().loadAsync(this.#surfaceMapSrc) : new Promise((resolve) => resolve(null)),
            this.#normalMapSrc ? new TextureLoader().loadAsync(this.#normalMapSrc) : new Promise((resolve) => resolve(null)),
            this.#specularMapSrc ? new TextureLoader().loadAsync(this.#specularMapSrc) : new Promise((resolve) => resolve(null))
        ]);

        this.#surfaceMap = surfaceMapT;

        if (this.#surfaceMap) this.#surfaceMap.colorSpace = SRGBColorSpace;

        this.#normalMap = normalMapT;
        this.#specularMap = specularMapT;

        if (this.#surfaceMap || this.#normalMap || this.#specularMap)
            this.mesh.material = this.material = new MeshPhongMaterial({ map: this.#surfaceMap, normalMap: this.#normalMap, specularMap: this.#specularMap, specular: 0x111111 });
    }
}

export { Sphere };