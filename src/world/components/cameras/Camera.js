import { PerspectiveCamera, Vector3 } from 'three'

class Camera {

    camera;
    target = new Vector3(0, 0, 0);

    constructor(specs) {

        const { fov = 50, aspect = 1, near = .1, far = 500 } = specs;
        const { position = [0, 0, 0] } = specs;

        this.camera = new PerspectiveCamera(fov, aspect, near, far);

        this.camera.position.set(...position);
        
    }

    get position() {

        return this.camera.position;

    }

}

export { Camera };