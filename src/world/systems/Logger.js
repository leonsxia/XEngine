class Logger {

    enable = true;

    constructor(enable = true) {

        this.enable = enable;

    }

    log(message) {

        if (this.enable) {

            console.log(message);
            
        }

    }

}

export { Logger };