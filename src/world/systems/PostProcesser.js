import { Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';
import { OutlinePass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/examples/jsm/Addons.js';
import { SSAOPass } from 'three/examples/jsm/Addons.js';
import { FXAAShader } from 'three/examples/jsm/Addons.js';
import { OUTLINE, SSAO, FXAA } from '../components/utils/constants';
import { white } from '../components/basic/colorBase';

const DEFAULT_OUTLINE = {
    edgeStrength: 3.0,
    edgeGlow: 0.0,
    edgeThickness: 1.0,
    pulsePeriod: 0,
    rotate: false,
    usePatternTexture: false
};

class PostProcessor {

    #renderer;
    #scene;
    #camera;
    #container;

    composer;

    // passes
    renderPass;
    outputPass;
    outlinePass;
    ssaoPass;
    effectFXAA;

    effects = [];

    constructor(renderer, scene, camera, container) {

        this.#renderer = renderer;
        this.#scene = scene;
        this.#camera = camera;
        this.#container = container;

        this.composer = new EffectComposer(renderer);

        this.renderPass = new RenderPass(scene, camera);
        this.outputPass = new OutputPass();
        this.outlinePass = new OutlinePass( new Vector2( container.clientWidth, container.clientHeight ), scene, camera );
        this.ssaoPass = new SSAOPass(scene, camera, container.clientWidth, container.clientHeight);
        this.effectFXAA = new ShaderPass( FXAAShader );

        this.effects = [this.outlinePass, this.ssaoPass, this.effectFXAA];
        this.disableAllEffects();

        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.outlinePass);
        this.composer.addPass(this.ssaoPass)
        this.composer.addPass(this.outputPass);
        this.composer.addPass(this.effectFXAA);
        
    }

    get clientWidth() {

        return this.#container.clientWidth;

    }

    get clientHeight() {

        return this.#container.clientHeight;

    }

    disableAllEffects() {

        this.effects.forEach(e => e.enabled = false);

    }

    reset() {

        this.resetSSAO();
        this.resetFXAA();

    }

    resetFXAA() {

        this.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / this.clientWidth, 1 / this.clientHeight );

    }

    resetSSAO() {

        this.ssaoPass.setSize(this.clientWidth, this.clientHeight);

    }

    addOutlineObjects(objArr) {

        this.outlinePass.selectedObjects.push(...objArr);

    }

    clearOutlineObjects() {

        this.outlinePass.selectedObjects = [];

    }

    setEffectPass(type, specs) {

        // const passCount = this.composer.passes.length;
        // const outputIdx = this.composer.passes.findIndex(pass => pass instanceof OutputPass);
        
        switch(type) {
            
            case OUTLINE:
                {
                    const { 
                        enabled, texture,
                        edgeStrength = DEFAULT_OUTLINE.edgeStrength, 
                        edgeGlow = DEFAULT_OUTLINE.edgeGlow, 
                        edgeThickness = DEFAULT_OUTLINE.edgeThickness, 
                        pulsePeriod = DEFAULT_OUTLINE.pulsePeriod, 
                        usePatternTexture = DEFAULT_OUTLINE.usePatternTexture 
                    } = specs;

                    if (enabled) {

                        this.outlinePass.patternTexture = texture;
                        this.outlinePass.edgeStrength = edgeStrength;
                        this.outlinePass.edgeGlow = edgeGlow;
                        this.outlinePass.edgeThickness = edgeThickness;
                        this.outlinePass.pulsePeriod = pulsePeriod;
                        this.outlinePass.hiddenEdgeColor.setHex(white);
                        this.outlinePass.usePatternTexture = usePatternTexture;

                    } 
                    this.outlinePass.enabled = enabled;
                }
                break;

            case SSAO:
                {
                    const { 
                        enabled,
                        kernelRadius = 8,
                        minDistance = .005,
                        maxDistance = .1
                    } = specs;

                    if (enabled) {

                        this.resetSSAO();
                        this.ssaoPass.kernelRadius = kernelRadius;
                        this.ssaoPass.minDistance = minDistance;
                        this.ssaoPass.maxDistance = maxDistance;
                        // this.ssaoPass.output = SSAOPass.OUTPUT.Blur;

                    }

                    this.ssaoPass.enabled = enabled;

                }
                break;

            case FXAA:
                {
                    const { enabled } = specs;

                    if (enabled) {

                        this.resetFXAA();

                    } 

                    this.effectFXAA.enabled = enabled;

                }
                break;
        }
    }

}

export { PostProcessor };