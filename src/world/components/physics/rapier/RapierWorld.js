import { Quaternion, Vector3 } from 'three';
import { getShape, RapierPhysics } from './RapierPhysics';
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';

const CHARACTER_CONTROLLER = 'characterController';
const STAIR_OFFSET_MAX = .3;
const DOWN_RAY_LENGTH = .55;

const _v1 = new Vector3();
const _v2 = new Vector3();
const _q1 = new Quaternion();
const _down = new Vector3(0, -1, 0);

class RapierWorld {

    isRapierWorld = true;

    physics = new RapierPhysics();

    players = [];
    enemies = [];
    activePlayers = [];
    activeEnemies = [];

    compounds = [];
    floors = [];
    obstacleTops = [];
    slopes = [];
    terrains = [];

    _currentRoom;
    attachTo;

    _rapierHelper;

    isActive = true;

    _debug = false;

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

            }

        }        

    }

    get scene() {

        return this.attachTo.scene;

    }

    initPhysics(room) {

        const { 
            floors, topOBBs, slopes,
            terrains 
        } = room;

        this.floors = floors;
        this.obstacleTops = topOBBs;
        this.slopes = slopes;
        this.terrains = terrains;

        this._currentRoom = room.name;

        this.physics.removeAll();
        this.setupWorld();

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

        userData.controller = characterController;

    }

    setupWorld() {

        this.addFloors();
        this.addTerrains();
        this.physics.addScene(this.attachTo.scene);

    }

    addFloors() {

        for (let i = 0, il = this.floors.length; i < il; i++) {

            const floor = this.floors[i];
            floor.mesh.userData.physics = { mass: 0, restitution: 0 };

        }

    }

    addTerrains() {

        for (let i = 0, il = this.terrains.length; i < il; i++) {

            const terrain = this.terrains[i];
            const { width, height, widthSegments, heightSegments } = terrain.geometry.parameters;
            const { heights } = terrain.geometry.userData;
            this.physics.addHeightfield(terrain.mesh, heightSegments, widthSegments, new Float32Array(heights), { x: width, y: 1, z: height });
            terrain.mesh.userData.physics.manuallyLoad = true;
            terrain.mesh.userData.physics.collider.name = `${terrain.name}_collider`;

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
                this.physics.removeCollider(userData.collider);
                userData.collider = undefined;
            
            }

        }        

    }

    onTofuContainerChanged(rapierContainer) {

        if (!rapierContainer) return;
        for (let i = 0, il = rapierContainer.actives.length; i < il; i++) {

            const instance = rapierContainer.actives[i];
            if (instance.name !== CHARACTER_CONTROLLER) {

                this.physics.addMesh(instance, instance.userData.physics.mass);

            } else {

                // re-create character collider
                const avatar = rapierContainer.attachTo;
                const geometryDesc = instance.geometry;
                const userData = instance.userData;
                const colliderDesc = getShape(geometryDesc, rapierContainer.scale);
                avatar.getWorldPosition(_v1);
                colliderDesc.setTranslation(..._v1);
                userData.collider = this.physics.world.createCollider(colliderDesc);
                userData.collider.name = `${avatar.name}_character_controller_collider`;

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

    addActivePlayers(...names) {

        names.forEach(name => {

            const find = this.players.find(p => p.name === name);
            const idx = this.activePlayers.indexOf(find);

            if (idx === -1) {

                this.activePlayers.push(find);
                this.onTofuContainerChanged(find.rapierContainer);

            }

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

    // check
    checkBlockByTopT(avatar, top) {

        let block = false;
        const topPosY = top.getWorldPosition(_v1).y;
        const offset = Math.abs(topPosY - avatar.bottomY);

        if (avatar.bottomY < topPosY - avatar.lastFrameFallingDistance && offset > STAIR_OFFSET_MAX) {
            
            block = true;

        }

        return block;

    }

    tick(delta) {

        if (this._rapierHelper) this._rapierHelper.update();

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
            const { userData: { collider, controller } } = avatar.rapierContainer.getInstanceByName(CHARACTER_CONTROLLER);
            const position = collider.translation();

            // let rotationTicked = false;
            if (!avatar.isInAir) {
                
                avatar.tickRotateActions(delta);
                // rotationTicked = true;

            }

            const moveVector = avatar.tickRaw(delta);

            // for avatar falling down check
            const collisionTops = [];

            for (let i = 0; i < this.obstacleTops.length; i++) {

                const top = this.obstacleTops[i];

                if (avatar.obb.intersectsOBB(top.obb) && !this.checkBlockByTopT(avatar, top)) {

                    collisionTops.push(top);

                    break;

                }

            }

            let isLanded = false;
            if (collisionTops.length > 0) {

                isLanded = true;

            }

            // collect on slope points and return the highest one
            const onSlopePoints = [];

            // let isOnSlope = false;     

            if (!avatar.isClimbingUp) {

                // terrain check
                if (this.terrains.length > 0) {

                    avatar.updateRayLength('terrain');
                    // for (let i = 0, il = this.terrains.length; i < il; i++) {

                    //     const terrain = this.terrains[i];
                    //     const { onSlope, point } = avatar.tickOnSlope([terrain.mesh], 'terrain');
                    //     if (onSlope) {

                    //         onSlopePoints.push(point);
                    //         isLanded = true;

                    //     }

                    // }

                }
                
                // check on land
                const maxToi = avatar.height * DOWN_RAY_LENGTH;
                _v1.set(position.x, position.y, position.z);    // origin

                const ray = new this.physics.RAPIER.Ray(_v1, _down);
                const hit = this.physics.world.castRay(ray, maxToi, false, null, null, collider);
                if (hit) {

                    // The hit point is obtained from the ray's origin and direction: `origin + dir * timeOfImpact`.
                    onSlopePoints.push(_v1.add(_v2.copy(_down).multiplyScalar(hit.timeOfImpact)));
                    moveVector.add(avatar.tickOnSlopePointsAdjustRaw(onSlopePoints));
                    isLanded = true;

                }
                
            }

            // if (onSlopePoints.length > 0) {

            //     moveVector.add(avatar.tickOnSlopePointsAdjustRaw(onSlopePoints));

            // }

            if (!isLanded) {

                avatar.isInAir = true;
                // console.log(`is in air`);

            }

            if (avatar.isInAir) {

                const collisionFloors = [];

                for (let i = 0, il = this.floors.length; i < il; i++) {

                    const floor = this.floors[i];

                    if (!avatar.isClimbingUp && !this.checkBlockByTopT(avatar, floor)) {

                        if (avatar.obb.intersectsOBB(floor.obb)) {

                            collisionFloors.push(floor);

                            break;

                        }
                    }
                }

                if (collisionFloors.length === 0) {

                    moveVector.add(avatar.tickFallRaw(delta));

                } else {

                    isLanded = true;

                }

            }

            avatar.group.getWorldQuaternion(_q1);
            collider.setRotation(_q1);

            controller.computeColliderMovement(collider, moveVector);
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