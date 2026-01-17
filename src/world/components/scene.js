import { Color, Scene } from 'three';
// import { basicMaterials } from './basic/basicMaterial';

function createScene(color) {
    const scene = new Scene();

    scene.background = new Color(color);  //cccccc

    // scene.overrideMaterial = basicMaterials.basic;

    return scene;
}

export { createScene };