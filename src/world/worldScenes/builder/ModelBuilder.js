import {
    Train, Tofu, SoldierFemale, CreatureBase, ZombieMale, BlackWidow,
    Plane, WaterPlane, OBBPlane, CollisionPlane, CollisionOBBPlane, 
    Room, InspectorRoom, 
    SquarePillar, LWall, CylinderPillar, HexCylinderPillar, BoxCube, WaterCube, Slope, Stairs,
    WoodenPicnicTable, WoodenSmallTable, RoundWoodenTable, PaintedWoodenTable, PaintedWoodenNightstand,
    PaintedWoodenBlueChair, PaintedWoodenWhiteChair, PaintedWoodenStool, Sofa03,
    PaintedWoodenBlueCabinet, Shelf01, PaintedWoodenWhiteCabinet,
    Television01,
    FancyPictureFrame01, VintageGrandfatherClock,
    ModernCeilingLamp01, SecurityLight,
    GlockItem, BayonetItem
} from '../../components/Models.js';
import {
    AXES, GRID, TRAIN, TOFU, SOLDIER_FEMALE, CREATURE_BASE, ZOMBIE_MALE, BLACK_WIDOW,
    PLANE, WATER_PLANE, OBBPLANE, COLLISIONPLANE, COLLISIONOBBPLANE,
    ROOM, INSPECTOR_ROOM,
    SQUARE_PILLAR, LWALL, CYLINDER_PILLAR, HEX_CYLINDER_PILLAR, BOX_CUBE, WATER_CUBE, SLOPE, STAIRS,
    WOODEN_PICNIC_TABLE, WOODEN_SMALL_TABLE, ROUND_WOODEN_TABLE, PAINTED_WOODEN_TABLE, PAINTED_WOODEN_NIGHTSTAND,
    PAINTED_WOODEN_BLUE_CHAIR, PAINTED_WOODEN_WHITE_CHAIR, PAINTED_WOODEN_STOOL, SOFA_03,
    PAINTED_WOODEN_BLUE_CABINET, SHELF_01, PAINTED_WOODEN_WHITE_CABINET,
    TELEVISION_01,
    FANCY_PICTURE_FRAME_01, VINTAGE_GRANDFATHER_CLOCK,
    MODERN_CEILING_LAMP_01, SECURITY_LIGHT,
    TEXTURE_NAMES, GLTF_NAMES,
    WEAPONS
} from '../../components/utils/constants.js';
import { createAxesHelper, createGridHelper } from '../../components/utils/helpers.js';

class ModelBuilder {

    textures;
    gltfs;
    objectCreationMapping = {};

    constructor(textures, gltfs) {
        
        this.textures = textures;
        this.gltfs = gltfs;

        this.buildObjectCreationMapping();

    }

    callCreateFunction(specs) {

        const { type } = specs;

        return this.objectCreationMapping[type].call(this, specs);

    }

