import { Mesh } from 'three';
import { BasicObject } from './BasicObject';
import { CYLINDER } from '../utils/constants';
import { white } from './colorBase';

class Cylinder extends BasicObject {

    topMaterial;
    bottomMaterial;

    constructor(specs) {

        super(CYLINDER, specs);

        this.setupMaterials('topMaterial', 'bottomMaterial');

        this.mesh = new Mesh(this.geometry, [this.material, this.topMaterial, this.bottomMaterial]);
        this.mesh.name = specs.name;

        this.mesh.father = this;

    }

    async init() {

        const { topMap, topNormal } = this.specs;
        const { bottomMap, bottomNormal } = this.specs;

        await Promise.all([
            this.initBasic(),
            this.initCap(topMap, topNormal, true),
            this.initCap(bottomMap, bottomNormal)
        ]);

    }

    async initCap(map, normalMap, isTop = false) {

        let material;

        if (isTop)
            material = this.topMaterial;
        else
            material = this.bottomMaterial;

        let mapLoaded = false;
        let normalLoaded = false;

        if (map?.isTexture) {

            const _map = map.clone();

            material.color.setHex(white);
            _map.isCap = true;
            this.setTexture(_map);
            this.setCapRotation(_map);

            material.map = _map;

            mapLoaded = true;

        }

        if (normalMap?.isTexture) {

            const _normal = normalMap.clone();

            material.color.setHex(white);
            _normal.isCap = true;
            this.setTexture(_normal, true);
            this.setCapRotation(_normal);

            material.normalMap = _normal;

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

            material.color.setHex(white);
            texture.isCap = true;
            this.setTexture(texture);
            this.setCapRotation(texture);

            material.map = texture;

        }

        if (normal) {

            material.color.setHex(white);
            normal.isCap = true;
            this.setTexture(normal, true);
            this.setCapRotation(normal);

            material.normalMap = normal;

        }

    }

    setCapRotation(texture) {

        let { rotationC } = this.specs;

        if (rotationC) {

            texture.rotation = rotationC;
            
        }

    }

    updateTextures() {

        super.updateTextures();

        const topMap = this.topMaterial?.map;
        const topMapNorm = this.topMaterial?.normalMap;
        const bottomMap = this.bottomMaterial?.map;
        const bottomMapNorm = this.bottomMaterial?.normalMap;
        
        if (topMap) {

            this.setTexture(topMap);

        }

        if (topMapNorm) {

            this.setTexture(topMapNorm);

        }

        if (bottomMap) {

            this.setTexture(bottomMap);

        }

        if (bottomMapNorm) {

            this.setTexture(bottomMapNorm);

        }

    }

    updateTexScale() {

        this.setConfig({ texScale: [this.scale.x, this.scale.y] }).updateTextures();

    }

}

export { Cylinder };