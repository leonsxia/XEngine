import { Logger } from "../../systems/Logger";

const DEBUG = true;

class Interaction {

    players = [];
    interactives = [];
    isActive = true;

    _inRangePickItems = [];
    _inRangeEntries = [];

    // eslint-disable-next-line no-unused-private-class-members
    #logger = new Logger(DEBUG, 'Interaction');

    constructor(players = [], ...interactives) {

        this.players = players;
        this.interactives = interactives;

    }

    // eslint-disable-next-line no-unused-vars
    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (!player.isActive || player.dead || !player.isCombatPlayer) continue;

            this._inRangePickItems.length = 0;
            this._inRangeEntries.length = 0;

            for (let j = 0, jl = this.interactives.length; j < jl; j++) {

                const item = this.interactives[j];
                if (item.isPickableItem && !item.isPicked && item.available) {

                    item.showLabelTip(false);
                    const result = player.checkTargetInPickRange(item);

                    if (result.in) {

                        this._inRangePickItems.push(result);

                    }

                } else if (item.isEntry) {

                    item.showLabelTip(false);
                    const result = player.checkTargetInEntryRange(item);

                    if (result.in) {

                        this._inRangeEntries.push(result);

                    }

                }

            }

            this._inRangePickItems.sort((a, b) => {

                return a.distance - b.distance

            });

            this._inRangeEntries.sort((a, b) => {

                return a.distance - b.distance

            });

            player.isInteractiveReady = false;

            if (!player.isInteracting) {

                if (this._inRangePickItems.length > 0) {

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

                    player.readyToPickItem = undefined;

                }
                
                if (this._inRangeEntries.length > 0) {

                    const nearestInRangeEntry = this._inRangeEntries[0].target;

                    // todo: check if entry is forbidden
                    nearestInRangeEntry.setLableTip(player);
                    nearestInRangeEntry.showLabelTip(true);

                    if (!nearestInRangeEntry.forbidden) {

                        player.isInteractiveReady = true;
                        player.readyToEnter = nearestInRangeEntry;

                    }

                } else {

                    player.readyToEnter = undefined;

                }

            }

        }

    }

}

export { Interaction };