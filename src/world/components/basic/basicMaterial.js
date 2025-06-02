import { MeshStandardMaterial, LineBasicMaterial, MeshPhongMaterial, MeshBasicMaterial } from 'three';
import * as Color from './colorBase.js';

function createBasicMaterials() {
    const basic = new MeshPhongMaterial({ color: Color.basic });

    const boundingBox = new MeshStandardMaterial({ color: Color.BB });

    const sovBoundingSphere = new MeshStandardMaterial({ color: Color.BS });

    const boundingFace = new MeshStandardMaterial({color: Color.BF });

    const boundingFace2 = new MeshStandardMaterial({ color: Color.BF2 });

    const boundingBoxWire = new LineBasicMaterial({ color: Color.BBW });

    const dark = new MeshBasicMaterial( { color: Color.black } );

    return { basic, boundingBox, sovBoundingSphere, boundingFace, boundingFace2, boundingBoxWire, dark };
}

const basicMateraials = createBasicMaterials();

export { basicMateraials };