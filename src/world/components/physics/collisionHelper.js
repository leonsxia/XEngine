import { BoxGeometry, EdgesGeometry, Mesh, LineSegments, Vector3, SphereGeometry } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { basicMateraials, createBasicMaterial } from '../basic/basicMaterial';
import { CollisionPlane } from './primitives/CollisionPlane';
import { CollisionOctagon } from './primitives/CollisionOctagon';
import { CollisionOBBPlane } from './primitives/CollisionOBBPlane';
import { CollisionTrianglePlane } from './primitives/CollisionTrianglePlane';
import { OBBPlane } from './primitives/OBBPlane';
import { OBBBox } from './primitives/OBBBox';
import { BF2, violetBlue } from '../basic/colorBase';
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

    if (cPlane.leftArrow) cPlane.leftArrow.visible = showArrow;
    if (cPlane.rightArrow) cPlane.rightArrow.visible = showArrow;

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

    if (cObbPlane.leftArrow) cObbPlane.leftArrow.visible = showArrow;
    if (cObbPlane.rightArrow) cObbPlane.rightArrow.visible = showArrow;
    
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

        if (cPlane.leftArrow) cPlane.leftArrow.visible = showArrow;
        if (cPlane.rightArrow) cPlane.rightArrow.visible = showArrow;

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

function createSovBoundingSphere(specs) {

    const { sovRadius, showBS } = specs;
    const sovBoundingSphereGeometry = new SphereGeometry(sovRadius, 16, 16);

    const sovBoundingSphere = new Mesh(sovBoundingSphereGeometry, basicMateraials.sovBoundingSphere.clone());
    sovBoundingSphere.material.transparent = true;
    sovBoundingSphere.material.opacity = 0.2;
    sovBoundingSphere.name = 'sovBoundingSphere-helper';
    sovBoundingSphere.position.set(0, 0, 0);
    sovBoundingSphere.visible = showBS;
    // sovBoundingSphere.geometry.computeBoundingSphere();

    return sovBoundingSphere;
    
}

function createBoundingBox(specs) {

    const { width, height, depth, showBB = false, showBBW = false } = specs;

    const boundingBoxGeometry = new BoxGeometry(width, height, depth);
    const boundingBoxEdgesGeometry = new EdgesGeometry(boundingBoxGeometry);

    // setup OBB on geometry level
    boundingBoxGeometry.userData.obb = new OBB();
    boundingBoxGeometry.userData.obb.halfSize.copy( new Vector3(width, height, depth) ).multiplyScalar( 0.5 );

    const boundingBoxWire = new LineSegments(boundingBoxEdgesGeometry, basicMateraials.boundingBoxWire.clone());
    boundingBoxWire.name = 'boundingBoxWire';
    boundingBoxWire.position.set(0, 0, 0);
    boundingBoxWire.visible = showBBW;

    const boundingBox = new Mesh(boundingBoxGeometry, basicMateraials.boundingBox.clone());
    boundingBox.name = 'boundingBox';
    boundingBox.position.set(0, 0, 0);
    boundingBox.visible = showBB;
    boundingBox.geometry.computeBoundingBox();
    boundingBox.material.transparent = true;
    boundingBox.material.opacity = 0.6;

    // bounding volume on object level (this will reflect the current world transform)
    boundingBox.userData.obb = new OBB();

    return { boundingBox, boundingBoxWire };

}

