import { BF2 } from "../../basic/colorBase";
import { CollisionBox, Tofu } from "../../Models";
import { createBoundingBox, createBoundingFaces as createBoundingFacesMesh, createTofuPushingOBBBox } from "../../physics/collisionHelper";
import { TOFU_AIM_LAYER } from "../../utils/constants";

class CustomizedCreatureTofu extends Tofu {

    isCustomizedCreatureTofu = true;

    typeMapping;

    collisionBoxes = new Map();
    boundingBoxes = new Map();
    boundingFaces = new Map();

    onBeforeCollisionBoxChanged = [];
    onCollisionBoxChanged = [];
    onBoundingFaceChanged = [];
    onDisposed = [];

    constructor(specs) {

        super(specs);

        const { enableCollision = true, typeMapping = {} } = specs;
        const { createDefaultBoundingObjects = true } = specs;

        this.typeMapping = typeMapping;

        if (enableCollision) {

            this.createCollisionBoxes();
            this.switchCollisionBox(this.typeMapping.idle.nick, false);
            this.showCollisionBox(false);

        }
        
        if (!createDefaultBoundingObjects) {

            this.createBoundingBoxes();
            this.switchBoundingBox(this.typeMapping.idle.nick);

            this.createBoundingFaces();
            this.switchBoundingFace();

            this.createPushingBox();

        }

    }

    trackResources() {

        super.trackResources();

        for (const cbox of this.collisionBoxes.values()) {

            this.track(cbox.group);

            for (let i = 0, il = cbox.walls.length; i < il; i++) {

                const wall = cbox.walls[i];
                this.track(wall.leftArrow);
                this.track(wall.rightArrow);

            }

        }

        for (const bb of this.boundingBoxes.values()) {

            const { boundingBox, boundingBoxWire } = bb;
            this.track(boundingBox);
            this.track(boundingBoxWire);

        }

        for (const bf of this.boundingFaces.values()) {

            const { frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace } = bf;
            this.track(frontBoundingFace);
            this.track(backBoundingFace);
            this.track(leftBoundingFace);
            this.track(rightBoundingFace);

        }

    }

    get currentAction() {

        let action;

        if (this.isForward || this.isRotating) {

            action = this.typeMapping.walk.nick;

        } else if (this._isAttacking) {

            // todo

        } else {

            action = this.typeMapping.idle.nick;

        }

        return action;

    }

    createPushingBox() {

        const { pushingBoxSize } = this.typeMapping;
        const pushingBoxSpecs = {
            height: pushingBoxSize.height, depth: pushingBoxSize.depth, show: false
        }

        const pushBox = createTofuPushingOBBBox(pushingBoxSpecs)
        this.group.add(pushBox);
        this.pushingOBBBoxMesh = pushBox;

    }

    createBoundingBoxes() {

        const { idleBoundingBoxSize, walkBoundingBoxSize } = this.typeMapping;
        const idleBBSpecs = {
            width: idleBoundingBoxSize.width, depth: idleBoundingBoxSize.depth, height: idleBoundingBoxSize.height,
            showBB: false, showBBW: false
        }
        const walkBBSpecs = {
            width: walkBoundingBoxSize.width, depth: walkBoundingBoxSize.depth, height: walkBoundingBoxSize.height,
            showBB: false, showBBW: false
        }

        this.boundingBoxes.clear();
        this.boundingBoxes.set(this.typeMapping.idle.nick, createBoundingBox(idleBBSpecs));
        this.boundingBoxes.set(this.typeMapping.walk.nick, createBoundingBox(walkBBSpecs));

        this.setAllBoundingBoxLayers(true);

    }

    setAllBoundingBoxLayers(enable) {

        for (const bb of this.boundingBoxes.values()) {

            enable ? bb.boundingBox.layers.enable(TOFU_AIM_LAYER) : bb.boundingBox.layers.disable(TOFU_AIM_LAYER);            

        }

    }

    switchBoundingBox(action) {

        if (this.boundingBoxes.size === 0) return;

        const { boundingBox, boundingBoxWire } = this.boundingBoxes.get(action);

        this.group.remove(this.boundingBoxMesh, this.boundingBoxWireMesh);
        this.group.add(boundingBox, boundingBoxWire);
        this.boundingBoxMesh = boundingBox;
        this.boundingBoxWireMesh = boundingBoxWire;

    }

    createBoundingFaces() {

        const { idleBoundingFaceSize, walkBoundingFaceSize, rotateBoundingFaceSize } = this.typeMapping;
        const idleBFSpecs = {
            width: idleBoundingFaceSize.width, depth: idleBoundingFaceSize.depth, height: idleBoundingFaceSize.height,
            bbfThickness: idleBoundingFaceSize.bbfThickness, gap: idleBoundingFaceSize.gap,
            showBF: false
        };
        const walkBFSpecs = {
            width: walkBoundingFaceSize.width, depth: walkBoundingFaceSize.depth, height: walkBoundingFaceSize.height,
            bbfThickness: walkBoundingFaceSize.bbfThickness, gap: walkBoundingFaceSize.gap,
            showBF: false
        };
        const rotateBFSpecs = {
            width: rotateBoundingFaceSize.width, depth: rotateBoundingFaceSize.depth, height: rotateBoundingFaceSize.height,
            bbfThickness: rotateBoundingFaceSize.bbfThickness, gap: rotateBoundingFaceSize.gap,
            showBF: false, color: BF2
        };

        this.boundingFaces.clear();
        this.boundingFaces.set(this.typeMapping.idle.nick, createBoundingFacesMesh(idleBFSpecs));
        this.boundingFaces.set(this.typeMapping.walk.nick, createBoundingFacesMesh(walkBFSpecs));
        this.boundingFaces.set(this.typeMapping.rotate.nick, createBoundingFacesMesh(rotateBFSpecs));

    }

