import { Vector3, Quaternion, Matrix4, BufferGeometry } from 'three';
import * as RAPIER from '@dimforge/rapier3d';

// const RAPIER_PATH = 'https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.17.3';

const _scale = new Vector3(1, 1, 1);
const ZERO = new Vector3();
const _geometry = new BufferGeometry();
const _v1 = new Vector3();
const _q1 = new Quaternion();
const _q2 = new Quaternion();
const _m1 = new Matrix4();

function getShape(geometry, scale = new Vector3(1, 1, 1)) {

    const parameters = geometry.parameters;
    const { x, y, z } = scale;

    switch(geometry.type) {

        case 'RoundedBoxGeometry':
            {
                const sx = parameters.width !== undefined ? parameters.width * x / 2 : 0.5;
                const sy = parameters.height !== undefined ? parameters.height * y / 2 : 0.5;
                const sz = parameters.depth !== undefined ? parameters.depth * z / 2 : 0.5;
                const radius = parameters.radius !== undefined ? parameters.radius : 0.1;

                return RAPIER.ColliderDesc.roundCuboid(sx - radius, sy - radius, sz - radius, radius);
            }
        case 'BoxGeometry':
            {
                const sx = parameters.width !== undefined ? parameters.width * x / 2 : 0.5;
                const sy = parameters.height !== undefined ? parameters.height * y / 2 : 0.5;
                const sz = parameters.depth !== undefined ? parameters.depth * z / 2 : 0.5;

                return RAPIER.ColliderDesc.cuboid(sx, sy, sz);
            }
        case 'SphereGeometry':
        case 'IcosahedronGeometry':
            {
                // scale.x === scale.y === scale.z
                const radius = parameters.radius !== undefined ? parameters.radius * x : 1;
                return RAPIER.ColliderDesc.ball(radius);
            }
        case 'CylinderGeometry':
            {
                // scale.x === scale.z
                const radius = parameters.radiusBottom !== undefined ? parameters.radiusBottom * x : 0.5;
                const length = parameters.height !== undefined ? parameters.height * y : 0.5;

                return RAPIER.ColliderDesc.cylinder(length / 2, radius);
            }
        case 'CapsuleGeometry':
            {
                // scale.x === scale.z
                const radius = parameters.radius !== undefined ? parameters.radius * x : 0.5;
                const length = parameters.height !== undefined ? parameters.height * y : 0.5;

                return RAPIER.ColliderDesc.capsule(length / 2, radius);
            }
        case 'PlaneGeometry':
        case 'BufferGeometry':
            {
                _geometry.copy(geometry);
                _geometry.scale(...scale);
                const vertices = [];
                const vertex = new Vector3();
                const position = _geometry.getAttribute('position');

                for (let i = 0; i < position.count; i++) {

                    vertex.fromBufferAttribute(position, i);
                    vertices.push(vertex.x, vertex.y, vertex.z);

                }

                // if the buffer is non-indexed, generate an index buffer
                const indices = _geometry.getIndex() === null
                    ? Uint32Array.from(Array(parseInt(vertices.length / 3)).keys())
                    : _geometry.getIndex().array;

                return RAPIER.ColliderDesc.trimesh(vertices, indices);
            }
        default:
            {
                console.error('RapierPhysics: Unsupported geometry type:', geometry.type);

                return null;
            }

    }    

}

const _vector = new Vector3();
const _quaternion = new Quaternion();
const _matrix = new Matrix4();

class RapierPhysics {

    gravity = new Vector3(0.0, - 9.81, 0.0);
    world;

    meshes = [];
    meshMap = new WeakMap();
    fixedMeshes = [];

    ready = false;
   
    constructor() {

        this.world = new RAPIER.World(this.gravity);
        this.ready = true;

    }

    addScene(scene) {

        scene.traverse((child) => {

            if (child.isMesh) {

                const physics = child.userData.physics;

                if (physics && !physics.manuallyLoad) {

                    this.addMesh(child, physics.mass, physics.restitution);

                }

            }

        });

    }

