import { AnimationMixer, LoopOnce } from 'three';

class AnimateWorkstation {

    model;
    // original animation clips
    animations;
    clipConfigs;
    mixer;
    clips = {};
    actions = {};

    constructor(specs) {

        const { model: { gltf: { animations = [] }, group }, clipConfigs } = specs;
        this.animations = animations;
        this.clipConfigs = clipConfigs;
        this.model = group;

    }

    init() {

        this.setupAnimationClips();
        this.setupAnimationMixer();

    }

    setupAnimationClips() {

        for (let i = 0; i < this.animations.length; i++) {

            const animate = this.animations[i];

            for (const clip in this.clipConfigs) { 

                const config = this.clipConfigs[clip];

                if (config.name === animate.name && config.enable) {
                    
                    this.clips[config.nick] = { animate, config };
                    
                } else {

                    continue;

                }
            }

        }

    }

    setupAnimationMixer() {

        this.mixer = new AnimationMixer(this.model);

        for (const clipName in this.clips) {

            const clip = this.clips[clipName];
            const { animate, config } = clip;
            const action = this.mixer.clipAction(animate);
            
            action.startAt(0);

            const { nick, loopOnce, timeScale } = config;
            if (loopOnce) {

                action.clampWhenFinished = true;
                action.setLoop(LoopOnce, 1);

            }

            if (timeScale) {

                action.setEffectiveTimeScale(timeScale);

            }

            this.actions[nick] = action;

        }

        this.activateAllActions();
        
    }

    activateAllActions() {

        for (const act in this.actions) {

            const action = this.actions[act];

            if (act !== this.clipConfigs.IDLE.nick) {

                this.setWeight(action, 0);

            } else {

                this.setWeight(action, 1);
            }

            action.play();

        }

    }

    pauseAllActions() {

        for (const act in this.actions) {

            const action = this.actions[act];
            action.paused = true;

        }

    }

    unPauseAllActions() {

        for (const act in this.actions) {

            const action = this.actions[act];
            action.paused = false;

        }

    }

    synchronizeCrossFade(startAction, endAction, duration) {        

        const onLoopFinished = (event) => {

            if (event.action === startAction) {

                this.mixer.removeEventListener('loop', onLoopFinished);

                this.executeCrossFade(startAction, endAction, duration);

            }
        }

        this.mixer.addEventListener('loop', onLoopFinished);
    }

    executeCrossFade(startAction, endAction, duration, endWeight = 1) {
        
        // Not only the start action, but also the end action must get a weight of 1 before fading
        // (concerning the start action this is already guaranteed in this place)
        this.setWeight(endAction, endWeight);
        endAction.time = 0;

        // Crossfade with warping - you can also try without warping by setting the third parameter to false
        startAction.crossFadeTo(endAction, duration, true);
        
    }

    // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
    // the start action's timeScale to ((start animation's duration) / (end animation's duration))
    setWeight(action, weight) {

        action.enabled = true;
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(weight);

    }

    prepareCrossFade(startAction, endAction, duration, endWeight = 1) {

        this.unPauseAllActions();

        // If the current action is 'idle' (duration 4 sec), execute the crossfade immediately;
        // else wait until the current action has finished its current loop
        if (startAction === this.actions[this.clipConfigs.IDLE.nick]) {

            this.executeCrossFade(startAction, endAction, duration, endWeight);

        } else {

            // this.synchronizeCrossFade( startAction, endAction, duration );
            this.executeCrossFade(startAction, endAction, duration, endWeight);

        }

    }

    setActionEffectiveTimeScale(action, timescale) {

        const findAction = this.actions[action];

        findAction.setEffectiveTimeScale(timescale);

        return this;

    }

    setActionEffectiveWeight(action, weight) {

        const findAction = this.actions[action];

        findAction.setEffectiveWeight(weight);

        return this;

    }

}

export { AnimateWorkstation };