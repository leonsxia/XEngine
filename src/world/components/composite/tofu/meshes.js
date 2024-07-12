import { Mesh, LineSegments } from 'three';

import { createGeometries } from './geometires';
import { createMaterials } from './materials';

function createMeshes() {
    const geometires = createGeometries();
    const materials = createMaterials();

    const body = new Mesh(geometires.body, materials.body);
    body.name = 'body';
    body.position.set(0, 3, -0.5);
    body.visible = false;

    const slotLeft = new Mesh(geometires.slot, materials.slot);
    slotLeft.name = 'slotLeft';
    slotLeft.position.set(1, 3, 1);

    const slotRight = slotLeft.clone();
    slotRight.name = 'slotRight'
    slotRight.position.set(-1, 3, 1);

    const boundingBoxWire = new LineSegments(geometires.boundingBoxEdges, materials.boundingBoxWire);
    boundingBoxWire.name = 'boundingBoxWire';
    boundingBoxWire.position.set(0, 3, 0);
    boundingBoxWire.visible = true;
    boundingBoxWire.geometry.computeBoundingBox();

    const boundingBox = new Mesh(geometires.boundingBox, materials.boundingBox);
    boundingBox.name = 'boundingBox';
    boundingBox.position.set(0, 3, 0);
    boundingBox.visible = false;
    boundingBox.geometry.computeBoundingBox();

    const width = 3;
    const depth = 3;
    const height = 6;

    const BBFDepthOffset = depth / 2 - geometires.BBFThickness / 2;
    const BBFWidthOffset = width / 2 - geometires.BBFThickness / 2;
    const frontBoundingFace = new Mesh(geometires.boundingBoxFace, materials.boundingBoxFace);
    frontBoundingFace.name = 'frontFace';
    frontBoundingFace.position.set(0, 3, BBFDepthOffset);
    frontBoundingFace.visible = true;
    frontBoundingFace.layers.enable(1);

    const backBoundingFace = frontBoundingFace.clone();
    backBoundingFace.name = 'backFace';
    backBoundingFace.position.set(0, 3, - BBFDepthOffset);

    const leftBoundingFace = frontBoundingFace.clone();
    leftBoundingFace.name = 'leftFace';
    leftBoundingFace.position.set(BBFWidthOffset, 3, 0);
    leftBoundingFace.rotation.y += Math.PI / 2;
     
    const rightBoundingFace = leftBoundingFace.clone();
    rightBoundingFace.name = 'rightFace';
    rightBoundingFace.position.set(- BBFWidthOffset, 3, 0);

    return { 
        body, slotLeft, slotRight, boundingBox, 
        boundingBoxWire, frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
        width, depth, height 
    };
}

export { createMeshes };