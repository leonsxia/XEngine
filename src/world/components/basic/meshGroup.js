import { SphereGeometry, Group, MathUtils, Mesh, MeshStandardMaterial } from 'three';

function createMeshGroup (specs) {
    // a group holds other objects but cannot be seen itself
    const group = new Group();
    group.position.set(...specs.position);

    const sphereGeometry = new SphereGeometry(0.25, 16, 16);
    const material = new MeshStandardMaterial({ color: '#568203' });
    const protoSphere = new Mesh(sphereGeometry, material);

    group.add(protoSphere);

    for (let i = 0; i < 1; i += 0.05) {
        const sphere =  protoSphere.clone();

        sphere.position.x = Math.cos(2 * Math.PI * i);
        sphere.position.y = Math.sin(2 * Math.PI * i);
        // sphere.position.z = -i * 5;
        sphere.scale.multiplyScalar(0.01 + i);
        group.add(sphere);
    }
    group.scale.multiplyScalar(2);
    group.rotation.x = MathUtils.degToRad(45);

    const radiusPerSecond = MathUtils.degToRad(30);
    let groupRadius = 0;
    group.tick = (delta) => {
        group.rotation.z -= delta * radiusPerSecond;
        group.position.x = 10 * Math.cos(groupRadius);
        group.position.z = -10 * Math.sin(groupRadius);
        group.position.y = 5 * Math.sin(groupRadius);
        groupRadius += delta * radiusPerSecond;
        if (groupRadius >= 2 * Math.PI) {
            groupRadius = 0;
        }
    };

    return group;
}

export { createMeshGroup };