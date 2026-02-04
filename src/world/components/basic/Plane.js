import { Mesh, DoubleSide, Vector3 } from 'three';
import { BasicObject } from './BasicObject';
import { PLANE } from '../utils/constants';
import { clone } from '../utils/objectHelper';
import { Logger } from '../../systems/Logger';

const DEBUG = false;
const _v1 = new Vector3();

class Plane extends BasicObject {

    _cachedWidth;
    _cachedHeight;

    #logger = new Logger(DEBUG, 'Plane');

    constructor(specs) {

        specs.useStandardMaterial = true;
        super(PLANE, specs);

        if (specs.empty) return this;

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

        this.mesh.father = this;

        this.bindEvents();

    }

    async init () {

        await this.initBasic();
        
    }

    bindEvents() {

        const listener = (event) => {

            this.#logger.log(`${event.message}`);
            this._cachedWidth = this.geometry.parameters.width * this.mesh.getWorldScale(_v1).x;
            this._cachedHeight = this.geometry.parameters.height * this.mesh.getWorldScale(_v1).y;

        }
        const type = 'scaleChanged';

        this.addEventListener(type, listener);

    }

    get width() {

        if (!this._cachedWidth) {

            this._cachedWidth = this.geometry.parameters.width * this.mesh.getWorldScale(_v1).x;

        }

        return this._cachedWidth;

    }

    get height() {

        if (!this._cachedHeight) {

            this._cachedHeight = this.geometry.parameters.height * this.mesh.getWorldScale(_v1).y;

        }

        return this._cachedHeight;

    }
    
    updateTexScale() {

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