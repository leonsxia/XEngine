import { GLTFModel, Tofu } from '../../Models';
import { SOLDIER_FEMALE_CLIPS as CLIPS } from '../../utils/constants';
import { AnimateWorkstation } from '../../Animation/AnimateWorkstation';

const GLTF_SRC = 'characters/soldier_female.glb';

class SoldierFemale extends Tofu {

    gltf;
    mixer;
    clips = {};    
    actions = {};

    AWS;

    constructor(specs) {

        const { name, src = GLTF_SRC, receiveShadow = true, castShadow = true, hasBones = true } = specs;
        const { offsetY = - .89 } = specs;

        super({ name, size: { width: .7, depth: .9, height: 1.78 } });

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, offsetY, receiveShadow, castShadow, hasBones };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);    
        
        this.group.add(this.gltf.group);

        this.showTofu(false);

    }

    async init() {

        await this.gltf.init();

        this.AWS = new AnimateWorkstation({ model: this.gltf, clipConfigs: CLIPS });
        this.AWS.init();

    }    

    // animation controls
    movingForward(val) {        

        if (val) {

            if (this.accelerating) {

                if (this.rotating) {

                    console.log(`walk turn to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.RUN.nick], 0.2);

                } else {

                    console.log(`idle to run`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.RUN.nick], 0.4);

                }

            } else if (!this.rotating) {

                console.log('idle to walk');
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], 0.1);

            }

        } else {
            
            if (this.accelerating) {

                if (this.rotating) {

                    console.log(`run to walk turn`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.WALK.nick], 0.2);

                } else {

                    console.log(`run to idle`);
                    this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.IDLE.nick], 0.3);

                }

            } else if (!this.rotating) {

                console.log(`walk to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], 0.3);

            }
            
        }      
        
        super.movingForward(val);

    }

    movingBackward(val) {

        if (val) {

            if (this.accelerating && !this.rotating) {

                console.log(`quick turn 1`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], 0.1, 0.7);

            } else {

                console.log(`idle to walk backward`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], 0.1, 0.7);
                this.AWS.setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);
                
            }

        } else {

            if (!this.rotating) {

                console.log(`walk back to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], 0.3);                

            } else {

                console.log(`walk back to turning`);
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, 1).setActionEffectiveTimeScale(CLIPS.WALK.nick, 1);

            }

        }

        super.movingBackward(val);

    }

    movingLeft(val) {

        if (val) {

            if (!this.forward && !this.backward) {

                console.log(`idle to left turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], 0.1);

            }

        } else {

            if (!this.forward && !this.backward) {

                console.log(`left turn to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], 0.1);

            }
        }

        super.movingLeft(val);

    }

    movingRight(val) {

        if (val) {

            if (!this.forward && !this.backward) {

                console.log(`idle to right turn`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.IDLE.nick], this.AWS.actions[CLIPS.WALK.nick], 0.1);

            }

        } else {

            if (!this.forward && !this.backward) {

                console.log(`right turn to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.IDLE.nick], 0.1);

            }
        }

        super.movingRight(val);

    }

    accelerate(val) {        

        if (val) {
            
            if (this.forward) {

                console.log(`walk to run`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.WALK.nick], this.AWS.actions[CLIPS.RUN.nick], 0.2);

            } else if (this.isBackward && !this.rotating) {

                console.log(`quick turn 2`);

            }
            
        } else {

            if (this.forward) {

                console.log(`run to walk`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.WALK.nick], 0.2);

            } else if (this.backward) {

                console.log(`quick turn to walk back`);
                this.AWS.setActionEffectiveWeight(CLIPS.WALK.nick, 0.7).setActionEffectiveTimeScale(CLIPS.WALK.nick, -1);

            } else if (!this.rotating) {

                console.log(`run to idle`);
                this.AWS.prepareCrossFade(this.AWS.actions[CLIPS.RUN.nick], this.AWS.actions[CLIPS.IDLE.nick], 0.3);

            }

        }

        super.accelerate(val);

    }

    finalTick(delta) {

        this.AWS.mixer.update(delta);

    }

}

export { SoldierFemale };