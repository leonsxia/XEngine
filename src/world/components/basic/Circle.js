import { Mesh, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { BasicObject } from './BasicObject';
import { REPEAT } from '../utils/constants';

class Circle extends BasicObject {

    constructor(specs) {

        super('circle', specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

    }

    async init() {

        const { map, normalMap } = this.specs;

        const [texture, normal] = await Promise.all([
            map ? new TextureLoader().loadAsync(map) : Promise.resolve(null),
            normalMap ? new TextureLoader().loadAsync(normalMap) : Promise.resolve(null)
        ]);

        if (texture) {

            this.setTextureCircle(texture);
            
        }

        if (normal) {

            this.setTextureCircle(normal);

        }

        if (texture || normal) 
            this.mesh.material = new MeshPhongMaterial({ map: texture, normalMap: normal });

    }

    setTextureCircle(texture) {

        const { rotationT, noRepeat = false, repeatU, repeatV, repeatModeU = REPEAT, repeatModeV = REPEAT, mapRatio } = this.specs;

        texture.colorSpace = SRGBColorSpace;

        if (rotationT) {

            texture.center.set(.5, .5);
            texture.rotation = rotationT;

        }

        if (!noRepeat) {

            if (repeatU && repeatV) {

                const modeU = this.getRepeatMode(repeatModeU)
                const modeV = this.getRepeatMode(repeatModeV)

                texture.wrapS = modeU;   // horizontal
                texture.wrapT = modeV;   // vertical

                texture.repeat.set(repeatU, repeatV);

            } else if (mapRatio) {

                const { radius } = this.specs;

                const xRepeat = radius * 2 / (mapRatio * radius * 2);
                const yRepeat = 1;

                texture.wrapS = RepeatWrapping;
                texture.wrapT = RepeatWrapping;

                texture.repeat.set(xRepeat, yRepeat);

            }
        }

    }
}

export { Circle };