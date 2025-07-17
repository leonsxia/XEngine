import { TabPanel } from "./TabPanel";

class Inventory extends TabPanel {

    items = [];

    constructor(specs) {

        super(specs);

    }

    add(item) {

        this.items.push(item);
        item.isPicked = true;
        item.belongTo = this._attachTo._owner.name;

    }

    remove(item) {

        const idx = this.items.findIndex(i => i === item);

        if (idx > - 1) {

            this.items.splice(idx, 1);
            item.isPicked = false;
            item.belongTo = undefined;

            if (item.isWeaponItem) item.isArmed = false;

        }

    }

    findItems(predication) {

        return this.items.filter(predication);

    }

}

export { Inventory };