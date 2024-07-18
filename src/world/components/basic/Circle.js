import { Mesh, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { BasicObject } from './BasicObject';
import { REPEAT } from '../utils/constants';

class Circle extends BasicObject {
    #mapSrc;
    #mapRatio;
    #repeatU;
    #repeatV;
    #repeatModeU;
    #repeatModeV;
    #rotationT;
    #map = null;

    constructor(specs) {
        super('circle', specs);
        const { name, map, mapRatio, repeatU, repeatV, rotationT, repeatModeU = REPEAT, repeatModeV = REPEAT } = specs;

        this.#mapSrc = map;
        this.#mapRatio = mapRatio;
        this.#repeatU = repeatU;
        this.#repeatV = repeatV;
        this.#rotationT = rotationT;
        this.#repeatModeU = repeatModeU;
        this.#repeatModeV = repeatModeV;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = name;
    }

    async init() {
        const [texture] = await Promise.all([
            this.#mapSrc ? new TextureLoader().loadAsync(this.#mapSrc) : Promise.resolve(null)
        ]);
        if (texture) {
            this.#map = texture;
            this.#map.colorSpace = SRGBColorSpace;

            if (this.#rotationT) {
                this.#map.center.set(.5, .5);
                this.#map.rotation = this.#rotationT;
            }

            if (this.#repeatU && this.#repeatV) {
                const modeU = this.getRepeatMode(this.#repeatModeU)
                const modeV = this.getRepeatMode(this.#repeatModeV)

                this.#map.wrapS = modeU;   // horizontal
                this.#map.wrapT = modeV;   // vertical
                
                this.#map.repeat.set(this.#repeatU, this.#repeatV);
            } else if (this.#mapRatio) {
                const xRepeat = this.radius * 2 / (mapRatio * this.radius * 2);
                const yRepeat = 1;

                this.#map.wrapS = RepeatWrapping;
                this.#map.wrapT = RepeatWrapping;

                this.#map.repeat.set(xRepeat, yRepeat);
            }

            this.mesh.material = new MeshPhongMaterial({ map: this.#map });
        }
    }
}

export { Circle };