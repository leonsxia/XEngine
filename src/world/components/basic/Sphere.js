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

        const [surfaceT, normalT, specularT] = await Promise.all([
            surfaceMap ? new TextureLoader().loadAsync(surfaceMap) : Promise.resolve(null),
            normalMap ? new TextureLoader().loadAsync(normalMap) : Promise.resolve(null),
            specularMap ? new TextureLoader().loadAsync(specularMap) : Promise.resolve(null)
        ]);


        if (surfaceT) surfaceT.colorSpace = SRGBColorSpace;

        if (surfaceT || normalT || specularT) {

            this.mesh.material = this.material = new MeshPhongMaterial({ map: surfaceT, normalMap: normalT, specularMap: specularT, specular: specular });

        }
        
    }
}

export { Sphere };