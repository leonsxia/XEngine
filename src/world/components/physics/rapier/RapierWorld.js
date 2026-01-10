import { RapierPhysics } from './RapierPhysics';

class RapierWorld {

    physics = new RapierPhysics();

    players = [];
    enemies = [];
    activePlayers = [];
    activeEnemies = [];

    compounds = [];
    terrains = [];

    constructor() {}

}

export { RapierWorld };