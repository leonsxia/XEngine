import { PHYSICS_TYPES } from "../components/utils/constants";
import { createRenderer } from "./renderer";

const modelRenderer = createRenderer();
modelRenderer.name = 'model_renderer';

const GLOBALS = {
    CURRENT_PHYSICS: PHYSICS_TYPES.SIMPLE   // for identifying current scene physics type in global
};

export { modelRenderer, GLOBALS };