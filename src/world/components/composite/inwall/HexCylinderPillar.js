import { createOBBBox } from '../../physics/collisionHelper';
import { ObstacleBase } from './ObstacleBase';
import { CollisionHexCylinder, CollisionCylinder, GeometryDesc, MeshDesc } from '../../Models';
import { CYLINDER_GEOMETRY } from '../../utils/constants';

class HexCylinderPillar extends ObstacleBase {

    isHexCylinderPillar = true;

    _radius = 1;
    _height = 1;

    cylinder;
    _chCylinder;

    constructor(specs) {

        super(specs);

        const { name, lines = false, showArrow = false } = specs;
        const { segments = 16, baseSize, mapRatio, rotationC = Math.PI * .5 } = specs;
        const { map, normalMap, topMap, topNormal, bottomMap, bottomNormal, armMap, topArm, bottomArm } = specs;
        const { roughness = 1, metalness = 0 } = specs;
        const { receiveShadow = true, castShadow = true } = specs;
        const { scale = [1, 1] } = specs;
        const { transparent = true } = specs;

        this._scale = [scale[0], scale[1], scale[0]];

        const boxSpecs = { size: { width: this._radius * 2, depth: this._radius * 2, height: this._height }, lines };
        const cylinderSpecs = {
            name: `${name}_cylinder`, radius: this._radius, height: this._height, segments, baseSize,
            map, normalMap, topMap, topNormal, bottomMap, bottomNormal, armMap, topArm, bottomArm,
            mapRatio, rotationC, lines, transparent,
            roughness, metalness
        };
        const chCylinderSpecs = { name: `${name}_collision_hex_cylinder`, radius: this._radius, height: this._height, enableWallOBBs: this.enableWallOBBs, showArrow, lines };

        // cylinder
        this.cylinder = new CollisionCylinder(cylinderSpecs);
        this.cylinder.receiveShadow(receiveShadow)
            .castShadow(castShadow);

        // obb box
        this.box = createOBBBox(boxSpecs, `${name}_obb_box`, [0, 0, 0], [0, 0, 0], receiveShadow, castShadow);
        this.box.visible = false;

        // collision cylinder
        const chCylinder = this._chCylinder = new CollisionHexCylinder(chCylinderSpecs);
        chCylinder.setRotationY(Math.PI / 16);

        this.update(false);

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
        this.setCanBeIgnored();

    }

    async init() {

        await this.cylinder.init();

    }

    get scaleR() {

        return this._scale[0];

    }

    set scaleR(r) {

        this._scale[0] = this._scale[2] = r;

        this.update();

    }

    get scale() {

        return [this._scale[0], this._scale[1]];

    }

    set scale(val = [1, 1]) {

        this._scale = [val[0], val[1], val[0]];

        this.update();

    }

    update(needToUpdateOBBnRay = true) {

        this._chCylinder.setScale(this._scale);

        this.cylinder.setScaleWithTexUpdate(this._scale);        

        this.box.setScale(this._scale);

        if (needToUpdateOBBnRay) {

            this.updateOBBs();

        }

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const radius = this._radius * this.scale[0];
        const height = this._height * this.scale[1];
        const { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        const cylinderGeo = new GeometryDesc({ type: CYLINDER_GEOMETRY, radiusBottom: radius, height });
        const cylinderMesh = new MeshDesc(cylinderGeo);
        cylinderMesh.name = `${this.name}_cylinder_mesh_desc`;
        cylinderMesh.userData.physics = { mass, restitution, friction };

        this.rapierInstances.push(cylinderMesh);

    }

}

export { HexCylinderPillar };