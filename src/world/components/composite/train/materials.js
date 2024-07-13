import { MeshPhysicalMaterial } from 'three';

function createMaterials() {
    const body = new MeshPhysicalMaterial({
        color: 'firebrick',
        flatShading: true
    });

    const detail = new MeshPhysicalMaterial({
        color: 'darkslategray',
        flatShading: true
    });

    return { body, detail };
}

export { createMaterials };