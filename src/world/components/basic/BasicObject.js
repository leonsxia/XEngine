import { PlaneGeometry, BoxGeometry, SphereGeometry, CircleGeometry, MeshPhongMaterial, TextureLoader, SRGBColorSpace, Vector3, RepeatWrapping, MirroredRepeatWrapping, Color } from 'three';
import { createTriangleGeometry, createStairsSideGeometry, createStairsFrontGeometry, createStairsTopGeometry } from '../utils/geometryHelper';
import { basicMateraials } from './basicMaterial';
import { white } from './colorBase';
import { REPEAT, MIRRORED_REPEAT } from '../utils/constants';
import { PLANE, BOX, SPHERE, CIRCLE, TRIANGLE, STAIRS_SIDE, STAIRS_FRONT, STAIRS_TOP } from '../utils/constants';

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
            case PLANE:
                {
                    const { width, height } = specs;
                    this.geometry = new PlaneGeometry(width, height);
                }
                break;
            case BOX:
                {
                    const { size: { width, height, depth } } = specs;
                    this.geometry = new BoxGeometry(width, height, depth);
                }
                break;
            case SPHERE:
                {
                    const { size: { radius, widthSegments, heightSegments } } = specs;
                    this.geometry = new SphereGeometry(radius, widthSegments, heightSegments);
                }
                break;
            case CIRCLE:
                {
                    const { radius, segments } = specs;
                    this.geometry = new CircleGeometry(radius, segments);
                }
                break;
            case TRIANGLE:
                {
                    const { width, height, leftHanded } = specs;
                    this.geometry = createTriangleGeometry(width, height, leftHanded);
                }
                break;
            case STAIRS_SIDE:
                {
                    this.geometry = createStairsSideGeometry(specs);
                }
                break;
            case STAIRS_FRONT:
                {
                    this.geometry = createStairsFrontGeometry(specs);
                }
                break;
            case STAIRS_TOP:
                {
                    this.geometry = createStairsTopGeometry(specs);
                }
                break;
        }

        if (color) 
            this.material = new MeshPhongMaterial({ color: color });
        else
            this.material = basicMateraials.basic.clone();

    }

    async initBasic() {

        const { map, normalMap } = this.specs;

        if (map?.isTexture || normalMap?.isTexture) {

            const _map = map?.clone();
            const _normalMap = normalMap?.clone();

            this.resetTextureColor();
            this.material.map = _map;
            this.material.normalMap = _normalMap;

            return;

        }

        if (map || normalMap) {

            const loader = new TextureLoader();

            const [texture, normal] = await Promise.all([
                map ? loader.loadAsync(map) : Promise.resolve(null),
                normalMap ? loader.loadAsync(normalMap) : Promise.resolve(null)
            ]);

            if (texture) {

                texture.colorSpace = SRGBColorSpace;
                this.material.map = texture;

            }

            if (normal) {

                this.material.normalMap = normal;

            }

        }

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

    resetTextureColor() {

        this.material.color = new Color(white);

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

        return this;

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