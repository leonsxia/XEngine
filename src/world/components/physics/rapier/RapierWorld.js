import { Quaternion, Vector3 } from 'three';
import { getShape, RapierPhysics } from './RapierPhysics';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';
import { Logger } from '../../../systems/Logger';

const CHARACTER_CONTROLLER = 'characterController';
const STAIR_OFFSET_MAX = .3;
const DOWN_RAY_LENGTH = .52;
const PICKABLE_DOWN_RAY_LENGTH = 1;

const _v1 = new Vector3();
const _v2 = new Vector3();
const _q1 = new Quaternion();
const _down = new Vector3(0, -1, 0);

const DEBUG = false;

class RapierWorld {

    isRapierWorld = true;

    engine = new RapierPhysics();

    players = [];
    enemies = [];
    activePlayers = [];
    activeEnemies = [];

    compounds = [];
    walls = [];
    floors = [];
    ceilings = [];
    terrains = [];

    _currentRoom;
    attachTo;

    _rapierHelper;

    isActive = true;

    _debug = false;

    #logger = new Logger(DEBUG, 'RapierWorld');

    constructor({ players = [], enemies = [], attachTo }) {

        this.players = players;
        this.enemies = enemies;
        this.attachTo = attachTo;

        // bind event
        for (let i = 0, il = players.length; i < il; i++) {

            const player = players[i];            
            if (player.isCustomizedCombatTofu) {

                const container = player.rapierContainer;
                if (container) {

                    container.onBeforeActivesChanged.push(this.onBeforeTofuContainerChanged.bind(this));
                    container.onActivesChanged.push(this.onTofuContainerChanged.bind(this));

                }

                player.onDisposed.push(this.onTofuDisposed.bind(this));                
                player.addRapierInstances();
                this.addCharacterController(player);
                this.bindObjectSyncEvents(player);

            }

        }

        for (let i = 0, il = enemies.length; i < il; i++) {

            const enemy = enemies[i];            
            if (enemy.isCustomizedCreatureTofu) {

                const container = enemy.rapierContainer;
                if (container) {

                    container.onBeforeActivesChanged.push(this.onBeforeTofuContainerChanged.bind(this));
                    container.onActivesChanged.push(this.onTofuContainerChanged.bind(this));

                }

                enemy.onDisposed.push(this.onTofuDisposed.bind(this));
                enemy.addRapierInstances();
                this.addCharacterController(enemy);
                this.bindObjectSyncEvents(enemy);

            }

        }        

    }

    get scene() {

        return this.attachTo.scene;

    }

    initPhysics(room) {

        const {
            compounds,
            walls, floors, ceilings,
            terrains 
        } = room;

        this.compounds = compounds;
        this.walls = walls;
        this.floors = floors;
        this.ceilings = ceilings;
        this.terrains = terrains;

        this._currentRoom = room.name;

        this.engine.removeAll();
        this.cleanupAvatars();
        this.setupWorld();

        if (this._debug) this.updateDebugger();

    }

    updateDebugger() {

        if (this._rapierHelper) this.scene.remove(this._rapierHelper);

        this._rapierHelper = new RapierHelper(this.engine.world);
        this._rapierHelper.update();
        this.attachTo.scene.add(this._rapierHelper);

    }

    showDebugger(s) {

        if (s) {

            if (!this._rapierHelper) {
                
                this._rapierHelper = new RapierHelper(this.engine.world);
                this._rapierHelper.update();
            
            }
            this.attachTo.scene.add(this._rapierHelper);

        } else {

            if (this._rapierHelper) this.attachTo.scene.remove(this._rapierHelper);

        }

        this._debug = s;

    }

    addCharacterController(avatar) {

        const meshDesc = avatar.rapierContainer.getInstanceByName(CHARACTER_CONTROLLER);
        const userData = meshDesc.userData;
        const { characterControllerSettings: { 
            offset = 0.01, snapToGroundDistance = 0.2, slideEnabled = true,
            maxSlopeClimbAngle = 50, minSlopeSlideAngle = 45,
            autoStepMaxHeight = STAIR_OFFSET_MAX, autoStepMinWidth = 0.2
        } = {} } = avatar.specs;

        const characterController = this.engine.world.createCharacterController(offset);
        characterController.setApplyImpulsesToDynamicBodies(true);
        characterController.setCharacterMass(userData.physics.mass ?? 60);
        characterController.enableSnapToGround(snapToGroundDistance);
        characterController.setSlideEnabled(slideEnabled);  // rapier default is true
        characterController.setMaxSlopeClimbAngle(maxSlopeClimbAngle * Math.PI / 180);
        characterController.setMinSlopeSlideAngle(minSlopeSlideAngle * Math.PI / 180);
        characterController.enableAutostep(autoStepMaxHeight, autoStepMinWidth, true);

        userData.physics.controller = characterController;

    }

