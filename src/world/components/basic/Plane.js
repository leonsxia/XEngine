import { Mesh, DoubleSide, TextureLoader } from 'three';
import { BasicObject } from './BasicObject';
import { PLANE } from '../utils/constants';
import { clone } from '../utils/objectHelper';

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

        const emptyObjName = name ?? `${this.name}_clone`;
        const emptyObj = new this.constructor({ name: emptyObjName, empty: true });
        
        const emptySpecs = {};
        const ignore = ['name'];
        if (typeof this.specs.map !== 'string') {
            ignore.push('map');
            emptySpecs.map = this.specs.map;
        }

        if (typeof this.specs.normalMap !== 'string') {
            ignore.push('normalMap');
            emptySpecs.normalMap = this.specs.normalMap;
        }

        emptyObj.name = emptySpecs.name = emptyObjName;

        emptyObj.specs = clone(emptySpecs, this.specs, ignore);

        emptyObj.geometry = this.geometry;
        emptyObj.material = this.material;
        emptyObj.mesh = this.mesh.clone();
        emptyObj.mesh.name = emptyObjName;

        return emptyObj;

    }

}

export { Plane };