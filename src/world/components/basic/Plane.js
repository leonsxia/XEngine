import { Mesh, MeshPhongMaterial, DoubleSide } from 'three';
import { BasicObject } from './BasicObject';

class Plane extends BasicObject {
    #map = null;

    constructor(specs) {
        super('plane', specs);
        const { name, color } = specs;
        if (color)
            this.material = new MeshPhongMaterial({ color: color });
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = name;
    }

    async init (specs) {
        const { map } = specs;
        const [texture] = await Promise.all([
            map ? new TextureLoader().loadAsync(map) : new Promise(resolve => resolve(null))
        ]);
        if (texture) {
            this.#map = texture;
            this.#map.colorSpace = SRGBColorSpace;
            this.mesh.material = this.material = new MeshPhongMaterial({ map: this.#map });
        }
    }

    get width() {
        return this.geometry.parameters.width * this.mesh.scale.x;
    }

    get height() {
        return this.geometry.parameters.height * this.mesh.scale.y;
    }

    setDoubleSide() {
        this.material.side = DoubleSide;
    }

    setDoubleShadowSide() {
        this.material.shadowSide = DoubleSide;
    }
}

export { Plane };