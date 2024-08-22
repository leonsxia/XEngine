import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'inRoom/seats/painted_wooden_chair_01_1k/painted_wooden_chair_01_1k.gltf';

class PaintedWoodenWhiteChair extends ObstacleBase {

    width = .433;
    height = .964;
    depth = .506;
    bottomHeight = .458;
    bottomDepth = .476;
    backWidth = .377;
    backHeight = .518;
    backDepth = .125;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetY = - .482 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];
        this.bottomHeight *= scale[1];
        this.bottomDepth *= scale[2];
        this.backWidth *= scale[0];
        this.backHeight *= scale[1];
        this.backDepth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const cBoxBottomSpecs = { name: `${name}_bottom`, width: this.width, depth: this.bottomDepth, height: this.bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxBackSpecs = { name: `${name}_back`, width: this.backWidth, depth: this.backDepth, height: this.backHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.mesh.visible = false;

        // collision box
        const cBoxBottom = new CollisionBox(cBoxBottomSpecs);
        const cBoxBack = new CollisionBox(cBoxBackSpecs);
        const bottomY = (this.bottomHeight - this.height) * .5;
        const backY = (this.backHeight - this.height) * .5 + this.bottomHeight;
        const backZ = - .24 * scale[2];
        cBoxBottom.setPosition([0, bottomY, 0]);
        cBoxBack.setPosition([0, backY, backZ]);

        this.cObjects = [cBoxBottom, cBoxBack];
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

    }

}

export { PaintedWoodenWhiteChair };