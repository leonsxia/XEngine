import { Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { ShaderPass } from 'three/examples/jsm/Addons.js';
import { OutlinePass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/examples/jsm/Addons.js';
import { SSAOPass } from 'three/examples/jsm/Addons.js';
import { FXAAShader } from 'three/examples/jsm/Addons.js';
import { OUTLINE, SSAO, FXAA, TRI_PATTERN, REPEAT_WRAPPING } from '../components/utils/constants';
import { white } from '../components/basic/colorBase';
import { loadSingleTexture } from '../components/utils/textureHelper';

const DEFAULT_OUTLINE = {
    edgeStrength: 3.0,
    edgeGlow: 0.0,
    edgeThickness: 1.0,
    pulsePeriod: 0,
    usePatternTexture: false,
    enabled: false
};

const DEFAULT_SSAO = {
    kernelRadius: 8,
    minDistance: .005,
    maxDistance: .1,
    output: SSAOPass.OUTPUT.Default,
    enabled: false
}

const SSAO_OUTPUT = {
    Default: SSAOPass.OUTPUT.Default,
    SSAOOnly: SSAOPass.OUTPUT.SSAO,
    SSAOBlur: SSAOPass.OUTPUT.Blur,
    Depth: SSAOPass.OUTPUT.Depth,
    Normal: SSAOPass.OUTPUT.Normal
}

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

    // config
    #outlineConfig = {};
    #ssaoConfig = {};

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

        Object.assign(this.#outlineConfig, DEFAULT_OUTLINE);
        Object.assign(this.#ssaoConfig, DEFAULT_SSAO);
        
    }

    get clientWidth() {

        return this.#container.clientWidth;

    }

    get clientHeight() {

        return this.#container.clientHeight;

    }

    async init() {

        const { texture } = await loadSingleTexture({ map: TRI_PATTERN });

        texture.wrapS = REPEAT_WRAPPING;
        texture.wrapT = REPEAT_WRAPPING;
        this.triTexture = texture;

        this.outlinePass.patternTexture = texture;

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

        if (this.outlinePass.selectedObjects.length > 0) {

            delete this.outlinePass.selectedObjects[0].isPicked;
            this.outlinePass.selectedObjects = [];

        }

    }

    setEffectPass(type, specs) {

        // const passCount = this.composer.passes.length;
        // const outputIdx = this.composer.passes.findIndex(pass => pass instanceof OutputPass);
        
        switch(type) {
            
            case OUTLINE:
                {
                    const { 
                        enabled = this.#outlineConfig.enabled,
                        edgeStrength = this.#outlineConfig.edgeStrength, 
                        edgeGlow = this.#outlineConfig.edgeGlow, 
                        edgeThickness = this.#outlineConfig.edgeThickness, 
                        pulsePeriod = this.#outlineConfig.pulsePeriod, 
                        usePatternTexture = this.#outlineConfig.usePatternTexture 
                    } = specs;

                    this.#outlineConfig.enabled = enabled;
                    this.#outlineConfig.edgeStrength = edgeStrength;
                    this.#outlineConfig.edgeGlow = edgeGlow;
                    this.#outlineConfig.edgeThickness = edgeThickness;
                    this.#outlineConfig.pulsePeriod = pulsePeriod;
                    this.#outlineConfig.usePatternTexture = usePatternTexture;

                    this.outlinePass.edgeStrength = edgeStrength;
                    this.outlinePass.edgeGlow = edgeGlow;
                    this.outlinePass.edgeThickness = edgeThickness;
                    this.outlinePass.pulsePeriod = pulsePeriod;
                    this.outlinePass.hiddenEdgeColor.setHex(white);
                    this.outlinePass.usePatternTexture = usePatternTexture;
                    this.outlinePass.enabled = enabled;
                }
                break;

            case SSAO:
                {
                    const { 
                        enabled = this.#ssaoConfig.enabled,
                        kernelRadius = this.#ssaoConfig.kernelRadius,
                        minDistance = this.#ssaoConfig.minDistance,
                        maxDistance = this.#ssaoConfig.maxDistance,
                        output = this.#ssaoConfig.output
                    } = specs;

                    this.#ssaoConfig.enabled = enabled;
                    this.#ssaoConfig.kernelRadius = kernelRadius;
                    this.#ssaoConfig.minDistance = minDistance;
                    this.#ssaoConfig.maxDistance = maxDistance;
                    this.#ssaoConfig.output = output;

                    this.resetSSAO();
                    this.ssaoPass.kernelRadius = kernelRadius;
                    this.ssaoPass.minDistance = minDistance;
                    this.ssaoPass.maxDistance = maxDistance;
                    this.ssaoPass.output = output;

                    this.ssaoPass.enabled = enabled;

                }
                break;

            case FXAA:
                {
                    const { enabled } = specs;

                    this.resetFXAA();

                    this.effectFXAA.enabled = enabled;

                }
                break;
        }
    }

}

export { PostProcessor, SSAO_OUTPUT };