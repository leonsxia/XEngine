import { Group, MathUtils, Vector3, Layers, Raycaster, ArrowHelper } from 'three';
import { createOBBBox, createOBBPlane } from '../../physics/collisionHelper';
import { ObstacleMoveable } from '../../movement/ObstacleMoveable';
import { violetBlue, BF, red } from '../../basic/colorBase';
import { CAMERA_RAY_LAYER, PLAYER_CAMERA_RAY_LAYER, OBSTACLE_RAY_LAYER, FRONT_TRIGGER_LAYER, BACK_TRIGGER_LAYER, LEFT_TRIGGER_LAYER, RIGHT_TRIGGER_LAYER, FRONT_FACE_LAYER, BACK_FACE_LAYER, LEFT_FACE_LAYER, RIGHT_FACE_LAYER, HEX_CYLINDER_PILLAR } from '../../utils/constants';
import { getVisibleMeshes } from '../../utils/objectHelper';
import { Logger } from '../../../systems/Logger';
import { BasicObject } from '../../basic/BasicObject';

const frontTriggerLayer = new Layers();
const backTriggerLayer = new Layers();
const leftTriggerLayer = new Layers();
const rightTriggerLayer = new Layers();

frontTriggerLayer.set(FRONT_TRIGGER_LAYER);
backTriggerLayer.set(BACK_TRIGGER_LAYER);
leftTriggerLayer.set(LEFT_TRIGGER_LAYER);
rightTriggerLayer.set(RIGHT_TRIGGER_LAYER);

const frontFaceLayer = new Layers();
const backFaceLayer = new Layers();
const leftFaceLayer = new Layers();
const rightFaceLayer = new Layers();

frontFaceLayer.set(FRONT_FACE_LAYER);
backFaceLayer.set(BACK_FACE_LAYER);
leftFaceLayer.set(LEFT_FACE_LAYER);
rightFaceLayer.set(RIGHT_FACE_LAYER);

const HEAD_LENGTH = .3;
const HEAD_WIDTH = .08;

const DEBUG = false;

class ObstacleBase extends ObstacleMoveable {

    isObstacleBase = true;

    name = '';
    box;
    group;
    gltf;

    _scale = [1, 1, 1];

    #bbfThickness = .1;
    #gap = .1;
    #triWidthPercentage = .6;
    #triHeightPercentage = .85;
    #rayPadding = .2;
    hasRays = false;

    walls = [];
    topOBBs = [];
    bottomOBBs = [];
    triggers = [];
    boundingFaces = [];

    cObjects = [];
    
    _frontTrigger;
    _backTrigger;
    _leftTrigger;
    _rightTrigger;

    _frontBF;
    _backBF;
    _leftBF;
    _rightBF;

    // set to false, will not add to room obstacles, so the physics engine will ignore this object.
    isObstacle = false;
    // set four vetical face to OBBPlane, so it can iteract with other object or player
    enableWallOBBs = false;
    // set this obstacle is climable by player
    climbable = false;
    // set this obstacle can be pushed by player
    movable = false;
    // falling ground
    hittingGround;
    // falling water
    hittingWater;

    pushable = false;
    draggable = false;

    density = .5;

    specs;

    #logger = new Logger(DEBUG, 'ObstacleBase')

    constructor(specs) {

        super();
        
        this.specs = specs;

        const { name, density = .5 } = specs;
        const { isObstacle = false, enableWallOBBs = false, climbable = false, movable = false, pushable = false, draggable = false } = specs;

        this.name = name;
        this.isObstacle = isObstacle;
        this.enableWallOBBs = enableWallOBBs;
        this.climbable = climbable;
        this.movable = movable;
        this.pushable = pushable;
        this.draggable = draggable;
        this.group = new Group();
        this.group.name = name;
        this.group.isInwallObject = true;
        this.group.father = this;

        this.rotationY = 0;     // local rotation y

        this.density = density;

    }

    get position() {

        return this.group.position;

    }

    get width() {

        return this.box.width;

    }

    get height() {

        return this.box.height;

    }

    get depth() {

        return this.box.depth;

    }

    get volume() {

        return this.width * this.height * this.depth;

    }

    get weight() {

        return this.volume * this.density;

    }

    get worldPosition() {

        const pos = new Vector3();

        this.group.getWorldPosition(pos);

        return pos;

    }

    get bottomY() {

        const target = new Vector3();

        this.group.getWorldPosition(target);

        return target.y - this.height * .5;

    }