    setupWorld() {

        this.addDefaultWalls();
        this.addCompounds();
        this.addFloors();
        this.addCeilings();
        this.addTerrains();

        // add current room objects and scene objects
        this.engine.addScene(this.attachTo.currentRoom.group);
        for (let i = 0, il = this.attachTo.sceneObjects.length; i < il; i++) {

            const sceneObj = this.attachTo.sceneObjects[i];
            const object3D = sceneObj.group ?? sceneObj.mesh;
            if (object3D) {

                this.engine.addScene(sceneObj.group ?? sceneObj.mesh);

            }

        }

    }

    addDefaultWalls() {

        for (let i = 0, il = this.walls.length; i < il; i++) {

            const wall = this.walls[i];
            const { physics: { restitution = 0, friction = 0 } = {} } = wall.specs;
            wall.setupRapierPhysics({ mass: 0, restitution, friction });
            this.bindObjectSyncEvents(wall);

        }

    }

    addCompounds() {

        for (let i = 0, il = this.compounds.length; i < il; i++) {

            const compound = this.compounds[i];
            this.bindObjectSyncEvents(compound);
            compound.addRapierInstances();
            this.engine.addCompoundMesh(compound.group, compound.rapierInstances);

        }

    }

    addFloors() {

        for (let i = 0, il = this.floors.length; i < il; i++) {

            const floor = this.floors[i];
            const { physics: { restitution = 0, friction = 0 } = {} } = floor.specs;

            floor.setupRapierPhysics({ mass: 0, restitution, friction });
            this.bindObjectSyncEvents(floor);            

        }

    }

    addCeilings() {

        for (let i = 0, il = this.ceilings.length; i < il; i++) {

            const ceiling = this.ceilings[i];
            const { physics: { restitution = 0, friction = 0 } = {} } = ceiling.specs;

            ceiling.setupRapierPhysics({ mass: 0, restitution, friction });
            this.bindObjectSyncEvents(ceiling);            

        }

    }

    addTerrains() {

        for (let i = 0, il = this.terrains.length; i < il; i++) {

            const terrain = this.terrains[i];
            // const { width, height, widthSegments, heightSegments } = terrain.geometry.parameters;
            // const { heights } = terrain.geometry.userData;
            const { physics: { restitution = 0, friction = 0 } = {} } = terrain.specs;
            
            terrain.setupRapierPhysics({ mass: 0, restitution, friction });
            // this.engine.addHeightfield(terrain.mesh, heightSegments, widthSegments, new Float32Array(heights), { x: width, y: 1, z: height });
            // terrain.addRapierInfo();

            this.bindObjectSyncEvents(terrain);

        }

    }

    setScenePickables(...objects) {

        for (let i = 0, il = objects.length; i < il; i++) {

            const obj = objects[i];
            const idx = this.compounds.findIndex(o => o === obj);

            if (!obj.isPicked && obj.currentRoom === this._currentRoom && obj.count >= 1) {

                if (idx === -1) {

                    this.compounds.push(obj);
                    this.bindObjectSyncEvents(obj);
                    obj.addRapierInstances();
                    this.onObjectAdded(obj);

                }

            } else if (idx > -1) {

                this.compounds.splice(idx, 1);
                this.onObjectRemoved(obj);
                // make sure it won't be added again when resetScene or loadScene
                obj.clearRapierEvents();

            }

        }    

    }

    // events
    onBeforeTofuContainerChanged(rapierContainer) {

        if (!rapierContainer) return;
        for (let i = 0, il = rapierContainer.actives.length; i < il; i++) {

            const instance = rapierContainer.actives[i];
            if (instance.name !== CHARACTER_CONTROLLER) {

                this.engine.removeMesh(instance);

            } else {

                const { collider } = instance.userData.physics;
                if (collider) {
                    
                    this.engine.removeCollider(collider);
                    instance.userData.physics.collider = undefined;

                }
            
            }

        }        

    }

    onTofuContainerChanged(rapierContainer) {

        if (!rapierContainer) return;
        for (let i = 0, il = rapierContainer.actives.length; i < il; i++) {

            const instance = rapierContainer.actives[i];
            if (instance.name !== CHARACTER_CONTROLLER) {

                this.engine.addMesh(instance);

            } else {

                const userData = instance.userData;
                if (userData.physics.collider) return;

                // re-create character collider
                const avatar = rapierContainer.attachTo;
                const geometryDesc = instance.geometry;
                const colliderDesc = getShape(geometryDesc, rapierContainer.scale);
                avatar.getWorldPosition(_v1);
                colliderDesc.setTranslation(..._v1);
                userData.physics.collider = this.engine.world.createCollider(colliderDesc);
                userData.physics.collider.name = `${avatar.name}_character_controller_collider`;

            }

        }

    }

