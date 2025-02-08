import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'inRoom/decorative/vintage_grandfather_clock_01_1k/vintage_grandfather_clock_01_1k.gltf';

class VintageGrandfatherClock extends ObstacleBase {

    width = .613;
    height = 2.2;
    depth = .416;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetX = - .059, offsetY = - 1.1, offsetZ = .033 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const cBoxSpecs = { name: `${name}_cbox`, width: this.width, depth: this.depth, height: this.height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBox = new CollisionBox(cBoxSpecs);

        this.cObjects = [cBox];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        this.group.add(
            this.gltf.group,
            this.box.mesh
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

        // remove glass
        this.gltf.getMeshes(this.gltf.group);
        const cylinder001_1 = this.gltf.meshes.find(m => m.name === 'Cylinder001_1');
        
        cylinder001_1.parent.remove(cylinder001_1);

    }

}

export { VintageGrandfatherClock };