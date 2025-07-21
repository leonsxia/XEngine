import { createECG } from "../../../systems/htmlElements";
import { ECG_STATE, IMAGE_NAMES } from "../../../systems/ui/uiConstants";
import { getImageUrl } from "../../utils/imageHelper";

class ECG {

    constructor() {}

    async init() {

        const url = await getImageUrl(IMAGE_NAMES.ECG);

        const { ecgDiv, pulseWave, stateText } = createECG({ url });
        this.container = ecgDiv;
        this.pulseWave = pulseWave;
        this.stateText = stateText;

    }

    switchState(state) {

        this.container.classList.remove(ECG_STATE.CAUTION, ECG_STATE.DANGER);

        switch (state) {

            case ECG_STATE.CAUTION:
                this.container.classList.add(ECG_STATE.CAUTION);
                break;

            case ECG_STATE.DANGER:
                this.container.classList.add(ECG_STATE.DANGER);
                break;

        }

    }

}

export { ECG };