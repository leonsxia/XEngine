import { Mesh } from 'three';
import { BasicObject } from './BasicObject';
import { CYLINDER } from '../utils/constants';
import { white } from './colorBase';
import { loadSingleTexture } from '../../systems/resources/helpers/TextureHelper';

class Cylinder extends BasicObject {

    topMaterial;
    bottomMaterial;

    constructor(specs) {

        specs.useStandardMaterial = specs.useStandardMaterial ?? true;
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

        const [diffuse, normal, arm, ao, rough, metal] = await Promise.all([
            loadSingleTexture(map, null, true),
            loadSingleTexture(normalMap, null, true),
            loadSingleTexture(armMap, null, true),
            loadSingleTexture(aoMap, null, true),
            loadSingleTexture(roughMap, null, true),
            loadSingleTexture(metalMap, null, true)
        ]);

        if (diffuse) {

            material.color.setHex(white);
            diffuse.isCap = true;
            this.setTexture(diffuse, true).setCapRotation(diffuse);

            material.map = diffuse;

        }

        if (normal) {

            normal.isCap = true;
            this.setTexture(normal).setCapRotation(normal);

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
            material.metalness = !metalness ? (armMap || metalMap) ? 1 : 0 : metalness;

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