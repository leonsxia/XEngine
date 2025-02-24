import { AnimationMixer, AnimationUtils, LoopOnce } from 'three';
import { Logger } from '../../systems/Logger';

const DEBUG = false;

class AnimateWorkstation {

    model;
    // original animation clips
    animations;
    clipConfigs;
    mixer;
    clips = {};
    actions = {};
    previousAction;
    activeAction;
    logger = new Logger(DEBUG, 'AnimateWorkstation');
    isLooping = false;
    cachedAction;

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

        for (let i = 0, il = this.animations.length; i < il; i++) {

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

            const { nick, loopOnce = false, startImmediately = true, timeScale, weight = 1, isDefault = false } = config;

            if (loopOnce) {

                action.clampWhenFinished = true;
                action.setLoop(LoopOnce, 1);

            }            

            this.actions[nick] = { 
                action, 
                weight, 
                timeScale: 1,
                play: () => { action.play(); return action; },
                stop: () => { action.stop(); return action; },
                reset: () => { action.reset(); return action; },
                fadeOut: (dur) => { action.fadeOut(dur); return action; },
                name: action._clip.name,
                nick,
                isDefault,
                loopOnce,
                startImmediately,
                callback: null
            };

            if (timeScale) {

                action.setEffectiveTimeScale(timeScale);
                this.actions[nick].timeScale = timeScale;

            }

        }

