function getRandomFloat(min, max) {

    return Math.random() * (max - min) + min;

}

function getRandomInt(min, max) {

    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;

}

function getLoopIndex(idx, size, step) {

    let tarIdx;
    const multiple = Math.ceil(size / step);
    const maxLen = multiple * step;

    if (idx > 0) {

        if (idx < size) {

            tarIdx = idx;

        } else if (idx >= size && idx < maxLen){

            tarIdx = idx % size;

        } else {

            tarIdx = idx % maxLen;

        }

    } else {

        const plus = idx + maxLen;
        if (plus < 0) {

            tarIdx = getLoopIndex(plus, size, step);

        } else {

            tarIdx = Math.min(plus % maxLen, size - 1);

        }

    }

    return tarIdx;

}

export { getRandomFloat, getRandomInt, getLoopIndex };