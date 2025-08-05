import { FIRST_AID_KIT, HEALTH_CATEGORY } from "../../../../utils/constants";
import { CombinableItem } from "../CombinableItem";
import { FirstAidKitLarge } from "./firstAidKit/FirstAidKitLarge";
import { FirstAidKitMedium } from "./firstAidKit/FirstAidKitMedium";
import { FirstAidKitSmall } from "./firstAidKit/FirstAidKitSmall";

class FirstAidKitItem extends CombinableItem {  
    
    isHealingItem = true;
    isFastCombinableItem = true;

    category = HEALTH_CATEGORY.FIRST_AID_KIT;
    count = 1;

    constructor(specs) {

        super(specs);

        const { itemType } = specs;
        this.itemType = itemType;

        this.itemCollection.push(new FirstAidKitLarge(specs));

        if (itemType === FIRST_AID_KIT.FIRST_AID_KIT_MEDIUM) {

            this.itemCollection.push(new FirstAidKitMedium(specs));

        }

        if (itemType === FIRST_AID_KIT.FIRST_AID_KIT_SMALL) {

            this.itemCollection.push(new FirstAidKitMedium(specs));
            this.itemCollection.push(new FirstAidKitSmall(specs));

        }        

    }

    async init() {

        const loadPromises = [];
        this.traverseItemCollection((item) => {

            loadPromises.push(item.init());

        });

        await Promise.all(loadPromises);

        // html
        this.createItemHtml();

        this.setPickLayers();

        this.switchItem(this.itemType);

        this.updateLabelTip();
        this.showLabelTip(false);

    }

    get healCapacity() {

        return this.currentItem.healCapacity;

    }

    checkCombinable(target) {

        let combinable = false;

        if (!(target instanceof FirstAidKitItem) || target.itemType === FIRST_AID_KIT.FIRST_AID_KIT_LARGE) {

            return combinable;

        }

        switch (this.itemType) {

            case FIRST_AID_KIT.FIRST_AID_KIT_SMALL:

                combinable = true;
                break;

            case FIRST_AID_KIT.FIRST_AID_KIT_MEDIUM:

                if (target.itemType === FIRST_AID_KIT.FIRST_AID_KIT_SMALL) {

                    combinable = true;

                }
                break;

        }

        return combinable;

    }

    // small + small = medium
    // small + medium = large
    // medium + small = large
    combine(target) {

        let result = false;

        if (!(target instanceof FirstAidKitItem) || target.itemType === FIRST_AID_KIT.FIRST_AID_KIT_LARGE) {

            return result;

        }

        switch (this.itemType) {

            case FIRST_AID_KIT.FIRST_AID_KIT_SMALL:

                if (target.itemType === FIRST_AID_KIT.FIRST_AID_KIT_SMALL) {

                    this.switchItem(FIRST_AID_KIT.FIRST_AID_KIT_MEDIUM);

                } else {

                    this.switchItem(FIRST_AID_KIT.FIRST_AID_KIT_LARGE);

                }
                result = true;
                break;

            case FIRST_AID_KIT.FIRST_AID_KIT_MEDIUM:

                if (target.itemType === FIRST_AID_KIT.FIRST_AID_KIT_SMALL) {

                    this.switchItem(FIRST_AID_KIT.FIRST_AID_KIT_LARGE);
                    result = true;

                }
                break;

        }

        return result;

    }

}

export { FirstAidKitItem };