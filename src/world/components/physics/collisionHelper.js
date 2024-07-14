import { BoxGeometry, EdgesGeometry, Mesh, LineSegments } from "three";
import { basicMateraials } from "../basic/basicMaterial";
import { CollisionPlane } from "./CollisionPlane";

function createCollisionPlane(specs, name, position, rotationY, receiveShadow = false, castShadow = false, showArrow = false, needUpdateMatrixWorld = true) {
    const cPlane = new CollisionPlane(specs);
    cPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotationY(rotationY)
        .createRay()
        .updateBoundingBoxHelper(needUpdateMatrixWorld);
    cPlane.leftArrow.visible = showArrow ? true : false;
    cPlane.rightArrow.visible = showArrow ? true : false;
    return cPlane;
}

function createCollisionGeometries(specs) {
    const { width, height, depth, bbfThickness } = specs;
    const boundingBox = new BoxGeometry(width, height, depth);
    const boundingBoxEdges = new EdgesGeometry(boundingBox);
    const boundingFace = new BoxGeometry(width - .2, height, bbfThickness);
    return { boundingBox, boundingBoxEdges, boundingFace };
}

function createBoundingBoxFaces(specs) {
    const { width, depth, bbfThickness, showBB, showBBW, showBF } = specs;
    const collisionGeometries = createCollisionGeometries(specs);
    const boundingBoxWire = new LineSegments(collisionGeometries.boundingBoxEdges, basicMateraials.boundingBoxWire);
    boundingBoxWire.name = 'boundingBoxWire';
    boundingBoxWire.position.set(0, 0, 0);
    boundingBoxWire.visible = showBBW ? true : false;
    // boundingBoxWire.geometry.computeBoundingBox();

    const boundingBox = new Mesh(collisionGeometries.boundingBox, basicMateraials.boundingBox);
    boundingBox.name = 'boundingBox';
    boundingBox.position.set(0, 0, 0);
    boundingBox.visible = showBB ? true : false;
    boundingBox.geometry.computeBoundingBox();

    const BBFDepthOffset = depth / 2 - bbfThickness / 2;
    const BBFWidthOffset = width / 2 - bbfThickness / 2;
    const frontBoundingFace = new Mesh(collisionGeometries.boundingFace, basicMateraials.boundingFace);
    frontBoundingFace.name = 'frontFace';
    frontBoundingFace.position.set(0, 0, BBFDepthOffset);
    frontBoundingFace.visible = showBF ? true : false;
    frontBoundingFace.layers.enable(1);

    const backBoundingFace = new Mesh(collisionGeometries.boundingFace, basicMateraials.boundingFace.clone());
    backBoundingFace.name = 'backFace';
    backBoundingFace.position.set(0, 0, - BBFDepthOffset);
    backBoundingFace.visible = showBF ? true : false;
    backBoundingFace.layers.enable(1);

    const leftBoundingFace = new Mesh(collisionGeometries.boundingFace, basicMateraials.boundingFace.clone());
    leftBoundingFace.name = 'leftFace';
    leftBoundingFace.position.set(BBFWidthOffset, 0, 0);
    leftBoundingFace.scale.x = (depth - .2) / (width - .2);
    leftBoundingFace.rotation.y += Math.PI / 2;
    leftBoundingFace.visible = showBF ? true : false;
    leftBoundingFace.layers.enable(1);
     
    const rightBoundingFace = new Mesh(collisionGeometries.boundingFace, basicMateraials.boundingFace.clone());
    rightBoundingFace.name = 'rightFace';
    rightBoundingFace.position.set(- BBFWidthOffset, 0, 0);
    rightBoundingFace.scale.x = (depth - .2) / (width - .2);
    rightBoundingFace.rotation.y += Math.PI / 2;
    rightBoundingFace.visible = showBF ? true : false;
    rightBoundingFace.layers.enable(1);

    return { boundingBox, boundingBoxWire, frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace };
}

export { createCollisionPlane, createBoundingBoxFaces };