import { createMap } from "../../../systems/htmlElements";
import { TabPanel } from "./TabPanel";

class Maps extends TabPanel {

    constructor(specs) {

        super(specs);

        this._html = createMap();

    }

}

export { Maps };