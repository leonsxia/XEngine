import { Mesh, Vector3 } from 'three';
import { BasicObject } from './BasicObject';
import { TERRAIN } from '../utils/constants';
import { Logger } from '../../systems/Logger';
import { getTerrainGeometry, updateTerrainGeometry } from '../utils/geometryHelper';

const DEBUG = false;
const _v1 = new Vector3();

class Terrain extends BasicObject {

    isTerrain = true;

    _width;
    _depth;
    _height;

    _repeatU;
    _repeatV;
    _offsetX;
    _offsetY;

    _segmentW;
    _segmentD;
    _displacementMap;

    #logger = new Logger(DEBUG, 'Terrain');

    constructor(specs) {

        specs.useStandardMaterial = true;
        super(TERRAIN, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;
        this.mesh.father = this;

        this.updateSize();
        this.updateSegments();
        this.updateTexRepeat();
        this.updateTexOffset();
        this.bindOnBeforeSync();
        this.bindEvents();

    }

    async init () {

        const initPromises = [];
        initPromises.push(this.initBasic());

        const {
            dispMap, displacementScale = 1, useHeightmap = false,
            repeatU = 1, repeatV = 1, offsetX = 0, offsetY = 0, height = 1
        } = this.specs;

        if (dispMap?.isTexture) {

            const _map = dispMap.clone();
            // this.setTexture(_map);
            // this.material.displacementMap = _map;

            if (useHeightmap) {

                updateTerrainGeometry(this.geometry, _map, this.material, [repeatU, repeatV], [offsetX, offsetY], height);

            }

            this._displacementMap = _map;

        }

        initPromises.push(dispMap && !dispMap.isTexture ? this.loader.loadAsync(dispMap) : Promise.resolve(null));

        const [disp] = await Promise.all(initPromises);

        if (disp) {

            // this.setTexture(disp);
            // this.material.displacementMap = disp;

            if (useHeightmap) {

                updateTerrainGeometry(this.geometry, disp, this.material, [repeatU, repeatV], [offsetX, offsetY], height);

            }

            this._displacementMap = disp;

        }

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
    
    updateTexScale() {

        this.setConfig({ texScale: [this.scale.x, this.scale.y] })
            .updateTextures();

    }

    updateSize() {

        const { width, depth, height } = this.specs;
        this._width = width;
        this._depth = depth;
        this._height = height;

    }

    updateSegments() {

        const { segmentW, segmentD } = this.specs;
        this._segmentW = segmentW;
        this._segmentD = segmentD;

    }

    updateTexRepeat() {

        const { repeatU, repeatV } = this.specs;
        this._repeatU = repeatU;
        this._repeatV = repeatV;

    }

    updateTexOffset() {

        const { offsetX, offsetY } = this.specs;
        this._offsetX = offsetX;
        this._offsetY = offsetY;

    }

    bindOnBeforeSync() {

        this.onBeforeSync = () => {

            const { width, depth, height, segmentW, segmentD, repeatU, repeatV, offsetX, offsetY } = this.specs;
            if (
                this._width !== width || this._depth !== depth || this._height !== height ||
                this._segmentW !== segmentW || this._segmentD !== segmentD ||
                this._repeatU !== repeatU || this._repeatV !== repeatV ||
                this._offsetX !== offsetX || this._offsetY !== offsetY
            ) {

                const { useHeightmap = false, repeatU = 1, repeatV = 1, offsetX = 0, offsetY = 0, height = 1 } = this.specs;
                const geometry = getTerrainGeometry(this.specs);
                if (useHeightmap) {

                    updateTerrainGeometry(geometry, this._displacementMap, this.material, [repeatU, repeatV], [offsetX, offsetY], height);

                }

                this.mesh.geometry = geometry;
                this.geometry.dispose();
                this.geometry = geometry;

                this.updateSize();
                this.updateSegments();
                this.updateTexRepeat();
                this.updateTexOffset();
                this.updateTextures();

            }

        }

    }

    syncRapierWorld() {

        super.syncRapierWorld();
        this.addRapierInfo();

        return this;

    }

    addRapierInfo() {

        if (!this.mesh.userData.physics) return this;

        this.mesh.userData.physics.collider.isTerrain = true;
        this.mesh.userData.physics.collider.name = `${this.name}_collider`;

        return this;

    }

}

export { Terrain };