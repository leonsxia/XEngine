import { EdgesGeometry, LineSegments, LineBasicMaterial } from "three";
import { Circle } from "../Models";
import { white } from "../basic/colorBase";

class CollisionOctagon extends Circle {
    isOBB = false;

    constructor(specs) {
        specs.segments = 8;
        super(specs);
        
        this.edges = new EdgesGeometry( this.geometry );
        this.line = new LineSegments( this.edges, new LineBasicMaterial( { color: white } ) );
        this.mesh.add(this.line);
    }
}

export { CollisionOctagon };