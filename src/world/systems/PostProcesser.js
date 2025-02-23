import { Layers, ShaderMaterial, Vector2 } from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OUTLINE, SSAO, FXAA, SSAA, BLOOM, TRI_PATTERN, REPEAT_WRAPPING, BLOOM_SCENE_LAYER, SHADER_NAMES } from '../components/utils/constants';
import { black, white } from '../components/basic/colorBase';
import { loadSingleTexture } from '../components/utils/textureHelper';
import { basicMateraials } from '../components/basic/basicMaterial';
import { shaders } from '../components/utils/shaderHelper';

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

const DEFAULT_SSAA = {
    unbiased: true,
    sampleLevel: 2,
    enabled: false
}

const DEFAULT_BLOOM = {
    strength: 2.2,  // 1
    radius: .74,  // .5
    threshold: 0,
    enabled: false
}

const bloomLayer = new Layers();
bloomLayer.set(BLOOM_SCENE_LAYER);

class PostProcessor {

    #renderer;
    #scene;
    #camera;
    #container;

    composer;
    bloomComposer;

    // passes
    renderPass;
    outputPass;
    outlinePass;
    ssaoPass;
    effectFXAA;
    ssaaPass;
    // bloom
    bloomPass;
    bloomMixedPass;
    bloomMaterials = {};
    darkMaterial = basicMateraials.dark;

    // config
    #outlineConfig = {};
    #ssaoConfig = {};
    #ssaaConfig = {};
    #bloomConfig = {};

    // shaders
    #vertexShaderBloom;
    #fragmentShaderBloom;

    #sceneBackground;

    effects = [];

    ready = false;

