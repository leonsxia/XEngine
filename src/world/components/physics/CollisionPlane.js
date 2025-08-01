import { EdgesGeometry, LineSegments, LineBasicMaterial, Raycaster, Vector3, ArrowHelper, MathUtils } from "three";
import { Plane } from "../Models";
import { white, red, green } from "../basic/colorBase";
import { CORNOR_RAY_LAYER } from "../utils/constants";

const DEFAULT_RAY_LENGTH = 20;
const HEAD_LENGTH = 1;
const HEAD_WIDTH = .2;

const _v1 = new Vector3();
const _up = new Vector3(0, 1, 0);

class CollisionPlane extends Plane {

    #w;
    #rayLength;
    isOBB = false;
    isCollision = true;

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

    get rotationY() {

        return this.mesh.rotation.y;

    }

    setRotationY(y) {
        
        this.setRotation([0, y, 0]);

        return this;

    }

    get rotationYDegree() {

        return MathUtils.radToDeg(this.rotationY);

    }

    set rotationYDegree(value) {

        this.setRotationY(MathUtils.degToRad(value));

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

        // create left ray and arrow
        const leftfrom = new Vector3(width * .5, originY , 0);

        this.leftRay = new Raycaster(leftfrom, _up, 0, this.#rayLength);
        this.leftRay.layers.set(CORNOR_RAY_LAYER);
        this.leftArrow = new ArrowHelper(this.leftRay.ray.direction, this.leftRay.ray.origin, this.#rayLength, green, HEAD_LENGTH, HEAD_WIDTH);
         
        // create right ray and arrow
        const rightfrom = new Vector3(- width * .5, originY, 0);

        this.rightRay = new Raycaster(rightfrom, _up, 0, this.#rayLength);
        this.rightRay.layers.set(CORNOR_RAY_LAYER);
        this.rightArrow = new ArrowHelper(this.rightRay.ray.direction, this.rightRay.ray.origin, this.#rayLength, red, HEAD_LENGTH, HEAD_WIDTH);

        return this;

    }

    updateRay(needUpdateMatrixWorld = true) {   // update ray based on world matrix.

        if (!this.leftRay || !this.rightRay) return this;

        if (needUpdateMatrixWorld) {

            this.mesh.updateWorldMatrix(true, true);

        }

        const width = this.#w;
        const originY = - this.#rayLength * .5;

        // udpate left ray and arrow
        _v1.set(width * .5, 0, 0).applyMatrix4(this.mesh.matrixWorld);
        _v1.y += originY;

        const leftLen = this.#rayLength;
        this.leftRay.set(_v1, _up);
        this.leftRay.far = leftLen;

        this.leftArrow.position.copy(_v1);
        this.leftArrow.setDirection(_up);
        this.leftArrow.setLength(leftLen, HEAD_LENGTH, HEAD_WIDTH);
         
        // udpate right ray and arrow
        _v1.set(- width * .5, 0, 0).applyMatrix4(this.mesh.matrixWorld);
        _v1.y += originY;

        const rightLen = this.#rayLength;
        this.rightRay.set(_v1, _up);
        this.rightRay.far = rightLen;

        this.rightArrow.position.copy(_v1);
        this.rightArrow.setDirection(_up);
        this.rightArrow.setLength(rightLen, HEAD_LENGTH, HEAD_WIDTH);

        return this;

    }

    update(needToUpdateRay = true) {

        super.updateTexScale();

        if (needToUpdateRay) {

            this.updateRay();

        }

    }

}

export { CollisionPlane };