import { Logger } from "../../../systems/Logger";
import { BF, BF2 } from "../../basic/colorBase";
import { CollisionBox, Tofu } from "../../Models";
import { createBoundingBox, createBoundingFaces as createBoundingFacesMesh, createTofuPushingOBBBox } from "../../physics/collisionHelper";
import { TOFU_AIM_LAYER, WEAPONS } from "../../utils/constants";

const DEBUG = false;

class CustomizedCombatTofu extends Tofu {

    isCustomizedCombatTofu = true;

    weaponActionMapping = {};
    currentActionType;
    initialWeapon;
    weapons = [];

    collisionBoxMap = new Map();
    boundingFaceMap = new Map();
    boundingBoxMap = new Map();
    pushingBoxMap = new Map();

    onBeforeCollisionBoxChanged = [];
    onCollisionBoxChanged = [];
    onBoundingFaceChanged = [];
    onDisposed = [];

    #logger = new Logger(DEBUG, 'CustomizedCombatTofu');

    constructor(specs) {

        super(specs);

        const { enableCollision = true } = specs;
        const { weaponActionMapping = {}, initialWeapon, weapons = [] } = specs;
        const { createDefaultBoundingObjects = true } = specs;

        this.weaponActionMapping = weaponActionMapping;
        this.initialWeapon = initialWeapon;
        this.weapons = weapons;

        const initialWeaponType = this.initialWeapon.weaponType;
        if (enableCollision) {
            
            this.createCollisionBoxes();
            this.switchCollisionBox(initialWeaponType, this.weaponActionMapping[initialWeaponType].idle.nick, false);
            this.showCollisionBox(false);

        }

        if (!createDefaultBoundingObjects) {

            this.createBoundingFaces();
            this.switchBoundingFace(initialWeaponType);

            this.createBoundingBoxes();
            this.switchBoundingBox(initialWeaponType, this.weaponActionMapping[initialWeaponType].idle.nick);

            this.createPushingBoxes();
            this.switchPushingBox(initialWeaponType);

        }

    }

    trackResources() {

        super.trackResources();

        for (const mapping of this.collisionBoxMap.values()) {

            const cboxes = mapping.values();

            for (const cbox of cboxes) {

                this.track(cbox.group);

                for (let j = 0, jl = cbox.walls.length; j < jl; j++) {

                    const wall = cbox.walls[j];
                    this.track(wall.leftArrow);
                    this.track(wall.rightArrow);

                }

            }

        }

        for (const mapping of this.boundingFaceMap.values()) {

            const bfaces = mapping.values();

            for (const bf of bfaces) {

                const { frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace } = bf;
                this.track(frontBoundingFace);
                this.track(backBoundingFace);
                this.track(leftBoundingFace);
                this.track(rightBoundingFace);

            }

        }

        for (const mapping of this.boundingBoxMap.values()) {

            const bboxes = mapping.values();

            for (const bbox of bboxes) {

                const { boundingBox, boundingBoxWire } = bbox;
                this.track(boundingBox);
                this.track(boundingBoxWire);

            }

        }

        for (const pushingBox of this.pushingBoxMap.values()) {

            this.track(pushingBox);

        }

    }

    get currentAction() {

        let action;

        if (this.attacking && !this.hurting) {

            action = this.currentActionType.aim.nick;

        } else if (this.isForward || this.isBackward || this.isRotating) {

            if (this.isAccelerating && !this.isRotating) {

                action = this.currentActionType.run.nick;

            } else {

                action = this.currentActionType.walk.nick;

            }

        } else {

            action = this.currentActionType.idle.nick;

        }

        return action;

    }

    createPushingBoxes() {

        const weaponTypes = Object.keys(this.weaponActionMapping);

        for (let i = 0, il = weaponTypes.length; i < il; i++) {

            const weaponType = weaponTypes[i];
            const typeMapping = this.weaponActionMapping[weaponType];
            const { ignorePushingBox, pushingBoxSize } = typeMapping;

            if (ignorePushingBox) continue;

            const pushingBoxSpecs = {
                height: pushingBoxSize.height, depth: pushingBoxSize.depth, show: false
            }

            this.pushingBoxMap.set(weaponType, createTofuPushingOBBBox(pushingBoxSpecs));

        }

    }

    switchPushingBox(weaponType) {

        if (this.pushingBoxMap.size === 0) return;

        const pushingBox = this.pushingBoxMap.get(weaponType);

        this.group.remove(this.pushingOBBBoxMesh);
        this.group.add(pushingBox); 
        this.pushingOBBBoxMesh = pushingBox;

    }

