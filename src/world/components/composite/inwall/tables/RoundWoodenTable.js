import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionHexCylinder } from '../../../Models';

const GLTF_SRC = 'inRoom/tables/round_wooden_table_01_1k/round_wooden_table_01_1k.gltf';

class RoundWoodenTable extends ObstacleBase {

    radius = .7;
    height = 1;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1], lines = true } = specs;
        const { offsetY = - .5 } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs; 

        this.radius *= scale[0];
        this.height *= scale[1];

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow }

        const boxSpecs = { size: { width: this.radius * 2, depth: this.radius * 2, height: this.height }, lines };
        
        const chCylinderSpecs = { name, radius: this.radius, height: this.height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale([scale[0], scale[1], scale[0]]);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.mesh.visible = false;

        // collision cylinder
        const chCylinder = new CollisionHexCylinder(chCylinderSpecs);

        this.cObjects = [chCylinder];
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

export { RoundWoodenTable };
