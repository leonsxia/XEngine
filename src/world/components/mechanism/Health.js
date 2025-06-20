import { Sprite } from "three";
import { makeLabelCanvas } from "../utils/canvasMaker";
import { createSpriteMaterial } from "../basic/basicMaterial";
import { colorStr } from "../basic/colorBase";

const PALETTE = [];

for (let i = 0; i < 6; i++) {

    const r = 255;
    const g = 42.5 * i;
    const b = 0;
    const color = colorStr(r, g, b);

    PALETTE.push({
        r, g, b,
        color
    });

}

for (let i = 1; i < 6; i++) {

    const r = Math.floor(255 - 42.5 * i);
    const g = 255;
    const b = 0;
    const color = colorStr(r, g, b);

    PALETTE.push({
        r, g, b,
        color
    });

}

const colorStep = 1 / 11;


class Health {

    #max;
    #min;
    #current;
    #life;

    constructor(specs) {

        const { max = 100, min = 0, current = 100, showText = true } = specs;

        this.#max = max;
        this.#min = min;
        this.#current = current;
        this.#life = this.#max - this.#min;
        this.labelCanvas = makeLabelCanvas(specs);
        this.showText = showText;

        this.strip = new Sprite(createSpriteMaterial(this.labelCanvas.canvas));

        const labelBaseScale = 0.01;
		this.strip.scale.x = this.labelCanvas.clientWidth * labelBaseScale;
		this.strip.scale.y = this.labelCanvas.clientHeight * labelBaseScale;

        this.updateHealth();

    }

    get max() {

        return this.#max;

    }

    get min() {

        return this.#min;

    }

    get current() {

        return this.#current;

    }

    set current(val) {

        this.#current = Math.max(this.#min, val);
        this.#current = Math.min(this.#max, this.#current);

        if (this.strip.visible) {

            this.updateHealth();

        }

    }

    get currentLife() {

        return 100 * (this.#current - this.#min) / this.#life;

    }

    get isEmpty() {

        return this.#current === this.#min;

    }

    /**
     * @param {boolean} val
     */
    set visible(val) {

        this.strip.visible = val;

    }

    showStrip(show) {

        this.visible = show;

    }

    updateHealth() {

        const { context: ctx, width, height, baseWidth } = this.labelCanvas;

        const content = this.showText ? `${this.currentLife.toFixed(1)}%` : '';
        // const content = `this is a very, very, very long text`;
        // measure how long the name will be
        const textWidth = ctx.measureText(content).width;        

        // transform back
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // draw background        
        ctx.fillStyle = '#010101';
        ctx.fillRect(0, 0, width, height);

        // draw health strip
        const index = this.#current ? Math.ceil(((this.#current - this.#min) / this.#life) / colorStep) - 1 : 0;
        const color = PALETTE[index].color;
        ctx.fillStyle = color;
        ctx.fillRect(1, 1, (width - 2) * (this.#current - this.#min) / this.#life, height - 2);

        if (textWidth > 0) {

            // scale to fit but don't stretch
            const scaleFactor = Math.min(1, baseWidth / textWidth);
            ctx.translate(width / 2, height / 2);
            ctx.scale(scaleFactor, 1);
            ctx.fillStyle = 'white';
            ctx.fillText(content, 0, 0);

        }

        this.strip.material.map.needsUpdate = true;

    }

}

export { Health };