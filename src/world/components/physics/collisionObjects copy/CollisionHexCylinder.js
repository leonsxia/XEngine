import { Group } from 'three';
import { CollisionBox } from './CollisionBox';

class CollisionHexCylinder {

    name;
    group = new Group();

    radius;
    height;

    walls = [];
    topOBBs = [];
    bottomOBBs = [];

    specs;

    constructor(specs) {

        this.specs = specs;

        const { name, enableWallOBBs, showArrow, lines = true } = specs;
        const { radius, height } = specs;

        const theta = Math.PI / 16;
        const w = 2 * radius * Math.sin(theta);
        const h = height;
        const d = 2 * radius * Math.cos(theta);

        const prefix = 'cHexCylinder';
        const ignoreFaces = [2, 3];
        const boxSpecs = { width: w, height: h, depth: d, enableWallOBBs, showArrow, lines, ignoreFaces };
        const boxSpecs1 = this.makeBoxConfig(`${name}_${prefix}_cbox_1`, boxSpecs);
        const boxSpecs2 = this.makeBoxConfig(`${name}_${prefix}_cbox_2`, boxSpecs);;
        const boxSpecs3 = this.makeBoxConfig(`${name}_${prefix}_cbox_3`, boxSpecs);;
        const boxSpecs4 = this.makeBoxConfig(`${name}_${prefix}_cbox_4`, boxSpecs);;
        const boxSpecs5 = this.makeBoxConfig(`${name}_${prefix}_cbox_5`, boxSpecs);;
        const boxSpecs6 = this.makeBoxConfig(`${name}_${prefix}_cbox_6`, boxSpecs);;
        const boxSpecs7 = this.makeBoxConfig(`${name}_${prefix}_cbox_7`, boxSpecs);;
        const boxSpecs8 = this.makeBoxConfig(`${name}_${prefix}_cbox_8`, boxSpecs);;

        this.name = `${name}_${prefix}`;
        this.radius = radius;
        this.height = height;
        this.group.name = this.name;

        this.rotationY = 0;     // local rotation y

        const cbox1 = new CollisionBox(boxSpecs1);
        const cbox2 = new CollisionBox(boxSpecs2);
        const cbox3 = new CollisionBox(boxSpecs3);
        const cbox4 = new CollisionBox(boxSpecs4);
        const cbox5 = new CollisionBox(boxSpecs5);
        const cbox6 = new CollisionBox(boxSpecs6);
        const cbox7 = new CollisionBox(boxSpecs7);
        const cbox8 = new CollisionBox(boxSpecs8);

        cbox2.setRotationY(Math.PI * .125);
        cbox3.setRotationY(2 * Math.PI * .125);
        cbox4.setRotationY(3 * Math.PI * .125);
        cbox5.setRotationY(4 * Math.PI * .125);
        cbox6.setRotationY(5 * Math.PI * .125);
        cbox7.setRotationY(6 * Math.PI * .125);
        cbox8.setRotationY(7 * Math.PI * .125);

        this.walls = cbox1.walls.concat(cbox2.walls).concat(cbox3.walls).concat(cbox4.walls)
            .concat(cbox5.walls).concat(cbox6.walls).concat(cbox7.walls).concat(cbox8.walls);

        this.topOBBs = cbox1.topOBBs.concat(cbox2.topOBBs).concat(cbox3.topOBBs).concat(cbox4.topOBBs)
            .concat(cbox5.topOBBs).concat(cbox6.topOBBs).concat(cbox7.topOBBs).concat(cbox8.topOBBs);

        this.bottomOBBs = cbox1.bottomOBBs.concat(cbox2.bottomOBBs).concat(cbox3.bottomOBBs).concat(cbox4.bottomOBBs)
            .concat(cbox5.bottomOBBs).concat(cbox6.bottomOBBs).concat(cbox7.bottomOBBs).concat(cbox8.bottomOBBs);

        this.group.add(
            cbox1.group,
            cbox2.group,
            cbox3.group,
            cbox4.group,
            cbox5.group,
            cbox6.group,
            cbox7.group,
            cbox8.group
        );
        
    }

    makeBoxConfig(name, specs) {

        const { width, height, depth, enableWallOBBs, showArrow, lines, ignoreFaces } = specs;
        const config = { name, width, height, depth, enableWallOBBs, showArrow, lines, ignoreFaces };

        return config;
        
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

}

export { CollisionHexCylinder };