    get topY() {

        const target = new Vector3();

        this.group.getWorldPosition(target);

        return target.y + this.height * .5;

    }

    get rays() {
        
        return [this.leftRay, this.rightRay, this.backLeftRay, this.backRightRay];

    }

    get scaleX() {

        return this._scale[0];

    }

    set scaleX(x) {

        this._scale[0] = x;

        this.update();

    }

    get scaleY() {

        return this._scale[1];

    }

    set scaleY(y) {

        this._scale[1] = y;

        this.update();

    }

    get scaleZ() {

        return this._scale[2];

    }

    set scaleZ(z) {

        this._scale[2] = z;

        this.update();

    }

    get scale() {

        return this._scale;

    }

    set scale(val) {

        this._scale = val;

        this.update();

    }

    // this should be inherited and implemented by child class
    update() { }

    getWalls() {

        let walls = [];

        this.cObjects.forEach(obj => walls.push(...obj.walls));

        return walls;

    }

    getTopOBBs() {

        let tops = [];

        this.cObjects.forEach(obj => tops.push(...obj.topOBBs));

        return tops;

    }

    getBottomOBBs() {

        let bottoms = [];

        this.cObjects.forEach(obj => bottoms.push(...obj.bottomOBBs));

        return bottoms;
    }

    addCObjects() {

        this.cObjects.forEach(obj => {

            this.group.add(obj.group);
            obj.father = this;

        });

        return this;

    }

    bindCObjectEvents(obj) {

        const listener = (event) => {

            this.#logger.func = 'bindCObjectEvents';
            this.#logger.log(`${obj.name}: ${event.message}`);
            obj.setLayers(CAMERA_RAY_LAYER);
            obj.setLayers(PLAYER_CAMERA_RAY_LAYER);

        }
        const type = 'visibleChanged';

        if (!obj.hasEventListener(type, listener)) {

            obj.addEventListener(type, listener);

        }
        
    }

    bindBasicObjectEvents(obj) {
        
        const listener = (event) => {

            this.#logger.func = 'bindBasicObjectEvents';
            this.#logger.log(`${obj.name}: ${event.message}`);
            obj.setLayers(CAMERA_RAY_LAYER);
            obj.setLayers(PLAYER_CAMERA_RAY_LAYER);

        }
        const type = 'visibleChanged';

        if (!obj.hasEventListener(type, listener)) {

            obj.addEventListener(type, listener);

        }

    }

    bindGLTFEvents() {

        if (!this.gltf) return;        

        const type = 'visibleChanged';
        const listener = (event) => {

            this.#logger.func = 'bindGLTFEvents';
            this.#logger.log(`${this.gltf.name}: ${event.message}`);
            this.gltf.setLayers(CAMERA_RAY_LAYER);
            this.gltf.setLayers(PLAYER_CAMERA_RAY_LAYER);

        };

        if (!this.gltf.hasEventListener(type, listener)) {

            this.gltf.addEventListener(type, listener);

        }

        this.gltf.visible = true;

    }

    setPickLayers() {

        const meshes = getVisibleMeshes(this.group).filter(m => m.father instanceof BasicObject);

        for (let i = 0, il = meshes.length; i < il; i++) {

            const m = meshes[i];

            this.bindBasicObjectEvents(m.father);

            m.father.visible = true;

        }

        this.bindGLTFEvents();

    }

    setCObjectsVisible(show) {

        this.cObjects.forEach(obj => {
            
            this.bindCObjectEvents(obj);

            obj.setVisible(show);
        
        });

        return this;

    }

