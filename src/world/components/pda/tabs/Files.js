import { createFiles } from "../../../systems/htmlElements";
import { TabPanel } from "./TabPanel";

class Files extends TabPanel {

    constructor(specs) {

        super(specs);

        this._html = createFiles();

    }

}

export { Files };