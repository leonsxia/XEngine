import { Object3D, Vector3 } from 'three';
import { createOBBBox } from '../../../physics/collisionHelper';
import { ObstacleBase } from '../ObstacleBase';
import { GLTFModel, CollisionBox, Box } from '../../../Models';
import { deepSkyBlue } from '../../../basic/colorBase';

const GLTF_SRC = 'inRoom/electronics/Television_01_1k/Television_01_1k.gltf';

class Television01 extends ObstacleBase {

    width = .6;
    height = .456;
    depth = .464;

    gltf;

    spotLightPosition = new Vector3();
    spotLightTarget = new Object3D();

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = true } = specs;
        const { offsetY = - .228, offsetZ = .032 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this.width *= scale[0];
        this.height *= scale[1];
        this.depth *= scale[2];

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, offsetZ, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this.width, depth: this.depth, height: this.height }, lines };

        const cBoxSpecs = { name: `${name}_cbox`, width: this.width, depth: this.depth, height: this.height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        const screenWidth = .36 * scale[0];
        const screenHeight = .28 * scale[1];
        const screenDepth = .04 * scale[2];
        const bloomScreenSpecs = { name: `${name}_screen`, size: { width: screenWidth, height: screenHeight, depth: screenDepth }, color: deepSkyBlue, useBasicMaterial: true, transparent: true };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.mesh.visible = false;

        // collision box
        const cBox = new CollisionBox(cBoxSpecs);
        const cBoxZ = .012 * scale[2];
        cBox.setPosition([0, 0, cBoxZ]);

        this.cObjects = [cBox];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        // bloom object
        const bloomScreen = new Box(bloomScreenSpecs);
        const screenX = -.068 * scale[0];
        const screenY = .03 * scale[1];
        const screenZ = .205 * scale[2];
        bloomScreen.setPosition([screenX, screenY, screenZ]);
        this.bloomObjects = [bloomScreen];
        this.setBloomObjectsFather();
        this.setBloomObjectsTransparent();
        this.setBloomObjectsLayers();
        this.setBloomObjectsVisible(false);
        this.addBloomObjects();

        this.spotLightPosition.set(screenX, screenY, screenZ);
        this.spotLightTarget.position.set(screenX, screenY, screenZ + 1);

        this.group.add(
            this.gltf.group,
            this.box.mesh,
            this.spotLightTarget
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();

    }

    addLight(lightObj, type) {

        const { light } = lightObj;

        switch(type) {

            case 'screen':  // spot light
                {
                    light.position.add(this.spotLightPosition);
                    this.spotLightTarget.position.add(light.target.position);
                    light.target = this.spotLightTarget;
                }

                break;

        }

        this.lightObjs.push(lightObj);
        this.lightIntensities.push(light.intensity);

        this.group.add(light);

    }

}

export { Television01 };