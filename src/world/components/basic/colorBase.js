const basic = 0xcccccc;
const white = 0xffffff;
const black = 0x000000;
const yankeesBlue = 0x0C2340;
const violetBlue = 0x324AB2;
const independence = 0x4C516D;
const deepSkyBlue = 0x00BFFF;
const lightSkyBlue = 0xb3ecff;
const TVNoise = 0xc9ecfd;
const green = 0x00ff00;
const red = 0xff0000;
const blue = 0x0000ff;
const yellow = 0xffff00;
const orange = 0xffa500;
const khaki = 0xF0E68C;
const seaSaltLight = 0x4b6cb7;
const seaSaltHeavy = 0x182848;
const moonlitAsteroidHeavier = 0x111111;
const moonlitAsteroidLight = 0x2c5364;
const moonlitAsteroidMedium = 0x203A43;
const moonlitAsteroidHeavy = 0x0F2027;
const BB = 0xffffff;
const BS = 0xFFC72C;
const BF = 0xFFD700;
const BF2 = 0xFF6347;
const BBW = 0x00ff00;
const intersect = 0xFF2400;
const specular = 0x111111;

// ui
const labelBackground = 0x555555;
const labelForbidden = 0xFF0800;

// AI color codes
const AI = {
    targetInRange: 0xFF2400
};

function hexToRGBA(hex, opacity = 1) {

    hex = hex.toString(16);
    hex = hex.length === 0 ? `000000` :
        hex.length === 1 ? `00000${hex}` :
            hex.length === 2 ? `0000${hex}` :
                hex.length === 3 ? `000${hex}` :
                    hex.length === 4 ? `00${hex}` :
                        hex.length === 5 ? `0${hex}` :
                            hex;
    // Remove 0x or # prefix if present
    let cleanHex = hex.startsWith("0x") ? hex.substring(2) : hex;
    cleanHex = cleanHex.startsWith("#") ? cleanHex.substring(1) : cleanHex;

    // Handle 3-digit hex (e.g., #F00 becomes #FF0000)
    if (cleanHex.length === 3) {
        cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
    }

    // Parse individual color components
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Return the RGB string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;

}

function colorStr(r, g, b, a = 1) {

    return `rgba(${r},${g},${b},${a})`;

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
    lightSkyBlue,
    TVNoise,
    green,
    red,
    blue,
    yellow,
    orange,
    khaki,
    seaSaltLight,
    seaSaltHeavy,
    moonlitAsteroidHeavier,
    moonlitAsteroidLight,
    moonlitAsteroidMedium,
    moonlitAsteroidHeavy,   
    BB,
    BS,
    BF,
    BF2,
    BBW,
    intersect,
    specular,
    labelBackground,
    labelForbidden,
    AI,
    colorStr,
    colorHex,
    colorArr,
    hexToRGBA
}