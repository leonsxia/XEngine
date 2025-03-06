import { Mesh, DoubleSide } from 'three';
import { BasicObject } from './BasicObject';
import { PLANE } from '../utils/constants';
import { clone } from '../utils/objectHelper';

class Plane extends BasicObject {

    constructor(specs) {

        super(PLANE, specs);

        if (specs.empty) return this;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

        this.mesh.father = this;

    }

    async init () {

        await this.initBasic();
        
    }

    get width() {

        return this.geometry.parameters.width * this.mesh.scale.x;

    }

    get height() {

        return this.geometry.parameters.height * this.mesh.scale.y;

    }
    
    update() {

        this.setConfig({ texScale: [this.scale.x, this.scale.y] })
            .updateTextures();

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