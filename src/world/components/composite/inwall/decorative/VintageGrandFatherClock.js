import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox, GeometryDesc, MeshDesc } from '../../../Models';
import { BOX_GEOMETRY } from '../../../utils/constants';

const GLTF_SRC = 'in_room/decorative/vintage_grandfather_clock_01_1k/vintage_grandfather_clock_01_1k.gltf';

class VintageGrandfatherClock extends ObstacleBase {

    _width = .613;
    _height = 2.2;
    _depth = .416;

    gltf;

    _cBox;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };
        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };
        const cBoxSpecs = { name: `${name}_cbox`, width: this._width, depth: this._depth, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        if (this.isSimplePhysics) {

            // obb box
            this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
            this.box.visible = false;
            this.group.add(this.box.mesh);

            // collision box
            const cBox = this._cBox = new CollisionBox(cBoxSpecs);

            this.cObjects = [cBox];
            this.walls = this.getWalls();
            this.topOBBs = this.getTopOBBs();
            this.bottomOBBs = this.getBottomOBBs();
            this.addCObjects();
            this.setCObjectsVisible(false);

        }

        this.update(false);

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

        // remove glass
        this.gltf.getMeshes(this.gltf.group);
        const cylinder001_1 = this.gltf.meshes.find(m => m.name === 'Cylinder001_1');

        cylinder001_1.parent.remove(cylinder001_1);

    }

    update(needToUpdateOBBnRay = true) {
    
        // update gltf scale
        this.gltf.setScale(this.scale);

        if (this.isSimplePhysics) {

            // update box scale
            this.box.setScale(this.scale);

            // update cBox scale
            this._cBox.setScale(this._scale);

        }

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];
        const { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        const boxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height, depth });
        const boxMesh = new MeshDesc(boxGeo);
        boxMesh.name = `${this.name}_box_mesh_desc`;
        boxMesh.userData.physics = { mass, restitution, friction };

        this.rapierInstances.push(boxMesh);

    }

}

export { VintageGrandfatherClock };