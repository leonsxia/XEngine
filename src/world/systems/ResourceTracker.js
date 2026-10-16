import { Object3D, Material, Texture } from "three";

// Global resource counter to keep track of the number of references to each resource.
const globalResourceCounter = new Map();

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

            if (!globalResourceCounter.has(resource)) {

                globalResourceCounter.set(resource, { count: 1 });

            } else {

                globalResourceCounter.get(resource).count++;

            }

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

            if (resource.dispose && globalResourceCounter.has(resource)) {

                const resCounter = globalResourceCounter.get(resource);

                resCounter.count--;
                if (resCounter.count == 0) {

                    resource.dispose();
                    globalResourceCounter.delete(resource);

                }

            }

        }

        this.resources.clear();

    }

}

export { ResourceTracker, globalResourceCounter };