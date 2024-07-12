import { BoxGeometry, EdgesGeometry } from 'three';

function createGeometries() {
    const body = new BoxGeometry(3, 6, 2);
    const slot = new BoxGeometry(1, 6, 1);
    const boundingBox = new BoxGeometry(3, 6, 3);
    const boundingBoxEdges = new EdgesGeometry(boundingBox);
    const BBFThickness = .35;
    const boundingBoxFace = new BoxGeometry(2.8, 6, BBFThickness);

    return { body, slot, boundingBox, boundingBoxEdges, boundingBoxFace, BBFThickness };
}

export { createGeometries };