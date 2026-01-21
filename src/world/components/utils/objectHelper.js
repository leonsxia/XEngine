import { 
    BoxCube, CylinderPillar, HexCylinderPillar, LWall, Plane, Slope, SquarePillar, 
    ModernCeilingLamp01, SecurityLight, Television01, 
    FancyPictureFrame01, 
    RoundWoodenTable,  VintageGrandfatherClock, WoodenPicnicTable, 
    PaintedWoodenBlueChair,
    PaintedWoodenStool,
    PaintedWoodenWhiteChair,
    Sofa03,
    PaintedWoodenBlueCabinet,
    PaintedWoodenWhiteCabinet,
    Shelf01,
    PaintedWoodenNightstand,
    PaintedWoodenTable,
    WoodenSmallTable,
    WoodenDoor1,
    GlockItem,
    PistolItem,
    RevolverItem,
    SMGShortItem,
    BayonetItem,
    PistolAmmoBox,
    MagnumAmmoBox,
    SMGAmmoBox,
    FirstAidKitItem,
    WoodenGlassDoor1,
    WoodenGlassDoor2,
    WoodenGlassDoor3,
    WoodenWhiteDoor1,
    WoodenWhiteDoor2,
    WoodenPinkDoor1,
    WoodenDoor2,
    IronPlateGlassDoor1,
    IronPlateGlassDoor2,
    OfficeDoor1,
    IronPlateDoor1,
    ClassicWoodenDoubleDoor1,
    ClassicWoodenDoor1,
    ClassicWoodenDoor2,
    ClassicWoodenDoor3,
    ClassicWoodenDoor4,
    ClassicWoodenDoor5,
    ClassicWoodenDoor6,
    DungeonGate1,
    VerticalLadder,
    RotatableLadder,
    Terrain
} from "../Models";
import { ObstacleMoveable } from "../movement/ObstacleMoveable";

function clone(target, source, ignore = []) {

    const properties = Object.getOwnPropertyNames(source).filter(prop => !ignore.find(i => i === prop));

    properties.forEach(prop => {

        if (!Array.isArray(source[prop]) && typeof source[prop] === 'object') {

            target[prop] = clone({}, source[prop]);

        } else {
            
            target[prop] = source[prop];
        }

    });

    return target;

}

function groupHasChild(group, child) {

    let has = false;

    if (group.children.length > 0) {

        for (let i = 0, il = group.children.length; i < il; i++) {

            const c = group.children[i];

            if (c.isGroup) {

                has = groupHasChild(c, child);

            } else if (c === child) {

                has = true;

            }

            if (has) return has;

        }
    }

    return has;

}

function getVisibleMeshes(object, meshes = []) {

    if (object.isGroup && object.visible) {

        object.traverseVisible((obj) => {

            if (obj.isMesh) {

                meshes.push(obj);

            }

        });

    } else if (object.isMesh && object.visible) {

        meshes.push(object);

    }

    return meshes;

}

function getInwallParent(object) {

    if (!object.parent) {

        return null;

    }

    let target = null;
    
    if (object.parent) {

        if (object.parent.isInwallObject) {

            target = object.parent;

        } else {

            target = getInwallParent(object.parent);

        }
    }

    return target;
}

/**
@param level - isTofu, isWeapon and so on
*/
function getTopParent(object, out, level = '') {

    if (!object.parent) {

        return null;

    }

    let target = null;
    
    if (!object[level] && object.parent && !object.parent.isScene) {

        target = getTopParent(object.parent, out, level);

    } else {

        target = object;
        out['value'] = target;

    }
    
    return target;

}

