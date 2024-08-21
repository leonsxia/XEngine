import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'inRoom/seats/painted_wooden_chair_02_1k/painted_wooden_chair_02_1k.gltf';

class PaintedWoodenBlueChair extends ObstacleBase {

    width = .637;
    height = 1.275;
    depth = .666;
    bottomWidth = .572;
    bottomHeight = .589;
    bottomDepth = .585;
    backHeight = .691;
    backDepth = .154;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetY = - .6375 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];
        this.bottomWidth *= scale[0];
        this.bottomHeight *= scale[1];
        this.bottomDepth *= scale[2];
        this.backHeight *= scale[1];
        this.backDepth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const cBoxBottomSpecs = { name: `${name}_bottom`, width: this.bottomWidth, depth: this.bottomDepth, height: this.bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxBackSpecs = { name: `${name}_back`, width: this.width, depth: this.backDepth, height: this.backHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.mesh.visible = false;

        // collision box
        const cBoxBottom = new CollisionBox(cBoxBottomSpecs);
        const cBoxBack = new CollisionBox(cBoxBackSpecs);
        const bottomX = - .015;
        const bottomY = (this.bottomHeight - this.height) * .5;
        const backX = - .02;
        const backY = (this.backHeight - this.height) * .5 + this.bottomHeight;
        const backZ = - .42;
        cBoxBottom.setPosition([bottomX, bottomY, 0]);
        cBoxBack.setPosition([backX, backY, backZ]);

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

export { PaintedWoodenBlueChair };