import { BoxGeometry, EdgesGeometry, Mesh, LineSegments, Vector3 } from 'three';
import { OBB } from 'three/examples/jsm/Addons.js';
import { basicMateraials } from '../basic/basicMaterial';
import { CollisionPlane } from './CollisionPlane';
import { CollisionOctagon } from './CollisionOctagon';
import { OBBPlane } from './OBBPlane';

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

function createCollisionPlaneFree(specs, name, position, rotation, receiveShadow = false, castShadow = false, createRay= false, showArrow = false, needUpdateMatrixWorld = true) {
    const cPlane = new CollisionPlane(specs);
    cPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotation(rotation);

    if (createRay) cPlane.createRay();
        
    cPlane.updateBoundingBoxHelper(needUpdateMatrixWorld);
    
    if (createRay) {
        cPlane.leftArrow.visible = showArrow ? true : false;
        cPlane.rightArrow.visible = showArrow ? true : false;
    }
    return cPlane;
}

function createCollisionOctagonFree(specs, name, position, rotation, receiveShadow = false, castShadow = false, needUpdateMatrixWorld = true) {
    const cOctagon = new CollisionOctagon(specs);
    cOctagon.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotation(rotation)
        .updateBoundingBoxHelper(needUpdateMatrixWorld);

    return cOctagon;
}

function createOBBPlane(specs, name, position, rotation, receiveShadow = false, castShadow = false, needUpdateMatrixWorld = true) {
    const obbPlane = new OBBPlane(specs);
    obbPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotation(rotation)
        .updateOBB(needUpdateMatrixWorld);

    return obbPlane;
}

function createCollisionGeometries(specs) {
    const { width, height, depth, bbfThickness, gap } = specs;
    const boundingBox = new BoxGeometry(width, height, depth);
    const boundingBoxEdges = new EdgesGeometry(boundingBox);
    const boundingFace = new BoxGeometry(width - gap, height, bbfThickness);

    // setup OBB on geometry level
    boundingBox.userData.obb = new OBB();
    boundingBox.userData.obb.halfSize.copy( new Vector3(width, height, depth) ).multiplyScalar( 0.5 );

    return { boundingBox, boundingBoxEdges, boundingFace };
}

function createBoundingBoxFaces(specs) {
    const { width, depth, bbfThickness, showBB, showBBW, showBF, gap } = specs;
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

    // bounding volume on object level (this will reflect the current world transform)
    boundingBox.userData.obb = new OBB();

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
    leftBoundingFace.scale.x = (depth - gap) / (width - gap);
    leftBoundingFace.rotation.y += Math.PI / 2;
    leftBoundingFace.visible = showBF ? true : false;
    leftBoundingFace.layers.enable(1);
     
    const rightBoundingFace = new Mesh(collisionGeometries.boundingFace, basicMateraials.boundingFace.clone());
    rightBoundingFace.name = 'rightFace';
    rightBoundingFace.position.set(- BBFWidthOffset, 0, 0);
    rightBoundingFace.scale.x = (depth - gap) / (width - gap);
    rightBoundingFace.rotation.y += Math.PI / 2;
    rightBoundingFace.visible = showBF ? true : false;
    rightBoundingFace.layers.enable(1);

    return { boundingBox, boundingBoxWire, frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace };
}

export { 
    createCollisionPlane, 
    createBoundingBoxFaces, 
    createCollisionPlaneFree,
    createCollisionOctagonFree,
    createOBBPlane
};