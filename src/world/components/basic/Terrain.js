import { Mesh, Vector3 } from 'three';
import { BasicObject } from './BasicObject';
import { TERRAIN } from '../utils/constants';
import { Logger } from '../../systems/Logger';
import { updateTerrainGeometry } from '../utils/geometryHelper';

const DEBUG = false;
const _v1 = new Vector3();

class Terrain extends BasicObject {

    _cachedWidth;
    _cachedHeight;

    #logger = new Logger(DEBUG, 'Terrain');

    constructor(specs) {

        super(TERRAIN, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;
        this.mesh.father = this;

        this.bindEvents();

    }

    async init () {

        const initPromises = [];
        initPromises.push(this.initBasic());

        const { aoMap, dispMap, displacementScale = 1, useHeightmap = false, repeatU = 1, repeatV = 1 } = this.specs;

        if (aoMap?.isTexture) {

            const _map = aoMap.clone();
            this.setTexture(_map);
            this.material.aoMap = _map;

        }

        if (dispMap?.isTexture) {

            const _map = dispMap.clone();
            // this.setTexture(dispMap);
            // this.material.displacementMap = _map;
            this.material.displacementScale = displacementScale;

            if (useHeightmap) {

                updateTerrainGeometry(this.geometry, _map, this.material, [repeatU, repeatV]);

            }

        }

        initPromises.push(aoMap && !aoMap.isTexture ? this.loader.loadAsync(aoMap) : Promise.resolve(null));
        initPromises.push(dispMap && !dispMap.isTexture ? this.loader.loadAsync(dispMap) : Promise.resolve(null));

        const [, ao, disp] = await Promise.all(initPromises);

        if (ao) {

            this.setTexture(ao);
            this.material.aoMap = ao;

        }

        if (disp) {

            // this.setTexture(disp);
            // this.material.displacementMap = disp;
            this.material.displacementScale = displacementScale;

            if (useHeightmap) {

                updateTerrainGeometry(this.geometry, disp, this.material, [repeatU, repeatV]);

            }

        }

        
        
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

export { Terrain };