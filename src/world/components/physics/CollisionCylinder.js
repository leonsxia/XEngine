import { EdgesGeometry, LineSegments, LineBasicMaterial } from "three";
import { Cylinder } from "../Models";
import { white } from "../basic/colorBase";

class CollisionCylinder extends Cylinder {

    isOBB = false;

    constructor(specs) {

        super(specs);

        const { lines = false } = specs;

        if (lines) {

            this.edges = new EdgesGeometry(this.geometry);
            this.line = new LineSegments(this.edges, new LineBasicMaterial({ color: white }));
            this.mesh.add(this.line);
            this.line.visible = false;

        }   
    }
}

export { CollisionCylinder };