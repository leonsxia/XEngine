import Resource from '../Resource';
import { RESOURCE_TYPE } from '../configs/resources.js';
import { Logger } from '../../Logger';

const loadedJsons = {};

async function loadSingleJson(src) {

    const response = await fetch(src);
    const json = await response.json();

    return json;

}

async function getJson(src, name) {

    if (!src) return null;

    let json;

    if (typeof src === 'object') {

        return src;

    } else if (loadedJsons[src]) {

        return loadedJsons[src];

    } else if (name && loadedJsons[name]) {

        return loadedJsons[name];

    }

    json = await loadSingleJson(src);
    if (name) loadedJsons[name] = json;

    return json;

}

async function getJsonItem(src, name) {

    let item = {};
    const json = await getJson(src);
    if (json) {

        Object.assign(item, json[name]);

    }

    return item;

}

export { getJson, getJsonItem, loadedJsons };

const DEBUG = true;
export default class JsonHelper extends Resource {

    _logger = new Logger(DEBUG, 'JsonHelper');

    constructor(sources, type = RESOURCE_TYPE.JSON) {

        super(sources, type);

    }

    async startLoading() {

        const fetchPromises = []
        const jsonPromises = [];
        this.startTime();

        for (const source of this.sources) {

            const { name, src } = source;

            if (src) {

                fetchPromises.push(fetch(src).then(response => {

                    jsonPromises.push(response.json().then(json => {

                        this.sourceLoaded(name, json);

                    }));

                }));

            }
        }

        await Promise.all(fetchPromises);
        await Promise.all(jsonPromises);

        Object.assign(loadedJsons, this.items);

        return loadedJsons;

    }

};