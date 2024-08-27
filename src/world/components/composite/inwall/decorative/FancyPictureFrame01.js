import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox } from '../../../Models';

const GLTF_SRC = 'inRoom/decorative/fancy_picture_frame_01_1k/fancy_picture_frame_01_1k.gltf';

class FancyPictureFrame01 extends ObstacleBase {

    width = .6;
    height = .466;
    depth = .021;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetZ = - .012 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetZ, receiveShadow, castShadow };

        const cBoxSpecs = { name: `${name}_cbox`, width: this.width, depth: this.depth, height: this.height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // collision box
        const cBox = new CollisionBox(cBoxSpecs);

        this.cObjects = [cBox];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

    }

}

export { FancyPictureFrame01 };