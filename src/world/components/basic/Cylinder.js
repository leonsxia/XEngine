import { Mesh } from 'three';
import { BasicObject } from './BasicObject';
import { CYLINDER } from '../utils/constants';
import { white } from './colorBase';

class Cylinder extends BasicObject {

    topMaterial;
    bottomMaterial;

    constructor(specs) {

        specs.useStandardMaterial = true;
        super(CYLINDER, specs);

        this.setupMaterials('topMaterial', 'bottomMaterial');

        this.mesh = new Mesh(this.geometry, [this.material, this.topMaterial, this.bottomMaterial]);
        this.mesh.name = specs.name;

        this.mesh.father = this;

    }

    async init() {

        const { topMap, topNormal, topArm, topAo, topRough, topMetal } = this.specs;
        const { bottomMap, bottomNormal, bottomArm, bottomAo, bottomRough, bottomMetal } = this.specs;

        await Promise.all([
            this.initBasic(),
            this.initCap(topMap, topNormal, topArm, topAo, topRough, topMetal, true),
            this.initCap(bottomMap, bottomNormal, bottomArm, bottomAo, bottomRough, bottomMetal, false)
        ]);

    }

    async initCap(map, normalMap, armMap, aoMap, roughMap, metalMap, isTop = false) {

        let material;

        if (isTop)
            material = this.topMaterial;
        else
            material = this.bottomMaterial;

        if (map?.isTexture) {

            const _map = map.clone();

            material.color.setHex(white);
            _map.isCap = true;
            this.setTexture(_map).setCapRotation(_map);

            material.map = _map;

        }

        if (normalMap?.isTexture) {

            const _normal = normalMap.clone();

            material.color.setHex(white);
            _normal.isCap = true;
            this.setTexture(_normal, true).setCapRotation(_normal);

            material.normalMap = _normal;

        }

        if (armMap?.isTexture) {

            const _arm = armMap.clone();
            _arm.isCap = true;
            this.setTexture(_arm).setCapRotation(_arm);

            material.aoMap = _arm;
            material.roughnessMap = _arm;
            material.metalnessMap = _arm;

        } else {

            if (aoMap?.isTexture) {

                const _ao = aoMap.clone();
                _ao.isCap = true;
                this.setTexture(_ao).setCapRotation(_ao);

                material.aoMap = _ao;

            }

            if (roughMap?.isTexture) {

                const _rough = roughMap.clone();
                _rough.isCap = true;
                this.setTexture(_rough).setCapRotation(_rough);

                material.roughnessMap = _rough;

            }

            if (metalMap?.isTexture) {

                const _metal = metalMap.clone();
                _metal.isCap = true;
                this.setTexture(_metal).setCapRotation(_metal);

                material.metalnessMap = _metal;

            }

        }

        const loadPromises = [];

        loadPromises.push(map && !map.isTexture ? this.loader.loadAsync(map) : Promise.resolve(null));
        loadPromises.push(normalMap && !normalMap.isTexture ? this.loader.loadAsync(normalMap) : Promise.resolve(null));
        loadPromises.push(armMap && !armMap.isTexture ? this.loader.loadAsync(armMap) : Promise.resolve(null));
        loadPromises.push(aoMap && !aoMap.isTexture ? this.loader.loadAsync(aoMap) : Promise.resolve(null));
        loadPromises.push(roughMap && !roughMap.isTexture ? this.loader.loadAsync(roughMap) : Promise.resolve(null));
        loadPromises.push(metalMap && !metalMap.isTexture ? this.loader.loadAsync(metalMap) : Promise.resolve(null));

        const [texture, normal, arm, ao, rough, metal] = await Promise.all(loadPromises);

        if (texture) {

            material.color.setHex(white);
            texture.isCap = true;
            this.setTexture(texture).setCapRotation(texture);

            material.map = texture;

        }

        if (normal) {

            material.color.setHex(white);
            normal.isCap = true;
            this.setTexture(normal, true).setCapRotation(normal);

            material.normalMap = normal;

        }

        if (arm) {

            arm.isCap = true;
            this.setTexture(arm).setCapRotation(arm);

            material.aoMap = arm;
            material.roughnessMap = arm;
            material.metalnessMap = arm;

        } else {

            if (ao) {

                ao.isCap = true;
                this.setTexture(ao).setCapRotation(ao);

                material.aoMap = ao;

            }

            if (rough) {

                rough.isCap = true;
                this.setTexture(rough).setCapRotation(rough);

                material.roughnessMap = rough;

            }

            if (metal) {

                metal.isCap = true;
                this.setTexture(metal).setCapRotation(metal);

                material.metalnessMap = metal;

            }

        }

        const { useStandardMaterial = false, roughness = 1, metalness = 0 } = this.specs;
        if (useStandardMaterial) {

            material.roughness = roughness;
            material.metalness = metalness;

        }

    }

    setCapRotation(texture) {

        if (!texture) return this;

        let { rotationC } = this.specs;
        if (rotationC) {

            texture.rotation = rotationC;
            
        }

        return this;

    }

    updateTextures() {

        super.updateTextures();
        super.updateTextures(this.topMaterial);
        super.updateTextures(this.bottomMaterial);

        this.setCapRotation(this.topMaterial?.map);
        this.setCapRotation(this.topMaterial?.normalMap);
        this.setCapRotation(this.topMaterial?.aoMap);
        this.setCapRotation(this.topMaterial?.roughnessMap);
        this.setCapRotation(this.topMaterial?.metalnessMap);
        this.setCapRotation(this.bottomMaterial?.map);
        this.setCapRotation(this.bottomMaterial?.normalMap);
        this.setCapRotation(this.bottomMaterial?.aoMap);
        this.setCapRotation(this.bottomMaterial?.roughnessMap);
        this.setCapRotation(this.bottomMaterial?.metalnessMap);       

    }

    updateTexScale() {

        this.setConfig({ texScale: [this.scale.x, this.scale.y] }).updateTextures();

    }

}

export { Cylinder };