    constructor(renderer, scene, camera, container) {

        this.#renderer = renderer;
        this.#scene = scene;
        this.#camera = camera;
        this.#container = container;
        this.#sceneBackground = scene.background;

        this.composer = new EffectComposer(renderer);

        Object.assign(this.#outlineConfig, DEFAULT_OUTLINE);
        Object.assign(this.#ssaoConfig, DEFAULT_SSAO);
        Object.assign(this.#ssaaConfig, DEFAULT_SSAA);
        Object.assign(this.#bloomConfig, DEFAULT_BLOOM);
        
    }

    get clientWidth() {

        return this.#container.clientWidth;

    }

    get clientHeight() {

        return this.#container.clientHeight;

    }

    get renderTargetWidth() {

        return this.clientWidth * this.composer._pixelRatio;

    }

    get renderTargetHeight() {

        return this.clientHeight * this.composer._pixelRatio;

    }

    initPass() {

        this.renderPass = new RenderPass(this.#scene, this.#camera);
        this.outputPass = new OutputPass();
        this.outlinePass = new OutlinePass(new Vector2(this.renderTargetWidth, this.renderTargetHeight), this.#scene, this.#camera);
        this.ssaoPass = new SSAOPass(this.#scene, this.#camera, this.renderTargetWidth, this.renderTargetHeight);
        this.effectFXAA = new ShaderPass( FXAAShader );
        this.ssaaPass = new SSAARenderPass(this.#scene, this.#camera);
        this.initBloomPass();

        this.effects = [this.ssaaPass, this.outlinePass, this.ssaoPass, this.effectFXAA, this.bloomMixedPass];
        this.disableAllEffects();

        this.composer.addPass(this.renderPass);
        this.composer.addPass(this.ssaaPass);
        this.composer.addPass(this.outlinePass);
        this.composer.addPass(this.ssaoPass);
        this.composer.addPass(this.bloomMixedPass);
        this.composer.addPass(this.outputPass);
        this.composer.addPass(this.effectFXAA);

    }

    initBloomPass() {

        this.#vertexShaderBloom = shaders[SHADER_NAMES.BLOOM_VERTEX];
        this.#fragmentShaderBloom = shaders[SHADER_NAMES.BLOOM_FRAGMENT];

        const bloomPass = new UnrealBloomPass(new Vector2(this.renderTargetWidth, this.renderTargetHeight), 1.5, 0.4, 0.85 );
        bloomPass.threshold = DEFAULT_BLOOM.threshold;
        bloomPass.strength = DEFAULT_BLOOM.strength;
        bloomPass.radius = DEFAULT_BLOOM.radius;
        this.bloomPass = bloomPass;

        const bloomComposer = new EffectComposer(this.#renderer);
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass(this.renderPass);
        bloomComposer.addPass(this.bloomPass);
        this.bloomComposer = bloomComposer;

        const mixPass = new ShaderPass(
            new ShaderMaterial({
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: bloomComposer.renderTarget2.texture }
                },
                vertexShader: this.#vertexShaderBloom,
                fragmentShader: this.#fragmentShaderBloom,
                defines: {}
            }), 'baseTexture'
        );
        mixPass.needsSwap = true;

        this.bloomMixedPass = mixPass;

    }

    async init() {

        this.initPass();

        const { texture } = await loadSingleTexture({ map: TRI_PATTERN });

        texture.wrapS = REPEAT_WRAPPING;
        texture.wrapT = REPEAT_WRAPPING;
        this.triTexture = texture;

        this.outlinePass.patternTexture = texture;

        this.ready = true;

    }

    render() {

        if (this.bloomMixedPass.enabled) {

            this.#scene.traverse(this.darkenNonBloomed.bind(this));
            this.#scene.background = black;
            this.bloomComposer.render();
            this.#scene.traverse(this.restoreMaterial.bind(this));
            this.#scene.background = this.#sceneBackground;

        }

        // render the entire scene, then render bloom scene on top
        this.composer.render();

    }

    darkenNonBloomed(obj) {

        if (obj.father?.isWater) {

            obj.visible = false;
            return;

        }

        if (!obj.isScene && !bloomLayer.test(obj.layers)) {

            this.bloomMaterials[obj.uuid] = obj.material;
            obj.material = this.darkMaterial;

        } else if (bloomLayer.test(obj.layers)) {

            obj.visible = true;

        }

    }

    restoreMaterial(obj) {

        if (obj.father?.isWater) {

            obj.visible = true;
            return;

        }

        if (!obj.isScene && this.bloomMaterials[obj.uuid]) {

            obj.material = this.bloomMaterials[obj.uuid];
            delete this.bloomMaterials[obj.uuid];

        }

        if (bloomLayer.test(obj.layers) && !obj.alwaysVisible) {

            obj.visible = false;

        } 

    }

    turnOnBloomLights(obj) {

        if (bloomLayer.test(obj.layers)) {

            if (!obj.father.alwaysOn) {

                obj.father.turnOnLights();

            }

        }

    }

    turnOffBloomLights(obj) {

        if (bloomLayer.test(obj.layers)) {

            if (!obj.father.alwaysOn) {

                obj.father.turnOffLights();

            }

        }

    }

    disableAllEffects() {

        for (let i = 0, il = this.effects.length; i < il; i++) {

            const e = this.effects[i];

            e.enabled = false;

        }

    }

    reset() {

        this.resetOutline();
        this.resetSSAO();
        this.resetFXAA();
        this.resetSSAA();
        this.resetBloom();

    }

    resetOutline() {

        this.outlinePass?.setSize(this.renderTargetWidth, this.renderTargetHeight);

    }

    resetSSAA() {

        this.ssaaPass?.setSize(this.renderTargetWidth, this.renderTargetHeight);

    }

    resetFXAA() {

        this.effectFXAA?.uniforms[ 'resolution' ].value.set( 1 / this.renderTargetWidth, 1 / this.renderTargetHeight );

    }

    resetSSAO() {

        this.ssaoPass?.setSize(this.renderTargetWidth, this.renderTargetHeight);

    }

    resetBloom() {

        this.bloomPass?.setSize(this.renderTargetWidth, this.renderTargetHeight);

    }

    addOutlineObjects(objArr) {

        this.outlinePass.selectedObjects.push(...objArr);

    }

    clearOutlineObjects() {

        if (this.outlinePass?.selectedObjects.length > 0) {

            delete this.outlinePass.selectedObjects[0].isPicked;
            this.outlinePass.selectedObjects = [];

        }

    }

    setEffectPass(type, specs) {

        // const passCount = this.composer.passes.length;
        // const outputIdx = this.composer.passes.findIndex(pass => pass instanceof OutputPass);
        
        switch(type) {

            case SSAA:
                {
                    const {
                        enabled = this.#ssaaConfig.enabled,
                        sampleLevel = this.#ssaaConfig.sampleLevel,
                        unbiased = this.#ssaaConfig.unbiased
                    } = specs;

                    this.#ssaaConfig.enabled = enabled;
                    this.#ssaaConfig.sampleLevel = sampleLevel;
                    this.#ssaaConfig.unbiased = unbiased;

                    this.resetSSAA();
                    this.ssaaPass.enabled = enabled;
                    this.ssaaPass.sampleLevel = sampleLevel;
                    this.ssaaPass.unbiased = unbiased;

                }
                break;
            
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

                    this.resetOutline();
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

            case BLOOM:
                {
                    const {
                        enabled = this.#bloomConfig.enabled,
                        strength = this.#bloomConfig.strength,
                        radius = this.#bloomConfig.radius,
                        threshold = this.#bloomConfig.threshold
                    } = specs;

                    this.#bloomConfig.enabled = enabled;
                    this.#bloomConfig.strength = strength;
                    this.#bloomConfig.radius = radius;
                    this.#bloomConfig.threshold = threshold;

                    this.resetBloom();
                    this.bloomMixedPass.enabled = enabled;
                    this.bloomPass.strength = strength;
                    this.bloomPass.radius = radius;
                    this.bloomPass.threshold = threshold;

                    if (enabled) {

                        this.#scene.traverse(this.turnOnBloomLights);

                    } else {

                        this.#scene.traverse(this.turnOffBloomLights);

                    }

                }
                break;
        }
    }

}

export { PostProcessor, SSAO_OUTPUT, DEFAULT_BLOOM };