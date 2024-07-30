import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane, createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { yankeesBlue, green } from '../../basic/colorBase';
import { GLTFModel } from '../../Models';


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

        const bottomTopWidth = (this.width - this.topWidth) * .5;
        const topHeight = this.height - this.bottomHeight;

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const bottomFrontBackSpecs = { width: this.width, height: this.bottomHeight, lines };
        const bottomLeftRightSpecs = { width: this.depth, height: this.bottomHeight, lines };
        const bottomTopSpecs = { width: bottomTopWidth, height: this.depth, color: yankeesBlue, lines };

        const topFrontBackSpecs = { width: this.topWidth, height: topHeight, lines };
        const topLeftRightSpecs = {width: this.depth, height: topHeight, lines};
        const topUpSpecs = { width: this.topWidth, height: this.depth, color: yankeesBlue, lines };

        const bottomSpecs = { width: this.width, height: this.depth, color: yankeesBlue, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // collision box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], true, true);

        // collision faces
        const createPlaneFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        const bottomY = (this.bottomHeight - this.height) * .5;
        this.bottomBackFace = createPlaneFunction(bottomFrontBackSpecs, `${name}_bottom_back`, [0, bottomY, - this.depth * .5], Math.PI, true, true, showArrow);
        this.bottomLeftFace = createPlaneFunction(bottomLeftRightSpecs, `${name}_bottom_left`, [this.width * .5, bottomY ,0], Math.PI * .5, true, true, showArrow);
        this.bottomRightFace = createPlaneFunction(bottomLeftRightSpecs, `${name}_bottom_right`, [- this.width * .5, bottomY, 0], - Math.PI * .5, true, true, showArrow);

        const topY = (this.height - topHeight) * .5;
        this.topBackFace = createPlaneFunction(topFrontBackSpecs, `${name}_top_front`, [0, topY, - this.depth * .5], Math.PI, true, true, showArrow);
        this.topLeftFace = createPlaneFunction(topLeftRightSpecs, `${name}_top_left`, [this.topWidth * .5, topY, 0], Math.PI * .5, true, true, showArrow);
        this.topRightFace = createPlaneFunction(topLeftRightSpecs, `${name}_top_right`, [- this.topWidth * .5, topY, 0], - Math.PI * .5, true, true, showArrow);

        {
            const bottomTopX = (this.topWidth + bottomTopWidth) * .5;
            const bottomTopY = this.bottomHeight - this.height * .5;
            this.bottomTopLeftFace = createOBBPlane(bottomTopSpecs, `${name}_bottom_top_left`, [bottomTopX, bottomTopY, 0], [- Math.PI * .5, 0, 0], true, true);
            this.bottomTopRightFace = createOBBPlane(bottomTopSpecs, `${name}_bottom_top_right`, [- bottomTopX, bottomTopY, 0], [- Math.PI * .5, 0, 0], true, true);
            this.topUpFace = createOBBPlane(topUpSpecs, `${name}_top_up`, [0, this.height * .5, 0], [- Math.PI * .5, 0, 0], true, true);
            this.topOBBs = [this.bottomTopLeftFace, this.bottomTopRightFace, this.topUpFace];

            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottom`, [0, - this.height * .5, 0], [Math.PI * .5, 0, 0], true, true);
            this.bottomOBBs = [this.bottomFace];
        }

        this.bottomFrontFace = createPlaneFunction(bottomFrontBackSpecs, `${name}_bottom_front`, [0, bottomY, this.depth * .5], 0, true, true, showArrow);
        this.topFrontFace = createPlaneFunction(topFrontBackSpecs, `${name}_top_front`, [0, topY, this.depth * .5], 0, true, true, showArrow);
        this.bottomFrontFace.line?.material.color.setHex(green);
        this.topFrontFace.line?.material.color.setHex(green);

        this.walls = [
            this.bottomFrontFace, this.bottomBackFace, this.bottomLeftFace, this.bottomRightFace,
            this.topFrontFace, this.topBackFace, this.topLeftFace, this.topRightFace
        ];

        this.box.mesh.visible = false;
        this.setPlaneVisible(false);

        this.setTriggers();

        this.group.add(
            this.gltf.group,
            this.box.mesh,
            this.bottomFrontFace.mesh,
            this.bottomBackFace.mesh,
            this.bottomLeftFace.mesh,
            this.bottomRightFace.mesh,
            this.bottomTopLeftFace.mesh,
            this.bottomTopRightFace.mesh,
            this.topFrontFace.mesh,
            this.topBackFace.mesh,
            this.topLeftFace.mesh,
            this.topRightFace.mesh,
            this.topUpFace.mesh,
            this.bottomFace.mesh
        );
        
    }

    async init() {

        await this.gltf.init();

    }

}

export { WoodenPicnicTable };