    switchBoundingFace() {

        if (this.boundingFaces.size === 0) return;

        const { idleBoundingFaceSize, walkBoundingFaceSize, rotateBoundingFaceSize } = this.typeMapping;
        let bf;

        if (this.isRotating) {

            bf = this.boundingFaces.get(this.typeMapping.rotate.nick);
            this.w = rotateBoundingFaceSize.width;
            this.d = rotateBoundingFaceSize.depth;

        } else if (this.isForward) {

            bf = this.boundingFaces.get(this.typeMapping.walk.nick);
            this.w = walkBoundingFaceSize.width;
            this.d = walkBoundingFaceSize.depth;

        } else {

            bf = this.boundingFaces.get(this.typeMapping.idle.nick);
            this.w = idleBoundingFaceSize.width;
            this.d = idleBoundingFaceSize.depth;

        }

        const currentFaces = this.boundingFaceMesh;
        for (let i = 0, il = currentFaces.length; i < il; i++) {

            const face = currentFaces[i];
            this.boundingFaceGroup.remove(face);

        }

        const { frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace } = bf;
        this.boundingFaceGroup.add(frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace);
        this.boundingFaceMesh = [frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace];

        this.doBoundingFaceChangedEvents();

    }

    createCollisionBoxes() {

        const { name, idleCollisionSize, walkCollisionSize } = this.typeMapping;
        const idleCBoxSpecs = {
            name: `${this.name}-${name}-idle-cBox`,
            width: idleCollisionSize.width, depth: idleCollisionSize.depth, height: idleCollisionSize.height,
            enableWallOBBs: true, showArrow: false, lines: false,
            ignoreFaces: [4, 5]
        };
        const walkCBoxSpecs = {
            name: `${this.name}-${name}-walk-cBox`,
            width: walkCollisionSize.width, depth: walkCollisionSize.depth, height: walkCollisionSize.height,
            enableWallOBBs: true, showArrow: false, lines: false,
            ignoreFaces: [4, 5]
        };

        this.collisionBoxes.clear();

        const setCBox = (specs, nick) => {

            const box = new CollisionBox(specs);
            this.collisionBoxes.set(nick, box);

            // for SimplyPhysics self-check
            box.father = this;

        }

        setCBox(idleCBoxSpecs, this.typeMapping.idle.nick);
        setCBox(walkCBoxSpecs, this.typeMapping.walk.nick);

    }

    switchCollisionBox(action, forceEvent = true) {

        if (forceEvent) this.doBeforeCollisionBoxChangedEvents();

        const cbox = this.collisionBoxes.get(action);

        this.walls = [];
        this.walls.push(...cbox.walls);

        if (this.collisionBox) {

            this.group.remove(this.collisionBox.group);

        }

        this.group.add(cbox.group);
        this.collisionBox = cbox;

        if (forceEvent) this.doCollisionBoxChangedEvents();

    }

    showBB(show) {

        this._showBB = show;

        for (const bb of this.boundingBoxes.values()) {

            bb.boundingBox.visible = show;
            this.enablePickLayers(bb.boundingBox);

        }

    }

    showBBW(show) {

        this._showBBW = show;

        for (const bb of this.boundingBoxes.values()) {

            bb.boundingBoxWire.visible = show;

        }

    }

    showCollisionBox(show) {

        for (const cbox of this.collisionBoxes.values()) {

            cbox.group.children.forEach(p => p.visible = show);
            this.enablePickLayers(...cbox.group.children);

        }

    }

    showCollisionBoxArrows(show) {

        this._showCBoxArrows = show;

        for (const cbox of this.collisionBoxes.values()) {

            for (let i = 0, il = cbox.walls.length; i < il; i++) {

                const wall = cbox.walls[i];
                wall.leftArrow.visible = show;
                wall.rightArrow.visible = show;

            }

        }

    }

    showBF(show) {

        this._showBF = show;

        for (const bf of this.boundingFaces.values()) {

            const { frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace } = bf;
            frontBoundingFace.visible = show;
            backBoundingFace.visible = show;
            leftBoundingFace.visible = show;
            rightBoundingFace.visible = show;

            this.enablePickLayers(frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace);

        }

    }

    doBeforeCollisionBoxChangedEvents() {

        for (let i = 0, il = this.onBeforeCollisionBoxChanged.length; i < il; i++) {

            const event = this.onBeforeCollisionBoxChanged[i];
            event(this);

        }

    }

    doCollisionBoxChangedEvents() {

        for (let i = 0, il = this.onCollisionBoxChanged.length; i < il; i++) {

            const event = this.onCollisionBoxChanged[i];
            event(this);

        }

    }

    doBoundingFaceChangedEvents() {

        for (let i = 0, il = this.onBoundingFaceChanged.length; i < il; i++) {

            const event = this.onBoundingFaceChanged[i];
            event(this);

        }

    }

    doDisposedEvents() {

        for (let i = 0, il = this.onDisposed.length; i < il; i++) {

            const event = this.onDisposed[i];
            event(this);

        }

    }

    switchHelperComponents(forceEvent = true) {

        const action = this.currentAction;

        this.switchBoundingFace();
        this.switchCollisionBox(action, forceEvent);
        this.switchBoundingBox(action);

    }

    destroy() {

        this.doDisposedEvents();
        this.onBeforeCollisionBoxChanged = [];
        this.onCollisionBoxChanged = [];
        this.onBoundingFaceChanged = [];
        this.onDisposed = [];
        super.destroy();

    }

}

export { CustomizedCreatureTofu };