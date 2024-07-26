import { Mesh, MeshPhongMaterial, DoubleSide, TextureLoader } from 'three';
import { BasicObject } from './BasicObject';

class Plane extends BasicObject {

    constructor(specs) {

        super('plane', specs);

        if (specs.empty) return this;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

    }

    async init () {

        const { map, normalMap } = this.specs;

        const [texture, normal] = await Promise.all([
            map ? new TextureLoader().loadAsync(map) : Promise.resolve(null),
            normalMap ? new TextureLoader().loadAsync(normalMap) : Promise.resolve(null)
        ]);

        if (texture) {
            
            this.setTexture(texture);
        
        }

        if (normal) {

            this.setTexture(normal);

        }

        this.mesh.material = this.material = new MeshPhongMaterial({ map: texture, normalMap: normal });
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

    clone(name) {

        const emptyObj = new this.constructor({ name: name ?? `${this.name}_clone`, empty: true });
        
        emptyObj.specs = this.specs;
        emptyObj.geometry = this.geometry;
        emptyObj.material = this.material;
        emptyObj.mesh = this.mesh.clone();

        return emptyObj;

    }

}

export { Plane };