    onTofuDisposed(tofu) {

        const findPlayerIdx = this.activePlayers.indexOf(tofu);
        const findEnemyIdx = this.activeEnemies.indexOf(tofu);

        if (findPlayerIdx > -1) {

            this.removeActivePlayers(tofu.name);

        }

        if (findEnemyIdx > -1) {

            this.removeActiveEnemies(tofu.name);

        }

    }

    onObjectRemoved(object) {

        if (object.isTofu) {
            
            this.onBeforeTofuContainerChanged(object.rapierContainer);

        } else if (object.isObstacleBase || object.isInWallObjectBase) {
            
            this.engine.removeMesh(object.group);

        } else {

            this.engine.removeMesh(object.mesh);

        }

    }

    onObjectAdded(object) {

        if (object.isTofu) {

            this.onTofuContainerChanged(object.rapierContainer);

        } else if (object.isObstacleBase || object.isInWallObjectBase) {
            
            this.engine.addCompoundMesh(object.group, object.rapierInstances);

        } else {

            this.engine.addMesh(object.mesh);

        }

    }

    bindObjectSyncEvents(object) {

        if (!object) return;

        object.onRapierInstanceRemoved = this.onObjectRemoved.bind(this);
        object.onRapierInstanceAdded = this.onObjectAdded.bind(this);

    }

    addActivePlayers(...names) {

        names.forEach(name => {

            const find = this.players.find(p => p.name === name);
            const idx = this.activePlayers.indexOf(find);

            if (idx === -1) {

                this.activePlayers.push(find);
                this.onTofuContainerChanged(find.rapierContainer);

            }

            // make sure die action is over
            if (find.dead && !find.AWS.isLooping) find.isActive = false;

        });

    }

    removeActivePlayers(...names) {

        names.forEach((name) => {

            const idx = this.activePlayers.findIndex(active => active.name === name);

            if (idx > -1) {
                
                const player = this.activePlayers[idx];
                this.onBeforeTofuContainerChanged(player.rapierContainer);
                this.activePlayers.splice(find, 1);
            
            }

        });

    }

    addActiveEnemies(...names) {

        names.forEach(name => {

            const find = this.enemies.find(e => e.name === name);
            const idx = this.activeEnemies.indexOf(find);

            if (idx === -1) {
                
                this.activeEnemies.push(find);
                this.onTofuContainerChanged(find.rapierContainer);
            
            }

            // make sure die action is over
            if (find.dead && !find.AWS.isLooping) find.isActive = false;

        });

    }

    removeActiveEnemies(...names) {

        names.forEach((name) => {

            const idx = this.activeEnemies.findIndex(active => active.name === name);

            if (idx > -1) {
                
                const enemy = this.activeEnemies[idx];
                this.onBeforeTofuContainerChanged(enemy.rapierContainer);
                this.activeEnemies.splice(idx, 1);
            
            }

        });

    }

    // changeRoom will remove all dynamic and fixed bodies from rapier physics world when initPhysics, 
    // so need to remove dead player/enemies from actives first,
    // then they will be added again after initPhysics
    cleanupAvatars() {

        for (let i = 0, il = this.players.length; i < il; i++) {

            const player = this.players[i];
            if (player.dead) {

                const idx = this.activePlayers.indexOf(player);
                if (idx > -1) {

                    this.activePlayers.splice(idx, 1);

                }

            }

        }

        for (let i = 0, il = this.enemies.length; i < il; i++) {

            const enemy = this.enemies[i];
            if (enemy.dead) {

                const idx = this.activeEnemies.indexOf(enemy);
                if (idx > -1) {

                    this.activeEnemies.splice(idx, 1);

                }

            }

        }

    }

    tick(delta) {

        if (delta > 0.077) return;  // lost frame when fps lower than 13fps

        if (this._rapierHelper && this._debug) this._rapierHelper.update();

        this.playerTick(delta);
        this.enemyTick(delta);
        this.fixedItemTick(delta);

        this.engine.step(delta);

    }

