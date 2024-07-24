import { BufferGeometry, Float32BufferAttribute } from 'three';

function createTriangleGeometry(width, height, leftHanded = true) {

    const width_half = width * .5;
    const height_half = height * .5;

    const vertices = [
        // front
        { pos: [- width_half, - height_half, 0], norm: [0, 0, 1], uv: [0, 0] }, // 0
        { pos: [width_half, - height_half, 0], norm: [0, 0, 1], uv: [1, 0] }, // 1
        { pos: [leftHanded ? width_half : - width_half, height_half, 0], norm: [0, 0, 1], uv: [leftHanded ? 1 : 0, 1] } // 2
    ]

    const positions = [];
	const normals = [];
	const uvs = [];

	for ( const vertex of vertices ) {

		positions.push( ...vertex.pos );
		normals.push( ...vertex.norm );
		uvs.push( ...vertex.uv );

	}

    const geometry = new BufferGeometry();
	const positionNumComponents = 3;
	const normalNumComponents = 3;
	const uvNumComponents = 2;

	geometry.parameters = {
		width: width,
		height: height,
		leftHanded: leftHanded
	};

	geometry.setAttribute(
		'position',
		new Float32BufferAttribute(positions, positionNumComponents)
    );
	geometry.setAttribute(
		'normal',
		new Float32BufferAttribute(normals, normalNumComponents) 
    );
	geometry.setAttribute(
		'uv',
		new Float32BufferAttribute(uvs, uvNumComponents) 
    );

	geometry.setIndex( [
		0, 1, 2
	] );

    return geometry;

}

export { createTriangleGeometry };