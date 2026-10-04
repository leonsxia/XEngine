import { Color, Scene, MathUtils } from 'three';
// import { basicMaterials } from './basic/basicMaterial';

function createScene(color) {

    const scene = new Scene();

    scene.background = new Color(color);
    // scene.overrideMaterial = basicMaterials.basic;

    Object.defineProperty(scene, 'backgroundRotationX', {

        get() {

            return MathUtils.radToDeg(this.backgroundRotation.x);

        },
        set(value) {

            this.backgroundRotation.x = MathUtils.degToRad(value);

        }

    });

    Object.defineProperty(scene, 'backgroundRotationY', {

        get() {

            return MathUtils.radToDeg(this.backgroundRotation.y);

        },
        set(value) {

            this.backgroundRotation.y = MathUtils.degToRad(value);

        }

    });

    Object.defineProperty(scene, 'backgroundRotationZ', {

        get() {

            return MathUtils.radToDeg(this.backgroundRotation.z);

        },
        set(value) {

            this.backgroundRotation.z = MathUtils.degToRad(value);

        }

    });

    return scene;

}

export { createScene };