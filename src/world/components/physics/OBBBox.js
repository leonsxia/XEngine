import { EdgesGeometry, LineSegments, LineBasicMaterial, Vector3 } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { Box } from '../Models';
import { white } from '../basic/colorBase';

class OBBBox extends Box {

    size;
    isOBB = true;

    constructor(specs) {

        super(specs);

        const { size: { width, height, depth }, lines = false } = specs;

        // setup OBB on geometry level
        this.size = new Vector3(width, height, depth);
        this.geometry.userData.obb = new OBB();
        this.geometry.userData.obb.halfSize.copy(this.size).multiplyScalar(.5);

        // bounding volume on object level (this will reflect the current world transform)
        this.mesh.userData.obb = new OBB();

        if (lines) {

            this.edges = new EdgesGeometry(this.geometry);
            this.line = new LineSegments(this.edges, new LineBasicMaterial({ color: white }));
            this.mesh.add(this.line);
            this.line.visible = false;

        }
    }

    get obb() {

        return this.mesh.userData.obb;

    }

    get layers() {

        return this.mesh.layers;
        
    }

    setLayer(layer) {

        this.mesh.layers.enable(layer);
        
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
}

export { OBBBox };