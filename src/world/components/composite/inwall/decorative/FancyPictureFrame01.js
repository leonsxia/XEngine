import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox, Plane } from '../../../Models';

const GLTF_SRC = 'inRoom/decorative/fancy_picture_frame_01_1k/fancy_picture_frame_01_1k.gltf';

class FancyPictureFrame01 extends ObstacleBase {

    width = .6;
    height = .466;
    depth = .021;
    imgWidth = .523;
    imgHeight = .385;

    gltf;
    image;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetZ = - .012 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, img, mapRatio, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];
        this.imgWidth *= scale[0];
        this.imgHeight *= scale[1];

        if (mapRatio) {

            const newHeight = this.width / mapRatio;
            scale[1] = newHeight / (this.height / scale[1]);
            this.height = newHeight;
            this.imgHeight = this.imgWidth / mapRatio;

        }

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetZ, receiveShadow, castShadow };

        const cBoxSpecs = { name: `${name}_cbox`, width: this.width, depth: this.depth, height: this.height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // collision box
        const cBox = new CollisionBox(cBoxSpecs);

        if (img) {

            const { imgNormal } = specs;

            const imageSpecs = { name: `${name}_image`, width: this.imgWidth, height: this.imgHeight, map: img, normalMap: imgNormal, transparent: true };

            this.image = new Plane(imageSpecs);
            const imgPosZ = 0 * scale[2];
            this.image.setPosition([0, 0, imgPosZ]);

            this.group.add(this.image.mesh);

        }

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

        const loadPromises = [this.gltf.init()];
        
        if (this.image) {

            loadPromises.push(this.image.init());

        }

        await Promise.all(loadPromises);

        this.setPickLayers();

        if (this.image) {

            const canvas = this.gltf.meshes.find(m => m.name === 'fancy_picture_frame_01_canvas');
            canvas.visible = false;

        }

    }

}

export { FancyPictureFrame01 };