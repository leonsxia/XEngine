import { BoxGeometry, EdgesGeometry, Mesh, LineSegments, Vector3 } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { basicMateraials } from '../basic/basicMaterial';
import { CollisionPlane } from './CollisionPlane';
import { CollisionOctagon } from './CollisionOctagon';
import { CollisionOBBPlane } from './CollisionOBBPlane';
import { CollisionTrianglePlane } from './CollisionTrianglePlane';
import { OBBPlane } from './OBBPlane';
import { OBBBox } from './OBBBox';
import { violetBlue } from '../basic/colorBase';
import { CORNOR_RAY_LAYER } from '../utils/constants';

// create plane with line and rays, only support rotationY for collision for now.
function createCollisionPlane(specs, name, position, rotationY, receiveShadow = false, castShadow = false, showArrow = false) {

    const cPlane = new CollisionPlane(specs);

    cPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotationY(rotationY)
        .createRay();

    cPlane.leftArrow.visible = showArrow;
    cPlane.rightArrow.visible = showArrow;

    return cPlane;

}

// create triangle plane with line and rays, only support rotationY for collision for now.
function createCollisionTrianglePlane(specs, name, position, rotationY, receiveShadow = false, castShadow = false, showArrow = false) {

    const cTriPlane = new CollisionTrianglePlane(specs);

    cTriPlane.setName(name)
        .receiveShadow(receiveShadow)
        .castShadow(castShadow)
        .setPosition(position)
        .setRotationY(rotationY)
        .createRay()

    if (cTriPlane.leftArrow) cTriPlane.leftArrow.visible = showArrow;
    if (cTriPlane.rightArrow) cTriPlane.rightArrow.visible = showArrow;

    return cTriPlane;

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

    cObbPlane.leftArrow.visible = showArrow;
    cObbPlane.rightArrow.visible = showArrow;
    
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
        cPlane.leftArrow.visible = showArrow;
        cPlane.rightArrow.visible = showArrow;
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

    const boundingBox = new BoxGeometry(width, height, depth * 2 / 3);

    const boundingBoxEdges = new EdgesGeometry(boundingBox);

    const boundingFace = new BoxGeometry(width - gap, height, bbfThickness);

    // setup OBB on geometry level
    boundingBox.userData.obb = new OBB();
    boundingBox.userData.obb.halfSize.copy( new Vector3(width, height, depth * 2 / 3) ).multiplyScalar( 0.5 );

    return { boundingBox, boundingBoxEdges, boundingFace };

}

function createBoundingBoxFaces(specs) {
    
    const { width, depth, bbfThickness, showBB, showBBW, showBF, gap } = specs;

    const collisionGeometries = createCollisionGeometries(specs);

    const boundingBoxWire = new LineSegments(collisionGeometries.boundingBoxEdges, basicMateraials.boundingBoxWire.clone());
    boundingBoxWire.name = 'boundingBoxWire';
    boundingBoxWire.position.set(0, 0, 0);
    boundingBoxWire.visible = showBBW;
    // boundingBoxWire.geometry.computeBoundingBox();

    const boundingBox = new Mesh(collisionGeometries.boundingBox, basicMateraials.boundingBox.clone());
    boundingBox.name = 'boundingBox';
    boundingBox.position.set(0, 0, 0);
    boundingBox.visible = showBB;
    boundingBox.geometry.computeBoundingBox();

    // bounding volume on object level (this will reflect the current world transform)
    boundingBox.userData.obb = new OBB();

    const BBFDepthOffset = depth / 2 - bbfThickness / 2;
    const BBFWidthOffset = width / 2 - bbfThickness / 2;
    const boundingFaceMaterial = basicMateraials.boundingFace.clone();
    const frontBoundingFace = new Mesh(collisionGeometries.boundingFace, boundingFaceMaterial);
    frontBoundingFace.name = 'frontFace';
    frontBoundingFace.position.set(0, 0, BBFDepthOffset);
    frontBoundingFace.visible = showBF;
    frontBoundingFace.layers.enable(CORNOR_RAY_LAYER);

    const backBoundingFace = new Mesh(collisionGeometries.boundingFace, boundingFaceMaterial);
    backBoundingFace.name = 'backFace';
    backBoundingFace.position.set(0, 0, - BBFDepthOffset);
    backBoundingFace.visible = showBF;
    backBoundingFace.layers.enable(CORNOR_RAY_LAYER);

    const leftBoundingFace = new Mesh(collisionGeometries.boundingFace, boundingFaceMaterial);
    leftBoundingFace.name = 'leftFace';
    leftBoundingFace.position.set(BBFWidthOffset, 0, 0);
    leftBoundingFace.scale.x = (depth - gap) / (width - gap);
    leftBoundingFace.rotation.y += Math.PI / 2;
    leftBoundingFace.visible = showBF;
    leftBoundingFace.layers.enable(CORNOR_RAY_LAYER);
     
    const rightBoundingFace = new Mesh(collisionGeometries.boundingFace, boundingFaceMaterial);
    rightBoundingFace.name = 'rightFace';
    rightBoundingFace.position.set(- BBFWidthOffset, 0, 0);
    rightBoundingFace.scale.x = (depth - gap) / (width - gap);
    rightBoundingFace.rotation.y += Math.PI / 2;
    rightBoundingFace.visible = showBF;
    rightBoundingFace.layers.enable(CORNOR_RAY_LAYER);

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
    createCollisionTrianglePlane,
    createBoundingBoxFaces,
    createPlayerPushingOBBBox,
    createCollisionPlaneFree,
    createCollisionOctagonFree,
    createOBBPlane,
    createOBBBox
};