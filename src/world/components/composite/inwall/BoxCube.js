import { Group } from 'three';
import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane, createOBBBox } from '../../physics/collisionHelper';
import { ObstacleMoveable } from '../../movement/ObstacleMoveable';
import { yankeesBlue, violetBlue, green, basic } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

class BoxCube extends ObstacleMoveable  {

    name = '';
    box;
    frontFace;
    backFace;
    leftFace;
    rightFace;
    topFace;
    bottomFace;

    // move triggers, used for player interaction
    frontTrigger;
    backTrigger;
    leftTrigger;
    rightTrigger;

    walls = [];
    topOBBs = [];
    bottomOBBs = [];
    triggers = [];

    // set to false, will not add to room obstacles, so the physics engine will ignore this cubebox.
    isObstacle = false;
    // set four vetical face to OBBPlane, so it can iteract with other cubebox or player
    enableWallOBBs = false;
    // set this cubebox is climable by player
    climbable = false;
    // set this cubebox can be pushed by player
    movable = false;
    // falling ground
    hittingGround;

    specs;

    constructor(specs) {

        super();

        this.specs = specs;
        const { name, width, depth, height } = specs;
        const { showArrow = false, isObstacle = false, freeTexture = false, enableWallOBBs = false, climbable = false, movable = false } = specs;
        const { map, frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;

        const boxSpecs = { size: { width, depth, height }, color: yankeesBlue, map };

        const frontSpecs = this.makePlaneConfig({ width, height, color: basic, map: frontMap })
        const backSpecs = this.makePlaneConfig({ width, height, color: basic, map: backMap });

        const leftSpecs = this.makePlaneConfig({ width: depth, height, color: basic, map: leftMap });
        const rightSpecs = this.makePlaneConfig({ width: depth, height, color: basic, map: rightMap });

        const topSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: topMap});
        const bottomSpecs = this.makePlaneConfig({ width: width, height: depth, color: yankeesBlue, map: bottomMap });

        this.name = name;
        this.isObstacle = isObstacle;
        this.enableWallOBBs = enableWallOBBs;
        this.climbable = climbable;
        this.movable = movable;
        this.group = new Group();

        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], !freeTexture ? true : false, !freeTexture ? true : false, false);

        const createPlaneFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;

        this.backFace = createPlaneFunction(backSpecs, `${name}_back`, [0, 0, - depth * .5], Math.PI, true, true, showArrow);
        this.rightFace = createPlaneFunction(leftSpecs, `${name}_right`, [- width * .5, 0, 0], - Math.PI * .5, true, true, showArrow);
        this.leftFace = createPlaneFunction(rightSpecs, `${name}_left`, [width * .5, 0, 0], Math.PI * .5, true, true, showArrow);

        {
            this.topFace = createOBBPlane(topSpecs, `${name}_topOBB`, [0, height * .5, 0], [- Math.PI * .5, 0, 0], true, true);
            this.bottomFace = createOBBPlane(bottomSpecs, `${name}_bottomOBB`, [0, - height * .5, 0], [Math.PI * .5, 0, 0], true, true);
            this.topOBBs = [this.topFace];
            this.bottomOBBs = [this.bottomFace];
        }

        // create last for changing line color
        this.frontFace = createPlaneFunction(frontSpecs, `${name}_front`, [0, 0, depth * .5], 0, true, true, showArrow);
        this.frontFace.line.material.color.setHex(green);

        if (movable) {

            const triggerSpecs = { width: .5, height, color: violetBlue };

            this.frontTrigger = createOBBPlane(triggerSpecs, `${name}_front_trigger`, [0, 0, depth * .5], [0, 0, 0], false, false );
            this.backTrigger = createOBBPlane(triggerSpecs, `${name}_back_trigger`, [0, 0, - depth * .5], [0, Math.PI, 0], false, false);
            this.leftTrigger = createOBBPlane(triggerSpecs, `${name}_left_trigger`, [- width * .5, 0, 0], [0, - Math.PI * .5, 0], false, false);
            this.rightTrigger = createOBBPlane(triggerSpecs, `${name}_right_trigger`, [width * .5, 0, 0], [0, Math.PI * .5, 0], false, false);

            this.triggers = [this.frontTrigger, this.backTrigger, this.leftTrigger, this.rightTrigger];

            this.group.add(
                this.frontTrigger.mesh,
                this.backTrigger.mesh,
                this.leftTrigger.mesh,
                this.rightTrigger.mesh
            );

            this.setTriggerVisible(false);

        }

        this.walls = [this.frontFace, this.backFace, this.leftFace, this.rightFace];

        // freeTexture is true to enable 6 different texture maps for each face,
        // the initial box will be hidden
        if (!freeTexture) {

            this.setFaceVisible(false);

        } else {

            this.box.mesh.visible = false;

        }

        this.group.add(
            this.box.mesh,
            this.frontFace.mesh,
            this.backFace.mesh,
            this.leftFace.mesh,
            this.rightFace.mesh,
            this.topFace.mesh,
            this.bottomFace.mesh
        );

    }

    async init() {

        const { freeTexture } = this.specs;
        let initPromises = [];

        if (freeTexture) initPromises = this.initFaces();
        else initPromises.push(this.box.init());

        await Promise.all(initPromises);

    }

    initFaces() {

        const promises = [];

        this.walls.forEach(w => promises.push(w.init()));

        promises.push(this.topFace.init());

        promises.push(this.bottomFace.init());

        return promises;

    }

    setFaceVisible(show) {

        this.walls.forEach(w => w.mesh.visible = show);

        this.topFace.mesh.visible = show;

        this.bottomFace.mesh.visible = show;

    }

    setTriggerVisible(show) {

        this.triggers.forEach(tri => tri.mesh.visible = show);

    }

    makePlaneConfig(specs) {
        
        const { width, height } = specs;
        const { baseSize = height, mapRatio, noRepeat = false } = this.specs;

        if (noRepeat) return specs;

        if (mapRatio) {

            specs.repeatU = width / (mapRatio * baseSize);
            specs.repeatV = height / baseSize;

        }

        specs.repeatModeU = REPEAT;
        specs.repeatModeV = REPEAT;

        return specs;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotationY(y) {

        this.group.rotation.y = y;

        this.walls.forEach(w => w.mesh.rotationY += y);

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

        this.box.updateOBB(needUpdateMatrixWorld);

    }

    tickFall(delta) {

        this.fallingTick({ delta, obstacle: this });

        this.updateOBBs();

    }

    onGround() {

        this.onGroundTick({ floor: this.hittingGround, obstacle: this });
        
        this.updateOBBs();
        
    }
}

export { BoxCube };