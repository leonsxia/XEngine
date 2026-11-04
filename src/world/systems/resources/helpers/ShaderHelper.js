import Resource from '../Resource';
import { RESOURCE_TYPE } from '../configs/resources.js';
import { Logger } from '../../Logger';

const loadedShaders = {};

export { loadedShaders };

const DEBUG = true;
export default class ShaderHelper extends Resource {

    _logger = new Logger(DEBUG, 'ShaderHelper');

    constructor(sources, type = RESOURCE_TYPE.SHADER) {

        super(sources, type);

    }

    async startLoading() {

        const fetchPromises = []
        const textPromises = [];
        const reg = /\n|\t/gi;
        this.startTime();

        for (const source of this.sources) {

            const { name, src } = source;

            if (src) {

                fetchPromises.push(fetch(src).then(response => {

                    textPromises.push(response.text().then(text => {

                        this.sourceLoaded(name, text.replaceAll(reg, ''));

                    }));

                }));

            }
        }

        await Promise.all(fetchPromises);
        await Promise.all(textPromises);

        Object.assign(loadedShaders, this.items);

        return loadedShaders;

    }

};