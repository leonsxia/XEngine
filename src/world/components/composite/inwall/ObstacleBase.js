import { Group } from 'three';
import { createOBBPlane } from '../../physics/collisionHelper';
import { ObstacleMoveable } from '../../movement/ObstacleMoveable';
import { violetBlue } from '../../basic/colorBase';
import { REPEAT } from '../../utils/constants';

class ObstacleBase extends ObstacleMoveable {

    name = '';
    box;
    group;

    width;
    height;
    depth;

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
        const { isObstacle = false, enableWallOBBs = false, climbable = false, movable = false } = specs;

        this.name = name;
        this.isObstacle = isObstacle;
        this.enableWallOBBs = enableWallOBBs;
        this.climbable = climbable;
        this.movable = movable;
        this.group = new Group();
        this.group.name = name;

        this.width = width;
        this.height = height;
        this.depth = depth;
        
    }

    setTriggers() {

        const { name, movable } = this.specs;

        if (movable) {

            const triggerSpecs = { width: .5, height: this.height, color: violetBlue };

            this.frontTrigger = createOBBPlane(triggerSpecs, `${name}_front_trigger`, [0, 0, this.depth * .5], [0, 0, 0], false, false );
            this.backTrigger = createOBBPlane(triggerSpecs, `${name}_back_trigger`, [0, 0, - this.depth * .5], [0, Math.PI, 0], false, false);
            this.leftTrigger = createOBBPlane(triggerSpecs, `${name}_left_trigger`, [- this.width * .5, 0, 0], [0, - Math.PI * .5, 0], false, false);
            this.rightTrigger = createOBBPlane(triggerSpecs, `${name}_right_trigger`, [this.width * .5, 0, 0], [0, Math.PI * .5, 0], false, false);

            this.triggers = [this.frontTrigger, this.backTrigger, this.leftTrigger, this.rightTrigger];

            this.group.add(
                this.frontTrigger.mesh,
                this.backTrigger.mesh,
                this.leftTrigger.mesh,
                this.rightTrigger.mesh
            );

            this.setTriggerVisible(false);

        }

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

    setPlaneVisible(show) {

        this.walls.forEach(w => w.mesh.visible = show);

        this.topOBBs.forEach(t => t.mesh.visible = show);

        this.bottomOBBs.forEach(b => b.mesh.visible = show);

    }

    setTriggerVisible(show) {

        this.triggers.forEach(tri => tri.mesh.visible = show);

    }

    makePlaneConfig(specs) {
        
        const { width, height } = specs;
        const { baseSize = height, mapRatio, noRepeat = false, lines = true } = this.specs;

        specs.lines = lines;

        if (noRepeat) return specs;

        if (mapRatio) {

            specs.repeatU = width / (mapRatio * baseSize);
            specs.repeatV = height / baseSize;

        }

        specs.repeatModeU = undefined;
        specs.repeatModeV = REPEAT;

        return specs;

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

export { ObstacleBase };