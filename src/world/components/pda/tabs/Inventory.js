import { TabPanel } from "./TabPanel";

class Inventory extends TabPanel {

    items = [];

    constructor(specs) {

        super(specs);

    }

    add(item) {

        this.items.push(item);
        item.isPicked = true;
        item.belongTo = this._attachTo._attachTo.name;

    }

    remove(item) {

        const idx = this.items.findIndex(i => i === item);

        if (idx > - 1) {

            this.items.splice(idx, 1);
            item.isPicked = false;
            item.belongTo = undefined;

        }

    }

    findItems(predication) {

        return this.items.filter(predication);

    }

}

export { Inventory };