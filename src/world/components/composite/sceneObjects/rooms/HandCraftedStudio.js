import { Vector3 } from 'three';
import { LightingSceneBase } from "../LightingSceneBase";
import { GLTFModel, GeometryDesc, MeshDesc } from '../../../Models';
import { BOX_GEOMETRY } from '../../../utils/constants';

const GLTF_SRC = 'scene_objects/rooms/hand_crafted_studio_1-2k/hand_crafted_studio.gltf';
const gltfIgnoreShadowCastList = [    
    'Blank_Paper',
    'Blank_Paper001',
    'Coffee_Stain',
    'Wall_Leak',
    'Wall_Tape'
]

class HandCraftedStudio extends LightingSceneBase {

    _width = 4.67;
    _height = 3.21;
    _depth = 4.57;
    _roomHalfHeight = this._height * 0.5;
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
    _tableTopPosY = - .72488 + this._roomHalfHeight;
    _tableBottomPosY = this._tableTopPosY - (this._tableBottomHeight + this._tableTopHeight) * .5;
    _tableMiddlePosY = this._tableTopPosY - (this._tableTopHeight + this._tableMiddleHeight) * .5;
    _tableFootWidth = .1;
    _tableFootDepth = .1;

    _mainWall;
    _mainRear;
    _floor;

    constructor(specs) {

        super(specs);

        const { name, scale = [1, 1, 1] } = specs;
        const { src = GLTF_SRC, receiveShadow = true, castShadow = true } = specs;

        this._scale = new Array(...scale);

        // gltf model
        const gltfSpecs = { name: `${name}_gltf_model`, src, receiveShadow, castShadow, shadowCastIgnoreList: gltfIgnoreShadowCastList, needAdjustPosition: false };
        this.GLTFs.push(new GLTFModel(gltfSpecs));

        this.addGLTFs();

    }
    
    async init() {

        await super.init();

        const lampBulb = this.GLTFs[0].meshes.find(m => m.name === 'Lamp_Bulb_Low');
        lampBulb.material = lampBulb.material.clone();
        lampBulb.alwaysVisible = true;

        const ledBulb = this.GLTFs[0].meshes.find(m => m.name === 'LED_Bulb_Low');
        ledBulb.material = ledBulb.material.clone();
        ledBulb.alwaysVisible = true;

        this._floor = this.GLTFs[0].getChildByName('Room_Floor_Low');
        this._mainWall = this.GLTFs[0].getChildByName('Room_Main_Wall_Low');
        this._mainRear = this.GLTFs[0].getChildByName('Room_Main_Rear_Low');

        this.bloomObjects = [lampBulb, ledBulb];
        this.setBloomObjectsFather();
        this.setBloomObjectsLayers();
        this.setLightingMap('lamp', {
            bloomObject: lampBulb,
            intensity: 0,
            bloomIntensity: 3,
            lightObject: null,
            position: new Vector3(- 1.96, this._roomHalfHeight - 0.25, - 1.67),
            currentPosition: new Vector3()
        });
        this.setLightingMap('led', {
            bloomObject: ledBulb,
            intensity: 0,
            bloomIntensity: 3,
            lightObject: null,
            position: new Vector3(- 1.53, this._roomHalfHeight + 0.23, - 2.25),
            currentPosition: new Vector3()
        });
        this.update(false);

    }

    update(needToUpdateLight = true) {

        // update gltfs scale
        for (let i = 0, il = this.GLTFs.length; i < il; i++) {

            this.GLTFs[i].setScale(this._scale);

        }

        this.updateLightingMap(needToUpdateLight);

    }

    addRapierInstances(needClear = true) {

        if (needClear) this.clearRapierInstances();

        const tableTopWidth = this._tableTopWidth * this.scale[0];
        const tableTopHeight = this._tableTopHeight * this.scale[1];
        const tableTopDepth = this._tableTopDepth * this.scale[2];
        const tableBottomHeight = this._tableBottomHeight * this.scale[1];
        const tableBottomWidth = this._tableBottomWidth * this.scale[0];
        const tableBottomDepth = this._tableBottomDepth * this.scale[2];
        const tableMiddleWidth = this._tableMiddleWidth * this.scale[0];
        const tableMiddleHeight = this._tableMiddleHeight * this.scale[1];
        const tableMiddleDepth = this._tableMiddleDepth * this.scale[2];
        const tablePosX = this._tablePosX * this.scale[0];
        const tablePosZ = this._tablePosZ * this.scale[2];
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

        this._mainWall.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this._mainRear.userData.physics = { mass, restitution, friction, manuallyLoad: true };
        this._floor.userData.physics = { mass, restitution, friction, manuallyLoad: true };

        this.rapierInstances.push(
            this._mainWall,
            this._mainRear,
            this._floor
        );

    }

}

export { HandCraftedStudio };