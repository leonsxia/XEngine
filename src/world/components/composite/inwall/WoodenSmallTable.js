import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane, createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { yankeesBlue, green } from '../../basic/colorBase';
import { GLTFModel } from '../../Models';

const GLTF_SRC = 'wooden_table_1k/wooden_table_02_1k.gltf';

class WoodenSmallTable extends ObstacleBase {

    width = 1.13768;
    height = .8;
    depth = .706739;

    gltf;
    frontFace;
    backFace;
    leftFace;
    rightFace;
    topFace;
    bottomFace;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetY } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const frontBackSpecs = { width: this.width, height: this.height, lines };
        const leftRightSpecs = { width: this.depth, height: this.height, lines };
        const bottomTopSpecs = { width: this.width, height: this.depth, color: yankeesBlue, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // collision box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], true, true);

        // collision faces
        const createPlaneFunction = this.enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.backFace = createPlaneFunction(frontBackSpecs, `${name}_back`, [0, 0, - this.depth * .5], Math.PI, true, true, showArrow);
        this.leftFace = createPlaneFunction(leftRightSpecs, `${name}_left`, [this.width * .5, 0, 0], Math.PI * .5, true, true, showArrow);
        this.rightFace = createPlaneFunction(leftRightSpecs, `${name}_right`, [- this.width * .5, 0, 0], - Math.PI * .5, true, true, showArrow);

        {
            this.topFace = createOBBPlane(bottomTopSpecs, `${name}_top`, [0, this.height * .5, 0], [- Math.PI * .5, 0 ,0], true, true);
            this.bottomFace = createOBBPlane(bottomTopSpecs, `${name}_bottom`, [0, - this.height * .5, 0], [Math.PI * .5, 0, 0], true, true);

            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];
        }

        this.frontFace = createPlaneFunction(frontBackSpecs, `${name}_front`, [0, 0, this.depth * .5], 0, true, true, showArrow);
        this.frontFace.line?.material.color.setHex(green);

        this.walls = [this.frontFace, this.backFace, this.leftFace, this.rightFace];

        this.box.mesh.visible = false;
        this.setPlaneVisible(false);

        this.setTriggers();

        this.group.add(
            this.gltf.group,
            this.box.mesh,
            this.frontFace.mesh,
            this.backFace.mesh,
            this.leftFace.mesh,
            this.rightFace.mesh,
            this.topFace.mesh,
            this.bottomFace.mesh
        );

    }

    async init() {

        await this.gltf.init();

    }

}

export { WoodenSmallTable };