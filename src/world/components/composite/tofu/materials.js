import { MeshPhysicalMaterial, LineBasicMaterial, MeshStandardMaterial } from 'three';

function createMaterials() {
    const boundingBoxWire = new LineBasicMaterial({
        color: '#00ff00'
    });

    const boundingBox = new MeshStandardMaterial({
        color: '#ffffff'
    });

    const boundingBoxFace = new MeshStandardMaterial({
        color: '#dddddd'
    });

    const body = new MeshPhysicalMaterial({
        color: '#cccccc',
        flatShading: true
    });

    const slot = new MeshPhysicalMaterial({
        color: '#aaaaaa',
        flatShading: true
    });

    return { body, slot, boundingBox, boundingBoxFace, boundingBoxWire };
}

export { createMaterials };