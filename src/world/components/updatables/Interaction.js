import { Logger } from "../../systems/Logger";

const DEBUG = true;

class Interaction {

    players = [];
    interactives = [];
    isActive = true;

    _inRangePickItems = [];

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(DEBUG, 'Interaction');

    constructor(players = [], interactives = []) {

        this.players = players;
        this.interactives = interactives;

    }

    // eslint-disable-next-line no-unused-vars
    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (!player.isActive || player.dead || !player.isCombatPlayer) continue;

            this._inRangePickItems.length = 0;
            for (let j = 0, jl = this.interactives.length; j < jl; j++) {

                const item = this.interactives[j];
                if (item.isPickableItem && !item.isPicked) {

                    item.showLabelTip(false);
                    const result = player.checkTargetInPickRange(item);

                    if (result.in) {

                        this._inRangePickItems.push(result);

                    }

                }

            }

            this._inRangePickItems.sort((a, b) => {

                return a.distance - b.distance

            });

            if (this._inRangePickItems.length > 0 && !player.isInteracting) {

                const nearestInRangeItem = this._inRangePickItems[0].target;
                if (player.pda.inventory.availableSlotsCount < nearestInRangeItem.itemSize) {

                    nearestInRangeItem.pickForbidden = true;

                } else {

                    nearestInRangeItem.pickForbidden = false;

                }
                nearestInRangeItem.showLabelTip(true);

                if (!nearestInRangeItem.pickForbidden) {

                    player.isInteractiveReady = true;
                    player.readyToPickItem = nearestInRangeItem;

                }                

            } else {

                player.isInteractiveReady = false;

            }

        }

    }

}

export { Interaction };