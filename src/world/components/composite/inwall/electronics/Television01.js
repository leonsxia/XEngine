import { Object3D, Vector3 } from 'three';
import { createOBBBox } from '../../../physics/collisionHelper';
import { GLTFModel, CollisionBox, Box } from '../../../Models';
import { TVNoise } from '../../../basic/colorBase';
import { LightLamp } from '../lighting/LightLamp';

const GLTF_SRC = 'inRoom/electronics/Television_01_1k/Television_01_1k.gltf';

class Television01 extends LightLamp {

    width = .6;
    height = .456;
    depth = .464;

    gltf;

    spotLightPosition = new Vector3();
    spotLightTargetPos = new Vector3();
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
        const bloomScreenSpecs = { name: `${name}_screen`, size: { width: screenWidth, height: screenHeight, depth: screenDepth }, color: TVNoise, useBasicMaterial: true, transparent: true };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(scale);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

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
        this.spotLightTargetPos.set(screenX, screenY, screenZ + 1);
        this.spotLightTarget.position.copy(this.spotLightTargetPos);

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

                    this.bloomObjects[0].linked = light;
                    this.bloomObjects[0].material.color.copy(light.color);
                }

                break;

        }

        this.lightObjs.push(lightObj);
        this.lightIntensities.push(light.intensity);

        this.bindBloomEvents(lightObj);

        this.group.add(light);

    }

    setLightPositionNTarget(light, position, target, type) {

        switch(type) {

            case 'screen':
                {
                    const pos = new Vector3(...position);
                    const tar = new Vector3(...target);
                    light.position.copy(pos.add(this.spotLightPosition));
                    light.target.position.copy(tar.add(this.spotLightTargetPos));
                }

                break;
        }
    }

    getLightPositionNTarget(light, type) {

        const results = {};

        switch(type) {

            case 'screen':
                {
                    results.position = light.position.clone().sub(this.spotLightPosition);
                    results.target = light.target.position.clone().sub(this.spotLightTargetPos);
                }

                break;
        }

        return results;
    }

}

export { Television01 };