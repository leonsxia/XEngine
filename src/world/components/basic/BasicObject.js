import { PlaneGeometry, BoxGeometry, SphereGeometry, CircleGeometry, MeshStandardMaterial, MeshPhongMaterial, TextureLoader, SRGBColorSpace, Vector3, RepeatWrapping, MirroredRepeatWrapping } from 'three';
import { createTriangleGeometry, createStairsSideGeometry, createStairsFrontGeometry, createStairsTopGeometry } from '../utils/geometryHelper';
import { basicMateraials } from './basicMaterial';
import { REPEAT, MIRRORED_REPEAT } from '../utils/constants';

class BasicObject {
    geometry = null;
    material = null;
    mesh = null;
    name = '';
    specs;

    constructor(type, specs) {
        const { name, color, empty } = specs;

        if (name) this.name = name;

        this.specs = specs;

        if (empty) return this;

        switch (type) {
            case 'plane':
                {
                    const { width, height } = specs;
                    this.geometry = new PlaneGeometry(width, height);
                }
                break;
            case 'box':
                {
                    const { size: { width, height, depth } } = specs;
                    this.geometry = new BoxGeometry(width, height, depth);
                }
                break;
            case 'sphere':
                {
                    const { size: { radius, widthSegments, heightSegments } } = specs;
                    this.geometry = new SphereGeometry(radius, widthSegments, heightSegments);
                }
                break;
            case 'circle':
                {
                    const { radius, segments } = specs;
                    this.geometry = new CircleGeometry(radius, segments);
                }
                break;
            case 'triangle':
                {
                    const { width, height, leftHanded } = specs;
                    this.geometry = createTriangleGeometry(width, height, leftHanded);
                }
                break;
            case 'stairsSide':
                {
                    this.geometry = createStairsSideGeometry(specs);
                }
                break;
            case 'stairsFront':
                {
                    this.geometry = createStairsFrontGeometry(specs);
                }
                break;
            case 'stairsTop':
                {
                    this.geometry = createStairsTopGeometry(specs);
                }
                break;
        }

        if (color) 
            this.material = new MeshPhongMaterial({ color: color });
        else
            this.material = basicMateraials.basic;

    }

    async initBasic() {

        const { map, normalMap } = this.specs;

        const [texture, normal] = await Promise.all([
            map ? new TextureLoader().loadAsync(map) : Promise.resolve(null),
            normalMap ? new TextureLoader().loadAsync(normalMap) : Promise.resolve(null)
        ]);

        if (texture) {
            
            texture.colorSpace = SRGBColorSpace;

        }

        if (texture || normal) 
            this.mesh.material = this.material = new MeshStandardMaterial({ map: texture, normalMap: normal });

    }

    get worldPosition() {

        const target = new Vector3();

        this.mesh.getWorldPosition(target);

        return target;

    }

    getRepeatMode(mode) {
        let repeat;

        switch(mode) {
            case REPEAT:

                repeat = RepeatWrapping;

                break;

            case MIRRORED_REPEAT:

                repeat = MirroredRepeatWrapping;

                break;
        }

        return repeat;
    }

    setTexture(texture) {

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

                const { width, height } = this.specs;

                const xRepeat = width / (mapRatio * height);

                texture.wrapS = RepeatWrapping;
                texture.repeat.set(xRepeat, 1);

            }
        }

    }

    setPosition(pos) {

        this.mesh.position.set(...pos);

        return this;

    }

    setRotation(rot) {

        this.mesh.rotation.set(...rot);

        return this;

    }

    setScale(scale) {

        this.mesh.scale.set(...scale);

        return this;

    }

    setName(name) {

        this.mesh.name = name;;
        this.name = name;

        return this;

    }

    setTransparent(transparent, opacity) {

        this.material.transparent = transparent;
        this.material.opacity = opacity;

        return this;

    }

    setWireframe(show) {

        this.material.wireframe = show;

    }

    castShadow(cast) {

        this.mesh.castShadow = cast;

        return this;

    }

    receiveShadow(receive) {

        this.mesh.receiveShadow = receive;

        return this;

    }
}

export { BasicObject };