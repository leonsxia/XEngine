import { Mesh, MeshPhongMaterial, TextureLoader, SRGBColorSpace } from 'three';
import { BasicObject } from './BasicObject';
import { specular } from './colorBase';
import { SPHERE } from '../utils/constants';

class Sphere extends BasicObject {

    constructor(specs) {

        super(SPHERE, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

    }

    async init() {

        const { surfaceMap, normalMap, specularMap } = this.specs;

        if (surfaceMap?.isTexture || normalMap?.isTexture || specularMap?.isTexture) {

            const _map = specularMap?.clone();
            const _normalMap = normalMap?.clone();
            const _specularMap = specularMap?.clone();

            if (surfaceMap) _map.colorSpace = SRGBColorSpace;

            this.resetTextureColor();
            this.material.map = _map;
            this.material.normalMap = _normalMap;
            this.material.specularMap = _specularMap;

            return;

        }

        if (surfaceMap || normalMap || specularMap) {

            const loader = new TextureLoader();

            const [surfaceT, normalT, specularT] = await Promise.all([
                surfaceMap ? loader.loadAsync(surfaceMap) : Promise.resolve(null),
                normalMap ? loader.loadAsync(normalMap) : Promise.resolve(null),
                specularMap ? loader.loadAsync(specularMap) : Promise.resolve(null)
            ]);


            if (surfaceT) {
                
                this.resetTextureColor();
                surfaceT.colorSpace = SRGBColorSpace;
                this.material.map = surfaceT;
            
            }

            if (normalT) this.material.normalMap = normalT;
            if (specularT) this.material.specularMap = specularT;

        }
        
    }
}

export { Sphere };