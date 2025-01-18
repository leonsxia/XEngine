class Logger {

    enable = true;

    constructor() {

    }

    log(message) {

        if (this.enable) {

            console.log(message);
            
        }

    }

}

export { Logger };