    setTriggers() {

        const { name, movable = false, pushable = false, draggable = false } = this.specs;

        if (movable && (pushable || draggable)) {

            const width = this.box.geometry.parameters.width;
            const height = this.box.geometry.parameters.height;
            const depth = this.box.geometry.parameters.depth;

            const triggerSpecs = { width: width * this.#triWidthPercentage, height: height * this.#triHeightPercentage, color: violetBlue };

            const frontTrigger = this._frontTrigger = createOBBPlane(triggerSpecs, `${name}_front_trigger`, [0, 0, depth * .5], [0, 0, 0], false, false );
            const backTrigger = this._backTrigger = createOBBPlane(triggerSpecs, `${name}_back_trigger`, [0, 0, - depth * .5], [0, Math.PI, 0], false, false);
            const leftTrigger = this._leftTrigger = createOBBPlane(triggerSpecs, `${name}_left_trigger`, [width * .5, 0, 0], [0, Math.PI * .5, 0], false, false);
            const rightTrigger = this._rightTrigger = createOBBPlane(triggerSpecs, `${name}_right_trigger`, [- width * .5, 0, 0], [0, - Math.PI * .5, 0], false, false);

            frontTrigger.setLayer(FRONT_TRIGGER_LAYER);
            backTrigger.setLayer(BACK_TRIGGER_LAYER);
            leftTrigger.setLayer(LEFT_TRIGGER_LAYER);
            rightTrigger.setLayer(RIGHT_TRIGGER_LAYER);

            this.triggers = [frontTrigger, backTrigger, leftTrigger, rightTrigger];

            this.group.add(
                frontTrigger.mesh,
                backTrigger.mesh,
                leftTrigger.mesh,
                rightTrigger.mesh
            );

            this.setTriggerVisible(false);

        }

    }

    updateTriggers() {

        const { movable = false, pushable = false, draggable = false } = this.specs;

        if (!movable || !(pushable || draggable)) return;

        const ZOffset = this.depth / 2;
        const XOffset = this.width / 2;

        this._frontTrigger.setScale([this.scale[0], this.scale[1], 1]).setPosition([0, 0, ZOffset]);
        this._backTrigger.setScale([this.scale[0], this.scale[1], 1]).setPosition([0, 0, - ZOffset]);
        this._leftTrigger.setScale([this.scale[2], this.scale[1], 1]).setPosition([XOffset, 0, 0]);
        this._rightTrigger.setScale([this.scale[2], this.scale[1], 1]).setPosition([- XOffset, 0, 0]);
        
    }

    testFrontTrigger(trigger) {

        if (frontTriggerLayer.test(trigger.layers)) {

            return true;

        }

        return false;

    }

    testBackTrigger(trigger) {

        if (backTriggerLayer.test(trigger.layers)) {

            return true;
            
        }

        return false;

    }

    testLeftTrigger(trigger) {

        if (leftTriggerLayer.test(trigger.layers)) {

            return true;

        }

        return false;

    }

    testRightTrigger(trigger) {

        if (rightTriggerLayer.test(trigger.layers)) {

            return true;

        }

        return false;

    }

    testFrontFace(face) {

        if (frontFaceLayer.test(face.layers)) {

            return true;

        }

        return false;

    }

    testBackFace(face) {

        if (backFaceLayer.test(face.layers)) {

            return true;
            
        }

        return false;

    }

    testLeftFace(face) {

        if (leftFaceLayer.test(face.layers)) {

            return true;

        }

        return false;

    }

    testRightFace(face) {

        if (rightFaceLayer.test(face.layers)) {

            return true;

        }

        return false;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotation(rot) {

        this.group.rotation.set(...rot);

        return this;

    }

    setRotationY(y) {

        const preGroupRotY = this.rotationY;

        this.group.rotation.y = y;
        this.rotationY = y;

        for (let i = 0, il = this.walls.length; i < il; i++) {

            const w = this.walls[i];

            w.mesh.rotationY = w.mesh.rotationY - preGroupRotY + y;
            
        }

        return this;

    }

    get rotationYDegree() {

        return MathUtils.radToDeg(this.rotationY);

    }

    set rotationYDegree(value) {

        this.setRotationY(MathUtils.degToRad(value));

    }

    setPlaneVisible(show) {

        this.walls.forEach(w => w.visible = show);

        this.topOBBs.forEach(t => t.visible = show);

        this.bottomOBBs.forEach(b => b.visible = show);

    }

    setTriggerVisible(show) {

        this.triggers.forEach(tri => tri.visible = show);

    }

    setBoundingFaceVisible(show) {

        this.boundingFaces.forEach(bf => bf.visible = show);

    }

    makePlaneConfig(specs) {
        
        const { height } = specs;
        const { baseSize = height, mapRatio, lines = true } = this.specs;

        specs.lines = lines;
        specs.mapRatio = mapRatio;
        specs.baseSize = baseSize;
        specs.transparent = true;

        return specs;

    }

    showArrows(show) {

        if (this.hasRays) {

            this.leftArrow.visible = show;
            this.rightArrow.visible = show;
            this.backLeftArrow.visible = show;
            this.backRightArrow.visible = show;

        }

    }

    createBoundingFaces() {

        const { name, movable } = this.specs;

        if (!movable) return;

        const width = this.box.geometry.parameters.width;
        const height = this.box.geometry.parameters.height;
        const depth = this.box.geometry.parameters.depth;
        const BBFDepthOffset = depth / 2 - this.#bbfThickness / 2;
        const BBFWidthOffset = width / 2 - this.#bbfThickness / 2;
        const FBFaceSpecs = { size: { width: width - this.#gap, depth: this.#bbfThickness, height }, color: BF };
        const LRFaceSpecs = { size: { width: depth - this.#gap, depth: this.#bbfThickness, height }, color: BF };

        const frontFace = this._frontBF = createOBBBox(FBFaceSpecs, `${name}_front_face`, [0, 0, BBFDepthOffset], [0, 0, 0], false, false);
        const backFace = this._backBF = createOBBBox(FBFaceSpecs, `${name}_back_face`, [0, 0, - BBFDepthOffset], [0, 0, 0], false, false);
        const leftFace = this._leftBF = createOBBBox(LRFaceSpecs, `${name}_left_face`, [BBFWidthOffset, 0, 0], [0, Math.PI * .5, 0], false, false);
        const rightFace = this._rightBF = createOBBBox(LRFaceSpecs, `${name}_right_face`, [- BBFWidthOffset, 0, 0], [0, Math.PI * .5, 0], false, false);        

        frontFace.setLayer(FRONT_FACE_LAYER);
        backFace.setLayer(BACK_FACE_LAYER);
        leftFace.setLayer(LEFT_FACE_LAYER);
        rightFace.setLayer(RIGHT_FACE_LAYER);

        this.boundingFaces = [frontFace, backFace, leftFace, rightFace];

        this.group.add(
            frontFace.mesh,
            backFace.mesh,
            leftFace.mesh,
            rightFace.mesh
        );

        this.setBoundingFaceVisible(false);

    }

    updateBoundFaces() {

        const { movable } = this.specs;

        if (!movable) return;

        const width = this.box.geometry.parameters.width;
        const depth = this.box.geometry.parameters.depth;

        const BBFDepthOffset = this.depth / 2 - this.#bbfThickness / 2;
        const BBFWidthOffset = this.width / 2 - this.#bbfThickness / 2;

        const scaleX = (this.width - this.#gap) / (width - this.#gap);
        const scaleY = this.scale[1];
        const scaleZ = (this.depth - this.#gap) / (depth - this.#gap);

        this._frontBF.setScale([scaleX, scaleY, 1]).setPosition([0, 0, BBFDepthOffset]);
        this._backBF.setScale([scaleX, scaleY, 1]).setPosition([0, 0, - BBFDepthOffset]);
        this._leftBF.setScale([scaleZ, scaleY, 1]).setPosition([BBFWidthOffset, 0, 0]);
        this._rightBF.setScale([scaleZ, scaleY, 1]).setPosition([- BBFWidthOffset, 0, 0]);

    }

    createRay() {

        const { movable } = this.specs;

        if (!movable) return;

        this.hasRays = true;
 
        const length = this.box.geometry.parameters.height;
        const dir = new Vector3(0, - 1, 0);
        const posY = this.box.geometry.parameters.height * .5;
        const posX = this.box.geometry.parameters.width * .5 - this.#rayPadding;
        const posZ = this.box.geometry.parameters.depth * .5 - this.#rayPadding;
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        this.leftRay = new Raycaster(fromVec3, dir, 0, length);
        this.leftRay.layers.set(OBSTACLE_RAY_LAYER);
        this.leftArrow = new ArrowHelper(dir, fromVec3, length, red, HEAD_LENGTH, HEAD_WIDTH);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        this.rightRay = new Raycaster(fromVec3, dir, 0, length);
        this.rightRay.layers.set(OBSTACLE_RAY_LAYER);
        this.rightArrow = new ArrowHelper(dir, fromVec3, length, red, HEAD_LENGTH, HEAD_WIDTH);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        this.backLeftRay = new Raycaster(fromVec3, dir, 0, length);
        this.backLeftRay.layers.set(OBSTACLE_RAY_LAYER);
        this.backLeftArrow = new ArrowHelper(dir, fromVec3, length, red, HEAD_LENGTH, HEAD_WIDTH);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        this.backRightRay = new Raycaster(fromVec3, dir, 0, length);
        this.backRightRay.layers.set(OBSTACLE_RAY_LAYER);
        this.backRightArrow = new ArrowHelper(dir, fromVec3, length, red, HEAD_LENGTH, HEAD_WIDTH);

        return this;
    }

    updateRay(needUpdateMatrixWorld = true) {

        if (!this.hasRays) return;

        if (needUpdateMatrixWorld) {

            this.group.updateWorldMatrix(true, true);

        }

        const length = this.height;
        const posY = this.height * .5;
        const posX = this.width * .5 - this.#rayPadding;
        const posZ = this.depth * .5 - this.#rayPadding;
        const dir = new Vector3(0, - 1, 0);
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.leftRay.set(fromVec3, dir);
        this.leftRay.far = length;

        this.leftArrow.position.copy(fromVec3);
        this.leftArrow.setDirection(dir);
        this.leftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.rightRay.set(fromVec3, dir);
        this.rightRay.far = length;

        this.rightArrow.position.copy(fromVec3);
        this.rightArrow.setDirection(dir);
        this.rightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.backLeftRay.set(fromVec3, dir);
        this.backLeftRay.far = length;

        this.backLeftArrow.position.copy(fromVec3);
        this.backLeftArrow.setDirection(dir);
        this.backLeftArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.backRightRay.set(fromVec3, dir);
        this.backRightRay.far = length;

        this.backRightArrow.position.copy(fromVec3);
        this.backRightArrow.setDirection(dir);
        this.backRightArrow.setLength(length, HEAD_LENGTH, HEAD_WIDTH);

        return this;

    }

    updateOBBs(needUpdateMatrixWorld = true, needUpdateWalls = true, needUpdateTopBottom = true) {

        if (needUpdateWalls) {

            for (let i = 0, il = this.walls.length; i < il; i++) {
            
                const w = this.walls[i];

                w.updateRay(needUpdateMatrixWorld);

                if (w.isOBB) {

                    w.updateOBB(false);

                }

            }
        }

        if (needUpdateTopBottom) {

            const topBottoms = this.topOBBs.concat(this.bottomOBBs);

            for (let i = 0, il = topBottoms.length; i < il; i++) {

                const obb = topBottoms[i];

                obb.updateOBB(needUpdateMatrixWorld);

            }

        }

        for (let i = 0, il = this.triggers.length; i < il; i++) {

            const tri = this.triggers[i];

            tri.updateOBB(needUpdateMatrixWorld);

        }

        this.box?.updateOBB(needUpdateMatrixWorld);

        for (let i = 0, il = this.boundingFaces.length; i < il; i++) {

            const bf = this.boundingFaces[i];

            bf.updateOBB(needUpdateMatrixWorld);

        }

    }

    get obbPlanes() {

        return this.walls.filter(w => w.isOBB).concat(...this.topOBBs, ...this.bottomOBBs);

    }

    intersectsOBB(obb) {

        let result = false;

        for (let i = 0; i < this.obbPlanes.length; i++) {

            const plane = this.obbPlanes[i];

            if (plane.obb.intersectsOBB(obb)) {

                result = true;
                break;

            }

        }

        return result;

        // return this.box.obb.intersectsOBB(obb);

    }

    intersects(plane) {

        let result = false;

        if (plane.isOBB) {

            result = this.intersectsOBB(plane.obb);

        }

        // if (!result) {
            
        //     if (plane.father?.father?.isObstacleBase || plane.father?.father?.father?.isObstacleBase) {

        //         const father = plane.father.father.isObstacleBase ? plane.father.father : plane.father.father.father;

        //         for (let i = 0; i < this.bottomOBBs.length; i++) {

        //             const thisPlane = this.bottomOBBs[i];

        //             if (father.intersectsOBB(thisPlane.obb)) {

        //                 result = true;
        //                 break;

        //             }

        //         }

        //     }

        // }

        return result;

    }

    setModelVisible(show) {

        if (this.gltf) {

            this.gltf.visible = show;

        } else if (this.constructor.name === HEX_CYLINDER_PILLAR) {

            this.cylinder.visible = show;
            
        }

    }

    tickFall(delta) {

        this.fallingTick({ delta, obstacle: this });

        this.updateOBBs();
        this.updateRay(false);

    }

    onGround() {

        this.onGroundTick({ floor: this.hittingGround, obstacle: this });
        
        this.updateOBBs();
        this.updateRay(false);
        
    }

    onSlope() {

        this.onSlopeTick({ slope: this.hittingGround, obstacle: this });

        this.updateOBBs();
        this.updateRay(false);

    }

    onWater() {

        this.onWaterTick({ waterCube: this.hittingWater, obstacle: this });

        this.updateOBBs();
        this.updateRay(false);

    }

    tickMoving(delta) {

        const velocity = this.frictionCoefficient / this.weight;
        const dist = velocity * delta;

        this.movingTick({ dist, obstacle: this });

        this.updateOBBs();
        this.updateRay(false);

    }

}

export { ObstacleBase };