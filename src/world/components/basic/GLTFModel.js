import { Group } from 'three';
import { worldGLTFLoader } from '../utils/gltfHelper';
import { clone } from '../utils/objectHelper';

class GLTFModel {

    name = '';
    group;
    meshes = [];
    gltf;
    specs;

    constructor(specs) {

        const { name } = specs;

        this.name = name;

        this.group = new Group();
        this.group.name = name;

        this.specs = specs;

    }

    async init() {

        const { src, receiveShadow = false, castShadow = false, offsetY = 0, offsetZ = 0 } = this.specs;

        let model;

        if (src.scene) {

            model = src;

        } else {

            model = await Promise.all([src ? worldGLTFLoader.loadAsync(src) : Promise.resolve(null)]);

        }

        if (model) {

            let gltfModel = model;
            let modelGroup;

            if (Array.isArray(model)) {

                gltfModel = model[0];
                modelGroup = gltfModel.scene;

            } else {

                modelGroup = gltfModel.scene.clone();

            }

            modelGroup.position.y = offsetY;
            modelGroup.position.z = offsetZ;

            this.group.add(modelGroup);

            this.getMeshes(this.group);

            this.castShadow(receiveShadow)
                .receiveShadow(castShadow);

            this.gltf = gltfModel;

        }

    }

    getMeshes(object) {

        if (object.isGroup) {

            object.children.forEach(child => {

                if (child.isGroup) {

                    this.getMeshes(child);

                } else if (child.isMesh) {

                    this.meshes.push(child);
                    
                }

            });

        } else if (object.isMesh) {

            this.meshes.push(object);

        }

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotation(rot) {

        this.group.rotation.set(...rot);

        return this;

    }

    setScale(scale) {

        this.group.scale.set(...scale);

        return this;

    }

    setWireframe(show) {

        this.meshes.forEach(mesh => mesh.material.wireframe = show);

        return this;

    }

    castShadow(cast) {

        this.meshes.forEach(mesh => mesh.castShadow = cast);

        return this;

    }

    receiveShadow(receive) {

        this.meshes.forEach(mesh => mesh.receiveShadow = receive);

        return this;

    }

    clone(name) {

        const emptyObjName = name ?? `${this.name}_clone`;
        const emptyObj = new this.constructor({ name: emptyObjName });

        const emptySpecs = {};
        const ignore = ['name'];
        if (typeof this.specs.src !== 'string') {
            
            ignore.push('src');
            emptySpecs.src = this.specs.src;
        
        }

        emptyObj.name = emptySpecs.name = emptyObjName;

        emptyObj.specs = clone(emptySpecs, this.specs, ignore);

        emptyObj.group.copy(this.group);
        emptyObj.group.name = emptyObjName;

        emptyObj.getMeshes(emptyObj.group);

        emptyObj.gltf = this.gltf;

        return emptyObj;

    }

}

export { GLTFModel };