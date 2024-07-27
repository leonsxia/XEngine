import { EdgesGeometry, LineSegments, LineBasicMaterial, Raycaster, Vector3, ArrowHelper } from "three";
import { TrianglePlane } from "../Models";
import { white, red, green } from "../basic/colorBase";

const DEFAULT_RAY_LENGTH = 20;

class CollisionTrianglePlane extends TrianglePlane {

    #w;
    #rayLength;
    isOBB = false;
    isTriangle = true;

    constructor(specs) {

        super(specs);

        const { width, rayLength = DEFAULT_RAY_LENGTH, lines = false } = specs;

        this.#w = width;
        this.#rayLength = rayLength;
        
        if (lines) {

            this.edges = new EdgesGeometry(this.geometry);
            this.line = new LineSegments(this.edges, new LineBasicMaterial({ color: white }));
            this.mesh.add(this.line);
            this.line.visible = false;

        }

    }

    setRotationY(y) {

        this.setRotation([0, y, 0]);
        this.mesh.rotationY = y;

        return this;

    }

    get arrows() {

        const arrows = [];
        if (this.leftArrow) arrows.push(this.leftArrow);
        if (this.rightArrow) arrows.push(this.rightArrow);

        return arrows;

    }

    createRay() {   // create ray from original no translation.

        const width = this.#w;
        const originY = - this.#rayLength * .5;
        
        const headLength = 1;
        const headWidth = .2;
        const leftHanded = this.geometry.parameters.leftHanded;

        const dir = new Vector3(0, 1, 0);

        if (!leftHanded) {
            // create left ray and arrow
            const leftfrom = new Vector3(- width * .5, originY, 0);

            this.leftRay = new Raycaster(leftfrom, dir, 0, this.#rayLength);
            this.leftRay.layers.set(1);
            this.leftArrow = new ArrowHelper(this.leftRay.ray.direction, this.leftRay.ray.origin, this.#rayLength, green, headLength, headWidth);
        }
         
        if (leftHanded) {
            // create right ray and arrow
            const rightfrom = new Vector3(width * .5, originY, 0);

            this.rightRay = new Raycaster(rightfrom, dir, 0, this.#rayLength);
            this.rightRay.layers.set(1);
            this.rightArrow = new ArrowHelper(this.rightRay.ray.direction, this.rightRay.ray.origin, this.#rayLength, red, headLength, headWidth);
        }

        return this;

    }

    updateRay(needUpdateMatrixWorld = true) {   // update ray based on world matrix.

        if (!this.leftRay && !this.rightRay) return this;

        if (needUpdateMatrixWorld) {

            this.mesh.updateWorldMatrix(true, true);

        }

        const width = this.#w;
        const originY = - this.#rayLength * .5;
        const leftHanded = this.geometry.parameters.leftHanded;

        const dir = new Vector3(0, 1, 0);

        if (!leftHanded) {
            // udpate left ray and arrow
            const leftfrom = new Vector3(- width * .5, originY, 0);
            leftfrom.applyMatrix4(this.mesh.matrixWorld);

            this.leftRay.set(leftfrom, dir);

            this.leftArrow.position.copy(leftfrom);
            this.leftArrow.setDirection(dir);
        }
         
        if (leftHanded) {
            // udpate right ray and arrow
            const rightfrom = new Vector3(width * .5, originY, 0);
            rightfrom.applyMatrix4(this.mesh.matrixWorld);

            this.rightRay.set(rightfrom, dir);

            this.rightArrow.position.copy(rightfrom);
            this.rightArrow.setDirection(dir);
        }

        return this;

    }
}

export { CollisionTrianglePlane };