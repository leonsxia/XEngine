import { MeshStandardMaterial, LineBasicMaterial, MeshPhongMaterial, MeshBasicMaterial, SpriteMaterial, CanvasTexture, LinearFilter, ClampToEdgeWrapping } from 'three';
import * as Color from './colorBase.js';

function createBasicMaterials() {

    const basic = new MeshPhongMaterial({ color: Color.basic });

    const standard = new MeshStandardMaterial({ color: Color.basic });

    const boundingBox = new MeshStandardMaterial({ color: Color.BB });

    const sovBoundingSphere = new MeshStandardMaterial({ color: Color.BS });

    const boundingFace = new MeshStandardMaterial({ color: Color.BF });

    const boundingFace2 = new MeshStandardMaterial({ color: Color.BF2 });

    const boundingBoxWire = new LineBasicMaterial({ color: Color.BBW });

    const dark = new MeshBasicMaterial({ color: Color.black });

    return {
        basic, standard,
        boundingBox, sovBoundingSphere, boundingFace, boundingFace2, boundingBoxWire,
        dark
    };

}

function createBasicMaterial(color) {

    return new MeshStandardMaterial({ color });

}

function createSpriteMaterial(canvas) {

    const texture = new CanvasTexture(canvas);
    // because our canvas is likely not a power of 2
    // in both dimensions set the filtering appropriately.
    texture.minFilter = LinearFilter;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;

    return new SpriteMaterial({
        map: texture,
        transparent: true
    });

}

const basicMaterials = createBasicMaterials();

export { basicMaterials, createBasicMaterial, createSpriteMaterial };