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
const BF = 0xFFD700;
const BF2 = 0xFF6347;
const BBW = 0x00ff00;
const intersect = 0xFF2400;
const specular = 0x111111;

function colorStr(r, g, b) {

    return `rgb(${r},${g},${b})`;

}

function colorHex(r, g, b) {

    let rr = r.toString(16);
    let gg = g.toString(16);
    let bb = b.toString(16);

    if (rr.length < 2) rr = '0' + rr;
    if (gg.length < 2) gg = '0' + gg;
    if (bb.length < 2) bb = '0' + bb;

    const hex = `#${rr}${gg}${bb}`;

    return hex;

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
    BF2,
    BBW,
    intersect,
    specular,
    colorStr,
    colorHex,
    colorArr
}