export default class Panel {

    constructor(scope) {

        this.scope = scope;
        this.scene = scope.scene;
        this.guiMaker = scope.guiMaker;

        this.init();

    }

    init() {}

    getLocalDomain() {

        this.domain = {
            $scope: this.scope,
            $scene: this.scene,
            $guiMaker: this.guiMaker,
            folders: this.folders,
            controllers: this.controllers
        };

        return this.domain;

    }

};