import { BoxGeometry, CylinderGeometry } from 'three';

function createGeometries() {
    const cabin = new BoxGeometry(2, 2.25, 1.5);
    const nose = new CylinderGeometry(0.75, 0.75, 3, 12);
    const wheel = new CylinderGeometry(0.4, 0.4, 1.75, 8);
    const chimney = new CylinderGeometry(0.3, 0.1, 0.5, 8);

    return { cabin, nose, wheel, chimney };
}

export { createGeometries };