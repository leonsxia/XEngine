import { createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { GLTFModel, CollisionBox } from '../../Models';


const GLTF_SRC = 'wooden_picnic_table_1k/wooden_picnic_table_1k.gltf';

class WoodenPicnicTable extends ObstacleBase {

    width = 2.24;
    height = .742;
    depth = 3.03;
    bottomHeight = .35;
    topWidth = 1.246;

    gltf;
    bottomFrontFace;
    bottomBackFace;
    bottomLeftFace;
    bottomRightFace;
    bottomTopLeftFace;
    bottomTopRightFace;

    topFrontFace;
    topBackFace;
    topLeftFace;
    topRightFace;
    topUpFace;

    bottomFace;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetY } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];
        this.bottomHeight *= scale[1];
        this.topWidth *= scale[0];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const topHeight = this.height - this.bottomHeight;
        const sideWidth = (this.width - this.topWidth) * .5
        const cBoxTopSpecs = { name: `${name}_top`, width: this.topWidth, depth: this.depth, height: topHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxLeftSideSpecs = { name: `${name}_left_side`, width: sideWidth, depth: this.depth, height: this.bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };
        const cBoxRightSideSpecs = { name: `${name}_right_side`, width: sideWidth, depth: this.depth, height: this.bottomHeight, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], true, true);
        this.box.mesh.visible = false;

        // collision box
        const cBoxTop = new CollisionBox(cBoxTopSpecs);
        const cBoxSideLeft = new CollisionBox(cBoxLeftSideSpecs);
        const cBoxSideRight = new CollisionBox(cBoxRightSideSpecs);
        const sideX = (this.topWidth + sideWidth) * .5;
        const topY = (this.height - topHeight) * .5; 
        const bottomY = (this.bottomHeight - this.height) * .5;
        cBoxTop.setPosition([0, topY, 0]);
        cBoxSideLeft.setPosition([sideX, bottomY, 0]);
        cBoxSideRight.setPosition([- sideX, bottomY, 0]);

        this.cObjects = [cBoxTop, cBoxSideLeft, cBoxSideRight];
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

    }

}

export { WoodenPicnicTable };