function objectFilter(object) {

    if (object instanceof BoxCube ||
        object instanceof SquarePillar ||
        object instanceof LWall ||
        object instanceof Slope ||
        object instanceof WoodenPicnicTable ||
        object instanceof Television01 ||
        object instanceof SecurityLight ||
        object instanceof FancyPictureFrame01 ||
        object instanceof VintageGrandfatherClock ||
        object instanceof PaintedWoodenBlueChair ||
        object instanceof PaintedWoodenStool ||
        object instanceof PaintedWoodenWhiteChair ||
        object instanceof Sofa03 ||
        object instanceof PaintedWoodenBlueCabinet ||
        object instanceof PaintedWoodenWhiteCabinet ||
        object instanceof Shelf01 ||
        object instanceof PaintedWoodenNightstand ||
        object instanceof PaintedWoodenTable ||
        object instanceof WoodenSmallTable ||
        object instanceof WoodenDoor1 ||
        object instanceof WoodenDoor2 ||
        object instanceof WoodenGlassDoor1 ||
        object instanceof WoodenGlassDoor2 ||
        object instanceof WoodenGlassDoor3 ||
        object instanceof WoodenWhiteDoor1 ||
        object instanceof WoodenWhiteDoor2 ||
        object instanceof WoodenPinkDoor1 ||
        object instanceof IronPlateGlassDoor1 ||
        object instanceof IronPlateGlassDoor2 ||
        object instanceof IronPlateDoor1 ||
        object instanceof OfficeDoor1 ||
        object instanceof ClassicWoodenDoubleDoor1 ||
        object instanceof ClassicWoodenDoor1 ||
        object instanceof ClassicWoodenDoor2 ||
        object instanceof ClassicWoodenDoor3 ||
        object instanceof ClassicWoodenDoor4 ||
        object instanceof ClassicWoodenDoor5 ||
        object instanceof ClassicWoodenDoor6 ||
        object instanceof DungeonGate1 ||
        object instanceof VerticalLadder ||
        object instanceof RotatableLadder ||
        object instanceof GlockItem ||
        object instanceof PistolItem ||
        object instanceof RevolverItem ||
        object instanceof SMGShortItem ||
        object instanceof BayonetItem ||
        object instanceof PistolAmmoBox ||
        object instanceof MagnumAmmoBox ||
        object instanceof SMGAmmoBox ||
        object instanceof FirstAidKitItem
    ) {

        return true;

    } else {

        return false;

    }

}

function objectFilter2(object) {

    if (object instanceof HexCylinderPillar ||
        object instanceof CylinderPillar ||
        object instanceof ModernCeilingLamp01 ||
        object instanceof RoundWoodenTable
    ) {

        return true;

    } else {

        return false;

    }

}

function objectFilter3(object) {

    if (object instanceof LWall) {

        return true;

    } else {

        return false;

    }

}

function objectFilter4(object) {

    if (object instanceof Plane) {

        return true;

    } else {

        return false;

    }

}

function objectFilter5(object) {

    if (object instanceof Terrain) {

        return true;

    } else {

        return false;

    }

}

function moveableObjectFilter(object) {

    if (object instanceof ObstacleMoveable) {

        return true;

    } else {

        return false;

    }

}

function isRapierObject(object) {

    if (object instanceof BoxCube ||
        object instanceof LWall ||
        object instanceof SquarePillar
    ) {

        return true;

    } else {

        return false;

    }

}

function resetObject3D(object) {

    object.position.set(0, 0, 0);
    object.quaternion.set(0, 0, 0, 1);
    object.scale.set(1, 1, 1);

    return object;

}

function getIntersectionTarget(object) {

    let realTarget = null;
    const objectFather = object.parent.father;
    realTarget = objectFather ?
        (
            objectFather.isCreature ?
                objectFather :      // CreatureBase
                object.father       // plane

        ) : object;    // gltf mesh

    return realTarget;

}

export { 
    clone, groupHasChild, getVisibleMeshes, getInwallParent, getTopParent, 
    objectFilter, objectFilter2, objectFilter3, objectFilter4, objectFilter5,
    moveableObjectFilter, isRapierObject,
    resetObject3D,
    getIntersectionTarget
};