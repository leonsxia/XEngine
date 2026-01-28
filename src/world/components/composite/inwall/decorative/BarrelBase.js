import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, GeometryDesc, MeshDesc } from '../../../Models';
import { CYLINDER_GEOMETRY } from '../../../utils/constants';

class BarrelBase extends ObstacleBase {

    _radius = 1;
    _height = 1;

    gltf;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1] } = specs;
        const { src, receiveShadow = true, castShadow = true } = specs;

        this._scale = [scale[0], scale[1], scale[0]];

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale([scale[0], scale[1], scale[0]]);

        this.update();

        this.group.add(
            this.gltf.group
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

    update() {

        // update gltf scale
        this.gltf.setScale(this._scale);

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const radius = this._radius * this.scale[0];
        const height = this._height * this.scale[1];
        const { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        const cylinderGeo = new GeometryDesc({ type: CYLINDER_GEOMETRY, radiusBottom: radius, height });
        const cylinderMesh = new MeshDesc(cylinderGeo);
        cylinderMesh.name = `${this.name}_cylinder_mesh_desc`;
        cylinderMesh.userData.physics = { mass, restitution, friction };

        this.rapierInstances.push(cylinderMesh);

    }

}

export { BarrelBase };