import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'inRoom/seats/sofa_03_1k/sofa_03_1k.gltf';

class Sofa03 extends ObstacleBase {

    width = 2.735;
    height = 1.115;
    depth = .916;
    bottomWidth = 1.865;
    bottomHeight = .573;
    sideHeight = .857;
    backDepth = .484;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetY = - .558 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];
        this.bottomWidth *= scale[0];
        this.bottomHeight *= scale[1];
        this.sideHeight *= scale[1];
        this.backDepth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const sideWidth = (this.width - this.bottomWidth) * .5;
        const backHeight = this.height - this.bottomHeight;
        const cBoxBottomSpecs = { name: `${name}_bottom`, width: this.bottomWidth, depth: this.depth, height: this.bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxLeftSideSpecs = { name: `${name}_left_side`, width: sideWidth, depth: this.depth, height: this.sideHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxRightSideSpecs = { name: `${name}_right_side`, width: sideWidth, depth: this.depth, height: this.sideHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxBackSpecs = { name: `${name}_back`, width: this.bottomWidth, depth: this.backDepth, height: backHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.mesh.visible = false;

        // collision box
        const cBoxBottom = new CollisionBox(cBoxBottomSpecs);
        const cBoxSideLeft = new CollisionBox(cBoxLeftSideSpecs);
        const cBoxSideRight = new CollisionBox(cBoxRightSideSpecs);
        const cBoxBack = new CollisionBox(cBoxBackSpecs);
        const sideX = (this.bottomWidth + sideWidth) * .5;
        const sideY = (this.sideHeight - this.height) * .5;
        const bottomY = (this.bottomHeight - this.height) * .5;
        const backY = (this.height - backHeight) * .5;
        const backZ = (this.backDepth - this.depth) * .5;
        cBoxBottom.setPosition([0, bottomY, 0]);
        cBoxSideLeft.setPosition([sideX, sideY, 0]);
        cBoxSideRight.setPosition([- sideX, sideY, 0]);
        cBoxBack.setPosition([0, backY, backZ]);

        this.cObjects = [cBoxBottom, cBoxSideLeft, cBoxSideRight, cBoxBack];
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

export { Sofa03 };