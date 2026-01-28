import { PlaneGeometry } from 'three';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { getRandomFloat } from './mathHelper';
import { makeCanvasFromImage } from './canvasMaker';

function createGeometryFromIndex(vertices, index) {

    const positions = [];
    const normals = [];
    const uvs = [];

    for (const vertex of vertices) {

        positions.push(...vertex.pos);
        normals.push(...vertex.norm);
        uvs.push(...vertex.uv);

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

function createPlaneGeometry(width, height) {

    const width_half = width * .5;
    const height_half = height * .5;

    const vertices = [
        { pos: [- width_half, - height_half, 0], norm: [0, 0, 1], uv: [0, 0] }, // 0
        { pos: [width_half, - height_half, 0], norm: [0, 0, 1], uv: [1, 0] }, // 1
        { pos: [width_half, height_half, 0], norm: [0, 0, 1], uv: [1, 1] }, // 2
        { pos: [- width_half, height_half, 0], norm: [0, 0, 1], uv: [0, 1] }, // 3
    ];
    const index = [0, 1, 2, 2, 3, 0];

    const geometry = createGeometryFromIndex(vertices, index);

    geometry.parameters = {
        width,
        height
    };

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

    for (let i = 0; i < steps; i++) {

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
        vertices.push({ pos: [xl, yt, 0], norm, uv: [ul, vt] });
        vertices.push({ pos: [xr, yt, 0], norm, uv: [ur, vt] });

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

    for (let i = 0; i < steps; i++) {

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
        vertices.push({ pos: [xl, yt, posZ], norm, uv: [ul, vt] });
        vertices.push({ pos: [xr, yt, posZ], norm, uv: [ur, vt] });

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

    for (let i = 0; i < steps; i++) {

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
        vertices.push({ pos: [xl, yt, posZ], norm, uv: [ul, vt] });
        vertices.push({ pos: [xr, yt, posZ], norm, uv: [ur, vt] });

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

function generateTerrainGeometry(width, depth, height, segmentW, segmentD) {

    const geometry = new PlaneGeometry(width, depth, segmentW, segmentD);
    geometry.rotateX(- Math.PI / 2);

    const position = geometry.getAttribute('position');
    const columnNum = segmentW + 1;
    // store height data in matrix
    /*
        this is a row-major matrix, order follow geometry position stored sequence
        0          1         2 ...       w
        w + 1                  ...   2 * w
        2 * w + 1              ...   3 * w
        .
        h * w + 1              ...   h * (w + 1)
    */
    const matrix = new Map();
    for (let i = 0, il = position.count; i < il; i++) {

        const row = Math.floor(i / columnNum);
        const column = (i - row * columnNum) % columnNum;
        const randomHeight = getRandomFloat(- height * .5, height * .5);
        position.setY(i, randomHeight);

        if (!matrix.has(row)) {

            matrix.set(row, new Map());

        }

        matrix.get(row).set(column, randomHeight);

    }

    geometry.computeVertexNormals();
    // geometry.computeBoundingBox();
    // geometry.computeBoundingSphere();

    geometry.userData.heights = generateRapierHeights(matrix, segmentW, segmentD);

    return { geometry };

}

function getHeightValue(material, canvas, u, v) {

    const ctx = canvas.getContext('2d');
    // Map UV coordinates (0 to 1) to pixel coordinates
    const x = Math.floor(Math.max(0, u * canvas.width - 1));
    const y = Math.floor(Math.max(0, v * canvas.height - 1));

    // Get the pixel data (RGBA values)
    const imageData = ctx.getImageData(x, y, 1, 1).data;
    // For a grayscale displacement map, R, G, and B are usually the same.
    // The red channel value gives the height information.
    const heightValue = imageData[0]; // R channel (0-255)

    // The raw value needs to be mapped to the actual displacement scale and bias
    // The default range for a displacement map in three.js is [0, displacementScale]
    // unless displacementBias is used to offset it.
    const scale = material.displacementScale || 1;
    const bias = material.displacementBias || 0;
    const normalizedValue = heightValue / 255.0;
    const actualDisplacement = normalizedValue * scale + bias;

    return actualDisplacement;

}

/*
    transfrom from row-major to column-major
    0    h + 1   2 * h + 1   ...   w * h + 1
    1
    2
    .
    h    2 * h   3 * h       ...   (w + 1) * h
*/
function generateRapierHeights(matrixMap, width, depth) {

    const heights = [];
    for (let i = 0, il = width; i <= il; i++) {

        for (let j = 0, jl = depth; j <= jl; j++) {

            heights.push(matrixMap.get(j).get(i));

        }

    }

    return heights;

}

function updateTerrainGeometry(geometry, heightmap, material, texScale = [1, 1], offset = [0, 0], heightScale = 1) {

    geometry.rotateX(- Math.PI / 2);
    const position = geometry.getAttribute('position');
    const { width, height, widthSegments, heightSegments } = geometry.parameters;
    const dx = width / widthSegments;
    const dy = height / heightSegments;
    const unitWidth = width / texScale[0];
    const unitHeight = height / texScale[1];
    const columnNum = widthSegments + 1;
    // store height data in matrix
    /*
        this is a row-major matrix, order follow geometry position stored sequence
        0          1         2 ...       w
        w + 1                  ...   2 * w
        2 * w + 1              ...   3 * w
        .
        h * w + 1              ...   h * (w + 1)
    */
    const matrix = new Map();
    // get canvas from heightmap image
    const canvas = makeCanvasFromImage(heightmap.image);

    for (let i = 0, il = position.count; i < il; i++) {

        const row = Math.floor(i / columnNum);
        const column = (i - row * columnNum) % columnNum;
        // for canvas uv is flipped in y axis
        let u = column * dx % unitWidth / unitWidth;
        let v = (heightSegments - row) * dy % unitHeight / unitHeight;
        u = (u + offset[0]) % 1;
        v = 1 - (offset[1] + v) % 1;
        const calcHeight = getHeightValue(material, canvas, u, v) * heightScale || 0;
        position.setY(i, calcHeight);

        if (!matrix.has(row)) {

            matrix.set(row, new Map());

        }

        matrix.get(row).set(column, calcHeight);

    }

    geometry.computeVertexNormals();
    // geometry.computeBoundingBox();
    // geometry.computeBoundingSphere();

    geometry.userData.heights = generateRapierHeights(matrix, widthSegments, heightSegments);

    return geometry;

}

function getTerrainGeometry(specs) {

    const { width, depth, height = 1, segmentW, segmentD, useHeightmap = false } = specs;
    const geometry = !useHeightmap ?
        generateTerrainGeometry(width, depth, height, segmentW, segmentD).geometry :
        new PlaneGeometry(width, depth, segmentW, segmentD);

    return geometry;

}

export {
    createPlaneGeometry,
    createTriangleGeometry,
    createStairsSideGeometry,
    createStairsFrontGeometry,
    createStairsTopGeometry,
    generateTerrainGeometry,
    updateTerrainGeometry,
    getTerrainGeometry
};