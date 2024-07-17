import { EdgesGeometry, LineSegments, LineBasicMaterial, Vector3 } from 'three';
import { OBB } from 'three/examples/jsm/Addons.js';
import { Plane } from '../Models';
import { white } from '../basic/colorBase';

class OBBPlane extends Plane {
    size;

    constructor(specs) {
        super(specs);

        const { width, height } = specs;

        // setup OBB on geometry level
        this.size = new Vector3( width - .05, height - .05, 0);
        this.geometry.userData.obb = new OBB();
        this.geometry.userData.obb.halfSize.copy(this.size).multiplyScalar(.5);

        // bounding volume on object level (this will reflect the current world transform)
        this.mesh.userData.obb = new OBB();

        this.edges = new EdgesGeometry( this.geometry );
        this.line = new LineSegments( this.edges, new LineBasicMaterial( { color: white } ) );
        this.mesh.add(this.line);
    }

    get obb() {
        return this.mesh.userData.obb;
    }

    // update OBB
    updateOBB(needUpdateMatrixWorld = true) {
        if (needUpdateMatrixWorld) {
            this.mesh.updateMatrixWorld();
        }

        const { matrixWorld, geometry: { userData } } = this.mesh;

        this.mesh.userData.obb.copy( userData.obb );
        this.mesh.userData.obb.applyMatrix4( matrixWorld );

        return this;
    }
}

export { OBBPlane };