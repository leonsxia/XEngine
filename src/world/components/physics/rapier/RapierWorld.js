import { Quaternion, Vector3 } from 'three';
import { getShape, RapierPhysics } from './RapierPhysics';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';
import { Logger } from '../../../systems/Logger';

const CHARACTER_CONTROLLER = 'characterController';
const STAIR_OFFSET_MAX = .3;
const DOWN_RAY_LENGTH = .52;

const _v1 = new Vector3();
const _v2 = new Vector3();
const _q1 = new Quaternion();
const _down = new Vector3(0, -1, 0);

const DEBUG = false;

class RapierWorld {

    isRapierWorld = true;

    physics = new RapierPhysics();

    players = [];
    enemies = [];
    activePlayers = [];
    activeEnemies = [];

    compounds = [];
    floors = [];
    slopes = [];
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
            floors, slopes,
            terrains 
        } = room;

        this.compounds = compounds;
        this.floors = floors;
        this.slopes = slopes;
        this.terrains = terrains;

        this._currentRoom = room.name;

        this.physics.removeAll();
        this.cleanupAvatars();
        this.setupWorld(room);

        if (this._debug) this.updateDebugger();

    }

    updateDebugger() {

        if (this._rapierHelper) this.scene.remove(this._rapierHelper);

        this._rapierHelper = new RapierHelper(this.physics.world);
        this._rapierHelper.update();
        this.attachTo.scene.add(this._rapierHelper);

    }

    showDebugger(s) {

        if (s) {

            if (!this._rapierHelper) {
                
                this._rapierHelper = new RapierHelper(this.physics.world);
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

        const characterController = this.physics.world.createCharacterController(0.01);
        characterController.setApplyImpulsesToDynamicBodies(true);
        characterController.setCharacterMass(userData.physics.mass ?? 60);
        characterController.enableSnapToGround(0.2);
        // characterController.setSlideEnabled(true);
        characterController.setMaxSlopeClimbAngle(80 * Math.PI / 180);
        characterController.setMinSlopeSlideAngle(60 * Math.PI / 180);
        characterController.enableAutostep(STAIR_OFFSET_MAX, 0.2, true);

        userData.physics.controller = characterController;

    }

    setupWorld(room) {

        this.addDefaultWalls(room);
        this.addCompounds();
        this.addFloors();
        this.addTerrains();
        this.physics.addScene(this.attachTo.scene);

    }

    addDefaultWalls(room) {

        this.bindObjectSyncEvents(room.leftWall);
        this.bindObjectSyncEvents(room.rightWall);
        this.bindObjectSyncEvents(room.frontWall);
        this.bindObjectSyncEvents(room.backWall);

    }

    addCompounds() {

        for (let i = 0, il = this.compounds.length; i < il; i++) {

            const compound = this.compounds[i];
            this.bindObjectSyncEvents(compound);
            compound.addRapierInstances();
            this.physics.addCompoundMesh(compound.group, compound.rapierInstances);

        }

    }

    addFloors() {

        for (let i = 0, il = this.floors.length; i < il; i++) {

            const floor = this.floors[i];
            const { restitution = 0, friction = 0 } = floor.specs.physics;

            floor.setupRapierPhysics({ mass: 0, restitution, friction });
            this.bindObjectSyncEvents(floor);            

        }

    }

    addTerrains() {

        for (let i = 0, il = this.terrains.length; i < il; i++) {

            const terrain = this.terrains[i];
            const { width, height, widthSegments, heightSegments } = terrain.geometry.parameters;
            const { heights } = terrain.geometry.userData;
            const { restitution = 0, friction = 0 } = terrain.specs.physics;
            
            terrain.setupRapierPhysics({ mass: 0, restitution, friction });
            this.physics.addHeightfield(terrain.mesh, heightSegments, widthSegments, new Float32Array(heights), { x: width, y: 1, z: height });
            terrain.addRapierInfo();

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

                }

            } else if (idx > -1) {

                this.compounds.splice(idx, 1);

            }

        }    

    }

    // events
    onBeforeTofuContainerChanged(rapierContainer) {

        if (!rapierContainer) return;
        for (let i = 0, il = rapierContainer.actives.length; i < il; i++) {

            const instance = rapierContainer.actives[i];
            if (instance.name !== CHARACTER_CONTROLLER) {

                this.physics.removeMesh(instance);

            } else {

                const userData = instance.userData;
                this.physics.removeCollider(userData.physics.collider);
                userData.physics.collider = undefined;
            
            }

        }        

    }

    onTofuContainerChanged(rapierContainer) {

        if (!rapierContainer) return;
        for (let i = 0, il = rapierContainer.actives.length; i < il; i++) {

            const instance = rapierContainer.actives[i];
            if (instance.name !== CHARACTER_CONTROLLER) {

                this.physics.addMesh(instance);

            } else {

                // re-create character collider
                const avatar = rapierContainer.attachTo;
                const geometryDesc = instance.geometry;
                const userData = instance.userData;
                const colliderDesc = getShape(geometryDesc, rapierContainer.scale);
                avatar.getWorldPosition(_v1);
                colliderDesc.setTranslation(..._v1);
                userData.physics.collider = this.physics.world.createCollider(colliderDesc);
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
            
            this.physics.removeMesh(object.group);

        } else {

            this.physics.removeMesh(object.mesh);

        }

    }

    onObjectAdded(object) {

        if (object.isTofu) {

            this.onTofuContainerChanged(object.rapierContainer);

        } else if (object.isObstacleBase || object.isInWallObjectBase) {
            
            this.physics.addCompoundMesh(object.group, object.rapierInstances);

        } else {

            this.physics.addMesh(object.mesh);

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

            if (find.dead) find.isActive = false;

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

            if (find.dead) find.isActive = false;

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

        if (this._rapierHelper && this._debug) this._rapierHelper.update();

        this.playerTick(delta);
        this.enemyTick(delta);

        this.physics.step(delta);

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

            // update rotation
            avatar.group.getWorldQuaternion(_q1);
            collider.setRotation(_q1);

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

                const ray = new this.physics.RAPIER.Ray(_v1, _down);
                const hit = this.physics.world.castRay(ray, maxToi, false, null, null, collider, null, 
                    // take terrain into account, `undefined` will not see as `false` in rapier!!!
                    (collider) => collider.checkByRay || false
                );

                if (hit) {

                    // The hit point is obtained from the ray's origin and direction: `origin + dir * timeOfImpact`.
                    onLandPoints.push(_v1.add(_v2.copy(_down).multiplyScalar(hit.timeOfImpact)));
                    moveVector.add(avatar.tickOnLandPointsAdjustRaw(onLandPoints));
                    isLanded = true;
                    this.#logger.log(`charater: ${avatar.name}, is landed by castRay`);

                } else {

                    const radius = instance.geometry.parameters.radius * instance.scale.x;
                    const shape = new this.physics.RAPIER.Ball(radius);
                    const stopAtPenetration = true;
                    /* 
                        maxToi should not be 0, otherwise it will not take effect,
                        also a little bigger than character controller offset
                    */
                    const maxToi = controller.offset() + 0.002;
                    _v1.set(position.x, position.y - avatar.height / 2 + radius, position.z);   // origin
                    const hit = this.physics.world.castShape(_v1, _q1, _down, shape, 0, maxToi, stopAtPenetration, null, null, collider, null, 
                        // terrain will be excluded
                        (collider) => !collider.checkByRay
                    );

                    if (hit) {

                        isLanded = true;
                        this.#logger.log(`charater: ${avatar.name}, is landed by castShape`);

                    }

                }
                
            }

            avatar.isInAir = !isLanded;

            if (avatar.isInAir) {

                moveVector.add(avatar.tickFallRaw(delta));

            } else if (!rotationTicked) {

                avatar.tickRotateActions(delta);
                // update rotation
                avatar.group.getWorldQuaternion(_q1);
                collider.setRotation(_q1);

            }

            controller.computeColliderMovement(collider, moveVector, null, null, 
                // terrain will be excluded
                collider => !collider.checkByRay
            );
            const translation = controller.computedMovement();

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

}

export { RapierWorld };