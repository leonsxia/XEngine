import Resource from '../Resource.js';
import { RESOURCE_TYPE } from '../configs/resources.js';
import { Logger } from '../../Logger';

const loadedImages = {};

async function loadSingleImageUrl(src) {

    const response = await fetch(src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    return url;

}

async function getImageUrl(src, name) {

    if (!src) return null;

    let url;

    if (src.startsWith?.('blob')) {

        return src;

    } else if (loadedImages[src]) {

        return loadedImages[src];

    } else if (name && loadedImages[name]) {

        return loadedImages[name];

    }

    url = await loadSingleImageUrl(src);
    if (name) loadedImages[name] = url;

    return url;

}
export { loadedImages, getImageUrl };

const DEBUG = true;
export default class ImageHelper extends Resource {

    _logger = new Logger(DEBUG, 'ImageHelper');

    constructor(sources, type = RESOURCE_TYPE.IMAGE) {

        super(sources, type);

    }

    async startLoading() {

        const fetchPromises = []
        const blobPromises = [];
        this.startTime();

        for (const source of this.sources) {

            const { name, src } = source;

            if (src) {

                fetchPromises.push(fetch(src).then(response => {

                    blobPromises.push(response.blob().then(blob => {

                        this.sourceLoaded(name, URL.createObjectURL(blob));

                    }));

                }));

            }
        }

        await Promise.all(fetchPromises);
        await Promise.all(blobPromises);

        Object.assign(loadedImages, this.items);

        return loadedImages;

    }

};