import { BufferGeometry, Float32BufferAttribute } from 'three';

function createGeometryFromIndex(vertices, index) {

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

	geometry.setIndex(index);

	return geometry;

}

function createTriangleGeometry(width, height, leftHanded = true) {

    const width_half = width * .5;
    const height_half = height * .5;

    const vertices = [
        { pos: [- width_half, - height_half, 0], norm: [0, 0, 1], uv: [0, 0] }, // 0
        { pos: [width_half, - height_half, 0], norm: [0, 0, 1], uv: [1, 0] }, // 1
        { pos: [leftHanded ? width_half : - width_half, height_half, 0], norm: [0, 0, 1], uv: [leftHanded ? 1 : 0, 1] } // 2
    ];
	const index = [0, 1, 2];

    const geometry = createGeometryFromIndex(vertices, index);

	geometry.parameters = {
		width,
		height,
		leftHanded
	};

    return geometry;

}

function createStairsSideGeometry(specs) {

	const { width, height, stepHeight, steps, lastStepHeight, stepDepth, leftHanded } = specs;
	const half_width = width * .5;
	const half_height = height * .5;

	const vertices = [];
	const index = [];
	let idx = 0;

	for (let i = 0; i < steps; i ++) {

		const step_height = leftHanded ? i === steps - 1 && lastStepHeight > 0 ? lastStepHeight : stepHeight : 
			i === 0 && lastStepHeight > 0 ? lastStepHeight : stepHeight;
		
		const xl = - half_width + i * stepDepth
		const xr = - half_width + (i + 1) * stepDepth;
		const yb = - half_height;
		const yt = leftHanded ? - half_height + i * stepHeight + step_height : - half_height + (steps - i - 1) * stepHeight + step_height;
		const ul = (half_width + xl) / width;
		const ur = (half_width + xr) / width;
		const vb = 0;
		const vt = (half_height + yt) / height;
		const norm = [0, 0, 1];

		if (i === 0) {
			// 0
			vertices.push({ pos: [xl, yb, 0], norm, uv: [ul, vb] });
		}

		vertices.push({ pos: [xr, yb, 0], norm, uv: [ur, vb] });
		vertices.push({ pos: [xl, yt, 0], norm, uv: [ul, vt]});
		vertices.push({ pos: [xr, yt, 0], norm, uv: [ur, vt]});

		if (i === 0) {

			index.push(0, 1, 2, 2, 1, 3);

			idx = 1;

		} else {

			index.push(idx, idx + 3, idx + 4, idx + 4, idx + 3, idx + 5);

			idx += 3;

		}
	}

	const geometry = createGeometryFromIndex(vertices, index);

	geometry.parameters = {
		width,
		height,
		leftHanded
	};

	return geometry;

}

function createStairsFrontGeometry(specs) {

	const { width, height, depth, stepHeight, steps, lastStepHeight, stepDepth } = specs;
	const half_width = width * .5;
	const half_height = height * .5;
	const half_depth = depth * .5

	const vertices = [];
	const index = [];
	let idx = 0;

	for (let i = 0; i < steps; i ++) {

		const step_height = i === steps - 1 && lastStepHeight > 0 ? lastStepHeight : stepHeight;
		
		const xl = - half_width;
		const xr = half_width;
		const yb = - half_height + i * stepHeight;
		const yt = - half_height + i * stepHeight + step_height;
		const ul = 0;
		const ur = 1;
		const vb = (i * stepHeight) / height;
		const vt = (half_height + yt) / height;
		const posZ = half_depth - i * stepDepth;
		const norm = [0, 0, 1];

		vertices.push({ pos: [xl, yb, posZ], norm, uv: [ul, vb] });
		vertices.push({ pos: [xr, yb, posZ], norm, uv: [ur, vb] });
		vertices.push({ pos: [xl, yt, posZ], norm, uv: [ul, vt]});
		vertices.push({ pos: [xr, yt, posZ], norm, uv: [ur, vt]});

		index.push(idx, idx + 1, idx + 2, idx + 2, idx + 1, idx + 3);

		idx += 4;

	}

	const geometry = createGeometryFromIndex(vertices, index);

	geometry.parameters = {
		width,
		height
	};

	return geometry;

}

function createStairsTopGeometry(specs) {

	// height: depth, depth: height
	const { width, height, depth, stepHeight, steps, lastStepHeight, stepDepth } = specs;
	const half_width = width * .5;
	const half_height = height * .5;
	const half_depth = depth * .5

	const vertices = [];
	const index = [];
	let idx = 0;

	for (let i = 0; i < steps; i ++) {

		const step_height = i === steps - 1 && lastStepHeight > 0 ? lastStepHeight : stepHeight;
		
		const xl = - half_width;
		const xr = half_width;
		const yb = - half_height + i * stepDepth;
		const yt = - half_height + (i + 1) * stepDepth;
		const ul = 0;
		const ur = 1;
		const vb = (i * stepDepth) / height;
		const vt = (half_height + yt) / height;
		const posZ = - half_depth + i * stepHeight + step_height;
		const norm = [0, 0, 1];

		vertices.push({ pos: [xl, yb, posZ], norm, uv: [ul, vb] });
		vertices.push({ pos: [xr, yb, posZ], norm, uv: [ur, vb] });
		vertices.push({ pos: [xl, yt, posZ], norm, uv: [ul, vt]});
		vertices.push({ pos: [xr, yt, posZ], norm, uv: [ur, vt]});

		index.push(idx, idx + 1, idx + 2, idx + 2, idx + 1, idx + 3);

		idx += 4;

	}

	const geometry = createGeometryFromIndex(vertices, index);

	geometry.parameters = {
		width,
		height
	};

	return geometry;

}

export { 
	createTriangleGeometry,
	createStairsSideGeometry,
	createStairsFrontGeometry,
	createStairsTopGeometry
};