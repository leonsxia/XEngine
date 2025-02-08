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

        this.rotationY = 0;     // local rotation y

        // collision faces
        const createPlaneFunction = enableWallOBBs ? createCollisionOBBPlane : createCollisionPlane;
        
        this.back = this.ignoreFace('back') ? null : createPlaneFunction(frontBackSpecs, `${this.name}_back`, [0, 0, - this.depth * .5], Math.PI, false, false, showArrow);
        this.left = this.ignoreFace('left') ? null : createPlaneFunction(leftRightSpecs, `${this.name}_left`, [this.width * .5, 0, 0], Math.PI * .5, false, false, showArrow);
        this.right = this.ignoreFace('right') ? null : createPlaneFunction(leftRightSpecs, `${this.name}_right`, [- this.width * .5, 0, 0], - Math.PI * .5, false, false, showArrow);

        {
            this.top = createOBBPlane(bottomTopSpecs, `${this.name}_top`, [0, this.height * .5, 0], [- Math.PI * .5, 0 ,0], false, false);
            this.bottom = createOBBPlane(bottomTopSpecs, `${this.name}_bottom`, [0, - this.height * .5, 0], [Math.PI * .5, 0, 0], false, false);

            this.topOBBs = [this.top];
            this.bottomOBBs = [this.bottom];

        }

        this.front = this.ignoreFace('front') ? null : createPlaneFunction(frontBackSpecs, `${this.name}_front`, [0, 0, this.depth * .5], 0, false, false, showArrow);
        this.front?.line?.material.color.setHex(green);

        this.addWalls();

        this.group.add(
            this.top.mesh,
            this.bottom.mesh
        );

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

        const preRotY = this.rotationY;

        this.walls.forEach(w => w.mesh.rotationY = w.mesh.rotationY - preRotY + rotY);

        this.group.rotation.set(0, rotY, 0);
        this.rotationY = rotY;

        return this;

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

        }

        return ignore;

    }

    addWalls() {

        if (this.front) {
            this.walls.push(this.front);
            this.group.add(this.front.mesh);
        }

        if (this.back) {
            this.walls.push(this.back);
            this.group.add(this.back.mesh);
        }

        if (this.left) {
            this.walls.push(this.left);
            this.group.add(this.left.mesh);
        }

        if (this.right) {
            this.walls.push(this.right);
            this.group.add(this.right.mesh);
        }

    }

}

export { CollisionBox };