    addMesh(mesh, mass = 0, restitution = 0) {

        const shape = getShape(mesh.geometry, mesh.scale);

        if (shape === null) return;

        shape.setMass(mass);
        shape.setRestitution(restitution);

        if (!mesh.isInstancedMesh) {

            mesh.updateWorldMatrix(true, false);
            mesh.matrixWorld.decompose(_v1, _q1, _vector);

        }

        const { body, collider } = mesh.isInstancedMesh
            ? this.createInstancedBody(mesh, mass, shape)
            : this.createBody(_v1, _q1, mass, shape);

        if (!mesh.userData.physics) mesh.userData.physics = {};

        mesh.userData.physics.body = body;
        mesh.userData.physics.collider = collider;

        if (mass > 0) {

            this.meshes.push(mesh);
            this.meshMap.set(mesh, { body, collider });

        } else {

            this.fixedMeshes.push(mesh);

        }

    }

    addCompoundMesh(group) {

        let totalMass = 0;
        const colliders = [];
        group.traverse((child) => {

            if (child.userData.physics) {

                const { mass } = child.userData.physics;
                totalMass += mass;

            }

        });

        group.updateWorldMatrix(true, false);
        group.matrixWorld.decompose(_v1, _q1, _vector);
        const body = this.createRigidBody(_v1, _q1, totalMass ? 'dynamic' : 'fixed');

        for (let i = 0, il = group.children.length; i < il; i++) {

            const mesh = group.children[i];
            const physics = mesh.userData.physics;
            if (!physics) continue;

            const { mass = 0, restitution = 0 } = physics;

            const shape = getShape(mesh.geometry, mesh.scale);
            shape.setTranslation(...mesh.position);
            shape.setRotation(mesh.quaternion);

            if (shape === null) continue;

            shape.setMass(mass);
            shape.setRestitution(restitution);

            const collider = this.world.createCollider(shape, body);

            physics.body = body;
            physics.collider = collider;
            colliders.push(collider);

            totalMass += mass;

        }

        if (!group.userData.physics) group.userData.physics = {};

        group.userData.physics.body = body;
        group.userData.physics.collider = colliders;

        if (totalMass > 0) {

            this.meshes.push(group);
            this.meshMap.set(group, { body });

        } else {

            this.fixedMeshes.push(group);

        }

    }

    removeMesh(mesh) {

        const index = this.meshes.indexOf(mesh);

        if (index !== - 1) {

            this.meshes.splice(index, 1);
            this.meshMap.delete(mesh);

            if (!mesh.userData.physics) return;

            const body = mesh.userData.physics.body;
            const collider = mesh.userData.physics.collider;

            if (body) this.removeBody(body);
            if (collider) this.removeCollider(collider);

        }

    }

    removeAll() {

        for (let i = 0, il = this.meshes.length; i < il; i++) {

            const mesh = this.meshes[i];

            this.meshMap.delete(mesh);
            if (!mesh.userData.physics) return;

            const body = mesh.userData.physics.body;
            const collider = mesh.userData.physics.collider;

            if (body) this.removeBody(body);
            if (collider) this.removeCollider(collider);

        }

        this.meshes.length = 0;

        for (let i = 0, il = this.fixedMeshes.length; i < il; i++) {

            const mesh = this.fixedMeshes[i];
            if (!mesh.userData.physics) return;

            const body = mesh.userData.physics.body;
            const collider = mesh.userData.physics.collider;

            if (body) this.removeBody(body);
            if (collider) this.removeCollider(collider);

        }

        this.fixedMeshes.length = 0;

    }

    createInstancedBody(mesh, mass, shape) {

        const array = mesh.instanceMatrix.array;

        const bodies = [];
        const colliders = [];

        for (let i = 0; i < mesh.count; i++) {

            mesh.updateWorldMatrix(true, false);
            const position = _vector.fromArray(array, i * 16 + 12);
            position.applyMatrix4(mesh.matrixWorld);
            const { body, collider } = this.createBody(position, null, mass, shape);
            bodies.push(body);
            colliders.push(collider);

        }

        return { body: bodies, collider: colliders };

    }

