import { EdgesGeometry, LineSegments, LineBasicMaterial, Raycaster, Vector3, ArrowHelper } from "three";
import { Plane } from "../Models";
import { white, red, green } from "../basic/colorBase";
import { CORNOR_RAY_LAYER } from "../utils/constants";

const DEFAULT_RAY_LENGTH = 20;

class CollisionPlane extends Plane {

    #w;
    #rayLength;
    isOBB = false;

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

        this.mesh.rotationY = 0;
        this.mesh.father = this;
        this.rotationY = 0;

    }

    setRotationY(y) {
        
        const preRotY = this.rotationY;

        this.setRotation([0, y, 0]);
        this.rotationY = y;

        this.mesh.rotationY = this.mesh.rotationY - preRotY + y;

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

        const dir = new Vector3(0, 1, 0);

        // create left ray and arrow
        const leftfrom = new Vector3(width * .5, originY , 0);

        this.leftRay = new Raycaster(leftfrom, dir, 0, this.#rayLength);
        this.leftRay.layers.set(CORNOR_RAY_LAYER);
        this.leftArrow = new ArrowHelper(this.leftRay.ray.direction, this.leftRay.ray.origin, this.#rayLength, green, headLength, headWidth);
         
        // create right ray and arrow
        const rightfrom = new Vector3(- width * .5, originY, 0);

        this.rightRay = new Raycaster(rightfrom, dir, 0, this.#rayLength);
        this.rightRay.layers.set(CORNOR_RAY_LAYER);
        this.rightArrow = new ArrowHelper(this.rightRay.ray.direction, this.rightRay.ray.origin, this.#rayLength, red, headLength, headWidth);

        return this;

    }

    updateRay(needUpdateMatrixWorld = true) {   // update ray based on world matrix.

        if (!this.leftRay || !this.rightRay) return this;

        if (needUpdateMatrixWorld) {

            this.mesh.updateWorldMatrix(true, true);

        }

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