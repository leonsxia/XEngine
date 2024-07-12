import { MeshStandardMaterial } from 'three';

function createBasicMaterials() {
    const basic = new MeshStandardMaterial({ color: 0x777777 });

    return { basic };
}

const basicMateraials = createBasicMaterials();

export { basicMateraials };