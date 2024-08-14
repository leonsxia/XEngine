import { createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { CollisionHexCylinder, CollisionCylinder } from '../../Models';

class HexCylinderPillar extends ObstacleBase {

    radius;
    height;
    cylinder;

    constructor(specs) {

        super(specs);

        const { name, lines = true, showArrow = false } = specs;
        const { radius, height, segments = 16, baseSize, mapRatio, rotationC = Math.PI * .5 } = specs;
        const { map, normalMap, topMap, topNormal, bottomMap, bottomNormal } = specs;
        const { receiveShadow = true, castShadow = true } = specs;

        this.radius = radius;
        this.height = height;

        const boxSpecs = { size: { width: this.radius * 2, depth: this.radius * 2, height: this.height }, lines };
        const cylinderSpecs = { 
            name: `${name}_cylinder`, radius: this.radius, height: this.height, segments, baseSize, 
            map, normalMap, topMap, topNormal, bottomMap, bottomNormal,
            mapRatio, rotationC, lines, transparent: true
        };
        const chCylinderSpecs = { name, radius: this.radius, height: this.height, enableWallOBBs:this.enableWallOBBs, showArrow, lines };

        // cylinder
        this.cylinder = new CollisionCylinder(cylinderSpecs);
        this.cylinder.receiveShadow(receiveShadow)
            .castShadow(castShadow);
        
        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.mesh.visible = false;

        // collision cylinder
        const chCylinder = new CollisionHexCylinder(chCylinderSpecs);
        chCylinder.setRotationY(Math.PI / 16);

        this.cObjects = [chCylinder];
        this.walls = this.getWalls();
        this.topOBBs = this.getTopOBBs();
        this.bottomOBBs = this.getBottomOBBs();
        this.addCObjects();
        this.setCObjectsVisible(false);

        this.group.add(
            this.cylinder.mesh,
            this.box.mesh
        );

        this.setPickLayers();

    }

    async init() {

        await this.cylinder.init();

    }

}

export { HexCylinderPillar };