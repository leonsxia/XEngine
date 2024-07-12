import { Mesh, MeshPhongMaterial, DoubleSide, Box3, Box3Helper, EdgesGeometry, LineSegments, LineBasicMaterial, Raycaster, Vector3 } from 'three';
import { BasicObject } from './BasicObject';

class Plane extends BasicObject {
    #map = null;
    boundingBox;
    boundingBoxHelper;
    #w;
    #h;

    constructor(specs) {
        super('plane', specs)
        const { name, color, width, height } = specs;
        this.material = new MeshPhongMaterial({ color: color });
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.name = name;
        this.#w = width;
        this.#h = height;
        this.geometry.computeBoundingBox();
        this.boundingBox = new Box3();
        this.boundingBoxHelper = new Box3Helper(this.boundingBox, 0xffffff);
        
        this.edges = new EdgesGeometry( this.geometry );
        this.line = new LineSegments( this.edges, new LineBasicMaterial( { color: 0xffffff } ) );

    }

    async init (specs) {
        const { map } = specs;
        const [texture] = await Promise.all([
            map ? new TextureLoader().loadAsync(map) : new Promise(resolve => resolve(null))
        ]);
        if (texture) {
            this.#map = texture;
            this.#map.colorSpace = SRGBColorSpace;
            this.mesh.material = this.material = new MeshPhongMaterial({ map: this.#map });
        }
    }

    get width() {
        return this.geometry.parameters.width * this.mesh.scale.x;
    }

    get height() {
        return this.geometry.parameters.height * this.mesh.scale.y;
    }

    setRotationY(y) {
        this.setRotation([0, y, 0]);
        this.mesh.rotationY = y;
    }

    updateBoundingBoxHelper() {
        this.mesh.updateMatrixWorld();
        this.boundingBox.copy(this.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld);
        this.line.applyMatrix4(this.mesh.matrixWorld);
        // this.boundingBoxHelper.updateMatrixWorld();
        this.updateRay();
    }

    updateRay() {
        const width = this.#w;
        const height = this.#h;

        const dir = new Vector3(0, 1, 0);
        const leftfrom = new Vector3(width / 2, - height / 2, 0);
        leftfrom.applyMatrix4(this.mesh.matrixWorld);
        this.leftRay = new Raycaster(leftfrom, dir, 0, height);
        this.leftRay.layers.set(1);
         
        const rightfrom = new Vector3(- width / 2, - height / 2, 0);
        rightfrom.applyMatrix4(this.mesh.matrixWorld);
        this.rightRay = new Raycaster(rightfrom, dir, 0, height);
        this.rightRay.layers.set(1);
    }

    setDoubleSide() {
        this.material.side = DoubleSide;
    }

    setDoubleShadowSide() {
        this.material.shadowSide = DoubleSide;
    }
}

export { Plane };