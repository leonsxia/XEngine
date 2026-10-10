import { SceneObjectBase } from './SceneObjectBase';

class NavigationSceneBase extends SceneObjectBase {

    isNavigationSceneObject = true;

    _navMesh;

    constructor(specs) {

        super(specs);

    }

    get navigationMesh() {

        return this._navMesh;

    }

    set navigationMesh(navMesh) {

        this._navMesh = navMesh;

    }

}

export { NavigationSceneBase };