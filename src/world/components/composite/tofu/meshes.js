import { Mesh } from 'three';
import { createGeometries } from './geometires';
import { createMaterials } from './materials';
import { createBoundingBoxFaces, createPlayerPushingOBBBox } from '../../physics/collisionHelper';

function createMeshes(size) {

    const { width = .9, width2 = .9, depth = .9, depth2 = .9, height = 1.8 } = size;
    const geometires = createGeometries(size);
    const materials = createMaterials();

    const body = new Mesh(geometires.body, materials.body);
    body.name = 'body';
    body.position.set(0, 0, - depth / 6);
    body.visible = true;

    const slotLeft = new Mesh(geometires.slot, materials.slot);
    slotLeft.name = 'slotLeft';
    slotLeft.position.set( width / 3, 0, depth / 3);
    slotLeft.visible = true;

    const slotRight = slotLeft.clone();
    slotRight.name = 'slotRight'
    slotRight.position.set(- width / 3, 0, depth / 3);
    slotRight.visible = true;

    const bbSpecs = {

        width, width2, depth, depth2, height, 
        bbfThickness: .18,  // calculated by faster speed = 10 m/s, 30fps needs at least 1/30 * 10 = 0.333 m to cover.
        gap: .1,
        showBB: false, showBBW: false, showBF: false

    };

    const bbObjects = createBoundingBoxFaces(bbSpecs);

    const pushingObbSpecs = { height, depth, show: false };
    const pushingOBBBox = createPlayerPushingOBBBox(pushingObbSpecs);

    return { 
        body, slotLeft, slotRight,
        bbObjects,
        pushingOBBBox
    };

}

export { createMeshes };