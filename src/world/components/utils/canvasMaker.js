function makeLabelCanvas(specs) {

    const scale = 3 * window.devicePixelRatio;
    const { baseWidth, size, borderSize = 5 } = specs;
    const ctx = document.createElement('canvas').getContext('2d');
    const font = `bold ${size * scale}px sans-serif`;
    ctx.font = font;

    const doubleBorderSize = borderSize * 2;
    const clientWidth = baseWidth + doubleBorderSize;
    const clientHeight = size + doubleBorderSize;
    const width = clientWidth * scale;
    const height = clientHeight * scale;

    ctx.canvas.style.width = `${clientWidth}px`;
    ctx.canvas.style.height = `${clientHeight}px`;
    ctx.canvas.width = width
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    return {
        context: ctx,
        canvas: ctx.canvas,
        baseWidth: baseWidth * scale, size: size * scale,
        width, height, clientWidth, clientHeight
    };

}

function makeInteractiveLabelCanvas(specs) {

    const scale = 6;
    const { baseWidth, borderHeight, size, borderSize } = specs;
    const ctx = document.createElement('canvas').getContext('2d');
    const font = `bold ${size * scale}px sans-serif`;
    ctx.font = font;

    const doubleBorderSize = borderSize * 2;
    const clientWidth = baseWidth + doubleBorderSize;
    const clientHeight = borderHeight + doubleBorderSize;
    const width = clientWidth * scale;
    const height = clientHeight * scale;

    ctx.canvas.style.backgroundColor = 'transparent';
    ctx.canvas.style.width = `${clientWidth}px`;
    ctx.canvas.style.height = `${clientHeight}px`;
    ctx.canvas.width = width
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    return {
        context: ctx,
        canvas: ctx.canvas,
        baseWidth: baseWidth * scale, size: size * scale,
        width, height, clientWidth, clientHeight
    };

}

function makeCanvasFromImage(image) {

    if (!image) return null;

	const canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.drawImage(image, 0, 0, image.width, image.height);

    return canvas;

}

export { makeLabelCanvas, makeInteractiveLabelCanvas, makeCanvasFromImage };