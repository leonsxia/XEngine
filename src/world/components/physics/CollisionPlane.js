import { Box3, Box3Helper, EdgesGeometry, LineSegments, LineBasicMaterial, Raycaster, Vector3, ArrowHelper } from "three";
import { Plane } from "../Models";
import { white } from "../basic/colorBase";

class CollisionPlane extends Plane {
    boundingBox;
    boundingBoxHelper;
    #w;
    #h;

    constructor(specs) {
        super(specs);
        const { width, height } = specs;
        this.#w = width;
        this.#h = height;
        this.geometry.computeBoundingBox();
        this.boundingBox = new Box3();
        this.boundingBoxHelper = new Box3Helper(this.boundingBox, white);
        
        this.edges = new EdgesGeometry( this.geometry );
        this.line = new LineSegments( this.edges, new LineBasicMaterial( { color: white } ) );
    }

    setRotationY(y) {
        this.setRotation([0, y, 0]);
        this.mesh.rotationY = y;
        return this;
    }

    updateBoundingBoxHelper() {
        this.mesh.updateMatrixWorld();
        this.boundingBox.copy(this.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
        this.line.applyMatrix4(this.mesh.matrixWorld);
        // this.boundingBoxHelper.updateMatrixWorld();
        this.updateRay();
        return this;
    }

    updateRay() {
        const width = this.#w;
        const height = this.#h;

        const dir = new Vector3(0, 1, 0);
        const leftfrom = new Vector3(width / 2, - height / 2, 0);
        leftfrom.applyMatrix4(this.mesh.matrixWorld);
        this.leftRay = new Raycaster(leftfrom, dir, 0, height);
        this.leftRay.layers.set(1);
        this.leftArrow = new ArrowHelper(this.leftRay.ray.direction, this.leftRay.ray.origin, this.height, 0x00ff00);
         
        const rightfrom = new Vector3(- width / 2, - height / 2, 0);
        rightfrom.applyMatrix4(this.mesh.matrixWorld);
        this.rightRay = new Raycaster(rightfrom, dir, 0, height);
        this.rightRay.layers.set(1);
        this.rightArrow = new ArrowHelper(this.rightRay.ray.direction, this.rightRay.ray.origin, this.height, 0xff0000);
    }
}

export { CollisionPlane };