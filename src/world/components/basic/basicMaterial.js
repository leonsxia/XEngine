import { MeshStandardMaterial, LineBasicMaterial, MeshPhongMaterial, MeshBasicMaterial } from 'three';
import * as Color from './colorBase.js';

function createBasicMaterials() {
    const basic = new MeshPhongMaterial({ color: Color.basic });

    const boundingBox = new MeshStandardMaterial({ color: Color.BB });

    const boundingFace = new MeshStandardMaterial({color: Color.BF });

    const boundingBoxWire = new LineBasicMaterial({ color: Color.BBW });

    const dark = new MeshBasicMaterial( { color: Color.black } );

    return { basic, boundingBox, boundingFace, boundingBoxWire, dark };
}

const basicMateraials = createBasicMaterials();

export { basicMateraials };