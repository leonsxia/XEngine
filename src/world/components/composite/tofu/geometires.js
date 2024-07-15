import { BoxGeometry } from 'three';

function createGeometries() {
    const body = new BoxGeometry(.9, 1.8, .6);
    const slot = new BoxGeometry(.3, 1.8, .3);

    return { body, slot };
}

export { createGeometries };