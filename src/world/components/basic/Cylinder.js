import { Mesh, MeshPhongMaterial } from 'three';
import { BasicObject } from './BasicObject';
import { CYLINDER } from '../utils/constants';
import { basicMateraials } from './basicMaterial';
import { white } from './colorBase';

class Cylinder extends BasicObject {

    topMaterial;
    bottomMaterial;

    constructor(specs) {

        super(CYLINDER, specs);

        const { color } = specs;

        if (color) {

            this.topMaterial = new MeshPhongMaterial({ color: color });
            this.bottomMaterial = new MeshPhongMaterial({ color: color });

        } else {

            this.topMaterial = basicMateraials.basic.clone();
            this.bottomMaterial = basicMateraials.basic.clone();

        }

        this.mesh = new Mesh(this.geometry, [this.material, this.topMaterial, this.bottomMaterial]);
        this.mesh.name = specs.name;

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

        if (map?.isTexture || normalMap?.isTexture) {
            
            const _map = map?.clone();
            const _normal = normalMap?.clone();

            material.color.setHex(white);
            
            if (map) {

                _map.isCap = true;
                this.setTexture(_map);
                this.setCapRotation(_map);

                material.map = _map;

            }

            if (normalMap) {

                _normal.isCap = true;
                this.setTexture(_normal, true);
                this.setCapRotation(_normal);

                material.normalMap = _normal;

            }

            return;
            
        }
        
        if (map || normalMap) {

            const loader = this.loader;

            const [texture, normal] = await Promise.all([
                map ? loader.loadAsync(map) : Promise.resolve(null),
                normalMap ? loader.loadAsync(normalMap) : Promise.resolve(null)
            ]);

            material.color.setHex(white);

            if (texture) {

                texture.isCap = true;
                this.setTexture(texture);
                this.setCapRotation(texture);

                material.map = texture;

            }

            if (normal) {

                normal.isCap = true;
                this.setTexture(normal, true);
                this.setCapRotation(normal);
                
                material.normalMap = normal;

            }
        }
    }

    setCapRotation(texture) {

        let { rotationC } = this.specs;

        if (rotationC) {

            texture.rotation = rotationC;
            
        }

    }

}

export { Cylinder };