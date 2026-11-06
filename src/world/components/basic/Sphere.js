import { Mesh, SRGBColorSpace } from 'three';
import { BasicObject } from './BasicObject';
import { specular } from './colorBase';
import { SPHERE } from '../utils/constants';
import { loadSingleTexture } from '../../systems/resources/helpers/TextureHelper';

class Sphere extends BasicObject {

    constructor(specs) {

        super(SPHERE, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

        this.mesh.father = this;

    }

    async init() {

        const { surfaceMap, normalMap, specularMap } = this.specs;

        const [surfaceT, normalT, specularT] = await Promise.all([
            loadSingleTexture(surfaceMap, null, true),
            loadSingleTexture(normalMap, null, true),
            loadSingleTexture(specularMap, null, true)
        ]);

        if (surfaceT) {

            this.resetTextureColor();
            surfaceT.colorSpace = SRGBColorSpace;
            this.material.map = surfaceT;

        }

        if (normalT) {

            this.material.normalMap = normalT;

        }

        if (specularT) {

            this.resetTextureColor();
            specularT.colorSpace = SRGBColorSpace;
            this.material.specularMap = specularT;

        }

        this.material.specular.setHex(specular);
        
    }

}

export { Sphere };