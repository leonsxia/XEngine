import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'inRoom/tables/wooden_table_1k/wooden_table_02_1k.gltf';

class WoodenSmallTable extends ObstacleBase {

    width = 1.13768;
    height = .8;
    depth = .706739;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetY = -.4 } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const cBoxSpecs = { name, width: this.width, depth: this.depth, height: this.height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.mesh.visible = false;

        // collision box
        const cBox = new CollisionBox(cBoxSpecs);

        this.cObjects = [cBox];
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

export { WoodenSmallTable };