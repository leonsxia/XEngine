import { Mesh, MeshPhongMaterial, DoubleSide, TextureLoader } from 'three';
import { BasicObject } from './BasicObject';
import { PLANE } from '../utils/constants';

class Plane extends BasicObject {

    constructor(specs) {

        super(PLANE, specs);

        if (specs.empty) return this;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

    }

    async init () {

        const { map, normalMap } = this.specs;

        if (map?.isTexture || normalMap?.isTexture) {

            const _map = map?.clone();
            const _normalMap = normalMap?.clone();

            this.resetTextureColor();
            
            if (map) {

                this.setTexture(_map);
                this.material.map = _map;

            }

            if (normalMap) {
                
                this.setTexture(_normalMap);
                this.material.normalMap = _normalMap;

            }

            return;

        }

        if (map || normalMap) {

            const loader = new TextureLoader();

            const [texture, normal] = await Promise.all([
                map ? loader.loadAsync(map) : Promise.resolve(null),
                normalMap ? loader.loadAsync(normalMap) : Promise.resolve(null)
            ]);

            this.resetTextureColor();

            if (texture) {

                this.setTexture(texture);
                this.material.map = texture;

            }

            if (normal) {

                this.setTexture(normal);
                this.material.normalMap = normal;

            }
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