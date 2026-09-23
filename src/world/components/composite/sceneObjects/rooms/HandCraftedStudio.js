import { SceneObjectBase } from "../SceneObjectBase";
import { GLTFModel, GeometryDesc, MeshDesc, Plane } from '../../../Models';
import { BOX_GEOMETRY } from '../../../utils/constants';

const GLTF_SRC = 'scene_objects/rooms/hand_crafted_studio_1-2k/hand_crafted_studio.gltf';
const gltfIgnoreShadowCastList = [    
    'Blank_Paper',
    'Blank_Paper001',
    'Coffee_Stain',
    'Wall_Leak',
    'Wall_Tape'
]

class HandCraftedStudio extends SceneObjectBase {

    _width = 4.67;
    _height = 3.21;
    _depth = 4.57;
    _offsetX = .14;
    _offsetZ = .01;
    _tableTopWidth = 1.65;
    _tableTopDepth = .9;
    _tableTopHeight = .0398;
    _tableBottomHeight = .86;
    _tableBottomWidth = 1.6;
    _tableBottomDepth = .854;
    _tableMiddleWidth = 1.56;
    _tableMiddleHeight = .125;
    _tableMiddleDepth = .8106;
    _tablePosX = - 1.5051;
    _tablePosZ = - 1.835;
    _tableTopPosY = - .72488;
    _tableBottomPosY = this._tableTopPosY - (this._tableBottomHeight + this._tableTopHeight) * .5;
    _tableMiddlePosY = this._tableTopPosY - (this._tableTopHeight + this._tableMiddleHeight) * .5;
    _tableFootWidth = .1;
    _tableFootDepth = .1;