    createBoundingBoxes() {

        const weaponTypes = Object.keys(this.weaponActionMapping);
        
        for (let i = 0, il = weaponTypes.length; i < il; i++) {

            const weaponType = weaponTypes[i];
            const typeMapping = this.weaponActionMapping[weaponType];
            const {
                ignoreBoundingBox,
                idleBoundingBoxSize, walkBoundingBoxSize, runBoundingBoxSize, attackBoundingBoxSize
            } = typeMapping;

            if (ignoreBoundingBox) continue;

            const bboxes = new Map();

            const setBBox = (size, nick) => {

                if (!size) return;

                const { width, depth, height } = size;
                const specs = { width, depth, height, showBB: false, showBBW: false };
                bboxes.set(nick, createBoundingBox(specs));

            };

            setBBox(idleBoundingBoxSize, typeMapping.idle.nick);
            setBBox(walkBoundingBoxSize, typeMapping.walk.nick);
            setBBox(runBoundingBoxSize, typeMapping.run.nick);
            setBBox(attackBoundingBoxSize, typeMapping.aim.nick);

            this.boundingBoxMap.set(weaponType, bboxes);

        }

        this.setAllBoundingBoxLayers(true);

    }

    setAllBoundingBoxLayers(enable) {

        for (const mapping of this.boundingBoxMap.values()) {

            const bboxes = mapping.values();

            for (const bb of bboxes) {

                enable ? bb.boundingBox.layers.enable(TOFU_AIM_LAYER) : bb.boundingBox.layers.disable(TOFU_AIM_LAYER);

            }

        }

    }

    switchBoundingBox(weaponType, action) {

        if (this.boundingBoxMap.size === 0) return;

        const { boundingBox, boundingBoxWire } = this.boundingBoxMap.get(weaponType).get(action);

        this.group.remove(this.boundingBoxMesh, this.boundingBoxWireMesh);
        this.group.add(boundingBox, boundingBoxWire);
        this.boundingBoxMesh = boundingBox;
        this.boundingBoxWireMesh = boundingBoxWire;

    }

    createBoundingFaces() {

        const weaponTypes = Object.keys(this.weaponActionMapping);
        
        for (let i = 0, il = weaponTypes.length; i < il; i++) {

            const weaponType = weaponTypes[i];
            const typeMapping = this.weaponActionMapping[weaponType];
            const {
                ignoreBoundingFace,
                idleBoundingFaceSize, walkBoundingFaceSize, runBoundingFaceSize, rotateBoundingFaceSize, attackBoundingFaceSize
            } = typeMapping;

            if (ignoreBoundingFace) continue;

            const boundingFaces = new Map();

            const setBoundingFace = (size, nick, color) => {

                if (!size) return;

                const { width, depth, height, bbfThickness, gap } = size;
                const specs = { width, depth, height, bbfThickness, gap, showBF: false, color: color ?? BF };
                boundingFaces.set(nick, createBoundingFacesMesh(specs));

            };

            setBoundingFace(idleBoundingFaceSize, typeMapping.idle.nick);
            setBoundingFace(walkBoundingFaceSize, typeMapping.walk.nick);
            setBoundingFace(runBoundingFaceSize, typeMapping.run.nick);
            setBoundingFace(rotateBoundingFaceSize, typeMapping.rotate.nick, BF2);
            setBoundingFace(attackBoundingFaceSize, typeMapping.aim.nick);

            this.boundingFaceMap.set(weaponType, boundingFaces);

        }
        
    }

