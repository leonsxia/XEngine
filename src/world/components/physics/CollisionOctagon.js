import { Box3, Box3Helper, EdgesGeometry, LineSegments, LineBasicMaterial } from "three";
import { Circle } from "../Models";
import { white } from "../basic/colorBase";

class CollisionOctagon extends Circle {
    boundingBox;
    boundingBoxHelper;

    constructor(specs) {
        specs.segments = 8;
        super(specs);

        this.geometry.computeBoundingBox();
        this.boundingBox = new Box3();
        this.boundingBoxHelper = new Box3Helper(this.boundingBox, white);
        
        this.edges = new EdgesGeometry( this.geometry );
        this.line = new LineSegments( this.edges, new LineBasicMaterial( { color: white } ) );
        this.mesh.add(this.line);
    }

    updateBoundingBoxHelper(needUpdateMatrixWorld = true) {
        // when inside a group, no need to update mesh, group will update children instead
        if (needUpdateMatrixWorld) {
            this.mesh.updateMatrixWorld();
        }
        this.boundingBox.copy(this.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
        return this;
    }
}

export { CollisionOctagon };