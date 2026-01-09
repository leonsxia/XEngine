import { Vector3 } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { CollisionPlane } from './CollisionPlane';

class CollisionOBBPlane extends CollisionPlane {
    size;
    isOBB = true;

    constructor(specs) {
        super(specs);

        const { width, height } = specs;

        // setup OBB on geometry level
        this.size = new Vector3( width, height, 0);
        this.geometry.userData.obb = new OBB();
        this.geometry.userData.obb.halfSize.copy(this.size).multiplyScalar(.5);

        // bounding volume on object level (this will reflect the current world transform)
        this.mesh.userData.obb = new OBB();
    }

    get obb() {
        return this.mesh.userData.obb;
    }

    // update OBB
    updateOBB(needUpdateMatrixWorld = true) {
        if (needUpdateMatrixWorld) {
            this.mesh.updateWorldMatrix(true, true);
        }

        const { matrixWorld, geometry: { userData } } = this.mesh;

        this.mesh.userData.obb.copy( userData.obb );
        this.mesh.userData.obb.applyMatrix4( matrixWorld );

        return this;
    }

    update(needToUpdateOBBnRay = true) {

        super.updateTexScale();

        if (needToUpdateOBBnRay) {

            this.updateRay();
            this.updateOBB();

        }

    }

}

export { CollisionOBBPlane };