import { BoxGeometry, EdgesGeometry, Mesh, LineSegments, Vector3 } from 'three';
import { OBB } from 'three/examples/jsm/Addons.js';
import { basicMateraials } from '../basic/basicMaterial';
import { CollisionPlane } from './CollisionPlane';
import { CollisionOctagon } from './CollisionOctagon';
import { CollisionOBBPlane } from './CollisionOBBPlane';
import { OBBPlane } from './OBBPlane';
import { OBBBox } from './OBBBox';
import { violetBlue } from '../basic/colorBase';

// create plane with line and rays, only support rotationY for collision for now.
function createCollisionPlane(specs, name, position, rotationY, receiveShadow = false, castShadow = false, showArrow = false) {
    const cPlane = new CollisionPlane(specs);
    cPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotationY(rotationY)
        .createRay();

    cPlane.leftArrow.visible = showArrow ? true : false;
    cPlane.rightArrow.visible = showArrow ? true : false;

    return cPlane;
}

// create plane with line, rays and OBB, only support rotationY for collision for now.
function createCollisionOBBPlane(specs, name, position, rotationY, receiveShadow = false, castShadow = false, showArrow = false) {
    const cObbPlane = new CollisionOBBPlane(specs);
    cObbPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotationY(rotationY)
        .createRay();

    cObbPlane.leftArrow.visible = showArrow ? true : false;
    cObbPlane.rightArrow.visible = showArrow ? true : false;
    
    return cObbPlane;
}


// create plane with line, optional rays
function createCollisionPlaneFree(specs, name, position, rotation, receiveShadow = false, castShadow = false, createRay= false, showArrow = false) {
    const cPlane = new CollisionPlane(specs);

    cPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotation(rotation);

    if (createRay) cPlane.createRay();
    
    if (createRay) {
        cPlane.leftArrow.visible = showArrow ? true : false;
        cPlane.rightArrow.visible = showArrow ? true : false;
    }
    return cPlane;
}

// create octagon plane with line
function createCollisionOctagonFree(specs, name, position, rotation, receiveShadow = false, castShadow = false) {
    const cOctagon = new CollisionOctagon(specs);

    cOctagon.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotation(rotation);

    return cOctagon;
}

// create plane with line and OBB
function createOBBPlane(specs, name, position, rotation, receiveShadow = false, castShadow = false) {
    const obbPlane = new OBBPlane(specs);

    obbPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotation(rotation)

    return obbPlane;
}

function createOBBBox(specs, name, position, rotation, receiveShadow = false, castShadow = false) {
    const obbBox = new OBBBox(specs);

    obbBox.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotation(rotation)

    return obbBox;
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

function createPlayerPushingOBBBox(specs) {
    const { height, depth, show } = specs;
    const pushingBoxSpecs = { size: { width: .2, depth: .2, height }, color: violetBlue };
    const pushingOBBBox = createOBBBox(pushingBoxSpecs, 'pushingOBBBox', [0, 0, depth * .5 + .1 - pushingBoxSpecs.size.depth * .5], [0, 0, 0], false, false);
    pushingOBBBox.mesh.visible = show;

    return pushingOBBBox.mesh;
}

export { 
    createCollisionPlane,
    createCollisionOBBPlane,
    createBoundingBoxFaces,
    createPlayerPushingOBBBox,
    createCollisionPlaneFree,
    createCollisionOctagonFree,
    createOBBPlane,
    createOBBBox
};