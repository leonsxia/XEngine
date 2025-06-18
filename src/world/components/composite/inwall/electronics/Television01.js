import { Object3D, Vector3 } from 'three';
import { createOBBBox } from '../../../physics/collisionHelper';
import { GLTFModel, CollisionBox, Box } from '../../../Models';
import { TVNoise } from '../../../basic/colorBase';
import { LightLamp } from '../lighting/LightLamp';
import { updateSingleLightCamera } from '../../../shadowMaker';

const GLTF_SRC = 'inRoom/electronics/Television_01_1k/Television_01_1k.gltf';

class Television01 extends LightLamp {

    _width = .6;
    _height = .456;
    _depth = .464;

    _screenWidth = .36;
    _screenHeight = .28;
    _screenDepth = .04;

    _cBoxZ = .012;

    _screenX = -.068;
    _screenY = .03;
    _screenZ = .205;
    _targetZ = 1;

    _bloomScreen;

    _cBox;

    gltf;

    spotLightPosition = new Vector3();
    spotLightTargetPos = new Vector3();
    spotLightTarget = new Object3D();

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1], lines = false } = specs;
        const { offsetY = - .228, offsetZ = .032 } = specs;  // offsetY used to set gltf model to zero position.
        const { showArrow = false } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, offsetZ, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        const cBoxSpecs = { name: `${name}_cbox`, width: this._width, depth: this._depth, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        const bloomScreenSpecs = { name: `${name}_screen`, size: { width: this._screenWidth, height: this._screenHeight, depth: this._screenDepth }, color: TVNoise, useBasicMaterial: true, transparent: true };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision box
        const cBox = this._cBox = new CollisionBox(cBoxSpecs);

        this.cObjects = [cBox];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        // bloom object
        const bloomScreen = this._bloomScreen = new Box(bloomScreenSpecs);
        this.bloomObjects = [bloomScreen];
        this.setBloomObjectsFather();
        this.setBloomObjectsTransparent();
        this.setBloomObjectsLayers();
        this.setBloomObjectsVisible(false);
        this.addBloomObjects();

        this.update(false, false);

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

    update(needToUpdateOBBnRay = true, needToUpdateLight = true) {

        // update cBox scale and position
        const cBoxZ = this._cBoxZ * this.scale[2];

        this._cBox.setScale(this.scale).setPosition([0, 0, cBoxZ]);

        // update bloom screen scale and position
        const screenX = this._screenX * this.scale[0];
        const screenY = this._screenY * this.scale[1];
        const screenZ = this._screenZ * this.scale[2];

        this._bloomScreen.setScale(this.scale).setPosition([screenX, screenY, screenZ]);

        // update bloom screen linked light position and target
        const spotLightPosition = new Vector3(screenX, screenY, screenZ);
        const spotLightTargetPos = new Vector3(screenX, screenY, screenZ + this._targetZ * this.scale[2]);

        if (needToUpdateLight) {

            const lightObj = this._bloomScreen.linked;
            const { light } = lightObj;

            light.position.sub(this.spotLightPosition).add(spotLightPosition);
            light.target.position.sub(this.spotLightTargetPos).add(spotLightTargetPos);            
            updateSingleLightCamera.call(null, lightObj, false);

        } else {

            this.spotLightTarget.position.copy(spotLightTargetPos);

        }

        this.spotLightPosition.copy(spotLightPosition);
        this.spotLightTargetPos.copy(spotLightTargetPos);

        // update gltf scale
        this.gltf.setScale(this.scale);

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

    addLight(lightObj, type) {

        const { light } = lightObj;

        switch(type) {

            case 'screen':  // spot light
                {
                    light.position.add(this.spotLightPosition);
                    this.spotLightTarget.position.add(light.target.position);
                    light.target = this.spotLightTarget;

                    this.bloomObjects[0].linked = lightObj;
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