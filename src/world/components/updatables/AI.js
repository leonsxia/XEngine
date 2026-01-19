import { Layers } from 'three';
import { Logger } from '../../systems/Logger';
import { UpdatableBase } from './UpdatableBase';
import { TOFU_FOCUS_LAYER } from '../utils/constants';

const tofuFocusLayer = new Layers();
tofuFocusLayer.set(TOFU_FOCUS_LAYER);

class AI extends UpdatableBase {

    players = [];
    enemies = [];
    isActive = true;

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(true, 'AI');

    constructor(players = [], enemies = []) {

        super();
        this.players = players;
        this.enemies = enemies;

    }

    get sceneObjects() {

        const objects = [];
        for (let i = 0, il = this.attachTo.sceneObjects.length; i < il; i++) {

            const obj = this.attachTo.sceneObjects[i];
            const { mesh, group } = obj;

            if (mesh && mesh.visible) objects.push(mesh);
            else if (group && group.visible) objects.push(group);

        }

        return objects;

    }

    get playerObjects() {

        const objects = [];
        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];
            if (player.isActive && !player.dead) {

                objects.push(player.group);

            }

        }

        return objects;

    }

    get currentRoomObjects() {

        if (this._cachedRoomObjects.length === 0) {

            this.currentRoom.group.traverse(object => {

                if (tofuFocusLayer.test(object.layers) && !(object.canBeIgnored ?? object.father?.canBeIgnored)) {

                    this._cachedRoomObjects.push(object);

                }

            });

        }

        return this._cachedRoomObjects;

    }

    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (!player.isActive || player.dead) continue;

            for (let j = 0, jl = this.enemies.length; j < jl; j++) {

                const enemy = this.enemies[j];

                if (!enemy.isActive || enemy.dead || enemy.currentRoom !== this.currentRoom.name) continue;

                player.checkTargetInSight(enemy);

            }

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];

            if (!enemy.isActive || enemy.dead || enemy.currentRoom !== this.currentRoom.name) continue;

            for (let j = 0, jl = this.players.length; j < jl; j++) {
                
                const player = this.players[j];

                if (!player.isActive || player.dead) continue;

                this.concatObjects(...this.currentRoomObjects, ...this.sceneObjects, ...this.playerObjects);
                enemy.checkTargetInSight(player, this._concats);

            }

            enemy.movingTick(delta);

        }

    }

}

export { AI };