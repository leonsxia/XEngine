import { BoxGeometry, CylinderGeometry, EdgesGeometry } from 'three';

function createGeometries() {
    const cabin = new BoxGeometry(2, 2.25, 1.5);
    const nose = new CylinderGeometry(0.75, 0.75, 3, 12);
    const wheel = new CylinderGeometry(0.4, 0.4, 1.75, 8);
    const chimney = new CylinderGeometry(0.3, 0.1, 0.5, 8);
    const boundingBox = new BoxGeometry(2, 2.25, 5);
    const boundingBoxEdges = new EdgesGeometry(boundingBox);
    const BBFThickness = .35;  // calculated by Train faster speed = 10 m/s, 30fps needs at least 1/30 * 10 = 0.333 m to cover.
    const boundingBoxFace = new BoxGeometry(1.8, 2.25, BBFThickness);

    return { cabin, nose, wheel, chimney, boundingBox, boundingBoxEdges, boundingBoxFace, BBFThickness };
}

export { createGeometries };