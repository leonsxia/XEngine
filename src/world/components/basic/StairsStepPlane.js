import { Mesh, Vector3 } from 'three';
import { BasicObject } from './BasicObject';
import { Logger } from '../../systems/Logger';

const DEBUG = false;
const _v1 = new Vector3();

class StairsStepPlane extends BasicObject {

    _cachedWidth;
    _cachedHeight;

    #logger = new Logger(DEBUG, 'StairsStepPlane');

    constructor(specs) {

        super(specs.type, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

        this.mesh.father = this;

        this.bindEvents();
        
    }

    async init () {

        this.initBasic();

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

}

export { StairsStepPlane };