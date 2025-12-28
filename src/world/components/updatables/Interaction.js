import { Logger } from "../../systems/Logger";
import { entryType } from "../utils/enums";
import { UpdatableBase } from "./UpdatableBase";

const DEBUG = true;

class Interaction extends UpdatableBase {

    players = [];
    isActive = true;

    delegates = {};

    _inRangePickItems = [];
    _inRangeEntries = [];

    _cachedEntry = null;

    #logger = new Logger(DEBUG, 'Interaction');

    constructor(players = []) {

        super();
        this.players = players;

    }

    get pickables() {

        return this.attachTo.pickables;

    }

    get entries() {

        return this.attachTo.entries;

    }

    init() {

        this.initEntries();

    }

    initEntries() {

        this.#logger.func = this.initEntries.name;

        for (let i = 0, il = this.entries.length; i < il; i++) {

            const thisEntry = this.entries[i];
            if (thisEntry.transportType === entryType.separate) {

                const targetEntry = this.getTargetEntryByName(thisEntry.linkTo);
                if (targetEntry) {

                    if (targetEntry.roomSequence !== thisEntry.roomSequence) {

                        thisEntry.onEntryChanged.push(() => {

                            this.delegates['changeRoom']?.(thisEntry.roomSequence);
                            this.delegates['changeCamera']?.(thisEntry.roomSequence);

                        });

                    }

                } else {

                    this.#logger.log(`Cannot find target entry: ${thisEntry.linkTo} for entry: ${thisEntry.name}`);

                }

            }

        }

    }

    getTargetEntryByName(name) {

        if (!this._cachedEntry || this._cachedEntry.name !== name) {

            this._cachedEntry = this.entries.find(e => e.name === name);

        }

        return this._cachedEntry;

    }

    // eslint-disable-next-line no-unused-vars
    tick(delta) {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];

            if (!player.isActive || player.dead || !player.isCombatPlayer) continue;

            this._inRangePickItems.length = 0;
            this._inRangeEntries.length = 0;

            for (let j = 0, jl = this.pickables.length; j < jl; j++) {

                const item = this.pickables[j];

                if (item.currentRoom !== this.currentRoom.name) continue;

                if (item.isPickableItem && !item.isPicked && item.available) {

                    item.showLabelTip(false);
                    const result = player.checkTargetInPickRange(item);

                    if (result.in) {

                        this._inRangePickItems.push(result);

                    }

                }

            }

            for (let j = 0, jl = this.entries.length; j < jl; j++) {

                const item = this.entries[j];

                if (item.roomSequence !== this.currentRoom.sequence) continue;

                if (item.isEntry) {

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

                        if (nearestInRangeEntry.transportType === entryType.separate) {

                            const targetEntry = this.getTargetEntryByName(nearestInRangeEntry.linkTo);
                            if (targetEntry) {

                                player.readyToEnter = targetEntry;
                                
                            }

                        } else {

                            player.readyToEnter = nearestInRangeEntry;

                        }

                    }

                } else {

                    player.readyToEnter = undefined;

                }

            }

        }

    }

}

export { Interaction };