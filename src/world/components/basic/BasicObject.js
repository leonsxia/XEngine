import { PlaneGeometry, BoxGeometry, SphereGeometry, CircleGeometry, CylinderGeometry, CapsuleGeometry, MeshPhongMaterial, SRGBColorSpace, Vector3, MeshBasicMaterial, MathUtils, EventDispatcher, Quaternion, MeshStandardMaterial } from 'three';
// eslint-disable-next-line no-unused-vars
import { NearestFilter, LinearFilter, NearestMipMapNearestFilter, NearestMipMapLinearFilter, LinearMipMapNearestFilter, LinearMipMapLinearFilter } from 'three';
import { createTriangleGeometry, createStairsSideGeometry, createStairsFrontGeometry, createStairsTopGeometry, generateTerrainGeometry } from '../utils/geometryHelper';
import { worldTextureLoader } from '../utils/textureHelper';
import { basicMaterials } from './basicMaterial';
import { white } from './colorBase';
import { REPEAT_WRAPPING } from '../utils/constants';
import { PLANE, BOX, SPHERE, CIRCLE, CYLINDER, TRIANGLE, STAIRS_SIDE, STAIRS_FRONT, STAIRS_TOP, WATER_PLANE, TERRAIN, CAPSULE } from '../utils/constants';

const _v1 = new Vector3();
const _v2 = new Vector3();
const _q1 = new Quaternion();

class BasicObject extends EventDispatcher {
    
    geometry = null;
    material = null;
    mesh = null;
    name = '';
    loader = worldTextureLoader;
    type;
    specs;

