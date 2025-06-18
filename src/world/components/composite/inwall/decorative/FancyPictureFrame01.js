import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox, Plane } from '../../../Models';

const GLTF_SRC = 'inRoom/decorative/fancy_picture_frame_01_1k/fancy_picture_frame_01_1k.gltf';

class FancyPictureFrame01 extends ObstacleBase {

    _width = .6;
    _height = .466;
    _depth = .021;
    _imgWidth = .523;
    _imgHeight = .385;

    gltf;

    _cBox;
    _image;
    _imgPosZ = 0;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { offsetZ = - .012 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, img, mapRatio, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        if (mapRatio) {

            this._scale[1] = scale[0] * this._width / mapRatio / this._height;

        }

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetZ, receiveShadow, castShadow };

        const cBoxSpecs = { name: `${name}_cbox`, width: this._width, depth: this._depth, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        // collision box
        const cBox = this._cBox = new CollisionBox(cBoxSpecs);

        if (img) {

            const { imgNormal } = specs;

            const imageSpecs = { name: `${name}_image`, width: this._imgWidth, height: this._imgHeight, map: img, normalMap: imgNormal, transparent: true };

            this._image = new Plane(imageSpecs);

            this._image.receiveShadow(receiveShadow);

            this.group.add(this._image.mesh);

        }

        this.update(false);

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

        if (this._image) {

            loadPromises.push(this._image.init());

        }

        await Promise.all(loadPromises);

        this.setPickLayers();

        if (this._image) {

            const canvas = this.gltf.meshes.find(m => m.name === 'fancy_picture_frame_01_canvas');
            canvas.visible = false;

        }

    }

    get scaleX() {

        return this._scale[0];

    }

    set scaleX(x) {

        this._scale[0] = x;

        const { mapRatio } = this.specs;

        if (mapRatio) {

            this._scale[1] = x * this._width / mapRatio / this._height;

        }

        this.update();

    }

    get scaleY() {

        return this._scale[1];

    }

    set scaleY(y) {

        this._scale[1] = y;

        const { mapRatio } = this.specs;

        if (mapRatio) {

            this._scale[0] = y * this._height * mapRatio / this._width;

        }

        this.update();

    }

    update(needToUpdateOBBnRay = true) {

        // update image
        const { img } = this.specs;

        if (img) {

            const imgPosZ = this._imgPosZ * this.scale[2];

            this._image.setScaleWithTexUpdate([this.scale[0], this.scale[1], 1])
                .setPosition([0, 0, imgPosZ]);

        }

        // update gltf scale
        this.gltf.setScale(this.scale);

        // update cbox scale
        this._cBox.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { FancyPictureFrame01 };