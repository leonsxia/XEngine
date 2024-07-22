import { EdgesGeometry, LineSegments, LineBasicMaterial, Raycaster, Vector3, ArrowHelper } from "three";
import { Plane } from "../Models";
import { white } from "../basic/colorBase";

const DEFAULT_RAY_LENGTH = 20;

class CollisionPlane extends Plane {

    #w;
    #h;
    #rayLength;
    isOBB = false;

    constructor(specs) {

        super(specs);

        const { width, height, rayLength = DEFAULT_RAY_LENGTH } = specs;

        this.#w = width;
        this.#h = height;
        this.#rayLength = rayLength;
        
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
        const originY = - this.#rayLength * .5;
        
        const headLength = 1;
        const headWidth = .2;

        const dir = new Vector3(0, 1, 0);

        // create left ray and arrow
        const leftfrom = new Vector3(width * .5, originY , 0);

        this.leftRay = new Raycaster(leftfrom, dir, 0, this.#rayLength);
        this.leftRay.layers.set(1);
        this.leftArrow = new ArrowHelper(this.leftRay.ray.direction, this.leftRay.ray.origin, this.#rayLength, 0x00ff00, headLength, headWidth);
         
        // create right ray and arrow
        const rightfrom = new Vector3(- width * .5, originY, 0);

        this.rightRay = new Raycaster(rightfrom, dir, 0, this.#rayLength);
        this.rightRay.layers.set(1);
        this.rightArrow = new ArrowHelper(this.rightRay.ray.direction, this.rightRay.ray.origin, this.#rayLength, 0xff0000, headLength, headWidth);

        return this;

    }

    updateRay() {   // update ray based on world matrix.

        if (!this.leftRay || !this.rightRay) return this;

        const width = this.#w;
        const originY = - this.#rayLength * .5;

        const dir = new Vector3(0, 1, 0);

        // udpate left ray and arrow
        const leftfrom = new Vector3(width * .5, originY, 0);
        leftfrom.applyMatrix4(this.mesh.matrixWorld);

        this.leftRay.set(leftfrom, dir);

        this.leftArrow.position.copy(leftfrom);
        this.leftArrow.setDirection(dir);
         
        // udpate right ray and arrow
        const rightfrom = new Vector3(- width * .5, originY, 0);
        rightfrom.applyMatrix4(this.mesh.matrixWorld);

        this.rightRay.set(rightfrom, dir);

        this.rightArrow.position.copy(rightfrom);
        this.rightArrow.setDirection(dir);

        return this;

    }
}

export { CollisionPlane };