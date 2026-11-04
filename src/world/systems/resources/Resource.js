import EventEmitter from '../EventEmitter';

export default class Resource extends EventEmitter {

    outEvent = 'out.ready';
    inEvent = 'in.ready';

    _logger;

    time;

    constructor(sources = [], type, renderer) {

        super();
        
        this.sources = sources;
        this.type = type;
        if (renderer) this.renderer = renderer;

        this.items = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;

        this.ready = false;

        this.setLoaders();

        this.on(this.inEvent, (event) => {

            this._logger.func = `${event.type}`;
            this._logger.log(`all ${event.count} loaded in ${event.time} ms.`);

        });

    }

    setLoaders() {}

    async startLoading() {}

    sourceLoaded(name, file) {

        this.items[name] = file;
        this.loaded++;

        if (this.loaded === this.toLoad) {

            this.stopTime();
            this.ready = true;
            this.trigger(this.inEvent, { type: this.type, time: this.time, count: this.loaded });
            this.trigger(this.outEvent, { type: this.type, time: this.time, count: this.loaded });

        }

    }

    startTime() {

        this.time = Date.now();

    }

    stopTime() {

        this.time = Date.now() - this.time;

    }

};