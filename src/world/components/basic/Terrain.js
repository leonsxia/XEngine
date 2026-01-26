import { Mesh, Vector3 } from 'three';
import { BasicObject } from './BasicObject';
import { TERRAIN } from '../utils/constants';
import { Logger } from '../../systems/Logger';
import { updateTerrainGeometry } from '../utils/geometryHelper';

const DEBUG = false;
const _v1 = new Vector3();

class Terrain extends BasicObject {

    isTerrain = true;

    _cachedWidth;
    _cachedHeight;

    #logger = new Logger(DEBUG, 'Terrain');

    constructor(specs) {

        specs.useStandardMaterial = true;
        super(TERRAIN, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;
        this.mesh.father = this;

        this.bindEvents();

    }

    async init () {

        const initPromises = [];
        initPromises.push(this.initBasic());

        const {
            aoMap, roughMap, roughness = 1, metalMap, metalness = 0,
            dispMap, displacementScale = 1, useHeightmap = false,
            repeatU = 1, repeatV = 1, height = 1
        } = this.specs;

        if (aoMap?.isTexture) {

            const _map = aoMap.clone();
            this.setTexture(_map);
            this.material.aoMap = _map;

        }

        if (roughMap?.isTexture) {

            const _map = roughMap.clone();
            this.setTexture(_map);
            this.material.roughnessMap = _map;

        }

        if (metalMap?.isTexture) {

            const _map = metalMap.clone();
            this.setTexture(_map);
            this.material.metalnessMap = _map;

        }

        if (dispMap?.isTexture) {

            const _map = dispMap.clone();
            // this.setTexture(dispMap);
            // this.material.displacementMap = _map;

            if (useHeightmap) {

                updateTerrainGeometry(this.geometry, _map, this.material, [repeatU, repeatV], height);

            }

        }

        initPromises.push(aoMap && !aoMap.isTexture ? this.loader.loadAsync(aoMap) : Promise.resolve(null));
        initPromises.push(roughMap && !roughMap.isTexture ? this.loader.loadAsync(roughMap) : Promise.resolve(null));
        initPromises.push(metalMap && !metalMap.isTexture ? this.loader.loadAsync(metalMap) : Promise.resolve(null));
        initPromises.push(dispMap && !dispMap.isTexture ? this.loader.loadAsync(dispMap) : Promise.resolve(null));

        const [ao, rough, metal, disp] = await Promise.all(initPromises);

        if (ao) {

            this.setTexture(ao);
            this.material.aoMap = ao;

        }

        if (rough) {

            this.setTexture(rough);
            this.material.roughnessMap = rough;

        }

        if (metal) {

            this.setTexture(metal);
            this.material.metalnessMap = metal;

        }

        if (disp) {

            // this.setTexture(disp);
            // this.material.displacementMap = disp;

            if (useHeightmap) {

                updateTerrainGeometry(this.geometry, disp, this.material, [repeatU, repeatV], height);

            }

        }

        this.material.roughness = roughness;
        this.material.metalness = metalness;
        this.material.displacementScale = displacementScale;

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

    syncRapierWorld() {

        super.syncRapierWorld();
        this.addRapierInfo();

        return this;

    }

    addRapierInfo() {

        this.mesh.userData.physics.collider.isTerrain = true;
        this.mesh.userData.physics.collider.name = `${this.name}_collider`;

    }

}

export { Terrain };