    createBody(position, quaternion, mass, shape) {

        const desc = mass > 0 ? RAPIER.RigidBodyDesc.dynamic() : RAPIER.RigidBodyDesc.fixed();
        desc.setTranslation(...position);
        if (quaternion !== null) desc.setRotation(quaternion);

        const body = this.world.createRigidBody(desc);
        const collider = this.world.createCollider(shape, body);

        return { body, collider };

    }

    createRigidBody(position, quaternion, type = 'fixed') {

        let body;
        switch (type) {

            case 'fixed':

                {
                    const desc = RAPIER.RigidBodyDesc.fixed();
                    desc.setTranslation(...position);
                    if (quaternion !== null) desc.setRotation(quaternion);

                    body = this.world.createRigidBody(desc);
                }

                break;

            case 'dynamic':

                {
                    const desc = RAPIER.RigidBodyDesc.dynamic();
                    desc.setTranslation(...position);
                    if (quaternion !== null) desc.setRotation(quaternion);

                    body = this.world.createRigidBody(desc);
                }

                break;

        }

        return body;

    }

    removeBody(body) {

        if (Array.isArray(body)) {

            for (let i = 0; i < body.length; i++) {

                this.world.removeRigidBody(body[i]);

            }

        } else {

            this.world.removeRigidBody(body);

        }

    }

    removeCollider(collider) {

        if (Array.isArray(collider)) {

            for (let i = 0; i < collider.length; i++) {

                this.world.removeCollider(collider[i]);

            }

        } else {

            this.world.removeCollider(collider);

        }

    }

    setMeshPosition(mesh, position, index = 0) {

        let { body } = this.meshMap.get(mesh);

        if (mesh.isInstancedMesh) {

            body = body[index];

        }

        body.setAngvel(ZERO);
        body.setLinvel(ZERO);
        body.setTranslation(position);

    }

    setMeshVelocity(mesh, velocity, index = 0) {

        let { body } = this.meshMap.get(mesh);

        if (mesh.isInstancedMesh) {

            body = body[index];

        }

        body.setLinvel(velocity);

    }

    addHeightfield(mesh, width, depth, heights, scale) {

        const shape = RAPIER.ColliderDesc.heightfield(width, depth, heights, scale);

        const bodyDesc = RAPIER.RigidBodyDesc.fixed();
        mesh.updateWorldMatrix(true, false);
        mesh.matrixWorld.decompose(_v1, _q1, _vector);
        bodyDesc.setTranslation(..._v1);
        bodyDesc.setRotation(_q1);

        const body = this.world.createRigidBody(bodyDesc);
        const collider = this.world.createCollider(shape, body);

        if (!mesh.userData.physics) mesh.userData.physics = {};
        mesh.userData.physics.body = body;
        mesh.userData.physics.collider = collider;

        this.fixedMeshes.push(mesh);

        return body;

    }

    step(delta) {

        this.world.timestep = delta;
        this.world.step();

        for (let i = 0, l = this.meshes.length; i < l; i++) {

            const mesh = this.meshes[i];

            if (mesh.isInstancedMesh) {

                const array = mesh.instanceMatrix.array;
                const { body: bodies } = this.meshMap.get(mesh);

                for (let j = 0; j < bodies.length; j++) {

                    const body = bodies[j];

                    const position = body.translation();
                    _quaternion.copy(body.rotation());

                    _matrix.compose(position, _quaternion, _scale).toArray(array, j * 16);

                }

                mesh.instanceMatrix.needsUpdate = true;
                mesh.computeBoundingSphere();

            } else {

                const { body } = this.meshMap.get(mesh);

                (mesh.parent ?? mesh).getWorldQuaternion(_q1).invert();
                _m1.copy((mesh.parent ?? mesh).matrixWorld).invert();
                _v1.copy(body.translation()).applyMatrix4(_m1);
                _q2.copy(body.rotation()).premultiply(_q1);
                mesh.position.copy(_v1);
                mesh.quaternion.copy(_q2);

            }

        }

    }

}

export { RapierPhysics };