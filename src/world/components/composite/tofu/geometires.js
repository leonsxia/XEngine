import { BoxGeometry } from 'three';

function createGeometries() {
    const body = new BoxGeometry(3, 6, 2);
    const slot = new BoxGeometry(1, 6, 1);

    return { body, slot };
}

export { createGeometries };