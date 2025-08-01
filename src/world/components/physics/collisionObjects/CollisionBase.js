import { EventDispatcher, Group } from 'three';

class CollisionBase extends EventDispatcher {

    name;
    group = new Group();

    walls = [];
    topOBBs = [];
    bottomOBBs = [];

    scale = [1, 1, 1];

    specs;

    constructor(specs) {

        super();

        this.specs = specs;        

    }

    get planes() {

        return this.walls.concat(...this.topOBBs, ...this.bottomOBBs);

    }

    setLayers(layer) {

        for (let i = 0, il = this.planes.length; i < il; i++) {

            const p = this.planes[i];

            if (this.group.visible) {

                p.mesh.layers.enable(layer);

            } else {

                p.mesh.layers.disable(layer);

            }

        }

    }

    setVisible(show) {

        this.group.visible = show;

        this.dispatchEvent({ type: 'visibleChanged', message: 'collision base visible changed' });

        return this;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotationY(rotY) {

        this.group.rotation.set(0, rotY, 0);

        return this;

    }

    updateOBBnRay(needUpdateMatrixWorld = true) {

        for (let i = 0, il = this.walls.length; i < il; i++) {

            const wall = this.walls[i];

            wall.updateRay(needUpdateMatrixWorld);

            if (wall.isOBB) {

                wall.updateOBB(false);


            }
        }

        const topBottoms = this.topOBBs.concat(this.bottomOBBs);

        for (let i = 0, il = topBottoms.length; i < il; i++) {

            const obb = topBottoms[i];

            obb.updateOBB(needUpdateMatrixWorld);

        }
        
    }

}

export { CollisionBase };