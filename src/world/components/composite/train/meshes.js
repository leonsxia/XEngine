import { Mesh } from 'three';

import { createGeometries } from './geometires';
import { createMaterials } from './materials';
import { createBoundingBox, createBoundingFaces } from '../../physics/collisionHelper';

function createMeshes() {
    const geometires = createGeometries();
    const materials = createMaterials();

    const cabin = new Mesh(geometires.cabin, materials.body);
    cabin.position.set(0, 0, - 1.5);
    cabin.rotation.y = Math.PI / 2;

    const chimney = new Mesh(geometires.chimney, materials.detail);
    chimney.position.set(0, .5, 2);
    chimney.rotation.y = Math.PI / 2;

    const nose = new Mesh(geometires.nose, materials.body);
    nose.position.set(0, - .3, 1);
    nose.rotation.z = Math.PI / 2;
    nose.rotation.y = Math.PI / 2;

    const smallWheelRear = new Mesh(geometires.wheel, materials.detail);
    smallWheelRear.position.y = - .9;
    smallWheelRear.rotation.x = Math.PI / 2;
    smallWheelRear.rotation.z = Math.PI / 2;

    const smallWheelCenter = smallWheelRear.clone();
    smallWheelCenter.position.z = 1;

    const smallWheelFront = smallWheelRear.clone()
    smallWheelFront.position.z = 2;

    const bigWheel = smallWheelRear.clone();
    bigWheel.position.set(0, - .5, - 1.5);
    bigWheel.scale.set(2, 1.25, 2);

    const width = 2;
    const depth = 5;
    const height = 2.5;
    const Rl = 0.8; // big wheel radius
    const Rs = 0.4; // small wheel radius

    const specs = { width, depth, height, Rl, Rs };

    const bbSpecs = { 
        bbfThickness: .35,  // calculated by Train faster speed = 10 m/s, 30fps needs at least 1/30 * 10 = 0.333 m to cover.
        gap: .2,
        showBB: false, showBBW: false, showBF: false
    }
    const bbObjects = Object.assign({}, 
        createBoundingBox({
            width, height, depth: depth * 2 / 3, showBB: bbSpecs.showBB, showBBW: bbSpecs.showBBW
        }), createBoundingFaces({
            width, height, depth, bbfThickness: bbSpecs.bbfThickness, gap: bbSpecs.gap, showBF: bbSpecs.showBF
        })
    );

    return { cabin, chimney, nose, smallWheelFront, smallWheelCenter, smallWheelRear, bigWheel,
        bbObjects,
        specs
     };
}

export { createMeshes };