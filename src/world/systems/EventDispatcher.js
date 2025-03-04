class EventDispatcher {

    #types = [];
    #actions = [];
    #messages = {};

    constructor(types, actions) {

        this.#types = types;
        this.#actions = actions;
        this.init();

    }

    get actions() {

        return this.#actions;

    }

    getActionTypes(category) {

        return this.#actions.find(act => act.category === category).types;

    }

    getMessage(type) {

        return this.#messages[type];

    }

    init() {

        for (let i = 0, il = this.#types.length; i < il; i++) {

            const type = this.#types[i];

            this.#messages[type] = {};

            for (let j = 0, jl = this.#actions.length; j < jl; j++) {

                const act = this.#actions[j];

                if (act.category === type) {

                    for (let k = 0, kl = act.types.length; k < kl; k++) {

                        const action = act.types[k];
                        this.#messages[type][action] = [];

                    }

                }

            }
        }
    }

    subscribe(type, action, subscriber) {

        const message = this.#messages[type];

        if (message) {

            const subscribers = message[action];

            if (subscribers) {

                if (this.findSubscriber(subscriber, subscribers) === -1) {

                    subscribers.push(subscriber);

                }

            }
        }
    }

    unsubscribe(type, action, subscriber) {

        const message = this.#messages[type];

        if (message) {

            const subscribers = message[action];

            if (subscribers) {

                var i = this.findSubscriber(subscriber, subscribers);

                if (i > -1) {

                    subscribers.splice(i, 1);

                }

            }
        }
    }

    publish(type, action, current) {
        
        const message = this.#messages[type];

        if (message) {

            const subscribers = message[action];

            if (subscribers && subscribers.length > 0) {

                for (let i = 0, il = subscribers.length; i < il; i++) {

                    const subscriber = subscribers[i];

                    if (subscriber.scene !== current) {

                        continue;
                        
                    }

                    const args = [];
                    for (let i = 3; i < arguments.length; i++) {

                        args.push(arguments[i]);

                    }

                    console.log(`subscriber: '${subscriber.subscriber.name}' scene: ${subscriber.scene}`);
                    subscriber.callback.apply(subscriber.subscriber, args);

                }

            }

        }
    }

    findSubscriber(subscriber, subscribers) {

        return subscribers.findIndex(s => s.subscriber === subscriber.subscriber);
        
    }

}

export { EventDispatcher };