    buildObjectCreationMapping() {

        this.objectCreationMapping[TOFU] = this.createTofu;
        this.objectCreationMapping[TRAIN] = this.createTrain;
        this.objectCreationMapping[SOLDIER_FEMALE] = this.createSoldierFemale;
        this.objectCreationMapping[CREATURE_BASE] = this.createCreatureBase;
        this.objectCreationMapping[ZOMBIE_MALE] = this.createZombieMale;
        this.objectCreationMapping[BLACK_WIDOW] = this.createBlackWidow;
        this.objectCreationMapping[WEAPONS.BAYONET] = this.createBayonetItem;
        this.objectCreationMapping[WEAPONS.GLOCK] = this.createGlockItem;
        this.objectCreationMapping[AXES] = this.createAxes;
        this.objectCreationMapping[GRID] = this.createGrid;
        this.objectCreationMapping[PLANE] = this.createPlane;
        this.objectCreationMapping[WATER_PLANE] = this.createWaterPlane;
        this.objectCreationMapping[OBBPLANE] = this.createOBBPlane;
        this.objectCreationMapping[COLLISIONPLANE] = this.createCollisionPlane;
        this.objectCreationMapping[COLLISIONOBBPLANE] = this.createCollisionOBBPlane;
        this.objectCreationMapping[ROOM] = this.createRoom;
        this.objectCreationMapping[INSPECTOR_ROOM] = this.createInspectorRoom;
        this.objectCreationMapping[SQUARE_PILLAR] = this.createSquarePillar;
        this.objectCreationMapping[LWALL] = this.createLWall;
        this.objectCreationMapping[CYLINDER_PILLAR] = this.createCylinderPillar;
        this.objectCreationMapping[SLOPE] = this.createSlope;
        this.objectCreationMapping[STAIRS] = this.createStairs;
        this.objectCreationMapping[HEX_CYLINDER_PILLAR] = this.createHexCylinderPillar;
        this.objectCreationMapping[BOX_CUBE] = this.createBoxCube;
        this.objectCreationMapping[WATER_CUBE] = this.createWaterCube;
        this.objectCreationMapping[WOODEN_PICNIC_TABLE] = this.createWoodenPicnicTable;
        this.objectCreationMapping[WOODEN_SMALL_TABLE] = this.createWoodenSmallTable;
        this.objectCreationMapping[ROUND_WOODEN_TABLE] = this.createRoundWoodenTable;
        this.objectCreationMapping[PAINTED_WOODEN_TABLE] = this.createPaintedWoodenTable;
        this.objectCreationMapping[PAINTED_WOODEN_NIGHTSTAND] = this.createPaintedWoodenNightstand;
        this.objectCreationMapping[PAINTED_WOODEN_BLUE_CHAIR] = this.createPaintedWoodenBlueChair;
        this.objectCreationMapping[PAINTED_WOODEN_WHITE_CHAIR] = this.createPaintedWoodenWhiteChair;
        this.objectCreationMapping[PAINTED_WOODEN_STOOL] = this.createPaintedWoodenStool;
        this.objectCreationMapping[SOFA_03] = this.createSofa03;
        this.objectCreationMapping[PAINTED_WOODEN_BLUE_CABINET] = this.createPaintedWoodenBlueCabinet;
        this.objectCreationMapping[SHELF_01] = this.createShelf01;
        this.objectCreationMapping[PAINTED_WOODEN_WHITE_CABINET] = this.createPaintedWoodenWhiteCabinet;
        this.objectCreationMapping[TELEVISION_01] = this.createTelevision01;
        this.objectCreationMapping[MODERN_CEILING_LAMP_01] = this.createModernCeilingLamp01;
        this.objectCreationMapping[SECURITY_LIGHT] = this.createSecurityLight;
        this.objectCreationMapping[FANCY_PICTURE_FRAME_01] = this.createFancyPictureFrame01;
        this.objectCreationMapping[VINTAGE_GRANDFATHER_CLOCK] = this.createVintageGrandfatherClock;

    }

    createTofu(specs) {

        let object;
        const { name, position = [0, 0, 0], scale = [1, 1, 1], receiveShadow = false, castShadow = false, enableDefaultCBox = true } = specs;

        object = new Tofu({ name, enableDefaultCBox });
        object.setPosition(position)
            .setScale(scale)
            .receiveShadow(receiveShadow)
            .castShadow(castShadow)
            .updateOBB()
            .updateRay();

        return object;

    }
    
    createTrain(specs) {

        let object;
        const { name, position = [0, 0, 0], scale = [1, 1, 1], receiveShadow = false, castShadow = false } = specs;

        object = new Train(name);
        object.setPosition(position)
            .setScale(scale)
            .receiveShadow(receiveShadow)
            .castShadow(castShadow)
            .updateOBB();

        return object;

    }

    createCreatureBase(specs) {

        let object;
        const { position = [0, 0, 0], rotation = [0, 0, 0], receiveShadow = false, castShadow = false } = specs;

        object = new CreatureBase(specs);
        object.setPosition(position)
            .setRotation(rotation)
            .receiveShadow(receiveShadow)
            .castShadow(castShadow)
            .updateOBB()
            .updateRay();

        return object;

    }

    createSoldierFemale(specs) {

        let object;
        const { position = [0, 0, 0] } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new SoldierFemale(specs);
        object.setPosition(position)
            // .setScale(scale)
            // .receiveShadow(receiveShadow)
            // .castShadow(castShadow)
            .updateOBB()
            .updateRay();

        return object;

    }

    createZombieMale(specs) {

        let object;
        const { position = [0, 0, 0], rotation = [0, 0, 0], } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new ZombieMale(specs);
        object.setPosition(position)
            .setRotation(rotation)
            .updateOBB()
            .updateRay();

        return object;

    }

    createBlackWidow(specs) {

        let object;
        const { position = [0, 0, 0], rotation = [0, 0, 0], } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new BlackWidow(specs);
        object.setPosition(position)
            .setRotation(rotation)
            .updateOBB()
            .updateRay();

        return object;

    }

