const SHADER_NAMES = {
    BLOOM_VERTEX: 'BLOOM_VERTEX',
    BLOOM_FRAGMENT: 'BLOOM_FRAGMENT'
};

const SHADERS = [{
    name: SHADER_NAMES.BLOOM_VERTEX, src: 'assets/shaders/bloom_vertex.glsl'
}, {
    name: SHADER_NAMES.BLOOM_FRAGMENT, src: 'assets/shaders/bloom_fragment.glsl'
}];

export { SHADER_NAMES, SHADERS };