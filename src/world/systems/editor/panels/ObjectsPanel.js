/* eslint-disable no-unused-vars */
import { GLOBALS } from '../../globals.js';
import { GUI_CONFIG, GUI_OPTIONS, GUI_MEASURES } from '../editorConfig.js';
import { PHYSICS_TYPES } from '../../../components/utils/constants.js';
import { isRapierObject, noPhysicsObject, objectFilter, objectFilter2, objectFilter3, objectFilter4, objectFilter5 } from '../../../components/utils/objectHelper.js';
import Panel from './Panel.js';

// $scope must be set to Editor instance when called
export default class ObjectsPanel extends Panel {

    folder = null;
    
    constructor(scope) {

        super(scope);

    }

    init() {

        // initialize objects panel
        this.scope.panel_objects = this.guiMaker.addGui({
            title: GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL,
            styles: {
                right: '250px'
            }
        });

        this.folders = this.guiMaker.folders[GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL];
        this.controllers = this.guiMaker.controllers[GUI_CONFIG.PANEL_TITLES.OBJECTS_CONTROL];

    }

    buildPanel(objects = []) {

        const { $scope, $scene, folders, controllers } = this.getLocalDomain();

        for (let i = 0, il = objects.length; i < il; i++) {

            const object = objects[i];
            this.folder = $scope.panel_objects.addFolder(object.name);

            const postChangeFn = () => {

                if (object.isTofu) {

                    object.father.updateAccessories();

                } else if (object.isWeapon) {

                    // weapon post change

                } else if (object.isGroup) {

                    object.father.updateOBBs?.();
                    object.father.updateRay?.();

                    object.father.updateLightObjects?.();

                } else if (object.isMesh) {

                    object.father?.updateRay?.();
                    object.father?.updateOBB?.();

                }

            }

            // 1. basic position controls
            this.buildPositionControls(object, postChangeFn);

            // 2. rotation.y for simple physics objects
            this.buildSimplePhysicsRotationControls(object, postChangeFn);

            // 3. rotation for rapier physics objects
            this.buildRapierPhysicsRotationControls(object, postChangeFn);

            // 4. LWall controls
            this.buildLWallControls(object, postChangeFn);

            // 5. scale controls
            this.buildScaleControls(object, postChangeFn);

            // 6. plane controls
            this.buildPlaneControls(object, postChangeFn);

            // 7. rotation controls for floor and ceiling in simple physics
            this.buildFloorCeilingRotationControls(object);

            // 8. rotation controls for area and water
            this.buildAreaWaterRotationControls(object);

            // 9. water and water cube controls
            this.buildWaterControls(object);

            // 10. area contorls
            this.buildAreaControls(object);

            // 11. standard material properties controls
            this.buildStandardMaterialControls(object);

        }

    }

    /**
     * 1. basic position controls
     */
    buildPositionControls(object, changeFn) {

        const steps = !object.isWeapon ? GUI_MEASURES.PICKED_NUMBER_STEPS : GUI_MEASURES.PICKED_WEAPON_NUMBER_STEPS;
        const min = - GUI_MEASURES.DEFALUT_GRID_WIDTH;
        const max = GUI_MEASURES.DEFALUT_GRID_WIDTH;

        this.folder.add(object.position, 'x', min, max, steps)
            .name('position.x')
            .listen()
            .onChange(() => changeFn());

        this.folder.add(object.position, 'y', min, max, steps)
            .name('position.y')
            .listen()
            .onChange(() => changeFn());

        this.folder.add(object.position, 'z', min, max, steps)
            .name('position.z')
            .listen()
            .onChange(() => changeFn());

    }

    /**
     * 2. rotation.y for simple physics objects
     */
    buildSimplePhysicsRotationControls(object, changeFn) {

        if (!object.isTofu && !object.isWeapon && !object.isSceneModel &&
            !object.father.isFloor && !object.father.isCeiling &&
            !object.father.isArea &&
            !object.father.isWater && !object.father.isWaterCube &&
            !object.father.isRotatableLadder &&
            GLOBALS.CURRENT_PHYSICS === PHYSICS_TYPES.SIMPLE
        ) {

            const steps = GUI_MEASURES.PICKED_ANGLE_STEPS;
            const min = - GUI_MEASURES.MAX_ANGLE;
            const max = GUI_MEASURES.MAX_ANGLE;

            this.folder.add(object.father, 'rotationYDegree', min, max, steps)
                .name('rotation.y')
                .listen()
                .onChange(() => changeFn());

        }

    }

