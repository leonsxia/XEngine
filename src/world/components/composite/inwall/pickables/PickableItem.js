import { Sprite } from "three";
import { ObstacleBase } from "../ObstacleBase";
import { GLTFModel } from "../../../Models";
import { createOBBBox } from "../../../physics/collisionHelper";
import { makeInteractiveLabelCanvas } from "../../../utils/canvasMaker";
import { createSpriteMaterial } from "../../../basic/basicMaterial";
import { GAMEPAD_BUTTONS, KEYS, LABEL_BASE_SCALE } from "../../../../systems/ui/uiConstants";
import { hexToRGBA, labelBackground, white } from "../../../basic/colorBase";
import { getImageUrl } from "../../../utils/imageHelper";

class PickableItem extends ObstacleBase {

    _width;
    _height;
    _depth;
    _gltfScale = [1, 1, 1];

    // html content
    _itemSize = 1;
    itemHtml;
    countInfo;
    occupiedSlotIdx = -1;

    isPickableItem = true;
    isPicked = false;
    belongTo = undefined;

    currentRoom;

    _xboxControllerConnected;
    _imgUrl;

    constructor(specs) {

        super(specs);

        const { name, lines = false } = specs;
        const { width = 1, height = 1, depth = 1 } = specs;
        const { scale = [1, 1, 1], gltfScale = [1, 1, 1] } = specs;
        const { gltfRotation = [0, 0, 0] } = specs;
        const { src, receiveShadow = true, castShadow = true } = specs;
        const { currentRoom } = specs;
        const { isPicked = false, belongTo } = specs;

        this._width = width;
        this._height = height;
        this._depth = depth;
        this._scale = new Array(...scale);
        this._gltfScale = gltfScale;

        this.currentRoom = currentRoom;
        this.isPicked = isPicked;
        this.belongTo = belongTo;

        // basic gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow };

        const boxSpecs = { size: { width: this._width, depth: this._depth, height: this._height }, lines };

        // gltf model
        this.gltf = new GLTFModel(gltfSpecs);
        this.gltf.setScale(gltfScale);
        this.gltf.setRotation(gltfRotation);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;
        // this.box.setTransparent(true, .5);

        // interaction label
        this.labelCanvas = makeInteractiveLabelCanvas({ baseWidth: 15, borderHeight: 15, size: 10, borderSize: 2 });
        this.interactiveLabelTip = new Sprite(createSpriteMaterial(this.labelCanvas.canvas));
        this.interactiveLabelTip.scale.x = this.labelCanvas.clientWidth * LABEL_BASE_SCALE;
        this.interactiveLabelTip.scale.y = this.labelCanvas.clientHeight * LABEL_BASE_SCALE;
        this.interactiveLabelTip.position.y = this._height / 2 + .3;
        this.updateLabelTip();
        this.showLabelTip(false);

        this.group.add(
            this.gltf.group,
            this.box.mesh,
            this.interactiveLabelTip
        );

    }

    async init() {

        await this.gltf.init();

        this._imgUrl = await getImageUrl(this.specs.imgName);

        // html
        this.createItemHtml();

        this.setPickLayers();

    }

    get itemSize() {

        return this._itemSize;

    }

    set itemSize(val) {

        this._itemSize = val;
        this.removeHtmlClass('item-size-');
        this.addHtmlClass('item-size-2');
        
    }

    createItemHtml() {}

    removeHtmlClass(clsname) {

        let find = [];
        for (let i = 0, il = this.itemHtml.classList.length; i < il; i++) {

            const cls = this.itemHtml.classList[i];
            if (cls.includes(clsname)) {

                find.push(cls);

            }

        }

        for (let i = 0, il = find.length; i < il; i++) {

            const cls = find[i];
            this.itemHtml.classList.remove(cls);

        }

    }

    addHtmlClass(clsname) {

        this.itemHtml.classList.add(clsname);

    }

    setModelVisible(show) {

        this.group.visible = show;

    }

    setGLTFScale() {}

    update(needToUpdateOBBnRay = true) {

        this.setGLTFScale();

        // update box scale
        this.box.setScale(this.scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

    showLabelTip(show) {

        if (this.interactiveLabelTip.visible !== show) {

            this.interactiveLabelTip.visible = show;

        }

    }

    updateLabelTip() {

        const { context: ctx, width, height, baseWidth } = this.labelCanvas;

        const borderGap = 5;
        const content = this._xboxControllerConnected ? GAMEPAD_BUTTONS.A : KEYS.F;
        // measure how long the name will be
        const textWidth = ctx.measureText(content).width;

        // transform back
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.translate(width / 2, height / 2);
        ctx.beginPath();
        ctx.fillStyle = hexToRGBA(labelBackground, .5);
        ctx.arc(0, 0, (width - borderGap) / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = hexToRGBA(white);
        ctx.lineWidth = 4;
        ctx.arc(0, 0, (width - borderGap) / 2, 0, 2 * Math.PI);
        ctx.stroke();

        if (textWidth > 0) {

            // scale to fit but don't stretch
            const scaleFactor = Math.min(1, baseWidth / textWidth);
            ctx.scale(scaleFactor, 1);
            ctx.fillStyle = hexToRGBA(white);
            ctx.fillText(content, 0, 0);

        }

        this.interactiveLabelTip.material.map.needsUpdate = true;

    }

    // events
    xboxControllerConnected(val) {

        if (val && !this._xboxControllerConnected) {

            this._xboxControllerConnected = true;
            this.updateLabelTip();

        } else if (!val && this._xboxControllerConnected) {

            this._xboxControllerConnected = false;
            this.updateLabelTip();

        }

    }

    tick(delta) {

        this.group.rotation.y = (this.group.rotation.y + 0.5 * delta) % (2 * Math.PI);
        this.updateOBBs();

    }

}

export { PickableItem };