import { Euler, Quaternion, Vector3 } from 'three';
import { GeometryDesc } from './GeometryDesc';

class MeshDesc {

    isMeshDesc = true;

    geometry;
    position = new Vector3();
    rotation = new Euler();
    quaternion = new Quaternion();
    scale = new Vector3(1, 1, 1);
    userData = {};

    constructor(geometry = new GeometryDesc()) {

        this.geometry = geometry;
        this.rotation._onChange();
        this.quaternion._onChange();

    }

    onRotationChange() {

        this.quaternion.setFromEuler(this.rotation, false);

    }

    onQuaternionChange() {

        this.rotation.setFromQuaternion(this.quaternion, undefined, false);

    }

}

export { MeshDesc };