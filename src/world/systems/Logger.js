class Logger {

    enable = true;
    module;
    func;

    constructor(enable = true, module = Logger.name) {

        this.enable = enable;
        this.module = module;

    }

    log(message) {

        if (this.enable) {

            if (this.func) {

                console.log(`[${this.module}] -> [${this.func}]: ${message}`);

            } else {

                console.log(`[${this.module}] ${message}`);

            }
            
        }

    }

}

export { Logger };