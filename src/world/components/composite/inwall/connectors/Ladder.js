import { GeometryDesc, MeshDesc } from '../../../Models';
import { BOX_GEOMETRY } from '../../../utils/constants';
import { InWallObjectBase } from '../InWallObjectBase';
import { LadderItem } from './LadderItem';

class Ladder extends InWallObjectBase {

    _width;
    _height;
    _depth;

    ladderItem;
    
    constructor(specs) {

        super(specs);
        const { scale = [1, 1, 1] } = specs;
        this._scale = new Array(...scale);

        this.ladderItem = new LadderItem(specs);

        this._width = this.ladderItem._width;
        this._height = this.ladderItem._height;
        this._depth = this.ladderItem._depth;

        this.update();

        this.group.add(this.ladderItem.group);

    }

    async init() {

        await this.ladderItem.init();
        this.setPickLayers();

    }

    update() {

        this.ladderItem.scale = this.scale;

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const width = this._width * this.scale[0];
        const height = this._height * this.scale[1];
        const depth = this._depth * this.scale[2];
        const { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        const boxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width, height, depth });
        const boxMesh = new MeshDesc(boxGeo);
        boxMesh.name = `${this.name}_box_mesh_desc`;
        boxMesh.userData.physics = { mass, restitution, friction };

        this.rapierInstances.push(boxMesh);

    }

}

export { Ladder };