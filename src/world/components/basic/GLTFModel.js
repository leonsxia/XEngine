import { EventDispatcher, Group, SkeletonHelper } from 'three';
import { worldGLTFLoader } from '../utils/gltfHelper';
import { clone } from '../utils/objectHelper';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js'

class GLTFModel extends EventDispatcher {

    name = '';
    group;
    meshes = [];
    gltf;
    skeleton;
    specs;

    constructor(specs) {

        super();

        const { name } = specs;

        this.name = name;

        this.group = new Group();
        this.group.name = `${name}_group`;
        this.group.father = this;

        this.specs = specs;

    }

    async init() {

        const { src, receiveShadow = false, castShadow = false, offsetX = 0, offsetY = 0, offsetZ = 0, hasBones = false } = this.specs;

        let model;

        if (src.scene) {

            model = src;

        } else {

            model = await Promise.all([src ? worldGLTFLoader.loadAsync(src) : Promise.resolve(null)]);

        }

        if (model) {

            let gltfModel = Array.isArray(model) ? model[0] : model;
            let modelGroup;

            if (!hasBones) {

                modelGroup = gltfModel.scene.clone();

            } else {

                // use skeleton clone to bind mesh with skeleton
                modelGroup = skeletonClone(gltfModel.scene);
                this.skeleton = new SkeletonHelper(modelGroup);

            }

            modelGroup.position.set(offsetX, offsetY, offsetZ);

            this.group.add(modelGroup);

            this.getMeshes(this.group);

            this.castShadow(receiveShadow)
                .receiveShadow(castShadow);

            this.gltf = gltfModel;

        }

    }

    get visible() {

        return this.group.visible;

    }

    set visible(val) {

        this.group.visible = val;

        this.dispatchEvent({ type: 'visibleChanged', message: 'gltf visible changed' });

    }

    setLayers(layer) {

        this.traverse((mesh) => {

            if (this.group.visible) {

                mesh.layers.enable(layer);

            } else {

                mesh.layers.disable(layer);

            }
            
        });

    }

    traverse(callback) {

        this.group.traverse((object) => {

            if (object.isMesh) {
                
                callback(object);
            
            }

        });

    }

    getMeshes(object) {

        object.traverse((object) => {

            if (object.isMesh) {
                
                this.meshes.push(object);
            
            }
            
        });

    }

    getChildByName(name) {

        let result;

        this.group.traverse((child) => {

            if (child.name === name) result = child;

        });

        return result;

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

        for (let i = 0, il = this.meshes.length; i < il; i++) {

            const mesh = this.meshes[i];

            mesh.material.wireframe = show;

        }

        return this;

    }

    castShadow(cast) {

        for (let i = 0, il = this.meshes.length; i < il; i++) {

            const mesh = this.meshes[i];

            mesh.castShadow = cast;

        }

        return this;

    }

    receiveShadow(receive) {

        for (let i = 0, il = this.meshes.length; i < il; i++) {

            const mesh = this.meshes[i];

            mesh.receiveShadow = receive;

        }

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