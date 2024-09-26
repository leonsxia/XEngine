const basic = 0xcccccc;
const white = 0xffffff;
const black = 0x000000;
const yankeesBlue = 0x0C2340;
const violetBlue = 0x324AB2;
const independence = 0x4C516D;
const deepSkyBlue = 0x00BFFF;
const green = 0x00ff00;
const red = 0xff0000;
const blue = 0x0000ff;
const yellow = 0xffff00;
const orange = 0xffa500;
const khaki = 0xF0E68C;
const BB = 0xffffff;
const BF = 0xffff33;
const BBW = 0x00ff00;
const intersect = 0xff0000;
const specular = 0x111111;

function colorStr(r, g, b) {

    return `rgb(${r},${g},${b})`;

}

function colorArr(objColor) {

    const color = objColor.clone().convertLinearToSRGB();
    return [Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255)];

}

export {
    basic,
    white,
    black,
    yankeesBlue,
    violetBlue,
    independence,
    deepSkyBlue,
    green,
    red,
    blue,
    yellow,
    orange,
    khaki,
    BB,
    BF,
    BBW,
    intersect,
    specular,
    colorStr,
    colorArr
}