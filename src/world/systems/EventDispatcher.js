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

    getMessage(type) {
        return this.#messages[type];
    }

    init() {
        this.#types.forEach(type => {
            this.#messages[type] = {};
            this.#actions.forEach(action => {
                this.#messages[type][action] = [];
            });
        });
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
                subscribers.forEach(subscriber => {
                    if (subscriber.scene !== current) return;
                    const args = [];
                    for (let i = 3; i < arguments.length; i++)
                    {
                        args.push(arguments[i]);
                    }
                    // console.log(`subscriber: '${subscriber.subscriber.name}' scene: ${subscriber.scene}`);
                    subscriber.callback.apply(subscriber.subscriber, args);
                });
            }
        }
    }

    findSubscriber(subscriber, subscribers) {
        return subscribers.findIndex(s => s.subscriber === subscriber.subscriber);
    }
}

export { EventDispatcher };