import { MeshPhysicalMaterial } from 'three';

function createMaterials() {
    const body = new MeshPhysicalMaterial({
        color: '#cccccc',
        flatShading: true
    });

    const slot = new MeshPhysicalMaterial({
        color: '#aaaaaa',
        flatShading: true
    });

    return { body, slot };
}

export { createMaterials };