    constructor(type, specs) {

        super();

        const { name, empty } = specs;

        if (name) this.name = name;

        this.specs = specs;
        this.type = type;

        if (empty) return this;

        switch (type) {
            case PLANE:
            case WATER_PLANE:
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
            case TERRAIN:
                {
                    const { width, depth, height = 1, segmentW, segmentD, useHeightmap = false } = specs;
                    const geometry = !useHeightmap ? 
                        generateTerrainGeometry(width, depth, height, segmentW, segmentD).geometry : 
                        new PlaneGeometry(width, depth, segmentW, segmentD);
                    this.geometry = geometry;
                }
                break;
            case CAPSULE:
                {
                    const { radius, height, capSegments = 4, radialSegments = 8 } = specs;
                    this.geometry = new CapsuleGeometry(radius, height, capSegments, radialSegments);
                }
                break;
        }

        this.setupMaterials('material');

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

    setupMaterials(...materials) {

        const { needMaterial = true, transparent = false, useBasicMaterial = false, useStandardMaterial = false, color } = this.specs;

        for (let i = 0, il = materials.length; i < il; i++) {

            if (needMaterial) {

                if (color) {

                    if (useBasicMaterial) {

                        this[materials[i]] = new MeshBasicMaterial({ color: color });

                    } else if (useStandardMaterial) {

                        this[materials[i]] = new MeshStandardMaterial({ color: color });

                    } else {

                        this[materials[i]] = new MeshPhongMaterial({ color: color });

                    }

                } else {

                    if (useStandardMaterial) {

                        this[materials[i]] = basicMaterials.standard.clone();

                    } else {

                        this[materials[i]] = basicMaterials.basic.clone();

                    }

                }

                this[materials[i]].transparent = transparent;

            }

        }

    }

    // inherited by child class
    update() {}

    // inherited by child class
    updateTexScale() {}

    get rotationXDegree() {

        return MathUtils.radToDeg(this.mesh.rotation.x);

    }

    set rotationXDegree(value) {

        this.mesh.rotation.x = MathUtils.degToRad(value);

    }

    get rotationYDegree() {

        return MathUtils.radToDeg(this.mesh.rotation.y);

    }

    set rotationYDegree(value) {

        this.mesh.rotation.y = MathUtils.degToRad(value);

    }

    get rotationZDegree() {

        return MathUtils.radToDeg(this.mesh.rotation.z);

    }

    set rotationZDegree(value) {

        this.mesh.rotation.z = MathUtils.degToRad(value);

    }

    get rotationTDegree() {

        const { rotationT = 0 } = this.specs;
        return MathUtils.radToDeg(rotationT);

    }

    set rotationTDegree(val) {

        this.specs.rotationT =  MathUtils.degToRad(val);

        this.updateTextures();

    }

    get rotationT() {

        const { rotationT = 0 } = this.specs;
        return rotationT;

    }

    set rotationT(val) {

        this.specs.rotationT = val;

        this.updateTextures();

    }

    get repeatU() {

        const { repeatU = 1 } = this.specs;
        return repeatU;

    }

    set repeatU(val) {

        this.specs.repeatU = val;

        this.updateTextures();

    }

    get repeatV() {

        const { repeatV = 1 } = this.specs;
        return repeatV;

    }

    set repeatV(val) {

        this.specs.repeatV = val;

        this.updateTextures();

    }

    get worldPosition() {

        return this.mesh.getWorldPosition(new Vector3());

    }

    getWorldPosition(target) {

        return this.mesh.getWorldPosition(target);

    }

    get scale() {

        return this.mesh.scale;

    }

    get scaleX() {

        return this.mesh.scale.x;

    }

    set scaleX(val) {

        this.mesh.scale.x = val;

        this.dispatchEvent({ type: 'scaleChanged', message: 'basic object scale x changed' });

        this.update();

    }

    get scaleY() {

        return this.mesh.scale.y;

    }

    set scaleY(val) {

        this.mesh.scale.y = val;

        this.dispatchEvent({ type: 'scaleChanged', message: 'basic object scale y changed' });

        this.update();

    }

    get roughness() {

        return this.material.roughness;

    }

    set roughness(val) {

        this.material.roughness = val;

    }

    get metalness() {

        return this.material.metalness;

    }

    set metalness(val) {

        this.material.metalness = val;

    }

    get visible() {

        return this.mesh.visible;

    }

    set visible(val) {

        this.mesh.visible = val;

        this.dispatchEvent({ type: 'visibleChanged', message: 'basic object visible changed' });
        
    }

    setLayers(layer, force = false) {

        if (this.visible || force) {

            this.mesh.layers.enable(layer);

        } else {

            this.mesh.layers.disable(layer);

        }

    }

    setConfig(specs) {

        Object.assign(this.specs, specs);

        return this;

    }

    updateTextures() {

        const map = this.material?.map;
        const mapNorm = this.material?.normalMap;

        if (map) {

            this.setTexture(map);

        }

        if (mapNorm) {

            this.setTexture(mapNorm);

        }

        return this;

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

        if (rotationT !== null && rotationT !== undefined) {

            texture.center.set(.5, .5);
            texture.rotation = rotationT;

        } else {

            texture.center.set(0, 0);
            texture.rotation = 0;

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

            if (repeatU || repeatV) {

                texture.wrapS = repeatModeU;   // horizontal
                texture.wrapT = repeatModeV;   // vertical

                const u = repeatU ?? 1;
                const v = repeatV ?? 1;
                this.specs.repeatU = u;
                this.specs.repeatV = v;

                texture.repeat.set(u, v);

            } else if (mapRatio) {

                let w, h, basic;

                switch(this.type) {
                    case PLANE:
                    case WATER_PLANE:
                    case TRIANGLE:
                    case STAIRS_SIDE:
                    case STAIRS_FRONT:
                    case STAIRS_TOP:

                        {
                            const { texScale = [1, 1] } = this.specs;
                            let { width, height } = this.specs;
                            width *= texScale[0];
                            height *= texScale[1];

                            const { baseSize = height } = this.specs;

                            w = width;
                            h = height;
                            basic = baseSize;
                        }

                        break;

                    case BOX:

                        {
                            const { texScale = [1, 1] } = this.specs;
                            let { size: { width, height } } = this.specs;
                            width *= texScale[0];
                            height *= texScale[1];

                            const { baseSize = height } = this.specs;

                            w = width;
                            h = height;
                            basic = baseSize;
                        }

                        break;
                        
                    case CIRCLE:

                        {
                            const {texScale = [1]} = this.specs;
                            let { radius } = this.specs;
                            radius *= texScale[0];

                            const { baseSize = radius * 2 } = this.specs;

                            w = h = radius * 2;
                            basic = baseSize;
                        }

                        break;

                    case CYLINDER:

                        if (!texture.isCap) {

                            const { texScale = [1, 1] } = this.specs;
                            let { radius, height } = this.specs;
                            radius *= texScale[0];
                            height *= texScale[1];

                            const { baseSize = height } = this.specs;

                            w = 2 * Math.PI * radius;
                            h = height;
                            basic = baseSize;

                        } else {

                            const { texScale = [1, 1] } = this.specs;
                            let { radius } = this.specs;
                            radius *= texScale[0];

                            const { baseSize = radius * 2 } = this.specs;

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

        this.dispatchEvent({ type: 'scaleChanged', message: 'basic object scale changed' });

        return this;

    }

    setScaleFullUpdate(scale) {

        this.setScale(scale);

        this.update();

        return this;

    }

    setScaleWithTexUpdate(scale) {

        this.setScale(scale);

        this.updateTexScale();

        return this;

    }

    setName(name) {

        this.mesh.name = `${name}_mesh`;;
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

    // rapier function
    // events
    onRapierInstanceRemoved;
    onRapierInstanceAdded;

    syncRapierWorld(force = false) {

        if (this.mesh.userData.physics) {

            if (force || !this.onRapierInstanceRemoved || !this.onRapierInstanceAdded) {

                const { body } = this.mesh.userData.physics;

                if (body) {

                    this.mesh.updateWorldMatrix(true, false);
                    this.mesh.matrixWorld.decompose(_v1, _q1, _v2);
                    body.setTranslation(_v1);
                    body.setRotation(_q1);

                }

            } else if (this.onRapierInstanceAdded && this.onRapierInstanceRemoved) {

                this.onRapierInstanceRemoved(this);
                this.onRapierInstanceAdded(this);

            }

        }

        return this;

    }

    setupRapierPhysics({ mass = 0, restitution = 0, friction = 0 } = {}) {

        this.mesh.userData.physics = { mass, restitution, friction };

    }

    // inherited by children
    addRapierInfo() {}

}

export { BasicObject };