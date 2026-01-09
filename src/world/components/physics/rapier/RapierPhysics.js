import { Vector3, Quaternion, Matrix4 } from 'three';
import * as RAPIER from '@dimforge/rapier3d';

// const RAPIER_PATH = 'https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.17.3';

const _scale = new Vector3(1, 1, 1);
const ZERO = new Vector3();

function getShape(geometry) {

    const parameters = geometry.parameters;

    if (geometry.type === 'RoundedBoxGeometry') {

        const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
        const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
        const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
        const radius = parameters.radius !== undefined ? parameters.radius : 0.1;

        return RAPIER.ColliderDesc.roundCuboid(sx - radius, sy - radius, sz - radius, radius);

    } else if (geometry.type === 'BoxGeometry') {

        const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
        const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
        const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;

        return RAPIER.ColliderDesc.cuboid(sx, sy, sz);

    } else if (geometry.type === 'SphereGeometry' || geometry.type === 'IcosahedronGeometry') {

        const radius = parameters.radius !== undefined ? parameters.radius : 1;
        return RAPIER.ColliderDesc.ball(radius);

    } else if (geometry.type === 'CylinderGeometry') {

        const radius = parameters.radiusBottom !== undefined ? parameters.radiusBottom : 0.5;
        const length = parameters.height !== undefined ? parameters.height : 0.5;

        return RAPIER.ColliderDesc.cylinder(length / 2, radius);

    } else if (geometry.type === 'CapsuleGeometry') {

        const radius = parameters.radius !== undefined ? parameters.radius : 0.5;
        const length = parameters.height !== undefined ? parameters.height : 0.5;

        return RAPIER.ColliderDesc.capsule(length / 2, radius);

    } else if (geometry.type === 'BufferGeometry') {

        const vertices = [];
        const vertex = new Vector3();
        const position = geometry.getAttribute('position');

        for (let i = 0; i < position.count; i++) {

            vertex.fromBufferAttribute(position, i);
            vertices.push(vertex.x, vertex.y, vertex.z);

        }

        // if the buffer is non-indexed, generate an index buffer
        const indices = geometry.getIndex() === null
            ? Uint32Array.from(Array(parseInt(vertices.length / 3)).keys())
            : geometry.getIndex().array;

        return RAPIER.ColliderDesc.trimesh(vertices, indices);

    }

    console.error('RapierPhysics: Unsupported geometry type:', geometry.type);

    return null;

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
   
    constructor() {}

    async init() {
        
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

        const shape = getShape(mesh.geometry);

        if (shape === null) return;

        shape.setMass(mass);
        shape.setRestitution(restitution);

        const { body, collider } = mesh.isInstancedMesh
            ? this.createInstancedBody(mesh, mass, shape)
            : this.createBody(mesh.position, mesh.quaternion, mass, shape);

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

    addCompoundMesh(compoundMeshes = [], body, group) {

        let totalMass = 0;
        const colliders = [];
        for (let i = 0, il = compoundMeshes.length; i < il; i++) {

            const mesh = compoundMeshes[i];
            const { mass = 0, restitution = 0 } = mesh.userData.physics;

            const shape = getShape(mesh.geometry);
            const { x, y, z } = mesh.position;
            shape.setTranslation(x, y, z);
            shape.setRotation(mesh.quaternion);

            if (shape === null) return;

            shape.setMass(mass);
            shape.setRestitution(restitution);

            const collider = this.world.createCollider(shape, body);

            if (!mesh.userData.physics) mesh.userData.physics = {};

            mesh.userData.physics.body = body;
            mesh.userData.physics.collider = collider;
            colliders.push(collider);

            totalMass += mass;

        }

        if (group) {

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

            const position = _vector.fromArray(array, i * 16 + 12);
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
        bodyDesc.setTranslation(mesh.position.x, mesh.position.y, mesh.position.z);
        bodyDesc.setRotation(mesh.quaternion);

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

                mesh.position.copy(body.translation());
                mesh.quaternion.copy(body.rotation());

            }

        }

    }

}

export { RapierPhysics };