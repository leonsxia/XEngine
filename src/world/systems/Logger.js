class Logger {

    enable = true;
    module;

    constructor(enable = true, module = Logger.name) {

        this.enable = enable;
        this.module = module;

    }

    log(message) {

        if (this.enable) {

            console.log(`[${this.module}] ${message}`);
            
        }

    }

}

export { Logger };