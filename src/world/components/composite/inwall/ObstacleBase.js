import { Group, MathUtils, Vector3, Layers, Raycaster, ArrowHelper } from 'three';
import { createOBBBox, createOBBPlane } from '../../physics/collisionHelper';
import { ObstacleMoveable } from '../../movement/ObstacleMoveable';
import { violetBlue, orange, BF } from '../../basic/colorBase';
import { CAMERA_RAY_LAYER, PLAYER_CAMERA_RAY_LAYER, OBSTACLE_RAY_LAYER, FRONT_TRIGGER_LAYER, BACK_TRIGGER_LAYER, LEFT_TRIGGER_LAYER, RIGHT_TRIGGER_LAYER, FRONT_FACE_LAYER, BACK_FACE_LAYER, LEFT_FACE_LAYER, RIGHT_FACE_LAYER } from '../../utils/constants';
import { getVisibleMeshes } from '../../utils/objectHelper';

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

class ObstacleBase extends ObstacleMoveable {

    name = '';
    box;
    group;

    #w;
    #h;
    #d;
    #rayPadding = .2;
    hasRays = false;

    walls = [];
    topOBBs = [];
    bottomOBBs = [];
    triggers = [];
    boundingFaces = [];

    cObjects = [];

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

    pushable = false;
    draggable = false;

    density = .5;
    #volume = undefined;
    #weight = undefined;

    specs;

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

        if (!this.#w) {

            this.#w = this.box.width;

        }

