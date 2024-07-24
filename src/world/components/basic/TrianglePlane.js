import { Mesh, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { BasicObject } from './BasicObject';
import { REPEAT } from '../utils/constants';

class TrianglePlane extends BasicObject {

    #mapSrc;
    #mapRatio;
    #repeatU;
    #repeatV;
    #repeatModeU;
    #repeatModeV;
    #rotationT;
    #noRepeat;
    #map = null;

    constructor(specs) {

        super('triangle', specs);

        const { name, map, mapRatio, repeatU, repeatV, rotationT, repeatModeU = REPEAT, repeatModeV = REPEAT, noRepeat = false } = specs;

        this.#mapSrc = map;
        this.#mapRatio = mapRatio;
        this.#repeatU = repeatU;
        this.#repeatV = repeatV;
        this.#rotationT = rotationT;
        this.#repeatModeU = repeatModeU;
        this.#repeatModeV = repeatModeV;
        this.#noRepeat = noRepeat;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = name;
        
    }

    async init () {
        const [texture] = await Promise.all([
            this.#mapSrc ? new TextureLoader().loadAsync(this.#mapSrc) : new Promise(resolve => resolve(null))
        ]);
        if (texture) {
            this.#map = texture;
            this.#map.colorSpace = SRGBColorSpace;

            if (this.#rotationT) {
                this.#map.center.set(.5, .5);
                this.#map.rotation = this.#rotationT;
            }

            if (!this.#noRepeat) {
                if (this.#repeatU && this.#repeatV) {
                    const modeU = this.getRepeatMode(this.#repeatModeU)
                    const modeV = this.getRepeatMode(this.#repeatModeV)

                    this.#map.wrapS = modeU;   // horizontal
                    this.#map.wrapT = modeV;   // vertical

                    this.#map.repeat.set(this.#repeatU, this.#repeatV);
                } else if (this.#mapRatio) {
                    const xRepeat = this.width / (this.#mapRatio * this.height);
                    this.#map.wrapS = RepeatWrapping;
                    this.#map.repeat.set(xRepeat, 1);
                }
            }
            
            this.mesh.material = this.material = new MeshPhongMaterial({ map: this.#map });
        }
    }

    get width() {
        return this.geometry.parameters.width * this.mesh.scale.x;
    }

    get height() {
        return this.geometry.parameters.height * this.mesh.scale.y;
    }
}

export { TrianglePlane };