import { Vector3 } from 'three';
import { Pathfinding, PathfindingHelper } from 'three-pathfinding';

const pathfinder = new Pathfinding();

function createPathHelper(offset = new Vector3()) {

    const helper = new PathfindingHelper();
    helper.position.copy(offset);

    return helper;

}

function createZone(geometry) {

    return Pathfinding.createZone(geometry);

}

export { pathfinder, createZone, createPathHelper };