    createBayonetItem(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new BayonetItem(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (!specs.ammo) specs.ammo = object.ammo.toJSON();

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createGlockItem(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new GlockItem(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (!specs.ammo) specs.ammo = object.ammo.toJSON();

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createAxes(specs) {

        const object = createAxesHelper(specs);

        return object;

    }

    createGrid(specs) {

        const object = createGridHelper(specs);

        return object;

    }

    createPlane(specs) {

        let object;
        const { position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], receiveShadow = false, castShadow = false } = specs;
        const { map, normalMap } = specs;

        const maps = [{ map }, { normalMap }];
        this.setupObjectTextures(maps, specs);

        object = new Plane(specs);
        object.setScaleWithTexUpdate(scale)
            .setRotation(rotation)
            .setPosition(position)
            .receiveShadow(receiveShadow)
            .castShadow(castShadow);

        return object;

    }

    createWaterPlane(specs) {

        let object;
        const { position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = specs;
        const { normalMap0, normalMap1 } = specs;

        const maps = [{ normalMap0 }, { normalMap1 }];
        this.setupObjectTextures(maps, specs);

        object = new WaterPlane(specs);
        object.setScaleWithTexUpdate(scale)
            .setRotation(rotation)
            .setPosition(position);

        return object;

    }

    createOBBPlane(specs) {

        let object;
        const { position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], receiveShadow = false, castShadow = false, updateOBB = true } = specs;
        const { map, normalMap } = specs;

        const maps = [{ map }, { normalMap }];
        this.setupObjectTextures(maps, specs);

        object = new OBBPlane(specs);
        object.setScaleWithTexUpdate(scale)
            .setRotation(rotation)
            .setPosition(position)
            .receiveShadow(receiveShadow)
            .castShadow(castShadow);

        if (updateOBB) object.updateOBB();

        return object;

    }

    createCollisionPlane(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, scale = [1, 1, 1], receiveShadow = false, castShadow = false, updateRay = true } = specs;
        const { map, normalMap } = specs;

        const maps = [{ map }, { normalMap }];
        this.setupObjectTextures(maps, specs);

        object = new CollisionPlane(specs);
        object.setScaleWithTexUpdate(scale)
            .setRotationY(rotationY)
            .setPosition(position)
            .receiveShadow(receiveShadow)
            .castShadow(castShadow)
            .createRay();

        if (updateRay) object.updateRay();

        return object;

    }

    createCollisionOBBPlane(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, scale = [1, 1, 1], receiveShadow = false, castShadow = false, updateOBB = true, updateRay = true } = specs;
        const { map, normalMap } = specs;

        const maps = [{ map }, { normalMap }];
        this.setupObjectTextures(maps, specs);

        object = new CollisionOBBPlane(specs);
        object.setScaleWithTexUpdate(scale)
            .setRotationY(rotationY)
            .setPosition(position)
            .receiveShadow(receiveShadow)
            .castShadow(castShadow)
            .createRay();

        if (updateOBB) object.updateOBB();
        if (updateRay) object.updateRay();

        return object;

    }

    createRoom(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBnRay = true } = specs;
        const { frontMap, backMap, leftMap, rightMap } = specs;
        const { frontNormal, backNormal, leftNormal, rightNormal } = specs;

        const maps = [{ frontMap }, { backMap }, { leftMap }, { rightMap }, { frontNormal }, { backNormal }, { leftNormal }, { rightNormal }];

        this.setupObjectTextures(maps, specs);

        object = new Room(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBnRay) object.updateOBBnRay();

        return object;

    }

    createInspectorRoom(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBnRay = true } = specs;
        const { frontMap, backMap, leftMap, rightMap } = specs;
        const { frontNormal, backNormal, leftNormal, rightNormal } = specs;

        const maps = [{ frontMap }, { backMap }, { leftMap }, { rightMap }, { frontNormal }, { backNormal }, { leftNormal }, { rightNormal }];

        this.setupObjectTextures(maps, specs);

        object = new InspectorRoom(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBnRay) {

            object.updateOBBnRay();
            object.updateAreasOBBBox(false);

        }

