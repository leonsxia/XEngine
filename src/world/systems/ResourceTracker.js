import { Object3D, Material, Texture } from "three";

class ResourceTracker {

    constructor() {

        this.resources = new Set();

    }

    track(resource) {

        if (!resource || this.resources.has(resource)) {

            return resource;

        }

        // handle children and when material is an array of materials or
        // uniform is array of textures
        if (Array.isArray(resource)) {

            resource.forEach(resource => this.track(resource));
            return resource;

        }

        if (resource.dispose || resource instanceof Object3D) {

            this.resources.add(resource);

        }

        if (resource instanceof Object3D) {

            this.track(resource.geometry);
            this.track(resource.material);
            this.track(resource.children);

        } else if (resource instanceof Material) {

            // We have to check if there are any textures on the material
            for (const value of Object.values(resource)) {

                if (value instanceof Texture) {

                    this.track(value);

                }

            }

            // We also have to check if any uniforms reference textures or arrays of textures
            if (resource.uniforms) {

                for (const value of Object.values(resource.uniforms)) {

                    if (value) {

                        const uniformValue = value.value;
                        if (uniformValue instanceof Texture ||
                            Array.isArray(uniformValue)) {

                            this.track(uniformValue);

                        }

                    }

                }

            }

        }

        return resource;

    }

    untrack(resource) {

        this.resources.delete(resource);

    }

    dispose() {

        for (const resource of this.resources) {

            if (resource instanceof Object3D) {

                if (resource.parent) {

                    resource.parent.remove(resource);

                }

            }

            if (resource.dispose) {

                resource.dispose();

            }

        }

        this.resources.clear();

    }

}

export { ResourceTracker };