import { createInventoryItem } from "../../../../systems/htmlElements";
import { PickableItem } from "./PickableItem";

class CombinableItem extends PickableItem {

    itemCollection = [];
    currentItem;
    itemType;

    constructor(specs) {

        specs.isCombinable = true;
        super(specs);

    }

    removeModels() {

        if (this.gltf) this.group.remove(this.gltf.group);
        if (this.box) this.group.remove(this.box.mesh);

    }

    addModels() {

        this.group.add(this.gltf.group);
        this.group.add(this.box.mesh);

    }

    assignModels(item) {

        this.removeModels();
        this.gltf = item.gltf;
        this.box = item.box;
        this.addModels();
        this.itemType = item.type;

    }

    setPickLayers() {

        this.traverseItemCollection((item) => {

            this.bindGLTFEvents(item.gltf);

        });

    }

    createItemHtml() {

        const { itemDiv } = createInventoryItem({ imgUrl: '', itemSize: 1, needCountInfo: false });
        this.itemHtml = itemDiv;

    }

    traverseItemCollection(callback) {

        for (let i = 0, il = this.itemCollection.length; i < il; i++) {

            const item = this.itemCollection[i];
            callback(item);

        }

    }

    switchItem(type) {

        this.currentItem = this.itemCollection.find(i => i.type === type);

        if (this.currentItem) {

            this.assignModels(this.currentItem);

            this.itemType = type;
            this.description = this.currentItem.description;

            const imgTag = this.itemHtml.querySelector('img');
            imgTag.src = this.currentItem.imgUrl;

            if (this.itemSize !== this.currentItem.itemSize) {

                this.itemSize = this.currentItem.itemSize;

            }

            this._width = this.currentItem.width;
            this._height = this.currentItem.height;
            this._depth = this.currentItem.depth;

            this.setLableTip();

            this.updateOBBs();

            return true;

        }

        return false;

    }

    update() {
        
        this.traverseItemCollection((item) => {

            item.scale = this.scale;

        });

    }

    updateOBBs() {

        this.traverseItemCollection((item) => {

            item.updateOBBs();

        });

    }

    // inherited by child
    checkCombinable() {}

}

export { CombinableItem };