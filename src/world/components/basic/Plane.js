import { Mesh, MeshPhongMaterial, DoubleSide, TextureLoader, SRGBColorSpace, RepeatWrapping, MirroredRepeatWrapping } from 'three';
import { BasicObject } from './BasicObject';

class Plane extends BasicObject {
    #mapSrc;
    #mapRatio;
    #repeatU;
    #repeatV;
    #rotationT;
    #map = null;

    constructor(specs) {
        super('plane', specs);
        const { name, color, map, mapRatio, repeatU, repeatV, rotationT } = specs;
        this.#mapSrc = map;
        this.#mapRatio = mapRatio;
        this.#repeatU = repeatU;
        this.#repeatV = repeatV;
        this.#rotationT = rotationT;
        if (color)
            this.material = new MeshPhongMaterial({ color: color });
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
            if (this.#repeatU && this.#repeatV) {
                this.#map.wrapS = MirroredRepeatWrapping;   // horizontal
                this.#map.wrapT = MirroredRepeatWrapping;   // vertical
                this.#map.repeat.set(this.#repeatU, this.#repeatV);
            } else if (this.#mapRatio) {
                const xRepeat =  this.width / (this.#mapRatio * this.height);
                this.#map.wrapS = RepeatWrapping;
                this.#map.repeat.set(xRepeat, 1);
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

    setDoubleSide() {
        this.material.side = DoubleSide;
    }

    setDoubleShadowSide() {
        this.material.shadowSide = DoubleSide;
    }
}

export { Plane };