    _frontWall;
    _backWall;
    _leftWall;
    _rightWall;
    _ceiling;
    _floor;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1] } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow, ignoreList: gltfIgnoreShadowCastList };
        this.gltf = new GLTFModel(gltfSpecs);

        this.createBoundaries();
        this.update();

        this.group.add(
            this.gltf.group
        );

    }

    async init() {

        await this.gltf.init();

        this.setPickLayers();
        this.setCanBeIgnored();

    }

    createBoundaries() {

        const { name } = this.specs;
        this._frontWall = new Plane({ name: `${name}_front_wall`,width: this._width, height: this._height, useStandardMaterial: false });
        this._backWall = new Plane({ name: `${name}_back_wall`, width: this._width, height: this._height, useStandardMaterial: false });
        this._leftWall = new Plane({ name: `${name}_left_wall`, width: this._depth, height: this._height, useStandardMaterial: false }).setRotation([0, - Math.PI * .5, 0]);
        this._rightWall = new Plane({ name: `${name}_right_wall`, width: this._depth, height: this._height, useStandardMaterial: false }).setRotation([0, Math.PI * .5, 0]);
        this._ceiling = new Plane({ name: `${name}_ceiling`, width: this._width, height: this._depth, useStandardMaterial: false }).setRotation([Math.PI * .5, 0, 0]);
        this._floor = new Plane({ name: `${name}_floor`, width: this._width, height: this._depth, useStandardMaterial: false }).setRotation([- Math.PI * .5, 0, 0]);

    }

    updateBoundaries() {

        const halfWidth = this._width * .5 * this.scale[0];
        const halfHeight = this._height * .5 * this.scale[1];
        const halfDepth = this._depth * .5 * this.scale[2];
        const halfOffsetX = this._offsetX * .5 * this.scale[0];
        const halfOffsetZ = this._offsetZ * .5 * this.scale[2];

        this._frontWall.setScale([this.scale[0], this.scale[1], 1])
            .setPosition([halfOffsetX, 0, halfDepth + halfOffsetZ]);
        this._backWall.setScale([this.scale[0], this.scale[1], 1])
            .setPosition([halfOffsetX, 0, - halfDepth + halfOffsetZ]);
        this._leftWall.setScale([this.scale[2], this.scale[1], 1])
            .setPosition([halfWidth + halfOffsetX, 0, halfOffsetZ]);
        this._rightWall.setScale([this.scale[2], this.scale[1], 1])
            .setPosition([- halfWidth + halfOffsetX, 0, halfOffsetZ]);
        this._ceiling.setScale([this.scale[0], this.scale[2], 1])
            .setPosition([halfOffsetX, halfHeight, halfOffsetZ]);
        this._floor.setScale([this.scale[0], this.scale[2], 1])
            .setPosition([halfOffsetX, - halfHeight, halfOffsetZ]);

    }

    update() {

        // update gltf scale
        this.gltf.setScale(this._scale);
        this.updateBoundaries();

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const halfOffsetX = this._offsetX * .5 * this.scale[0];
        const halfOffsetZ = this._offsetZ * .5 * this.scale[2];
        const tableTopWidth = this._tableTopWidth * this.scale[0];
        const tableTopHeight = this._tableTopHeight * this.scale[1];
        const tableTopDepth = this._tableTopDepth * this.scale[2];
        const tableBottomHeight = this._tableBottomHeight * this.scale[1];
        const tableBottomWidth = this._tableBottomWidth * this.scale[0];
        const tableBottomDepth = this._tableBottomDepth * this.scale[2];
        const tableMiddleWidth = this._tableMiddleWidth * this.scale[0];
        const tableMiddleHeight = this._tableMiddleHeight * this.scale[1];
        const tableMiddleDepth = this._tableMiddleDepth * this.scale[2];
        const tablePosX = this._tablePosX * this.scale[0] + halfOffsetX;
        const tablePosZ = this._tablePosZ * this.scale[2] + halfOffsetZ;
        const tableTopPosY = this._tableTopPosY * this.scale[1];
        const tableBottomPosY = this._tableBottomPosY * this.scale[1];
        const tableMiddlePosY = this._tableMiddlePosY * this.scale[1];
        const tableFootWidth = this._tableFootWidth * this.scale[0];
        const tableFootHeight = tableBottomHeight
        const tableFootDepth = this._tableFootDepth * this.scale[2];
        const tableFootPosXOffset = (tableBottomWidth - tableFootWidth) * .5;
        const tableFootPosZOffset = (tableBottomDepth - tableFootDepth) * .5;

        let { physics: { mass = 0, restitution = 0, friction = 0 } = {} } = this.specs;

        const tableTopBoxGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: tableTopWidth, height: tableTopHeight, depth: tableTopDepth });
        const tableTopBoxMesh = new MeshDesc(tableTopBoxGeo);
        tableTopBoxMesh.name = `${this.name}_tableTopBox_mesh_desc`;
        tableTopBoxMesh.position.set(tablePosX, tableTopPosY, tablePosZ);
        tableTopBoxMesh.userData.physics = { mass, restitution, friction };

        const tableMiddleBoxGeo = new GeometryDesc({type: BOX_GEOMETRY, width: tableMiddleWidth, height: tableMiddleHeight, depth: tableMiddleDepth});
        const tableMiddleBoxMesh = new MeshDesc(tableMiddleBoxGeo);
        tableMiddleBoxMesh.name = `${this.name}_tableMiddleBox_mesh_desc`;
        tableMiddleBoxMesh.position.set(tablePosX, tableMiddlePosY, tablePosZ);
        tableMiddleBoxMesh.userData.physics = { mass, restitution, friction };

        const tableFootFLGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: tableFootWidth, height: tableFootHeight, depth: tableFootDepth });
        const tableFootFLMesh = new MeshDesc(tableFootFLGeo);
        tableFootFLMesh.name = `${this.name}_tableFootFL_mesh_desc`;
        tableFootFLMesh.position.set(tablePosX + tableFootPosXOffset, tableBottomPosY, tablePosZ + tableFootPosZOffset);
        tableFootFLMesh.userData.physics = { mass: mass / 8, restitution, friction };

        const tableFootFRGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: tableFootWidth, height: tableFootHeight, depth: tableFootDepth });
        const tableFootFRMesh = new MeshDesc(tableFootFRGeo);
        tableFootFRMesh.name = `${this.name}_tableFootFR_mesh_desc`;
        tableFootFRMesh.position.set(tablePosX - tableFootPosXOffset, tableBottomPosY, tablePosZ + tableFootPosZOffset);
        tableFootFRMesh.userData.physics = { mass: mass / 8, restitution, friction };

        const tableFootBLGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: tableFootWidth, height: tableFootHeight, depth: tableFootDepth });
        const tableFootBLMesh = new MeshDesc(tableFootBLGeo);
        tableFootBLMesh.name = `${this.name}_tableFootBL_mesh_desc`;
        tableFootBLMesh.position.set(tablePosX + tableFootPosXOffset, tableBottomPosY, tablePosZ - tableFootPosZOffset);
        tableFootBLMesh.userData.physics = { mass: mass / 8, restitution, friction };

        const tableFootBRGeo = new GeometryDesc({ type: BOX_GEOMETRY, width: tableFootWidth, height: tableFootHeight, depth: tableFootDepth });
        const tableFootBRMesh = new MeshDesc(tableFootBRGeo);
        tableFootBRMesh.name = `${this.name}_tableFootBR_mesh_desc`;
        tableFootBRMesh.position.set(tablePosX - tableFootPosXOffset, tableBottomPosY, tablePosZ - tableFootPosZOffset);
        tableFootBRMesh.userData.physics = { mass: mass / 8, restitution, friction };

        this.rapierInstances.push(
            tableTopBoxMesh,
            tableMiddleBoxMesh,
            tableFootFLMesh,
            tableFootFRMesh,
            tableFootBLMesh,
            tableFootBRMesh
        );

        this._frontWall.mesh.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this._backWall.mesh.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this._leftWall.mesh.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this._rightWall.mesh.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this._ceiling.mesh.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this._floor.mesh.userData.physics = { mass, restitution, friction, manuallyLoad: true };

        this.rapierInstances.push(
            this._frontWall.mesh,
            this._backWall.mesh,
            this._leftWall.mesh,
            this._rightWall.mesh,
            this._ceiling.mesh,
            this._floor.mesh
        );



    }

}

export { HandCraftedStudio };