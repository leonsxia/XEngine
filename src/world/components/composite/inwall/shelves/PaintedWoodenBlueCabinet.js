import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'inRoom/shelves/painted_wooden_cabinet_02_1k/painted_wooden_cabinet_02_1k.gltf';

class PaintedWoodenBlueCabinet extends ObstacleBase {

    width = 1;
    height = 2.6;
    depth = .665;
    frontHeight = 1.169;
    backDepth = .388;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetY = - 1.3 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];
        this.frontHeight *= scale[1];
        this.backDepth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const frontDepth = this.depth - this.backDepth;
        const cBoxFrontSpecs = { name: `${name}_front`, width: this.width, depth: frontDepth, height: this.frontHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxBackSpecs = { name: `${name}_back`, width: this.width, depth: this.backDepth, height: this.height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBoxFront = new CollisionBox(cBoxFrontSpecs);
        const cBoxBack = new CollisionBox(cBoxBackSpecs);
        const frontY = (this.frontHeight - this.height) * .5;
        const frontZ = (this.depth - frontDepth) * .5;
        const backZ = (this.backDepth - this.depth) * .5;
        cBoxFront.setPosition([0, frontY, frontZ]);
        cBoxBack.setPosition([0, 0, backZ]);

        this.cObjects = [cBoxFront, cBoxBack];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);
       
        // set triggers if needed
        this.setTriggers();

        this.group.add(
            this.gltf.group,
            this.box.mesh
        );
        
    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

    }

}

export { PaintedWoodenBlueCabinet };