        return object;

    }

    createSquarePillar(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;
        const { frontNormal, backNormal, leftNormal, rightNormal, topNormal, bottomNormal } = specs;

        const maps = [{ frontMap }, { backMap }, { leftMap }, { rightMap }, { topMap }, { bottomMap }, { frontNormal }, { backNormal }, { leftNormal }, { rightNormal }, { topNormal }, { bottomNormal }];

        this.setupObjectTextures(maps, specs);

        object = new SquarePillar(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createLWall(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { outTMap, outSMap, inTMap, inSMap, sideTMap, sideSMap, topMap, bottomMap } = specs;
        const { outTNormal, outSNormal, inTNormal, inSNormal, sideTNormal, sideSNormal, topNormal, bottomNormal } = specs;

        const maps = [{ outTMap }, { outSMap }, { inTMap }, { inSMap }, { sideTMap }, { sideSMap }, { topMap }, { bottomMap }, { outTNormal }, { outSNormal }, { inTNormal }, { inSNormal }, { sideTNormal }, { sideSNormal }, { topNormal }, { bottomNormal }];

        this.setupObjectTextures(maps, specs);

        object = new LWall(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createCylinderPillar(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { map, topMap, bottomMap, normalMap, topNormal, bottomNormal } = specs;

        const maps = [{ map }, { topMap }, { bottomMap }, { normalMap }, { topNormal }, { bottomNormal }];

        this.setupObjectTextures(maps, specs);

        object = new CylinderPillar(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createSlope(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { backMap, leftMap, rightMap, slopeMap, bottomMap } = specs;
        const { backNormal, leftNormal, rightNormal, slopeNormal, bottomNormal } = specs;

        const maps = [{ backMap }, { leftMap }, { rightMap }, { slopeMap }, { bottomMap }, { backNormal }, { leftNormal }, { rightNormal }, { slopeNormal }, { bottomNormal }];

        this.setupObjectTextures(maps, specs);

        object = new Slope(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createStairs(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { frontMap, topMap, sideMap, backMap, bottomMap } = specs;
        const { frontNormal, topNormal, sideNormal, backNormal, bottomNormal } = specs;

        const maps = [{ frontMap }, { topMap }, { sideMap }, { backMap }, { bottomMap }, { frontNormal }, { topNormal }, { sideNormal }, { backNormal }, { bottomNormal }];

        this.setupObjectTextures(maps, specs);

        object = new Stairs(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createHexCylinderPillar(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { map, normalMap, topMap, topNormal, bottomMap, bottomNormal } = specs;

        const maps = [{ map }, { normalMap }, { topMap }, { topNormal }, { bottomMap }, { bottomNormal }];

        this.setupObjectTextures(maps, specs);

        object = new HexCylinderPillar(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createBoxCube(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { map, frontMap, backMap, leftMap, rightMap, topMap, bottomMap } = specs;
        const { normalMap, frontNormal, backNormal, leftNormal, rightNormal, topNormal, bottomNormal } = specs;

        const maps = [{ map }, { frontMap }, { backMap }, { leftMap }, { rightMap }, { topMap }, { bottomMap }, { normalMap }, { frontNormal }, { backNormal }, { leftNormal }, { rightNormal }, { topNormal }, { bottomNormal }];

        this.setupObjectTextures(maps, specs);

        object = new BoxCube(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createWaterCube(specs) {

        let object;
        const { position = [0, 0, 0], rotation = [0, 0, 0], updateOBBs = true } = specs;
        const { normalMap0, normalMap1 } = specs;

        const maps = [{ normalMap0 }, { normalMap1 }];
        this.setupObjectTextures(maps, specs);

        object = new WaterCube(specs);
        object.setRotation(rotation)
            .setPosition(position);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createWoodenPicnicTable(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new WoodenPicnicTable(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createWoodenSmallTable(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new WoodenSmallTable(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createRoundWoodenTable(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new RoundWoodenTable(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createPaintedWoodenTable(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new PaintedWoodenTable(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createPaintedWoodenNightstand(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new PaintedWoodenNightstand(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createPaintedWoodenBlueChair(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new PaintedWoodenBlueChair(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createPaintedWoodenWhiteChair(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new PaintedWoodenWhiteChair(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createPaintedWoodenStool(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new PaintedWoodenStool(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createSofa03(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new Sofa03(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createPaintedWoodenBlueCabinet(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new PaintedWoodenBlueCabinet(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createShelf01(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new Shelf01(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createPaintedWoodenWhiteCabinet(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new PaintedWoodenWhiteCabinet(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createTelevision01(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0, updateOBBs = true } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new Television01(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        if (updateOBBs) object.updateOBBs();

        return object;

    }

    createModernCeilingLamp01(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0 } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new ModernCeilingLamp01(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        return object;

    }

    createSecurityLight(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0 } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new SecurityLight(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        return object;

    }

    createFancyPictureFrame01(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0 } = specs;
        const { src, img, imgNormal } = specs;

        this.setupObjectGLTF({ src }, specs);
        this.setupObjectTextures([{ img }, { imgNormal }], specs);

        object = new FancyPictureFrame01(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        return object;

    }

    createVintageGrandfatherClock(specs) {

        let object;
        const { position = [0, 0, 0], rotationY = 0 } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new VintageGrandfatherClock(specs);
        object.setPosition(position)
            .setRotationY(rotationY);

        return object;

    }

    setupObjectTextures(_textures, specs) {

        for (let i = 0, il = _textures.length; i < il; i++) {

            const t = _textures[i];

            for (const map in t) {

                if (t[map] && TEXTURE_NAMES[t[map]]) {

                    specs[map] = this.textures[t[map]];

                }

            }

        }

    }

    setupObjectGLTF(_gltfSrc, specs) {

        for (const src in _gltfSrc) {

            if (_gltfSrc[src] && GLTF_NAMES[_gltfSrc[src]]) {

                specs[src] = this.gltfs[_gltfSrc[src]];

            }

        }
    
    }

}

export { ModelBuilder };