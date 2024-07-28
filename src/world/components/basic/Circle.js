import { Mesh, MeshPhongMaterial, TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { BasicObject } from './BasicObject';
import { REPEAT } from '../utils/constants';
import { CIRCLE } from '../utils/constants';

class Circle extends BasicObject {

    constructor(specs) {

        super(CIRCLE, specs);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = specs.name;

    }

    async init() {

        const { map, normalMap } = this.specs;
        
        if (map?.isTexture || normalMap?.isTexture) {

            const _map = map?.clone();
            const _normalMap = normalMap?.clone();

            this.resetTextureColor();

            if (map) {
                
                this.setTexture(_map);
                this.material.map = _map;

            }

            if (normalMap) {
                
                this.setTexture(_normalMap);
                this.material.normalMap = _normalMap;
            
            }

            return;

        }

        if (map || normalMap) {
            const loader = new TextureLoader();

            const [texture, normal] = await Promise.all([
                map ? loader.loadAsync(map) : Promise.resolve(null),
                normalMap ? loader.loadAsync(normalMap) : Promise.resolve(null)
            ]);

            this.resetTextureColor();
            
            if (texture) {

                this.setTextureCircle(texture);
                this.material.map = texture;

            }

            if (normal) {

                this.setTextureCircle(normal);
                this.material.normalMap = normal;

            }
        }

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