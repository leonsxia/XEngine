import { Group } from 'three';
import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane, createOBBBox } from '../../physics/collisionHelper';
import { yankeesBlue, green } from '../../basic/colorBase';

class CollisionBox {

    name;
    group = new Group();

    width;
    height;
    depth;

    front;
    back;
    left;
    right;
    top;
    bottom;

    walls = [];
    topOBBs = [];
    bottomOBBs = [];

    specs;

    constructor(specs) {

        this.specs = specs;

        const { name, enableWallOBBs, showArrow, lines = true } = specs;
        const { width, height, depth } = specs;

        const frontBackSpecs = { width, height, lines };
        const leftRightSpecs = { width: depth, height, lines };
        const bottomTopSpecs = { width, height: depth, color: yankeesBlue, lines };

        const prefix = 'cbox';

        this.name = `${name}_${prefix}`;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.group.name = this.name;

        // collision faces
        const createPlaneFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;
        

        this.back = createPlaneFunction(frontBackSpecs, `${this.name}_back`, [0, 0, - this.depth * .5], Math.PI, true, true, showArrow);
        this.left = createPlaneFunction(leftRightSpecs, `${this.name}_left`, [this.width * .5, 0, 0], Math.PI * .5, true, true, showArrow);
        this.right = createPlaneFunction(leftRightSpecs, `${this.name}_right`, [- this.width * .5, 0, 0], - Math.PI * .5, true, true, showArrow);

        {
            this.top = createOBBPlane(bottomTopSpecs, `${this.name}_top`, [0, this.height * .5, 0], [- Math.PI * .5, 0 ,0], true, true);
            this.bottom = createOBBPlane(bottomTopSpecs, `${this.name}_bottom`, [0, - this.height * .5, 0], [Math.PI * .5, 0, 0], true, true);

            this.topOBBs = [this.top];
            this.bottomOBBs = [this.bottom];

        }

        this.front = createPlaneFunction(frontBackSpecs, `${this.name}_front`, [0, 0, this.depth * .5], 0, true, true, showArrow);
        this.front.line?.material.color.setHex(green);

        this.walls = [this.front, this.back, this.left, this.right];

        this.group.add(
            this.front.mesh,
            this.back.mesh,
            this.left.mesh,
            this.right.mesh,
            this.top.mesh,
            this.bottom.mesh
        )

    }

    setVisible(show) {

        this.group.visible = show;

        return this;

    }

    setPosition(pos) {

        this.group.position.set(...pos);

        return this;

    }

    setRotationY(rotY) {

        this.walls.forEach(w => w.mesh.rotationY += rotY);

        this.group.rotation.set(0, rotY, 0);

        return this;
        
    }

}

export { CollisionBox };