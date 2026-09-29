import { Vector3 } from 'three';
import { SceneObjectBase } from "./SceneObjectBase";
import { updateSingleLightCamera } from "../../shadowMaker";
import { BLOOM_SCENE_LAYER } from "../../utils/constants";

const _v1 = new Vector3();
const _v2 = new Vector3();
const BLOOM_TYPE_DEFAULT = 'main';

class LightingSceneBase extends SceneObjectBase {

    bloomObjects = [];
    lightObjs = [];
    /*
    {
        bloomType, {
            lightObject, 
            bloomObject, 
            intensity, 
            position = new Vector3(), 
            target = new Vector3(), 
            currentPosition = new Vector3(), 
            currentTarget = new Vector3(), 
            targetObject = new Object3D() 
    }}
    */
    lightingMap = new Map();
    alwaysOn = true;

    constructor(specs) {

        super(specs);

    }

    setLightingMap(bloomType, bloomObject) {

        this.lightingMap.set(bloomType, bloomObject);

    }

    updateLightingMap(needToUpdateLight = true) {

        for (const bloomContainer of this.lightingMap.values()) {

            let { lightObject, position, target, currentPosition, currentTarget, targetObject } = bloomContainer;
            _v1.set(position.x * this.scale[0], position.y * this.scale[1], position.z * this.scale[2]);
            target ? _v2.set(target.x * this.scale[0], target.y * this.scale[1], target.z * this.scale[2]) : null;

            if (needToUpdateLight) {

                const { light } = lightObject;
                light.position.sub(currentPosition).add(_v1);

                if (light.isSpotLight) {

                    light.target.position.sub(currentTarget).add(_v2);
                    updateSingleLightCamera.call(null, lightObject, false);

                }

            } else {

                targetObject?.position.copy(_v2);

            }

            currentPosition.copy(_v1);
            currentTarget?.copy(_v2);

        }

    }

    addLight(lightObj, bloomType = BLOOM_TYPE_DEFAULT) {

        const { light } = lightObj;
        const bloomContainer = this.lightingMap.get(bloomType);
        const { bloomObject, currentPosition, targetObject } = bloomContainer;

        light.bloomType = bloomType;
        light.position.add(currentPosition);

        if (light.isSpotLight) {

            targetObject.position.add(light.target.position);
            light.target = targetObject;

            this.group.add(targetObject);

        }

        this.lightObjs.push(lightObj);
        bloomContainer.intensity = light.intensity;
        bloomContainer.lightObject = lightObj;
        bloomObject.material.color.copy(light.color);
        this.bindBloomEvents(lightObj);

        this.group.add(light);

    }

    setLightPosition(light, position, bloomType = BLOOM_TYPE_DEFAULT) {

        const { currentPosition } = this.lightingMap.get(bloomType);
        _v1.set(...position);
        light.position.copy(_v1.add(currentPosition));

    }

    getLightPosition(light, bloomType = BLOOM_TYPE_DEFAULT) {

        const { currentPosition } = this.lightingMap.get(bloomType);
        return light.position.clone().sub(currentPosition);

    }

    setLightPositionNTarget(light, position, target, bloomType = BLOOM_TYPE_DEFAULT) {

        const { currentPosition, currentTarget } = this.lightingMap.get(bloomType);
        _v1.set(...position);
        _v2.set(...target);
        light.position.copy(_v1.add(currentPosition));
        light.target.position.copy(_v2.add(currentTarget));

    }

    getLightPositionNTarget(light, bloomType = BLOOM_TYPE_DEFAULT) {

        const { currentPosition, currentTarget } = this.lightingMap.get(bloomType);
        return {
            position: light.position.clone().sub(currentPosition),
            target: light.target.position.clone().sub(currentTarget)
        };

    }

    addBloomObjects() {

        for (let i = 0, il = this.bloomObjects.length; i < il; i++) {

            const bloom = this.bloomObjects[i];

            if (bloom.isMesh) {

                this.group.add(bloom);

            } else {

                this.group.add(bloom.mesh);

            }

        }

        return this;

    }

    setBloomObjectsTransparent(opacity = .1) {

        for (let i = 0, il = this.bloomObjects.length; i < il; i++) {

            const bloom = this.bloomObjects[i];

            if (bloom.isMesh) {

                bloom.material.transparent = true;
                bloom.material.opacity = opacity;

            } else {

                bloom.setTransparent(true, opacity);

            }

        }

    }

    setBloomObjectsFather() {

        for (let i = 0, il = this.bloomObjects.length; i < il; i++) {

            const bloom = this.bloomObjects[i];

            if (bloom.isMesh) {

                bloom.attachTo = this;

            } else {

                bloom.mesh.attachTo = this;

            }

        }

    }

    setBloomObjectsLayers() {

        for (let i = 0, il = this.bloomObjects.length; i < il; i++) {

            const bloom = this.bloomObjects[i];

            if (bloom.isMesh) {

                bloom.layers.enable(BLOOM_SCENE_LAYER);

            } else {

                bloom.mesh.layers.enable(BLOOM_SCENE_LAYER);

            }

        }

    }

    setBloomObjectsVisible(show) {

        for (let i = 0, il = this.bloomObjects.length; i < il; i++) {

            const bloom = this.bloomObjects[i];

            if (bloom.isMesh) {

                bloom.visible = show;

            } else {

                bloom.visible = show;

            }

        }

    }

    updateLightObjects() {

        if (this.lightObjs) {

            for (let i = 0, il = this.lightObjs.length; i < il; i++) {

                const l = this.lightObjs[i];

                updateSingleLightCamera.call(null, l, false);

            }

        }

    }

    bindBloomEvents(lightObj) {

        const { light } = lightObj;

        lightObj.updateAttachedObject = () => {

            const bloomObj = this.lightingMap.get(light.bloomType).bloomObject;

            if (bloomObj) {

                bloomObj.material.color.copy(light.color);

            };

        };

    }

    turnOffLights() {

        for (let i = 0; i < this.lightObjs.length; i++) {

            const { light } = this.lightObjs[i];
            const bloomContainer = this.lightingMap.get(light.bloomType);

            bloomContainer.intensity = light.intensity;
            light.intensity = 0;

        }

    }

    turnOnLights() {

        for (let i = 0; i < this.lightObjs.length; i++) {

            const { light } = this.lightObjs[i];
            const bloomContainer = this.lightingMap.get(light.bloomType);

            light.intensity = bloomContainer.intensity;

        }

    }

    // this is can be inherited by children
    updateLights() {}

    onRapierUpdated() {

        super.onRapierUpdated();
        this.updateLightObjects();

    }

}

export { LightingSceneBase, BLOOM_TYPE_DEFAULT };