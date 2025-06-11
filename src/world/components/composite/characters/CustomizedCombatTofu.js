import { CollisionBox, Tofu } from "../../Models";
import { WEAPONS } from "../../utils/constants";

class CustomizedCombatTofu extends Tofu {

    weaponActionMapping = {};
    currentActionType;
    initialWeapon;
    weapons = [];

    collisionBoxMap = new Map();
    #lastAction;

    onBeforeCollisionBoxChanged = [];
    onCollisionBoxChanged = [];

    constructor(specs) {

        super(specs);

        const { enableCollision = true } = specs;
        const { weaponActionMapping = {}, initialWeapon, weapons = [] } = specs;
        this.weaponActionMapping = weaponActionMapping;
        this.initialWeapon = initialWeapon;
        this.weapons = weapons;

        if (enableCollision) {

            const initialWeaponType = this.initialWeapon.weaponType;

            this.createCollisionBoxes();
            this.switchCollisionBox(initialWeaponType, this.weaponActionMapping[initialWeaponType].idle.nick, false);
            this.showCollisionBox(false);

        }

    }

    trackResources() {

        super.trackResources();

        const weaponTypes = Object.keys(this.weaponActionMapping);
        
        for (let i = 0, il = weaponTypes.length; i < il; i++) {

            const weaponType = weaponTypes[i];
            const cboxes = this.collisionBoxMap.get(weaponType).values();

            for (const cbox of cboxes) {

                this.track(cbox.group);

                for (let j = 0, jl = cbox.walls.length; j < jl; j++) {

                    const wall = cbox.walls[j];
                    this.track(wall.leftArrow);
                    this.track(wall.rightArrow);

                }

            }

        }        

    }

    get currentAction() {

        let action;

        if (this.attacking) {

            action = this.currentActionType.aim.nick;

        } else if (this.isForward || this.isBackward || this.isRotating) {

            if (this.isAccelerating && !this.isRotating) {

                action = this.currentActionType.run.nick;

            } else {

                action = this.currentActionType.walk.nick;

            }

        } else {

            action = this.currentActionType.idle.nick;

        }

        return action;

    }

    doBeforeCollisionBoxChangedEvents() {

        for (let i = 0, il = this.onBeforeCollisionBoxChanged.length; i < il; i++) {

            const event = this.onBeforeCollisionBoxChanged[i];
            event(this);

        }

    }

    doCollisionBoxChangedEvents() {

        for (let i = 0, il = this.onCollisionBoxChanged.length; i < il; i++) {

            const event = this.onCollisionBoxChanged[i];
            event(this);

        }

    }

    showCollisionBox(show) {

        const weaponTypes = Object.keys(this.weaponActionMapping);
        
        for (let i = 0, il = weaponTypes.length; i < il; i++) {

            const weaponType = weaponTypes[i];
            const cboxes = this.collisionBoxMap.get(weaponType).values();

            for (const cbox of cboxes) {

                cbox.group.visible = show;

            }

        }

    }

    createCollisionBoxes() {

        const weaponTypes = Object.keys(this.weaponActionMapping);
        
        for (let i = 0, il = weaponTypes.length; i < il; i++) {

            const weaponType = weaponTypes[i];
            const typeMapping = this.weaponActionMapping[weaponType];
            const {
                name, ignoreCollisionBox,
                idleCollisionSize, walkCollisionSize, runCollisionSize, attackCollisionSize
            } = typeMapping;

            if (ignoreCollisionBox) continue;

            const cboxes = new Map();

            if (idleCollisionSize) {

                const specs = {
                    name: `${this.name}-${name}-idle-cBox`,
                    width: idleCollisionSize.width, depth: idleCollisionSize.depth, height: idleCollisionSize.height,
                    enableWallOBBs: true, showArrow: false, lines: false,
                    ignoreFaces: [4, 5]
                }
                cboxes.set(typeMapping.idle.nick, new CollisionBox(specs));
                // for SimplyPhysics self-check
                cboxes.get(typeMapping.idle.nick).father = this;
            
            }

            if (walkCollisionSize) {

                const specs = {
                    name: `${this.name}-${name}-walk-cBox`,
                    width: walkCollisionSize.width, depth: walkCollisionSize.depth, height: walkCollisionSize.height,
                    enableWallOBBs: true, showArrow: false, lines: false,
                    ignoreFaces: [4, 5]
                }
                cboxes.set(typeMapping.walk.nick, new CollisionBox(specs));
                // for SimplyPhysics self-check
                cboxes.get(typeMapping.walk.nick).father = this;

            }

            if (runCollisionSize) {

                const specs = {
                    name: `${this.name}-${name}-run-cBox`,
                    width: runCollisionSize.width, depth: runCollisionSize.depth, height: runCollisionSize.height,
                    enableWallOBBs: true, showArrow: false, lines: false,
                    ignoreFaces: [4, 5]
                }
                cboxes.set(typeMapping.run.nick, new CollisionBox(specs));
                // for SimplyPhysics self-check
                cboxes.get(typeMapping.run.nick).father = this;
                
            }

            if (attackCollisionSize) {

                const specs = {
                    name: `${this.name}-${name}-attack-cBox`,
                    width: attackCollisionSize.width, depth: attackCollisionSize.depth, height: attackCollisionSize.height,
                    enableWallOBBs: true, showArrow: false, lines: false,
                    ignoreFaces: [4, 5]
                }
                cboxes.set(typeMapping.aim.nick, new CollisionBox(specs));
                // for SimplyPhysics self-check
                cboxes.get(typeMapping.aim.nick).father = this;
                
            }

            this.collisionBoxMap.set(weaponType, cboxes);

        }
        
    }

    switchCollisionBox(weaponType, action, forceEvent = true) {

        if (forceEvent) this.doBeforeCollisionBoxChangedEvents();

        const cbox = this.collisionBoxMap.get(weaponType).get(action);

        this.walls = [];
        this.walls.push(...cbox.walls);

        if (this.collisionBox) {

            this.group.remove(this.collisionBox.group);

        }

        this.group.add(cbox.group);
        this.collisionBox = cbox;        

        if (forceEvent) this.doCollisionBoxChangedEvents();

    }

    switchHelperComponents(forceEvent = true) {

        const action = this.currentAction;

        if (this.#lastAction === action) return;

        this.#lastAction = action;

        this.switchCollisionBox(this.armedWeapon ? this.armedWeapon.weaponType : WEAPONS.NONE, action, forceEvent);

    }

    destroy() {

        this.doBeforeCollisionBoxChangedEvents();
        super.destroy();

    }

}

export { CustomizedCombatTofu };