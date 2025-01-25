import { Group } from 'three';
import { GLTFModel } from '../../Models';
import { loadedGLTFModels } from '../../utils/gltfHelper';
import { WEAPONS } from '../../utils/constants';
import { Logger } from '../../../systems/Logger';

const GLTF_SRC = 'weapons/Pistol.glb';

const DEBUG = true;

class Pistol {

    gltf;
    group;

    constructor(specs) {

        const { name, scale = [.15, .15, .15] } = specs;
        const { position = [0, 0, 0], rotation = [0, 0, 0] } = specs;
        const { offsetX = 0, offsetY = 0, offsetZ = 0 } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        let { src = GLTF_SRC } = specs;

        if (loadedGLTFModels[WEAPONS.PISTOL]) {

            src = loadedGLTFModels[WEAPONS.PISTOL];

        }

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetX, offsetY, offsetZ, receiveShadow, castShadow};

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);
        this.gltf.setPosition(position);
        this.gltf.setRotation(rotation);

        this.group = new Group();

        this.group.add(this.gltf.group);

    }

    async init() {

        await this.gltf.init();

        if (!loadedGLTFModels[WEAPONS.PISTOL]) {

            loadedGLTFModels[WEAPONS.PISTOL] = this.gltf.gltf;

        }

    }

}

export { Pistol };