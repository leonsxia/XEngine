import { Color, Scene } from 'three';
import { basicMateraials } from './basic/basicMaterial';

function createScene(color) {
    const scene = new Scene();

    scene.background = new Color(color);  //cccccc

    // scene.overrideMaterial = basicMateraials.basic;

    return scene;
}

export { createScene };