function createBoundingFaces(specs) {

    const { suffix = '', width, height, depth, bbfThickness, gap, showBF, color = null } = specs;
    const boundingFaceGeometry = new BoxGeometry(width - gap, height, bbfThickness);

    const BBFDepthOffset = depth / 2 - bbfThickness / 2;
    const BBFWidthOffset = width / 2 - bbfThickness / 2;
    const boundingFaceMaterial = color ? createBasicMaterial(color) : basicMateraials.boundingFace;
    const frontBoundingFace = new Mesh(boundingFaceGeometry, boundingFaceMaterial.clone());
    frontBoundingFace.name = `frontFace${suffix}`;
    frontBoundingFace.position.set(0, 0, BBFDepthOffset);
    frontBoundingFace.visible = showBF;
    frontBoundingFace.layers.enable(CORNOR_RAY_LAYER);
    frontBoundingFace.material.transparent = true;
    frontBoundingFace.material.opacity = 0.5;

    const backBoundingFace = new Mesh(boundingFaceGeometry, boundingFaceMaterial.clone());
    backBoundingFace.name = `backFace${suffix}`;
    backBoundingFace.position.set(0, 0, - BBFDepthOffset);
    backBoundingFace.visible = showBF;
    backBoundingFace.layers.enable(CORNOR_RAY_LAYER);
    backBoundingFace.material.transparent = true;
    backBoundingFace.material.opacity = 0.5;

    const leftBoundingFace = new Mesh(boundingFaceGeometry, boundingFaceMaterial.clone());
    leftBoundingFace.name = `leftFace${suffix}`;
    leftBoundingFace.position.set(BBFWidthOffset, 0, 0);
    leftBoundingFace.scale.x = (depth - gap) / (width - gap);
    leftBoundingFace.rotation.y += Math.PI / 2;
    leftBoundingFace.visible = showBF;
    leftBoundingFace.layers.enable(CORNOR_RAY_LAYER);
    leftBoundingFace.material.transparent = true;
    leftBoundingFace.material.opacity = 0.5;
     
    const rightBoundingFace = new Mesh(boundingFaceGeometry, boundingFaceMaterial.clone());
    rightBoundingFace.name = `rightFace${suffix}`;
    rightBoundingFace.position.set(- BBFWidthOffset, 0, 0);
    rightBoundingFace.scale.x = (depth - gap) / (width - gap);
    rightBoundingFace.rotation.y += Math.PI / 2;
    rightBoundingFace.visible = showBF;
    rightBoundingFace.layers.enable(CORNOR_RAY_LAYER);
    rightBoundingFace.material.transparent = true;
    rightBoundingFace.material.opacity = 0.5;

    return { frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace };

}

function createDefaultBoundingBoxFaces(specs) {

    const { width, width2, depth, depth2, height, bbfThickness, showBB, showBBW, showBF, gap } = specs;

    const { boundingBoxWire, boundingBox } = createBoundingBox({
        width, height, depth: depth * 2 / 3, showBB, showBBW
    });

    // original bounding faces
    const { frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace } = createBoundingFaces({
        width, height, depth, bbfThickness, gap, showBF
    });

    // bounding faces 2
    const { 
        frontBoundingFace: frontBoundingFace2, 
        backBoundingFace: backBoundingFace2, 
        leftBoundingFace: leftBoundingFace2, 
        rightBoundingFace: rightBoundingFace2
    } = createBoundingFaces({
        width: width2, height, depth: depth2, bbfThickness, gap, showBF, suffix: '2', color: BF2
    });

    return {
        boundingBox, boundingBoxWire,
        frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace,
        frontBoundingFace2, backBoundingFace2, leftBoundingFace2, rightBoundingFace2
    };

}

function createTofuPushingOBBBox(specs) {

    const { height, depth, show } = specs;

    const pushingBoxSpecs = { size: { width: .2, depth: .2, height }, color: violetBlue };

    const pushingOBBBox = createOBBBox(pushingBoxSpecs, 'pushingOBBBox', [0, 0, depth * .5 + .1 - pushingBoxSpecs.size.depth * .5], [0, 0, 0], false, false);

    pushingOBBBox.visible = show;

    return pushingOBBBox.mesh;

}

export { 
    createCollisionPlane,
    createCollisionOBBPlane,
    createCollisionTrianglePlane,
    createCollisionPlaneFree,
    createCollisionOctagonFree,
    createOBBPlane,
    createOBBBox,

    createBoundingBox,
    createBoundingFaces,
    createDefaultBoundingBoxFaces,
    createTofuPushingOBBBox,
    createSovBoundingSphere
};