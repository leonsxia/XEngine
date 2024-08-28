import { PlaneGeometry, BoxGeometry, SphereGeometry, CircleGeometry, CylinderGeometry, MeshPhongMaterial, SRGBColorSpace, Vector3, MeshBasicMaterial } from 'three';
import { NearestFilter, LinearFilter, NearestMipMapNearestFilter, NearestMipMapLinearFilter, LinearMipMapNearestFilter, LinearMipMapLinearFilter } from 'three';
import { createTriangleGeometry, createStairsSideGeometry, createStairsFrontGeometry, createStairsTopGeometry } from '../utils/geometryHelper';
import { worldTextureLoader } from '../utils/textureHelper';
import { basicMateraials } from './basicMaterial';
import { white } from './colorBase';
import { REPEAT_WRAPPING } from '../utils/constants';
import { PLANE, BOX, SPHERE, CIRCLE, CYLINDER, TRIANGLE, STAIRS_SIDE, STAIRS_FRONT, STAIRS_TOP } from '../utils/constants';

class BasicObject {
    
    geometry = null;
    material = null;
    mesh = null;
    name = '';
    loader = worldTextureLoader;
    type;
    specs;

    constructor(type, specs) {

        const { name, color, empty } = specs;

        if (name) this.name = name;

        this.specs = specs;
        this.type = type;

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
            case CYLINDER:
                {
                    const { radius, height, segments } = specs;
                    this.geometry = new CylinderGeometry(radius, radius, height, segments);
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

        const { transparent = false } = specs;

        if (color) {

            const { useBasicMaterial = false } = specs;

            if (useBasicMaterial) {

                this.material = new MeshBasicMaterial({ color: color });

            } else {

                this.material = new MeshPhongMaterial({ color: color });

            }
            
        }
        else
            this.material = basicMateraials.basic.clone();

        this.material.transparent = transparent;

    }

    async initBasic() {

        const { map, normalMap } = this.specs;
        let mapLoaded = false;
        let normalLoaded = false;

        if (map?.isTexture) {

            const _map = map.clone();

            this.resetTextureColor();
            this.setTexture(_map);
            this.material.map = _map;

            mapLoaded = true;

        }

        if (normalMap?.isTexture) {

            const _normalMap = normalMap.clone();

            this.resetTextureColor();
            this.setTexture(_normalMap, true);
            this.material.normalMap = _normalMap;

            normalLoaded = true;

        }

        if (mapLoaded && normalLoaded) {

            return;

        }
        
        const loadPromises = [];

        loadPromises.push(map && !map.isTexture ? this.loader.loadAsync(map) : Promise.resolve(null));
        loadPromises.push(normalMap && !normalMap.isTexture ? this.loader.loadAsync(normalMap) : Promise.resolve(null));

        const [texture, normal] = await Promise.all(loadPromises);

        if (texture) {

            this.resetTextureColor();
            this.setTexture(texture);
            this.material.map = texture;

        }

        if (normal) {

            this.resetTextureColor();
            this.setTexture(normal, true);
            this.material.normalMap = normal;

        }

    }

    get worldPosition() {

        const target = new Vector3();

        this.mesh.getWorldPosition(target);

        return target;

    }

    setTexture(texture, isNormal = false) {

        const { 
            rotationT, 
            noRepeat = false, repeatU, repeatV, repeatModeU = REPEAT_WRAPPING, repeatModeV = REPEAT_WRAPPING, 
            offsetX = 0, offsetY = 0,
            mapRatio 
        } = this.specs;

        if (!isNormal) {

            texture.colorSpace = SRGBColorSpace;
            
        }

        if (rotationT) {

            texture.center.set(.5, .5);
            texture.rotation = rotationT;

        }

        if (offsetX > 0 || offsetY > 0) {

            texture.offset.set(offsetX, offsetY);

        }

        if (!isNormal) {

            texture.minFilter = LinearMipMapLinearFilter;

        } else {

            texture.minFilter = NearestMipMapLinearFilter;
        }

        if (!noRepeat) {

            if (repeatU && repeatV) {

                texture.wrapS = repeatModeU;   // horizontal
                texture.wrapT = repeatModeV;   // vertical

                texture.repeat.set(repeatU, repeatV);

            } else if (mapRatio) {

                let w, h, basic;

                switch(this.type) {
                    case PLANE:
                    case BOX:
                    case TRIANGLE:
                    case STAIRS_SIDE:
                    case STAIRS_FRONT:
                    case STAIRS_TOP:

                        {
                            let { width, height, baseSize = height } = this.specs;
                            w = width;
                            h = height;
                            basic = baseSize;
                        }

                        break;
                        
                    case CIRCLE:

                        {
                            let { radius, baseSize = radius * 2 } = this.specs;
                            w = h = radius * 2;
                            basic = baseSize;
                        }

                        break;

                    case CYLINDER:

                        if (!texture.isCap) { 

                            let { radius, height, baseSize = height} = this.specs;
                            w = 2 * Math.PI * radius;
                            h = height;
                            basic = baseSize;

                        } else {

                            let { radius, baseSize = radius * 2 } = this.specs;
                            w = h = radius * 2;
                            basic = baseSize;
                        }

                        break;
                }

                const xRepeat = w / (mapRatio * basic);
                const yRepeat = h / basic;

                texture.wrapS = REPEAT_WRAPPING;
                texture.wrapT = REPEAT_WRAPPING;
                texture.repeat.set(xRepeat, yRepeat);

            }
        }

    }

    resetTextureColor() {

        this.material.color.setHex(white);

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