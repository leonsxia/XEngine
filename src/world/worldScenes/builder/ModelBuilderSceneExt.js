import { ModelBuilder } from "./ModelBuilder";
import { HandCraftedStudio, NavRoom } from '../../components/Models.js';
import { HAND_CRAFTED_STUDIO, NAV_ROOM } from '../../components/utils/constants.js';

class ModelBuilderSceneExt extends ModelBuilder {

    constructor(textures, gltfs) {

        super(textures, gltfs);

    }

    buildObjectCreationMapping() {

        super.buildObjectCreationMapping();
        this.objectCreationMapping[HAND_CRAFTED_STUDIO] = this.createHandCraftedStudio;
        this.objectCreationMapping[NAV_ROOM] = this.createNavRoom;

    }

    createHandCraftedStudio(specs) {

        let object;
        const { position = [0, 0, 0], rotationY, rotation = [0, 0, 0] } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new HandCraftedStudio(specs);
        object.setPosition(position)
            .setRotationY(rotationY ?? rotation[1])
            .setRotationX(rotation[0])
            .setRotationZ(rotation[2]);

        return object;

    }

    createNavRoom(specs) {

        let object;
        const { position = [0, 0, 0], rotationY, rotation = [0, 0, 0] } = specs;
        const { src } = specs;

        this.setupObjectGLTF({ src }, specs);

        object = new NavRoom(specs);
        object.setPosition(position)
            .setRotationY(rotationY ?? rotation[1])
            .setRotationX(rotation[0])
            .setRotationZ(rotation[2]);

        return object;

    }

}

export { ModelBuilderSceneExt };