import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionHexCylinder } from '../../../Models';

const GLTF_SRC = 'inRoom/tables/round_wooden_table_01_1k/round_wooden_table_01_1k.gltf';

class RoundWoodenTable extends ObstacleBase {

    _radius = .7;
    _height = 1;

    gltf;

    _chCylinder;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1], lines = false } = specs;
        const { offsetY = - .5 } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs; 

        this._scale = [scale[0], scale[1], scale[0]];

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow }

        const boxSpecs = { size: { width: this._radius * 2, depth: this._radius * 2, height: this._height }, lines };
        
        const chCylinderSpecs = { name, radius: this._radius, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale([scale[0], scale[1], scale[0]]);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision cylinder
        const chCylinder = this._chCylinder = new CollisionHexCylinder(chCylinderSpecs);

        this.update(false);

        this.cObjects = [chCylinder];
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

    get scaleR() {

        return this._scale[0];

    }

    set scaleR(r) {

        this._scale[0] = this._scale[2] = r;

        this.update();

    }

    get scale() {

        return [this._scale[0], this._scale[1]];

    }

    set scale(val = [1, 1]) {

        this._scale = [val[0], val[1], val[0]];

        this.update();

    }

    update(needToUpdateOBBnRay = true) {

        // update gltf scale
        this.gltf.setScale(this._scale);

        // update box scale
        this.box.setScale(this._scale);

        // update collision hex cylinder
        this._chCylinder.setScale(this._scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

}

export { RoundWoodenTable };