    /**
     * 3. rotation for rapier physics objects
     */
    buildRapierPhysicsRotationControls(object, changeFn) {

        if (GLOBALS.CURRENT_PHYSICS === PHYSICS_TYPES.RAPIER && 
            (isRapierObject(object.father) || noPhysicsObject(object.father))
        ) {

            const steps = GUI_MEASURES.PICKED_ANGLE_STEPS;
            const min = - GUI_MEASURES.MAX_ANGLE;
            const max = GUI_MEASURES.MAX_ANGLE;

            this.folder.add(object.father, 'rotationXDegree', min, max, steps)
                .name('rotation.x')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(object.father, 'rotationYDegree', min, max, steps)
                .name('rotation.y')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(object.father, 'rotationZDegree', min, max, steps)
                .name('rotation.z')
                .listen()
                .onChange(() => changeFn());

        }

    }

    /**
     * 4. LWall controls
     */
    buildLWallControls(object, changeFn) {

        if (objectFilter3(object.father)) {

            this.folder.add(object.father, 'thickSPercentage', 0, 100, .1)
                .name('thickness_S %')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(object.father, 'thickTPercentage', 0, 100, .1)
                .name('thickness_T %')
                .listen()
                .onChange(() => changeFn());

        }

    }

    /**
     * 5. scales controls
     */
    buildScaleControls(object, changeFn) {

        const min = GUI_MEASURES.SCALE_MIN;
        const max = GUI_MEASURES.SCALE_MAX;
        const steps = GUI_MEASURES.PICKED_NUMBER_STEPS;
        const target = object.father || object.sceneObject;

        if (objectFilter(target)) {

            this.folder.add(target, 'scaleX', min, max, steps)
                .name('scale.x')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(target, 'scaleY', min, max, steps)
                .name('scale.y')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(target, 'scaleZ', min, max, steps)
                .name('scale.z')
                .listen()
                .onChange(() => changeFn());

        } else if (objectFilter2(target)) {  // cylinder shape like

            this.folder.add(target, 'scaleR', min, max, steps)
                .name('scale.r')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(target, 'scaleY', min, max, steps)
                .name('scale.y')
                .listen()
                .onChange(() => changeFn());

        }

    }

    /**
     * 6. plane controls
     */
    buildPlaneControls(object, changeFn) {

        const target = object.father;
        let min, max, steps;

        if (objectFilter4(target)) {

            if (target.material) {

                min = - GUI_MEASURES.MAX_ANGLE;
                max = GUI_MEASURES.MAX_ANGLE;
                steps = GUI_MEASURES.PICKED_ANGLE_STEPS;

                this.folder.add(target, 'rotationTDegree', min, max, steps)
                    .name('rotationT')
                    .listen()
                    .onChange(() => changeFn());

                min = GUI_MEASURES.SCALE_MIN;
                max = GUI_MEASURES.SCALE_MAX;
                steps = GUI_MEASURES.PICKED_NUMBER_STEPS;

                this.folder.add(target, 'repeatU', min, max, steps)
                    .name('repeatU')
                    .listen()
                    .onChange(() => changeFn());

                this.folder.add(target, 'repeatV', min, max, steps)
                    .name('repeatV')
                    .listen()
                    .onChange(() => changeFn());

            }

            this.folder.add(target, 'scaleX', min, max, steps)
                .name('scale.x')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(target, 'scaleY', min, max, steps)
                .name('scale.y')
                .listen()
                .onChange(() => changeFn());

        }

    }

    /**
     * 7. rotation controls for floor and ceiling in simple physics
     */
    buildFloorCeilingRotationControls(object) {

        if (GLOBALS.CURRENT_PHYSICS === PHYSICS_TYPES.SIMPLE) {

            const target = object.father;
            const min = - GUI_MEASURES.MAX_ANGLE;
            const max = GUI_MEASURES.MAX_ANGLE;
            const steps = GUI_MEASURES.PICKED_ANGLE_STEPS;
            const changeFn = () => {

                target.updateOBB();

            }

            if (target.isFloor) {

                this.folder.add(target, 'rotationZDegree', min, max, steps)
                    .name('rotation.z')
                    .listen()
                    .onChange(() => changeFn());

            }

             if (target.isCeiling) {

                if (target.isOBB) {

                    this.folder.add(target, 'rotationZDegree', min, max, steps)
                        .name('rotation.z')
                        .listen()
                        .onChange(() => changeFn());

                } else {

                    this.folder.add(target, 'rotationXDegree', min, max, steps)
                        .name('rotation.x')
                        .listen();

                    this.folder.add(target, 'rotationYDegree', min, max, steps)
                        .name('rotation.y')
                        .listen();

                    this.folder.add(target, 'rotationZDegree', min, max, steps)
                        .name('rotation.x')
                        .listen();

                }

             }

        }

    }

