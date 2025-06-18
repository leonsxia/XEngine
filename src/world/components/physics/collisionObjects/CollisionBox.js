import { createCollisionPlane, createCollisionOBBPlane, createOBBPlane } from '../collisionHelper';
import { yankeesBlue, green } from '../../basic/colorBase';
import { CollisionBase } from './CollisionBase';

class CollisionBox extends CollisionBase {

    width;
    height;
    depth;

    front;
    back;
    left;
    right;
    top;
    bottom;

    constructor(specs) {

        super(specs);

        const { name, enableWallOBBs, showArrow, lines = false } = specs;
        const { width, height, depth } = specs;

        const frontBackSpecs = { width, height, lines, transparent: true };
        const leftRightSpecs = { width: depth, height, lines, transparent: true };
        const bottomTopSpecs = { width, height: depth, color: yankeesBlue, lines, transparent: true };

        const prefix = 'cbox';

        this.name = `${name}_${prefix}`;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.group.name = this.name;

        // collision faces
        const createPlaneFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;
        
        this.back = this.ignoreFace('back') ? null : createPlaneFunction(frontBackSpecs, `${this.name}_back`, [0, 0, - this.depth * .5], Math.PI, false, false, showArrow);
        this.left = this.ignoreFace('left') ? null : createPlaneFunction(leftRightSpecs, `${this.name}_left`, [this.width * .5, 0, 0], Math.PI * .5, false, false, showArrow);
        this.right = this.ignoreFace('right') ? null : createPlaneFunction(leftRightSpecs, `${this.name}_right`, [- this.width * .5, 0, 0], - Math.PI * .5, false, false, showArrow);

        {
            if (!this.ignoreFace('top')) {

                this.top = createOBBPlane(bottomTopSpecs, `${this.name}_top`, [0, this.height * .5, 0], [- Math.PI * .5, 0 ,0], false, false);
                this.top.father = this;
                this.topOBBs = [this.top];
                this.group.add(this.top.mesh);

            }
            
            if (!this.ignoreFace('bottom')) {

                this.bottom = createOBBPlane(bottomTopSpecs, `${this.name}_bottom`, [0, - this.height * .5, 0], [Math.PI * .5, 0, 0], false, false);
                this.bottom.father = this;
                this.bottomOBBs = [this.bottom];
                this.group.add(this.bottom.mesh);

            }

        }

        this.front = this.ignoreFace('front') ? null : createPlaneFunction(frontBackSpecs, `${this.name}_front`, [0, 0, this.depth * .5], 0, false, false, showArrow);
        this.front?.line?.material.color.setHex(green);

        this.addWalls();

    }

    ignoreFace(face) {

        const { ignoreFaces = [] } = this.specs;

        let ignore = false;

        switch (face) {

            case 'front':
                ignore = ignoreFaces.findIndex(i => i === 0) > - 1;
                break;

            case 'back':
                ignore = ignoreFaces.findIndex(i => i === 1) > - 1;
                break;

            case 'left':
                ignore = ignoreFaces.findIndex(i => i === 2) > - 1;
                break;
            
            case 'right':
                ignore = ignoreFaces.findIndex(i => i === 3) > - 1;
                break;

            case 'top':
                ignore = ignoreFaces.findIndex(i => i === 4) > - 1;
                break;

            case 'bottom':
                ignore = ignoreFaces.findIndex(i => i === 5) > - 1;
                break;

        }

        return ignore;

    }

    addWalls() {

        if (this.front) {

            this.walls.push(this.front);
            this.group.add(this.front.mesh);
            this.front.father = this;

        }

        if (this.back) {

            this.walls.push(this.back);
            this.group.add(this.back.mesh);
            this.back.father = this;

        }

        if (this.left) {

            this.walls.push(this.left);
            this.group.add(this.left.mesh);
            this.left.father = this;

        }

        if (this.right) {

            this.walls.push(this.right);
            this.group.add(this.right.mesh);
            this.right.father = this;

        }

    }

    setScale(scale) {

        this.scale = new Array(...scale);

        const width = this.width * scale[0];
        const height = this.height * scale[1];
        const depth = this.depth * scale[2];

        if (this.front) {

            this.front.setScale([scale[0], scale[1], 1])
                .setPosition([0, 0, depth * .5]);            

        }

        if (this.back) {

            this.back.setScale([scale[0], scale[1], 1])
                .setPosition([0, 0, - depth * .5]);

        }

        if (this.left) {

            this.left.setScale([scale[2], scale[1], 1])
                .setPosition([width * .5, 0, 0]);

        }

        if (this.right) {

            this.right.setScale([scale[2], scale[1], 1])
                .setPosition([- width * .5, 0, 0]);

        }

        if (this.top) {

            this.top.setScale([scale[0], scale[2], 1])
                .setPosition([0, height * .5, 0]);

        }

        if (this.bottom) {

            this.bottom.setScale([scale[0], scale[2], 1])
                .setPosition([0, - height * .5, 0]);

        }

        return this;

    }

}

export { CollisionBox };