        return this.#w;

    }

    get height() {

        if (!this.#h) {

            this.#h = this.box.height;

        }

        return this.#h;

    }

    get depth() {

        if (!this.#d) {

            this.#d = this.box.depth;

        }

        return this.#d;

    }

    get volume() {

        if (!this.#volume) {

            this.#volume = this.width * this.height * this.depth;

        }

        return this.#volume;

    }

    get weight() {

        if (!this.#weight) {

            this.#weight = this.volume * this.density;

        }

        return this.#weight;

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

    getWalls() {

        let walls = [];

        this.cObjects.forEach(obj => walls = walls.concat(obj.walls));

        return walls;

    }

    getTopOBBs() {

        let tops = [];

        this.cObjects.forEach(obj => tops = tops.concat(obj.topOBBs));

        return tops;

    }

    getBottomOBBs() {

        let bottoms = [];

        this.cObjects.forEach(obj => bottoms = bottoms.concat(obj.bottomOBBs));

        return bottoms;
    }

    addCObjects() {

        this.cObjects.forEach(obj => {

            this.group.add(obj.group);

        });

        return this;

    }

    setPickLayers() {

        const meshes = getVisibleMeshes(this.group);

        meshes.forEach(m => {

            m.layers.enable(CAMERA_RAY_LAYER);
            m.layers.enable(PLAYER_CAMERA_RAY_LAYER);

        });

    }

    setCObjectsVisible(show) {

        this.cObjects.forEach(obj => obj.setVisible(show));

        return this;

    }

    setTriggers() {

        const { name, movable = false, pushable = false, draggable = false } = this.specs;

        if (movable && (pushable || draggable)) {

            const triggerSpecs = { width: this.width * .6, height: this.height * .85, color: violetBlue };

            const frontTrigger = createOBBPlane(triggerSpecs, `${name}_front_trigger`, [0, 0, this.depth * .5], [0, 0, 0], false, false );
            const backTrigger = createOBBPlane(triggerSpecs, `${name}_back_trigger`, [0, 0, - this.depth * .5], [0, Math.PI, 0], false, false);
            const leftTrigger = createOBBPlane(triggerSpecs, `${name}_left_trigger`, [this.width * .5, 0, 0], [0, Math.PI * .5, 0], false, false);
            const rightTrigger = createOBBPlane(triggerSpecs, `${name}_right_trigger`, [- this.width * .5, 0, 0], [0, - Math.PI * .5, 0], false, false);

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

        this.walls.forEach(w => w.mesh.rotationY = w.mesh.rotationY - preGroupRotY + y);

        return this;

    }

    get rotationYDegree() {

        return MathUtils.radToDeg(this.rotationY);

    }

    set rotationYDegree(value) {

        this.setRotationY(MathUtils.degToRad(value));

    }

    setPlaneVisible(show) {

        this.walls.forEach(w => w.mesh.visible = show);

        this.topOBBs.forEach(t => t.mesh.visible = show);

        this.bottomOBBs.forEach(b => b.mesh.visible = show);

    }

    setTriggerVisible(show) {

        this.triggers.forEach(tri => tri.mesh.visible = show);

    }

    setBoundingFaceVisible(show) {

        this.boundingFaces.forEach(bf => bf.mesh.visible = show);

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

        const bbfThickness = .1;
        const gap = .1;
        const BBFDepthOffset = this.depth / 2 - bbfThickness / 2;
        const BBFWidthOffset = this.width / 2 - bbfThickness / 2;
        const FBFaceSpecs = { size: { width: this.width - gap, depth: bbfThickness, height: this.height }, color: BF };
        const LRFaceSpecs = { size: { width: this.depth - gap, depth: bbfThickness, height: this.height }, color: BF };

        const frontFace = createOBBBox(FBFaceSpecs, `${name}_front_face`, [0, 0, BBFDepthOffset], [0, 0, 0], false, false);
        const backFace = createOBBBox(FBFaceSpecs, `${name}_back_face`, [0, 0, - BBFDepthOffset], [0, 0, 0], false, false);
        const leftFace = createOBBBox(LRFaceSpecs, `${name}_left_face`, [BBFWidthOffset, 0, 0], [0, Math.PI * .5, 0], false, false);
        const rightFace = createOBBBox(LRFaceSpecs, `${name}_right_face`, [- BBFWidthOffset, 0, 0], [0, Math.PI * .5, 0], false, false);

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

    createRay() {

        const { movable } = this.specs;

        if (!movable) return;

        this.hasRays = true;
 
        const length = this.height;
        const dir = new Vector3(0, - 1, 0);
        const posY = this.height * .5;
        const posX = this.width * .5 - this.#rayPadding;
        const posZ = this.depth * .5 - this.#rayPadding;
        const headLength = .5;
        const headWidth = .1;
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        this.leftRay = new Raycaster(fromVec3, dir, 0, length);
        this.leftRay.layers.set(OBSTACLE_RAY_LAYER);
        this.leftArrow = new ArrowHelper(dir, fromVec3, length, orange, headLength, headWidth);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        this.rightRay = new Raycaster(fromVec3, dir, 0, length);
        this.rightRay.layers.set(OBSTACLE_RAY_LAYER);
        this.rightArrow = new ArrowHelper(dir, fromVec3, length, orange, headLength, headWidth);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        this.backLeftRay = new Raycaster(fromVec3, dir, 0, length);
        this.backLeftRay.layers.set(OBSTACLE_RAY_LAYER);
        this.backLeftArrow = new ArrowHelper(dir, fromVec3, length, orange, headLength, headWidth);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        this.backRightRay = new Raycaster(fromVec3, dir, 0, length);
        this.backRightRay.layers.set(OBSTACLE_RAY_LAYER);
        this.backRightArrow = new ArrowHelper(dir, fromVec3, length, orange, headLength, headWidth);

        return this;
    }

    updateRay(needUpdateMatrixWorld = true) {

        if (!this.hasRays) return;

        if (needUpdateMatrixWorld) {

            this.group.updateWorldMatrix(true, true);

        }

        const posY = this.height * .5;
        const posX = this.width * .5 - this.#rayPadding;
        const posZ = this.depth * .5 - this.#rayPadding;
        const dir = new Vector3(0, - 1, 0);
        let fromVec3;

        // left
        fromVec3 = new Vector3(posX, posY, posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.leftRay.set(fromVec3, dir);
        this.leftArrow.position.copy(fromVec3);
        this.leftArrow.setDirection(dir);

        // right
        fromVec3 = new Vector3(- posX, posY, posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.rightRay.set(fromVec3, dir);
        this.rightArrow.position.copy(fromVec3);
        this.rightArrow.setDirection(dir);

        // backLeft
        fromVec3 = new Vector3(posX, posY, - posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.backLeftRay.set(fromVec3, dir);
        this.backLeftArrow.position.copy(fromVec3);
        this.backLeftArrow.setDirection(dir);

        // backRight
        fromVec3 = new Vector3(- posX, posY, - posZ);
        fromVec3.applyMatrix4(this.group.matrixWorld);
        this.backRightRay.set(fromVec3, dir);
        this.backRightArrow.position.copy(fromVec3);
        this.backRightArrow.setDirection(dir);

        return this;

    }

    updateOBBs(needUpdateMatrixWorld = true, needUpdateWalls = true, needUpdateTopBottom = true) {

        if (needUpdateWalls) {

            this.walls.forEach(w => {

                w.updateRay();

                if (w.isOBB) {

                    w.updateOBB(needUpdateMatrixWorld);

                }

            });
        }

        if (needUpdateTopBottom) {

            this.topOBBs.concat(this.bottomOBBs).forEach(obb => obb.updateOBB(needUpdateMatrixWorld));

        }

        this.triggers.forEach(tri => tri.updateOBB(needUpdateMatrixWorld));

        this.box?.updateOBB(needUpdateMatrixWorld);

        this.boundingFaces.forEach(bf => bf.updateOBB(needUpdateMatrixWorld));

    }

    tickFall(delta) {

        this.fallingTick({ delta, obstacle: this });

        this.updateOBBs();
        this.updateRay();

    }

    onGround() {

        this.onGroundTick({ floor: this.hittingGround, obstacle: this });
        
        this.updateOBBs();
        this.updateRay();
        
    }

    onSlope() {

        this.onSlopeTick({ slope: this.hittingGround, obstacle: this });

        this.updateOBBs();
        this.updateRay();

    }

    tickMoving(delta) {

        const velocity = this.frictionCoefficient / this.weight;
        const dist = velocity * delta;

        this.movingTick({ dist, obstacle: this });

        this.updateOBBs();
        this.updateRay();

    }

}

export { ObstacleBase };