    switchBoundingFace(weaponType) {

        if (this.boundingFaceMap.size === 0) return;

        const typeMapping = this.weaponActionMapping[weaponType];
        const boundingFaces = this.boundingFaceMap.get(weaponType);
        const { idleBoundingFaceSize, walkBoundingFaceSize, runBoundingFaceSize, rotateBoundingFaceSize, attackBoundingFaceSize } = typeMapping;
        let bf;

        if (this.attacking && !this.hurting) {

            bf = boundingFaces.get(typeMapping.aim.nick);
            this.w = attackBoundingFaceSize.width;
            this.d = attackBoundingFaceSize.depth;

        } else if (this.isRotating) {

            bf = boundingFaces.get(typeMapping.rotate.nick);
            this.w = rotateBoundingFaceSize.width;
            this.d = rotateBoundingFaceSize.depth;

        } else if (this.isForward || this.isBackward) {

            if (this.isAccelerating) {

                bf = boundingFaces.get(typeMapping.run.nick);
                this.w = runBoundingFaceSize.width;
                this.d = runBoundingFaceSize.depth;

            } else {

                bf = boundingFaces.get(typeMapping.walk.nick);
                this.w = walkBoundingFaceSize.width;
                this.d = walkBoundingFaceSize.depth;

            }
        } else {

            bf = boundingFaces.get(typeMapping.idle.nick);
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

        const weaponTypes = Object.keys(this.weaponActionMapping);
        
        for (let i = 0, il = weaponTypes.length; i < il; i++) {

            const weaponType = weaponTypes[i];
            const typeMapping = this.weaponActionMapping[weaponType];
            const {
                name, ignoreCollisionBox,
                idleCollisionSize, walkCollisionSize, runCollisionSize, attackCollisionSize
            } = typeMapping;

            if (ignoreCollisionBox) continue;

            const cboxes = new Map();

            const setCBox = (size, nick) => {

                if (!size) return;

                const { width, depth, height } = size;
                const specs = {
                    name: `${this.name}-${name}-${nick}-cBox`,
                    width, depth, height,
                    enableWallOBBs: true, showArrow: false, lines: false,
                    ignoreFaces: [4, 5]
                }
                const box = new CollisionBox(specs);
                cboxes.set(nick, box);

                // for SimplyPhysics self-check
                box.father = this;
                
            }

            setCBox(idleCollisionSize, typeMapping.idle.nick);
            setCBox(walkCollisionSize, typeMapping.walk.nick);
            setCBox(runCollisionSize, typeMapping.run.nick);
            setCBox(attackCollisionSize, typeMapping.aim.nick);

            this.collisionBoxMap.set(weaponType, cboxes);

        }
        
    }

    switchCollisionBox(weaponType, action, forceEvent = true) {

        if (forceEvent) this.doBeforeCollisionBoxChangedEvents();

        const cbox = this.collisionBoxMap.get(weaponType).get(action);

        this.walls = [];
        this.walls.push(...cbox.walls);

        if (this.collisionBox) {

            this.group.remove(this.collisionBox.group);

        }

        this.group.add(cbox.group);
        this.collisionBox = cbox;        

        if (forceEvent) this.doCollisionBoxChangedEvents();

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

    showBB(show) {

        this._showBB = show;

        for (const mapping of this.boundingBoxMap.values()) {

            const bboxes = mapping.values();

            for (const bb of bboxes) {

                bb.boundingBox.visible = show;
                this.enablePickLayers(bb.boundingBox);

            }

        }

    }

    showBBW(show) {

        this._showBBW = show;

        for (const mapping of this.boundingBoxMap.values()) {

            const bboxes = mapping.values();

            for (const bb of bboxes) {

                bb.boundingBoxWire.visible = show;

            }

        }

    }

    showBF(show) {

        this._showBF = show;

        for (const mapping of this.boundingFaceMap.values()) {

            const bfaces = mapping.values();

            for (const bf of bfaces) {

                const { frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace } = bf;
                frontBoundingFace.visible = show;
                backBoundingFace.visible = show;
                leftBoundingFace.visible = show;
                rightBoundingFace.visible = show;

                this.enablePickLayers(frontBoundingFace, backBoundingFace, leftBoundingFace, rightBoundingFace);

            }

        }

    }

    showPushingBox(show) {

        this._showPushingBox = show;

        for (const pushBox of this.pushingBoxMap.values()) {

            pushBox.visible = show;
            this.enablePickLayers(pushBox);

        }

    }

    showCollisionBox(show) {

        for (const mapping of this.collisionBoxMap.values()) {

            const cboxes = mapping.values();

            for (const cbox of cboxes) {

                cbox.group.children.forEach(p => p.visible = show);
                this.enablePickLayers(...cbox.group.children);

            }

        }

    }

    showCollisionBoxArrows(show) {

        this._showCBoxArrows = show;

        for (const mapping of this.collisionBoxMap.values()) {

            const cboxes = mapping.values();

            for (const cbox of cboxes) {

                for (let i = 0, il = cbox.walls.length; i < il; i++) {

                    const wall = cbox.walls[i];
                    wall.leftArrow.visible = show;
                    wall.rightArrow.visible = show;

                }

            }

        }

    }

    switchHelperComponents(forceEvent = true) {

        this.#logger.func = 'switchHelperComponents';

        const action = this.currentAction;
        const weaponType = this.armedWeapon ? this.armedWeapon.weaponType : WEAPONS.NONE;

        this.switchCollisionBox(weaponType, action, forceEvent);
        this.switchBoundingBox(weaponType, action);
        this.switchPushingBox(weaponType);
        this.switchBoundingFace(weaponType);

        this.#logger.log(
            `current collision box map:`, this.collisionBoxMap.get(weaponType),
            `current collision box: ${this.collisionBox.group.uuid}`,
            `current walls:`, this.walls,
            `current boudning faces map:`, this.boundingFaceMap.get(weaponType),
            `current bounding faces`, this.boundingFaceMesh,
            `current bounding box map:`, this.boundingBoxMap.get(weaponType),
            `current bounding box: ${this.boundingBoxMesh.uuid}`,
            `current bounding box wire: ${this.boundingBoxWireMesh.uuid}`,
            `current pushing box map:`, this.pushingBoxMap.get(weaponType),
            `current pushing box: ${this.pushingOBBBoxMesh.uuid}`,
            `current action: ${action}`
        );

    }

    doDisposedEvents() {

        for (let i = 0, il = this.onDisposed.length; i < il; i++) {

            const event = this.onDisposed[i];
            event(this);

        }

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

export { CustomizedCombatTofu };