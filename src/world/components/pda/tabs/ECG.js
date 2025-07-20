import { createECG } from "../../../systems/htmlElements";
import { ECG_STATE } from "../../../systems/ui/uiConstants";

class ECG {

    constructor() {

        const { ecgDiv, pulseWave, stateText } = createECG();
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