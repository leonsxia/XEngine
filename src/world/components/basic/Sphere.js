import { Mesh, SRGBColorSpace } from 'three';
import { BasicObject } from './BasicObject';
import { specular } from './colorBase';
import { SPHERE } from '../utils/constants';

class Sphere extends BasicObject {

    constructor(specs) {

        super(SPHERE, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

        this.mesh.father = this;

    }

    async init() {

        const { surfaceMap, normalMap, specularMap } = this.specs;
        let mapLoaded = false;
        let normalLoaded = false;
        let specularLoaded = false;

        if (surfaceMap?.isTexture) {

            const _map = surfaceMap.clone();

            this.resetTextureColor();
            _map.colorSpace = SRGBColorSpace;
            this.material.map = _map;

            mapLoaded = true;

        }

        if (normalMap?.isTexture) {

            const _normalMap = normalMap.clone();

            this.resetTextureColor();
            this.material.normalMap = _normalMap;

            normalLoaded = true;

        }

        if (specularMap?.isTexture) {

            const _specularMap = specularMap.clone();

            this.resetTextureColor();
            this.material.specularMap = _specularMap;

            specularLoaded = true;

        }

        this.material.specular.setHex(specular);

        if (mapLoaded && normalLoaded && specularLoaded) {

            return;

        }
        
        const loadPromises = [];

        loadPromises.push(surfaceMap && !surfaceMap.isTexture ? this.loader.loadAsync(surfaceMap) : Promise.resolve(null));
        loadPromises.push(normalMap && !normalMap.isTexture ? this.loader.loadAsync(normalMap) : Promise.resolve(null));
        loadPromises.push(specularMap && !specularMap.isTexture ? this.loader.loadAsync(specularMap) : Promise.resolve(null));

        const [surfaceT, normalT, specularT] = await Promise.all(loadPromises);

        if (surfaceT) {

            this.resetTextureColor();
            surfaceT.colorSpace = SRGBColorSpace;
            this.material.map = surfaceT;

        }

        if (normalT) {

            this.resetTextureColor();
            this.material.normalMap = normalT;

        }

        if (specularT) {

            this.resetTextureColor();
            this.material.specularMap = specularT;

        }
        
    }
}

export { Sphere };