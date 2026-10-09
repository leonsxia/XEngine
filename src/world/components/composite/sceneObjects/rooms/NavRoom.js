import { SceneObjectBase } from '../SceneObjectBase';
import { GLTFModel } from '../../../Models';

const GLTF_SRC = 'scene_objects/rooms/nav_room/nav_room.glb';

class NavRoom extends SceneObjectBase {

    _navMesh;
    _walls;
    _room;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1] } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow, needAdjustPosition: false };
        this.GLTFs.push(new GLTFModel(gltfSpecs));

        this.addGLTFs();

    }

    async init() {

        await super.init();

        this._navMesh = this.GLTFs[0].getChildByName('Nav_Mesh');
        this._walls = this.GLTFs[0].getChildByName('Walls');
        this._room = this.GLTFs[0].getChildByName('Room');

        this.update();

    }

    update() {

        // update gltfs scale
        for (let i = 0, il = this.GLTFs.length; i < il; i++) {

            this.GLTFs[i].setScale(this._scale);

        }

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        this._room.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this._walls.userData.physics = { mass, restitution, friction, manuallyLoad: true };

        this.rapierInstances.push(this._room, this._walls);

    }

}

export { NavRoom };