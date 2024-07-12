import { MeshPhysicalMaterial, MeshStandardMaterial, LineBasicMaterial } from 'three';

function createMaterials() {
    const body = new MeshPhysicalMaterial({
        color: 'firebrick',
        flatShading: true
    });

    const detail = new MeshPhysicalMaterial({
        color: 'darkslategray',
        flatShading: true
    });

    const boundingBox = new MeshStandardMaterial({
        color: '#ffffff'
    });

    const boudingBoxFace = new MeshStandardMaterial({
        color: '#dddddd'
    });

    const boundingBoxWire = new LineBasicMaterial({
        color: '#00ff00'
    });

    return { body, detail, boundingBox, boudingBoxFace, boundingBoxWire };
}

export { createMaterials };