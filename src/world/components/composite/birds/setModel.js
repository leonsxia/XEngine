import { AnimationClip, NumberKeyframeTrack, VectorKeyframeTrack, AnimationMixer, LoopOnce } from 'three';

function setupModel(data, position) {
    const model = data.scene;
    const clip = data.animations[0];
    const [ x, y, z ] = position;
    const positionKF = new VectorKeyframeTrack(
        '.position',
        [0, 0.3, 0.6, 0.9, 1.2],
        [
            5 * x, 5 * y, 5 * z, 
            5 * (x + Math.random() * 2 - 1), 5 * (y + Math.random() * 2 - 1), 5 * (z + Math.random() * 2 - 1), 
            5 * x, 5 * y, 5 * z, 
            5 * (x + Math.random() * 2 - 1), 5 * (y + Math.random() * 2 - 1), 5 * (z + Math.random() * 2 - 1), 
            5 * x, 5 * y, 5 * z
        ]
    );
    const scaleKF = new VectorKeyframeTrack(
        '.scale',
        [0, 0.3, 0.6, 0.9, 1.2],
        [1, 1, 1, 1.5, 1.5, 1.5, 1, 1, 1, 0.8, 0.8, 0.8, 1, 1, 1]
    );
    const moveScaleClip = new AnimationClip('move-n-scale', -1, [positionKF, scaleKF]);

    const mixer = new AnimationMixer(model);
    const action = mixer.clipAction(clip);
    // action.clampWhenFinished = true;
    // const action2 = mixer.clipAction(moveScaleClip);
    // action.play();
    action
    // .setLoop(LoopOnce, 1)
        .startAt(0)
        .setEffectiveTimeScale(1) // 0.5
        .setEffectiveWeight(1)
        .play();
    // action2
    //     .startAt(1)
    //     .setEffectiveTimeScale(0.5)
    //     .setEffectiveWeight(0.2)
    //     .play();
    model.tick = (delta) => mixer.update(delta);
    return model;
}

export { setupModel };