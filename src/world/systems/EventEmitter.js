export default class EventEmitter {

    constructor() {

        this.callbacks = {};
        this.callbacks.base = {};

    }

    on(_names, callback) {

        // errors
        if (typeof _names === 'undefined' || _names === '') {

            console.warn('Wrong names');
            return false;

        }

        if (typeof callback === 'undefined') {

            console.warn('Wrong callback');
            return false;

        }

        // resolve names
        const names = this.resolveNames(_names);

        for (let i = 0, il = names.length; i < il; i++) {

            // resolve name
            const _name = names[i];
            const name = this.resolveName(_name);

            // create namespace if not exist
            if (!(this.callbacks[name.namespace] instanceof Object)) {

                this.callbacks[name.namespace] = {};

            }

            // create callback array if not exist
            if (!(this.callbacks[name.namespace][name.value] instanceof Array)) {

                this.callbacks[name.namespace][name.value] = [];

            }

            this.callbacks[name.namespace][name.value].push(callback);

        }

        return this;

    }

    off(_names) {

        // errors
        if (typeof _names === 'undefined' || _names === '') {

            console.warn('Wrong names');
            return false;

        }

        // resolve names
        const names = this.resolveNames(_names);

        for (let i = 0, il = names.length; i < il; i++) {

            // resolve name
            const _name = names[i];
            const name = this.resolveName(_name);

            // remove namespace
            if (name.namespace !== 'base' && name.value === '') {

                delete this.callbacks[name.namespace];

            } else { // remove specific callback in namespace

                // default
                if (name.namespace === 'base') {

                    // try to remove from each namespace
                    for (const namespace in this.callbacks) {

                        if (this.callbacks[namespace] instanceof Object && this.callbacks[namespace][name.value] instanceof Array) {

                            delete this.callbacks[namespace][name.value];

                            // remove namespace if empty
                            if (Object.keys(this.callbacks[namespace]).length === 0) {

                                delete this.callbacks[namespace];

                            }

                        }

                    }

                } else if (this.callbacks[name.namespace] instanceof Object && this.callbacks[name.namespace][name.value] instanceof Array) { // specified namespace

                    delete this.callbacks[name.namespace][name.value];

                    // remove namespace if empty
                    if (Object.keys(this.callbacks[name.namespace]).length === 0) {

                        delete this.callbacks[name.namespace];

                    }

                }

            }

        }

        return this;

    }

    trigger(_name, ..._args) {

        // errors
        if (typeof _name === 'undefined' || _name === '') {

            console.warn('Wrong name');
            return this;

        }

        // resolve names (should on have one event)
        let name = this.resolveNames(_name);

        // resolve name
        name = this.resolveName(name[0]);

        // default namespace
        if (name.namespace === 'base') {

            // try to find callback in each namespace
            for (const namespace in this.callbacks) {

                if (this.callbacks[namespace] instanceof Object && this.callbacks[namespace][name.value] instanceof Array) {

                    for (let i = 0, il = this.callbacks[namespace][name.value].length; i < il; i++) {

                        const callback = this.callbacks[namespace][name.value][i];
                        callback.apply(this, _args);

                    }

                }

            }

        } else if (this.callbacks[name.namespace] instanceof Object) { // specified namespace

            if (name.value === '') {

                console.warn('Wrong name');
                return this;

            }

            for (let i = 0, il = this.callbacks[name.namespace][name.value].length; i < il; i++) {

                const callback = this.callbacks[name.namespace][name.value][i];
                callback.apply(this, _args);

            }

        }

    }

    resolveNames(_names) {

        let names = _names;
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '');
        names = names.replace(/[,/]+/g, ' ');
        names = names.split(' ');

        return names;

    }

    resolveName(name) {

        const newName = {};
        const parts = name.split('.');

        newName.orignial = name;
        newName.value = parts.length > 1 ? parts[1] : parts[0];
        newName.namespace = 'base' // base namespace

        // specified namespace
        if (parts.length > 1 && parts[0] !== '') {

            newName.namespace = parts[0];

        }

        return newName;

    }

};