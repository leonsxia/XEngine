import { Mesh, Vector3 } from 'three'
import { BasicObject } from './BasicObject';
import { BOX } from '../utils/constants';
import { Logger } from '../../systems/Logger';

const DEBUG = false;
const _v1 = new Vector3();

class Box extends BasicObject {

    _cachedWidth;
    _cachedHeight;
    _cachedDepth;

    #logger = new Logger(DEBUG, 'Box');

    constructor(specs) {

        specs.useStandardMaterial = specs.useStandardMaterial ?? true;
        super(BOX, specs);

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
            this._cachedDepth = this.geometry.parameters.depth * this.mesh.getWorldScale(_v1).z;

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

    get depth() {

        if (!this._cachedDepth) {

            this._cachedDepth = this.geometry.parameters.depth * this.mesh.getWorldScale(_v1).z;

        }

        return this._cachedDepth;

    }

    updateTexScale() {

        this.setConfig({ texScale: [this.scale.x, this.scale.y] })
            .updateTextures();

    }

}

export { Box };