class Logger {

    enable = true;
    module;
    func;

    constructor(enable = true, module = Logger.name) {

        this.enable = enable;
        this.module = module;

    }

    log(message, prefix = true) {

        if (this.enable) {

            if (arguments.length > 2) {

                if (this.func) {

                    console.log(`[${this.module}] -> [${this.func}]: `);

                } else {

                    console.log(`[${this.module}]: `);

                }

                for (let i = 0; i < arguments.length; i++) {

                    this.log(arguments[i], false);

                }

                return;

            }

            if (prefix) {

                if (this.func) {

                    console.log(`[${this.module}] -> [${this.func}]:`, message);

                } else {

                    console.log(`[${this.module}]:`, message);

                }

            } else {

                console.log(message);

            }

        }

    }

}

export { Logger };