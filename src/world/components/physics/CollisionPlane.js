import { EdgesGeometry, LineSegments, LineBasicMaterial, Raycaster, Vector3, Quaternion, ArrowHelper } from "three";
import { Plane } from "../Models";
import { white } from "../basic/colorBase";

class CollisionPlane extends Plane {
    #w;
    #h;
    isOBB = false;

    constructor(specs) {
        super(specs);
        const { width, height } = specs;
        this.#w = width;
        this.#h = height;
        
        this.edges = new EdgesGeometry( this.geometry );
        this.line = new LineSegments( this.edges, new LineBasicMaterial( { color: white } ) );
        this.mesh.add(this.line);
    }

    setRotationY(y) {
        this.setRotation([0, y, 0]);
        this.mesh.rotationY = y;
        return this;
    }

    createRay() {   // create ray from original no translation.
        const width = this.#w;
        const height = this.#h;
        const offsetY = .01;

        const dir = new Vector3(0, 1, 0);
        const leftfrom = new Vector3(width / 2, - height / 2 - offsetY, 0);
        this.leftRay = new Raycaster(leftfrom, dir, 0, height);
        this.leftRay.layers.set(1);
        this.leftArrow = new ArrowHelper(this.leftRay.ray.direction, this.leftRay.ray.origin, this.height + offsetY, 0x00ff00);
         
        const rightfrom = new Vector3(- width / 2, - height / 2 - offsetY, 0);
        this.rightRay = new Raycaster(rightfrom, dir, 0, height);
        this.rightRay.layers.set(1);
        this.rightArrow = new ArrowHelper(this.rightRay.ray.direction, this.rightRay.ray.origin, this.height + offsetY, 0xff0000);

        return this;
    }

    updateRay() {   // update ray based on world matrix.
        if (!this.leftRay || !this.rightRay) return this;

        const width = this.#w;
        const height = this.#h;
        const  offsetY = .01;

        const dir = new Vector3(0, 1, 0);
        const quaternion = new Quaternion();
        dir.applyQuaternion(this.mesh.getWorldQuaternion(quaternion));  // this will update mesh matrix world.
        const leftfrom = new Vector3(width / 2, - height / 2 - offsetY, 0);
        leftfrom.applyMatrix4(this.mesh.matrixWorld);
        this.leftRay.set(leftfrom, dir);
        this.leftArrow.position.copy(leftfrom);
        this.leftArrow.setDirection(dir);
         
        const rightfrom = new Vector3(- width / 2, - height / 2 - offsetY, 0);
        rightfrom.applyMatrix4(this.mesh.matrixWorld);
        this.rightRay.set(rightfrom, dir);
        this.rightArrow.position.copy(rightfrom);
        this.rightArrow.setDirection(dir);

        return this;
    }
}

export { CollisionPlane };