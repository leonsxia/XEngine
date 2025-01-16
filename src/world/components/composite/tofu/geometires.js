import { BoxGeometry } from 'three';

function createGeometries(size) {
    const { width, depth, height } = size;
    const body = new BoxGeometry(width, height, depth * 2 / 3);
    const slot = new BoxGeometry(width / 3, height, depth / 3);

    return { body, slot };
}

export { createGeometries };