    fixedItemTick(delta) {

        for (let i = 0, il = this.compounds.length; i < il; i++) {

            const item = this.compounds[i];
            if (item.isPickableItem && !item.group.isPicked) {
                
                const { body, collider } = item.group.userData.physics;
                const position = body.translation();

                 // check on land
                const maxToi = item.height * PICKABLE_DOWN_RAY_LENGTH;
                _v1.set(position.x, position.y, position.z);    // origin

                let isLanded = false;

                // collect on land points and return the highest one
                const onLandPoints = [];

                const ray = new this.engine.RAPIER.Ray(_v1, _down);
                const hit = this.engine.world.castRay(ray, maxToi, false, null, null, null, null,                     
                    (col) => collider.indexOf(col) === -1
                );

                if (hit) {

                    // The hit point is obtained from the ray's origin and direction: `origin + dir * timeOfImpact`.
                    onLandPoints.push(_v1.add(_v2.copy(_down).multiplyScalar(hit.timeOfImpact)));
                    item.onLandPointsAdjust(onLandPoints);
                    isLanded = true;

                }

                item.isInAir = !isLanded;

                if (item.isInAir) {

                    item.tickFall(delta);

                } else {

                    item.resetFallingState();

                }

                item.syncRapierWorld(true);

            }

        }

    }

    playerTick(delta) {

        this.avatarTick(this.activePlayers, delta);

    }

    enemyTick(delta) {

        this.avatarTick(this.activeEnemies, delta);

    }

    avatarTick(avatars = [], delta) {

        const activeAvatars = avatars.filter(a => !a.group.isPicked && a.isActive);
        for (let i = 0, il = activeAvatars.length; i < il; i++) {

            const avatar = activeAvatars[i];
            const instance = avatar.rapierContainer.getInstanceByName(CHARACTER_CONTROLLER);
            const { physics: { collider, controller } } = instance.userData;
            const position = collider.translation();

            let rotationTicked = false;
            if (!avatar.isInAir) {
                
                avatar.tickRotateActions(delta);
                rotationTicked = true;

            }

            const moveVector = avatar.tickRaw(delta);

            // for avatar falling down check
            let isLanded = false;

            // collect on land points and return the highest one
            const onLandPoints = [];

            if (!avatar.isClimbingUp) {

                // terrain check
                if (this.terrains.length > 0) {

                    avatar.updateRayLength('terrain');

                }
                
                // check on land
                const maxToi = avatar.height * DOWN_RAY_LENGTH;
                _v1.set(position.x, position.y, position.z);    // origin
                // take terrain into account, `undefined` will not see as `false` in rapier!!!
                const { hit, ray } = this.engine.checkRayHitCollider(_v1, _down, maxToi, collider, (collider) => collider.isTerrain || false);

                if (hit && (
                    !controller.computedGrounded() || 
                    hit.timeOfImpact < avatar.height * .5   // avoid falling into ground
                )) {

                    // The hit point is obtained from the ray's origin and direction: `origin + dir * timeOfImpact`.
                    onLandPoints.push(ray.pointAt(hit.timeOfImpact)); // Same as: `ray.origin + ray.dir * toi`
                    moveVector.add(avatar.tickOnLandPointsAdjustRaw(onLandPoints));
                    isLanded = true;
                    this.#logger.log(`charater: ${avatar.name}, is landed by castRay`);

                }
                
            }

            avatar.isInAir = !isLanded;

            if (avatar.isInAir) {

                moveVector.add(avatar.tickFallRaw(delta));

            } else if (!rotationTicked) {

                avatar.tickRotateActions(delta);

            }

            controller.computeColliderMovement(collider, moveVector, null, null, 
                // terrain will be excluded
                collider => !collider.isTerrain
            );
            const translation = controller.computedMovement();

            if (controller.computedGrounded()) isLanded = true;

            position.x += translation.x;
            position.y += translation.y;
            position.z += translation.z;

            collider.setTranslation(position);

            // Sync avatar with Rapier collider
            avatar.position.set(position.x, position.y, position.z);
            avatar.updateAccessories();

            if (isLanded) {

                avatar.resetFallingState();

            }

        }

    }

    // deprecated
    checkShapeHitCollider(object, instance) {

        const { physics: { collider, controller } } = instance.userData;
        const position = collider.translation();
        const radius = instance.geometry.parameters.radius * instance.scale.x;
        const shape = new this.engine.RAPIER.Ball(radius);
        const stopAtPenetration = true;
        /*
            maxToi should not be 0, otherwise it will not take effect,
            also a little bigger than character controller offset
        */
        const maxToi = controller.offset() + 0.002;
        _v1.set(position.x, position.y - object.height / 2 + radius, position.z);   // origin
        const hit = this.engine.world.castShape(_v1, _q1, _down, shape, 0, maxToi, stopAtPenetration, null, null, collider, null,
            // terrain will be excluded
            (collider) => !collider.isTerrain
        );

        return hit;

    }

}

export { RapierWorld };