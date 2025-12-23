import { Box3, EventDispatcher, Group, SkeletonHelper, Vector3 } from 'three';
import { worldGLTFLoader } from '../utils/gltfHelper';
import { clone } from '../utils/objectHelper';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js'

const _box = new Box3();
const _v1 = new Vector3();

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

        const { src, receiveShadow = false, castShadow = false, hasBones = false, needCloneTexture = false } = this.specs;
        let { offsetX, offsetY, offsetZ } = this.specs;

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

            _box.setFromObject(gltfModel.scene);
            _box.getCenter(_v1);
            offsetX = offsetX ?? - _v1.x;
            offsetY = offsetY ?? - _v1.y;
            offsetZ = offsetZ ?? - _v1.z;
            modelGroup.position.set(offsetX, offsetY, offsetZ);

            this.group.add(modelGroup);

            this.getMeshes(this.group);

            this.cloneMaterial(needCloneTexture);

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

    cloneMaterial(needCloneTexture = false) {

        this.traverse((child) => {

            child.material = child.material.clone();

            if (!needCloneTexture) return;

            // Optionally, clone the texture if you need to modify its properties uniquely
            if (child.material.map) {

                child.material.map = child.material.map.clone();
                child.material.map.needsUpdate = true;

            }

            if (child.material.normalMap) {

                child.material.normalMap = child.material.normalMap.clone();
                child.material.normalMap.needsUpdate = true;

            }

            if (child.material.specularMap) {

                child.material.specularMap = child.material.specularMap.clone();
                child.material.specularMap.needsUpdate = true;

            }

            if (child.material.alphaMap) {

                child.material.alphaMap = child.material.alphaMap.clone();
                child.material.alphaMap.needsUpdate = true;

            }

            if (child.material.aoMap) {

                child.material.aoMap = child.material.aoMap.clone();
                child.material.aoMap.needsUpdate = true;

            }

            if (child.material.bumpMap) {

                child.material.bumpMap = child.material.bumpMap.clone();
                child.material.bumpMap.needsUpdate = true;

            }

            if (child.material.envMap) {

                child.material.envMap = child.material.envMap.clone();
                child.material.envMap.needsUpdate = true;

            }

            if (child.material.lightMap) {

                child.material.lightMap = child.material.lightMap.clone();
                child.material.lightMap.needsUpdate = true;

            }

        });

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