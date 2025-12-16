import { Sprite, Vector3, MathUtils, Quaternion } from 'three';
import { entrySide, entryType } from '../../../utils/enums';
import { ObstacleBase } from '../ObstacleBase';
import { makeInteractiveLabelCanvas } from '../../../utils/canvasMaker';
import { createSpriteMaterial } from '../../../basic/basicMaterial';
import { GAMEPAD_BUTTONS, KEYS, LABEL_BASE_SCALE } from '../../../../systems/ui/uiConstants';
import { hexToRGBA, labelBackground, labelForbidden, white } from '../../../basic/colorBase';

const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
const _up = new Vector3(0, 1, 0);
const _standPosition = new Vector3(0, 0, .7);
const _q1 = new Quaternion();
const _q2 = new Quaternion();

class EntryBase extends ObstacleBase {

    isEntry = true;

    transportType = entryType.self;
    linkTo = '';
    roomSequence = 0;
    transportTo = entrySide.back;

    _xboxControllerConnected;
    _forbidden = false;

    _labelSide = undefined;
    
    onEntryChanged = [];

    constructor(specs) {

        super(specs);

        const { transportType = entryType.self, linkTo = specs.name, roomSequence = 0, transportTo = entrySide.back } = specs;
        this.transportType = transportType;
        this.linkTo = linkTo;
        this.roomSequence = roomSequence;
        this.transportTo = transportTo;

        // interaction label
        this.labelCanvas = makeInteractiveLabelCanvas({ baseWidth: 15, borderHeight: 15, size: 10, borderSize: 2 });
        this.interactiveLabelTip = new Sprite(createSpriteMaterial(this.labelCanvas.canvas));
        this.interactiveLabelTip.scale.x = this.labelCanvas.clientWidth * LABEL_BASE_SCALE;
        this.interactiveLabelTip.scale.y = this.labelCanvas.clientHeight * LABEL_BASE_SCALE;

        this.group.add(this.interactiveLabelTip);

        this.updateLabelTip();
        this.showLabelTip(false);

    }

    get destinationTowards() {

        switch (this.transportTo) {

            case entrySide.back:

                this.group.getWorldDirection(_v1);
                return _v1.clone().negate();

            default:

                this.group.getWorldDirection(_v1);
                return _v1.clone();

        }

    }

    get destinationPosition() {

        switch (this.transportTo) {

            case entrySide.back:

                // this.group.updateWorldMatrix(true, false);
                // _v1.copy(_standPosition).negate().applyMatrix4(this.group.matrixWorld);
                // return _v1.clone();
                return this.group.localToWorld(_v1.copy(_standPosition).negate().clone());

            default:

                // this.group.updateWorldMatrix(true, false);
                // _v1.copy(_standPosition).applyMatrix4(this.group.matrixWorld);
                // return _v1.clone();
                return this.group.localToWorld(_v1.copy(_standPosition).clone());

        }

    }

    get forbidden() {

        return this._forbidden;

    }

    set forbidden(val) {

        if (this._forbidden === val) return;
        this._forbidden = val;
        this.updateLabelTip();

    }

    getTargetDirection(target) {

        const selfDir = this.group.getWorldDirection(_v1);
        target.getWorldPosition(_v2);
        this.getWorldPosition(_v3);
        _v2.y = 0;
        _v3.y = 0;
        const tarDir = _v2.sub(_v3);
        const angle = selfDir.angleTo(tarDir);

        return MathUtils.radToDeg(angle) <= 90 ? entrySide.front : entrySide.back;

    }

    setTargetPositionOrientation(target) {

        if (this.transportType === entryType.self) {

            const targetDirection = this.getTargetDirection(target);
            this.group.getWorldQuaternion(_q1);

            if (targetDirection === entrySide.front) {

                this.transportTo = entrySide.back;
                _q1.premultiply(_q2.setFromAxisAngle(_up, Math.PI));

            } else {

                this.transportTo = entrySide.front;

            }            

        } else {

            this.doEntryChangedEvents();

            this.group.getWorldQuaternion(_q1);
            if (this.transportTo === entrySide.back) {

                _q1.premultiply(_q2.setFromAxisAngle(_up, Math.PI));

            }

        }

        const targetPos = this.destinationPosition;
        const tarPosY = targetPos.y - this.height / 2 + target.height / 2;
        target.setPosition([targetPos.x, tarPosY, targetPos.z], true);
        target.group.setRotationFromQuaternion(_q1);

    }

    setLableTip(target) {

        const targetDirection = this.getTargetDirection(target);
        const offset = .1;
        if (targetDirection !== this._labelSide) {

            if (targetDirection === entrySide.front) {

                this.interactiveLabelTip.position.z = this.depth / 2 + offset;

            } else {

                this.interactiveLabelTip.position.z = - (this.depth / 2 + offset);

            }

            this._labelSide = targetDirection;
            this.updateLabelTip();

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
        if (this._forbidden) {

            ctx.strokeStyle = hexToRGBA(labelForbidden);

        } else {

            ctx.strokeStyle = hexToRGBA(white);

        }
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

        if (this._pickForbidden) {

            ctx.beginPath();
            ctx.lineWidth = 8;
            ctx.strokeStyle = hexToRGBA(labelForbidden);
            ctx.moveTo(- width * Math.cos(Math.PI / 4) / 2, width * Math.sin(Math.PI / 4) / 2);
            ctx.lineTo(width * Math.cos(Math.PI / 4) / 2, - width * Math.sin(Math.PI / 4) / 2);
            ctx.stroke();

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

    doEntryChangedEvents() {

        for (let i = 0, il = this.onEntryChanged.length; i < il; i++) {

            const event = this.onEntryChanged[i];
            event.call(this);

        }

    }

}

export { EntryBase };