import { MeshStandardMaterial, LineBasicMaterial, MeshPhongMaterial } from 'three';
import * as Color from './colorBase.js';

function createBasicMaterials() {
    const basic = new MeshPhongMaterial({ color: Color.basic });

    const boundingBox = new MeshStandardMaterial({ color: Color.BB });

    const boundingFace = new MeshStandardMaterial({color: Color.BF });

    const boundingBoxWire = new LineBasicMaterial({ color: Color.BBW });

    return { basic, boundingBox, boundingFace, boundingBoxWire };
}

const basicMateraials = createBasicMaterials();

export { basicMateraials };