function getRandomFloat(min, max) {

    return Math.random() * (max - min) + min;

}

function getRandomInt(min, max) {

    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;

}

export { getRandomFloat, getRandomInt };