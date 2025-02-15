import { ObstacleBase } from '../ObstacleBase';
import { updateSingleLightCamera } from '../../../shadowMaker';
import { BLOOM_SCENE_LAYER } from '../../../utils/constants';

class LightLamp extends ObstacleBase {

    bloomObjects = [];
    lightObjs = [];
    lightIntensities = [];
    alwaysOn = true;

    constructor(specs) {

        const { isObstacle = false, enableWallOBBs = false, movable = false, climbable = false } = specs;

        specs.isObstacle = isObstacle;
        specs.enableWallOBBs = enableWallOBBs;
        specs.movable = movable;
        specs.climbable = climbable;

        super(specs);

    }

    addBloomObjects() {

        this.bloomObjects.forEach(bloom => {

            if (bloom.isMesh) {

                this.group.add(bloom);

            } else {

                this.group.add(bloom.mesh);

            }

        });

        return this;
    }

    setBloomObjectsTransparent(opacity = .1) {

        this.bloomObjects.forEach(bloom => {

            if (bloom.isMesh) {

                bloom.material.transparent = true;
                bloom.material.opacity = opacity;

            } else {

                bloom.setTransparent(true, opacity);

            }

        });
    }

    setBloomObjectsFather() {

        this.bloomObjects.forEach(bloom => {

            if (bloom.isMesh) {

                bloom.father = this;

            } else {

                bloom.mesh.father = this;

            }

        });

    }

    setBloomObjectsLayers() {

        this.bloomObjects.forEach(bloom => {

            if (bloom.isMesh) {

                bloom.layers.enable(BLOOM_SCENE_LAYER);

            } else {

                bloom.mesh.layers.enable(BLOOM_SCENE_LAYER);

            }

        });

    }

    setBloomObjectsVisible(show) {

        this.bloomObjects.forEach(bloom => {

            if (bloom.isMesh) {

                bloom.visible = show;

            } else {

                bloom.visible = show;

            }

        });

    }

    updateLightObjects() {

        this.lightObjs?.forEach(l => {

            updateSingleLightCamera.call(null, l, false);

        });

    }

    bindBloomEvents(lightObj) {

        const { light } = lightObj;

        lightObj.updateAttachedObject = () => {

            const bloomObj = this.bloomObjects.find(f => f.linked === light);

            if (bloomObj) {

                bloomObj.material.color.copy(light.color);

            };

        };

    }

    turnOffLights() {

        for (let i = 0; i < this.lightObjs.length; i++) {

            const { light } = this.lightObjs[i];

            this.lightIntensities[i] = light.intensity;
            light.intensity = 0;

        }

    }

    turnOnLights() {

        for (let i = 0; i < this.lightObjs.length; i++) {

            const { light } = this.lightObjs[i];

            light.intensity = this.lightIntensities[i];

        }

    }

    tickFall(delta) {

        this.fallingTick({ delta, obstacle: this });

        this.updateOBBs();

        this.updateLightObjects();

    }

    onGround() {

        this.onGroundTick({ floor: this.hittingGround, obstacle: this });
        
        this.updateOBBs();

        this.updateLightObjects();
        
    }

}

export { LightLamp };