        this.activateAllActions();
        
    }

    activateAllActions() {

        for (const act in this.actions) {

            const action = this.actions[act];

            if (action.isDefault) {

                const { weight } = action;
                this.setWeight(action, weight);
                this.activeAction = this.previousAction = action;
                // action.play();

            } else {

                this.setWeight(action, 0);

            }

            if (!action.loopOnce && action.startImmediately) {

                action.play();

            }

        }

    }

    pauseAllActions() {

        for (const act in this.actions) {

            const action = this.actions[act].action;
            action.paused = true;

        }

    }

    unPauseAllActions() {

        for (const act in this.actions) {

            const action = this.actions[act].action;
            action.paused = false;

        }

    }

    synchronizeCrossFade(startAction, endAction, duration) {        

        const onLoopFinished = (event) => {

            if (event.action === startAction.action) {

                this.mixer.removeEventListener('loop', onLoopFinished);

                this.executeCrossFade(startAction, endAction, duration);

            }
        }

        this.mixer.addEventListener('loop', onLoopFinished);

    }

    oneTimeCrossFade(endAction, duration, restoreDuration = duration, endWeight = 1, endCallback) {

        // this.executeCrossFade(startAction, endAction, duration);
        this.setWeight(endAction, endWeight);
        this.fadeToAction(endAction, duration);
        this.isLooping = true;

        const onLoopFinished = () => {

            this.mixer.removeEventListener('finished', onLoopFinished);
            this.isLooping = false;

            // this.executeCrossFade(this.activeAction, this.previousAction, restoreDuration);
            const fadeToAction = this.cachedAction ? this.cachedAction : this.previousAction;
            this.fadeToAction(fadeToAction, restoreDuration);

            if (endCallback) endCallback();
            
        }

        this.mixer.addEventListener('finished', onLoopFinished);

    }

    executeCrossFade(startAction, endAction, duration, endWeight = 1) {
                
        this.setWeight(endAction, endWeight);
        // this.logger.log(`end weight: ${endAction.weight}`);
        endAction.action.time = 0;
        this.previousAction = this.activeAction;
        this.activeAction = endAction;        
        
        if (endAction.callback) {

            this.logger.log(`end ${endAction.name} callback`);
            endAction.callback();
            this.logger.log(`end ${endAction.name} weight: ${endAction.weight}, timeScale: ${endAction.timeScale}`);
            endAction.callback = null;

        }

        this.activeAction.play();
        // Crossfade with warping - you can also try without warping by setting the third parameter to false
        startAction.action.crossFadeTo(endAction.action, duration, true);
        // this.previousAction.stop();
        this.logger.log(`start action: ${startAction.name} cross fade to end action: ${endAction.name} - weight: ${endAction.weight} - timeScale: ${endAction.timeScale}`);        

        if (endAction.timeScale) endAction.action.setEffectiveTimeScale(endAction.timeScale);
        
    }

    fadeToAction(endAction, duration) {

        this.logger.log(`active action: ${this.activeAction.name} fade to end action: ${endAction.name}`);

        this.previousAction = this.activeAction;
        this.activeAction = endAction;

        if (this.previousAction !== this.activeAction) {

            this.previousAction.action.fadeOut(duration);

        }

        this.activeAction.action
            .reset()
            .setEffectiveTimeScale(endAction.timeScale)
            .setEffectiveWeight(endAction.weight)
            .fadeIn(duration)
            .play();

    }

    // This function is needed, since animationAction.crossFadeTo() disables its start action and sets
    // the start action's timeScale to ((start animation's duration) / (end animation's duration))
    setWeight(action, weight) {

        action.action.enabled = true;
        // this.setActionEffectiveTimeScale(action.nick, 1);
        this.setActionEffectiveWeight(action.nick, weight);

    }

    prepareCrossFade(startAction, endAction, duration, endWeight = 1, sync = false, loop = true, restoreDuration = duration, endCallback) {

        this.unPauseAllActions();

        if (this.isLooping && endAction !== this.activeAction) {
            
            this.cachedAction = endAction;
            return;
            
        };

        this.cachedAction = null;

        if (loop) {

            this.executeCrossFade(startAction, endAction, duration, endWeight);

        } else if (sync) {

            this.synchronizeCrossFade(startAction, endAction, duration);

        } else {

            if (endAction !== this.activeAction) {

                this.oneTimeCrossFade(endAction, duration, restoreDuration, endWeight, endCallback);

            }

        }

    }

    setActionEffectiveTimeScale(action, timescale) {

        const findAction = this.actions[action];

        findAction.action.setEffectiveTimeScale(timescale);
        findAction.timeScale = timescale;

        return this;

    }

    setActionEffectiveWeight(action, weight) {

        const findAction = this.actions[action];

        findAction.action.setEffectiveWeight(weight);
        findAction.weight = weight;

        return this;

    }

    setActionWeightTimeScaleInCallback(action, weight, timescale) {

        const findAction = this.actions[action];

        findAction.callback = () => {

            if (weight) this.setActionEffectiveWeight(action, weight);

            if (timescale) this.setActionEffectiveTimeScale(action, timescale);

        };

        return this;

    }

    clearActionCallback(action) {

        const findAction = this.actions[action];

        if (findAction) findAction.callback = null;

    }

    makeSubAction(target, name, startFrame, endFrame, config, fps = 30) {

        const tarClip = this.clips[target].animate;

        const subclip = AnimationUtils.subclip(tarClip, name, startFrame, endFrame, fps);

        const subAction = this.mixer.clipAction(subclip);

        const { nick = name, loopOnce = false, startImmediately = true, isDefault = false, weight = 1, timeScale = 1 } = config;

        if (loopOnce) {

            subAction.clampWhenFinished = true;
            subAction.setLoop(LoopOnce, 1);

        }

        subAction.setEffectiveTimeScale(timeScale);
        subAction.setEffectiveWeight(weight);

        this.actions[nick] = { 
            action: subAction, 
            weight, 
            timeScale,
            play: () => { subAction.play(); return subAction; },
            stop: () => { subAction.stop(); return subAction; },
            name: `${tarClip.name}_${name}`,
            nick,
            isDefault,
            loopOnce,
            startImmediately,
            callback: null
        };

        if (!loopOnce && startImmediately) {

            subAction.play();

        }

    }

    playAction(action) {

        const findAction = this.actions[action];

        this.setActionEffectiveWeight(action, 1);
        this.setActionEffectiveTimeScale(action, findAction.timeScale);

        findAction.reset().play();

    }

}

export { AnimateWorkstation };