    /**
     * 8. rotation controls for area and water
     */
    buildAreaWaterRotationControls(object) {

        const target = object.father;
        if (target && (target.isArea || target.isWater || target.isWaterCube)) {

            const min = - GUI_MEASURES.MAX_ANGLE;
            const max = GUI_MEASURES.MAX_ANGLE;
            const steps = GUI_MEASURES.PICKED_ANGLE_STEPS;
            const changeFn = () => {

                target.updateOBB?.();
                target.updateOBBs?.();

            };

            this.folder.add(target, 'rotationXDegree', min, max, steps)
                .name('rotation.x')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(target, 'rotationYDegree', min, max, steps)
                .name('rotation.y')
                .listen()
                .onChange(() => changeFn());

            this.folder.add(target, 'rotationYDegree', min, max, steps)
                .name('rotation.y')
                .listen()
                .onChange(() => changeFn());

        }

    }

    /**
     * 9. water and water cube controls
     */
    buildWaterControls(object) {

        const target = object.father;
        if (target && (target.isWater || target.isWaterCube)) {

            const min = GUI_MEASURES.SCALE_MIN;
            const max = GUI_MEASURES.SCALE_MAX;
            const steps = GUI_MEASURES.PICKED_NUMBER_STEPS;

            this.folder.add(target, 'scaleX', min, max, steps)
                .name('scale.x')
                .listen();

            this.folder.add(target, 'scaleY', min, max, steps)
                .name('scale.y')
                .listen();

            if (target.isWaterCube) {

                this.folder.add(target, 'scaleZ', min, max, steps)
                    .name('scale.z')
                    .listen();

            }

            this.folder.addColor(target, 'waterColor', 255)
                .name('color')
                .listen()
                .changeFn = event => target.waterColor = event.value;

            this.folder.add(target, 'waterScale', 1, 10, steps)
                .name('waterScale')
                .listen();

            this.folder.add(target, 'waterFlowX', - 1, 1, steps)
                .name('flowX')
                .listen();

            this.folder.add(target, 'waterFlowY', - 1, 1, steps)
                .name('flowY')
                .listen();

        }

    }

    /**
     * 10. area controls
     */
    buildAreaControls(object) {

        const target = object.father;
        if (target && target.isArea) {

            let min = GUI_MEASURES.SCALE_MIN;
            let max = GUI_MEASURES.SCALE_MAX;
            let steps = GUI_MEASURES.PICKED_NUMBER_STEPS;

            this.folder.add(target, 'scaleX', min, max, steps)
                .name('scale.x')
                .listen();

            this.folder.add(target, 'scaleX', min, max, steps)
                .name('scale.Y')
                .listen();

            this.folder.add(target, 'scaleX', min, max, steps)
                .name('scale.z')
                .listen();

            min = - GUI_MEASURES.DEFALUT_GRID_WIDTH;
            max = GUI_MEASURES.DEFALUT_GRID_WIDTH;

            const camera_folder = this.folder.addFolder('Camera');
            camera_folder.add(target, 'cameraPositionX', min, max, steps)
                .name('position.x')
                .listen();

            camera_folder.add(target, 'cameraPositionY', min, max, steps)
                .name('position.y')
                .listen();

            camera_folder.add(target, 'cameraPositionZ', min, max, steps)
                .name('position.z')
                .listen();

            camera_folder.add(target, 'cameraTargetX', min, max, steps)
                .name('target.x')
                .listen();

            camera_folder.add(target, 'cameraTargetY', min, max, steps)
                .name('target.y')
                .listen();

            camera_folder.add(target, 'cameraTargetZ', min, max, steps)
                .name('target.z')
                .listen();

        }

    }

    /**
     * standard material properties controls
     */
    buildStandardMaterialControls(object) {

        
        if (objectFilter5(object.father) || (object.isMesh && object.material?.isMeshStandardMaterial)) {

            const target = object.isMesh && object.material?.isMeshStandardMaterial ? object.material : object.father;
            const steps = GUI_MEASURES.PICKED_NUMBER_STEPS;
            this.folder.add(target, 'roughness', 0, 1, steps)
                .name('roughness')
                .listen();

            this.folder.add(target, 'metalness', 0, 1, steps)
                .name('metalness')
                .listen();

        }

    }

};