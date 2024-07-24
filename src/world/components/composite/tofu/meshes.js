import { Mesh } from 'three';
import { createGeometries } from './geometires';
import { createMaterials } from './materials';
import { createBoundingBoxFaces, createPlayerPushingOBBBox } from '../../physics/collisionHelper';

function createMeshes() {

    const geometires = createGeometries();
    const materials = createMaterials();

    const body = new Mesh(geometires.body, materials.body);
    body.name = 'body';
    body.position.set(0, 0, - .15);
    body.visible = true;

    const slotLeft = new Mesh(geometires.slot, materials.slot);
    slotLeft.name = 'slotLeft';
    slotLeft.position.set( .3, 0, .3);
    slotLeft.visible = true;

    const slotRight = slotLeft.clone();
    slotRight.name = 'slotRight'
    slotRight.position.set(- .3, 0, .3);
    slotRight.visible = true;

    const width = .9;
    const depth = .9;
    const height = 1.8;

    const specs = { width, depth, height };

    const bbSpecs = {

        width, depth, height, 
        bbfThickness: .18,  // calculated by faster speed = 10 m/s, 30fps needs at least 1/30 * 10 = 0.333 m to cover.
        gap: .04,
        showBB: false, showBBW: false, showBF: false

    };

    const bbObjects = createBoundingBoxFaces(bbSpecs);

    const pushingObbSpecs = { height, depth, show: false };
    const pushingOBBBox = createPlayerPushingOBBBox(pushingObbSpecs);

    return { 
        body, slotLeft, slotRight,
        bbObjects,
        pushingOBBBox,
        specs
    };

}

export { createMeshes };